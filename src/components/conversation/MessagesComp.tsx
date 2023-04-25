import { clsx } from 'clsx'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { MessageComp } from '@/components/conversation/MessageComp'
import { Textarea } from '@/components/ui/textarea'
import { IconBrandTelegram } from '@tabler/icons-react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ID } from '@/ds/general'
import { skipToken } from '@reduxjs/toolkit/query'
import { useLazyUser } from '@/hooks/use-user'
import { DalleDimensionType, IMessage, IMessageParams, MessageRoleType, MessageStatusType, MessageType } from '@/ds/openai/message'
import { PlatformType } from '@/ds/openai/general'
import { injectOpenAIConversation } from '@/api/conversationApi'
import { injectOpenAIMessages } from '@/api/messageApi'
import { ChatgptModelType, IConversationParams, ICreateConversation } from '@/ds/openai/conversation'
import _ from 'lodash'
import { useAppSelector } from '@/hooks/use-redux'
import { selectU } from '@/states/features/i18nSlice'
import { CentralLoadingComp } from '@/components/general/CentralLoadingComp'
import { Button } from '@/components/ui/button'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { BACKEND_ENDPOINT } from '@/lib/env'

const c = 'text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl flex m-auto break-all'

const initConversationParams = <T extends PlatformType>(platform_type: T): IConversationParams<T> => (
	platform_type === PlatformType.chatGPT
		? {
			model: ChatgptModelType.gpt35,
			selected: [],
		} as IConversationParams<PlatformType.chatGPT>
		: {} as IConversationParams<PlatformType.dalle>
) as IConversationParams<T>

const initMessageParams = <T extends PlatformType>(platform_type: T): IMessageParams<T> => (
	platform_type === PlatformType.chatGPT
		? {
			role: MessageRoleType.user,
		} as IMessageParams<PlatformType.chatGPT>
		: {
			role: MessageRoleType.user,
			dimension: DalleDimensionType.sm,
		} as IMessageParams<PlatformType.dalle>
) as IMessageParams<T>


export const MessagesComp = <T extends PlatformType>(
	{
		cid,
		platform_type,
		conversationsComp,
	}: {
		cid: ID | null
		platform_type: T
		conversationsComp: ReactNode
	}) => {
	
	const {
		useCreateConversationMutation,
	} = injectOpenAIConversation<T>()
	
	const {
		useListMessagesQuery,
		useSendMessageMutation,
	} = injectOpenAIMessages<T>()
	
	const [user, getUser] = useLazyUser()
	const user_id = user?.id
	
	const u = useAppSelector(selectU)
	
	const [conversation_id, setConversationId] = useState(cid)
	const [messages, setMessages] = useState<IMessage<T>[]>([])
	const { currentData: initedMessages, isLoading: isFetchingMessages } = useListMessagesQuery(cid ? { conversation_id: cid, platform_type } : skipToken)
	
	const [createConversation] = useCreateConversationMutation()
	
	const [conversationParams, setConversationParams] = useState<IConversationParams<T>>(initConversationParams<T>(platform_type))
	const [messageParams, setMessageParams] = useState<IMessageParams<T>>(initMessageParams<T>(platform_type))
	
	const refMessageSend = useRef<HTMLTextAreaElement | null>(null)
	const refMessageEnd = useRef<HTMLDivElement | null>(null)
	
	const pushMessage = (message: IMessage<T>) => setMessages((messages) => [...messages, message])
	const concatMessage = (chunk: string, status: MessageStatusType) => setMessages((messages) => {
		// console.log('current messages (setting): ', messages)
		const message = messages[messages.length - 1]
		return [...messages.slice(0, messages.length - 1), { ...message, content: message.content + chunk, status }]
	})
	
	
	const [isLoadingResponse, setLoadingResponse] = useState(false)
	
	// update conversation id upon prop changes
	useEffect(() => {
		setConversationId(cid)
		if (!cid) setMessages([])
	}, [cid])
	
	/**
	 * update messages upon inited messages changed
	 *
	 * 1. cid changed triggered by url change
	 * 2. inited messages changed out of auto fetch messages
	 * 3. set messages
	 */
	useEffect(() => {
		if (initedMessages) setMessages((messages) => initedMessages)
	}, [initedMessages])
	
	// auto scroll
	useEffect(() => refMessageEnd.current?.scrollIntoView({ behavior: 'smooth' }), [messages.length && messages[messages.length - 1].content.length])
	
	const fetchSSE = (msg: IMessage<T>) => {
		class MyError extends Error {}
		
		fetchEventSource(`${BACKEND_ENDPOINT}/chatGPT/${msg.conversation_id}/chat?stream=true`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(msg),
			onopen: async (response) => {
				console.log('onOpen')
				console.log({ response })
				if (!response.ok) {
					const { status } = response
					const { detail } = await response.json()
					console.log({ status, detail })
					concatMessage(detail, status === 402 ? 'ERROR_TOKEN_DRAIN' : 'ERROR')
					throw new MyError(detail)
				}
			},
			onmessage(msg) {
				const { data: chunk } = msg
				console.debug('chunk: ', chunk)
				concatMessage(chunk, 'OK')
			},
			onclose: () => {
				console.log('onClose')
				if (user) getUser(user.id) // update token
			},
			onerror: (error) => {
				console.log('onError')
				throw error
			},
		})
			.catch(console.error)
			.finally(() => setLoadingResponse(false))
	}
	
	
	const onSubmit = async () => {
		setLoadingResponse(true)
		const content = refMessageSend.current!.value
		refMessageSend.current!.value = ''
		
		let success = true, detail = ''
		if (!user_id) {
			success = false
			detail = '聊天功能需要先登录再使用！'
		} else if (isLoadingResponse) {
			success = false
			detail = '请耐心等待回复完成'
		}
		
		let msg: IMessage<T> = {
			conversation_id: conversation_id || '',
			content,
			type: MessageType.text,
			platform_type,
			platform_params: messageParams,
			sender: user_id || 'Unknown',
		}
		await pushMessage(msg)
		
		// 直接处理 client 端错误
		if (!success) return pushMessage({ ...msg, status: 'ERROR', content: detail, platform_params: { ...messageParams, role: MessageRoleType.assistant } })
		
		const _createConversation = async () => {
			//// 1.
			// const initCreateConversationModel = (user_id: ID): ICreateConversation<T> => ({
			// 		user_id,
			// 		platform_type,
			// 		platform_params: platform_type === PlatformType.chatGPT ? {
			// 			model: ChatgptModelType.gpt35,
			// 			selected: [],
			// 		} : {}
			// 	} as ICreateConversation<T>)
			// const conversationModel: ICreateConversation<T> = initCreateConversationModel(user_id)
			
			//// 2.
			const createConversationModel: ICreateConversation<T> = { user_id: user_id!, platform_type, platform_params: conversationParams }
			
			//// 3.
			//  failed: Type 'PlatformType.dalle' is not assignable to type 'PlatformType.chatGPT'.
			// let createConversationModel: ICreateConversation<PlatformType.chatGPT> = {
			// 	user_id,
			// 	platform_type: PlatformType.chatGPT,
			// 	platform_params: {
			// 		model: ChatgptModelType.gpt35,
			// 		selected: [],
			// 	},
			// } as unknown as ICreateConversation<T>
			
			return await createConversation(createConversationModel).unwrap()
		}
		
		if (!conversation_id) {
			const newConversationID = await _createConversation()
			setConversationId(newConversationID)
			msg.conversation_id = newConversationID
		}
		
		await pushMessage({ ...msg, platform_params: { ...msg.platform_params, role: MessageRoleType.assistant }, content: '', sender: 'system' })
		fetchSSE(msg)
	}
	
	
	// 这个加了会闪屏
	// 但是不加的话，在网速差的时候就存在点了没反应的问题
	// 但转念一想，除了用于调试，谁会频繁地切换conversation呢？
	// 所以还是加上吧！
	if (isFetchingMessages) return <CentralLoadingComp/>
	
	
	return (
		<div className={'grow items-stretch overflow-hidden flex flex-col'}>
			<div className={'w-full rounded-none mb-1 flex justify-center items-center font-semibold'}>
				<span className={'inline-flex items-center'}>Tokens:
					<p className={clsx('px-2 text-lg font-bold text-primary', !isLoadingResponse && 'animate-bounce-start')}>{user ? user.openai.balance : '请登录后查看！'}</p>
					<p>, Platform: <span className={'font-bold'}>{_.upperCase(platform_type)}</span></p>
				</span>
				<span className={'hidden'}>, Detail: {JSON.stringify(conversationParams)}</span>
			</div>
			
			<ScrollArea className={'w-full grow overflow-hidden flex flex-col'}>
				{/* messages */}
				{messages.map((msg, index) => <MessageComp msg={msg} key={index}/>)}
				
				{/* for scroll */}
				<div ref={refMessageEnd} className={'w-full'}/>
			</ScrollArea>
			
			
			{/* for stretch, since flex-end cannot combine with overflow-auto */}
			<div className={'hidden md:block grow'}/>
			<div className={clsx(c, 'w-full relative ')}>
				<Textarea
					className={'mt-2 mb-10 md:mb-2 w-full shadow-sm resize-none'}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							if (!event.metaKey && !event.shiftKey && !event.ctrlKey) {
								onSubmit()
								event.preventDefault() // prevent enter go down
							}
						}
					}}
					ref={refMessageSend}
					placeholder={u.ui.general.textarea.placeholder}
				/>
				<IconBrandTelegram className={'hidden md:block text-primary absolute right-3 bottom-6 cursor-pointer'} onClick={onSubmit}/>
			</div>
			
			<div className={'md:hidden fixed bottom-0 left-0 w-full grid grid-cols-2 divide-x divide-y-0 divide-slate-500'}>
				<Sheet>
					<SheetTrigger asChild>
						<Button size={'sm'} className={'rounded-none'}>{u.ui.chat.btn.conversations}</Button>
					</SheetTrigger>
					<SheetContent className={'w-1/2 p-0 pt-10'} position={'left'}>
						{conversationsComp}
					</SheetContent>
				</Sheet>
				
				<Button size={'sm'} className="rounded-none" onClick={onSubmit}>{u.ui.general.btn.send}</Button>
			</div>
		</div>
	)
}
