import { Button } from '@/components/ui/button'
import { IconMessageCircle, IconPencil, IconPlus, IconSquareRoundedX } from '@tabler/icons-react'
import { clsx } from 'clsx'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef, useState } from 'react'
import { ID } from '@/ds/general'
import { skipToken } from '@reduxjs/toolkit/query'
import { useUserId } from '@/hooks/use-user'
import { CentralLoadingComp } from '@/components/views/CentralLoadingComp'
import { getChatUrl } from '@/lib/utils'
import { PlatformType } from '@/ds/openai/general'
import { IConversation } from '@/ds/openai/conversation'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { injectOpenAIConversation } from '@/api/conversationApi'
import { useToast } from '@/hooks/use-toast'

export const ConversationsComp = <T extends PlatformType>(
	{
		cid,
		platform_type,
	}: {
		cid: ID | null
		platform_type: T
	}) => {
	
	const user_id = useUserId()
	const router = useRouter()
	
	const {
		useListConversationsQuery,
		useUpdateConversationMutation,
		useDeleteConversationMutation,
	} = injectOpenAIConversation<T>()
	
	const { data: conversations = [], isLoading: isLoadingConversations } =
		useListConversationsQuery(user_id ? { user_id, platform_type } : skipToken)
	
	const ConversationLineComp: FC<{
		conversation: IConversation<T>
		isHighlight?: boolean
	}> = ({ conversation, isHighlight }) => {
		const router = useRouter()
		
		const [isEditing, setEditing] = useState(false)
		const refInput = useRef<HTMLInputElement>(null)
		
		const [updateConversation] = useUpdateConversationMutation()
		const [deleteConversation] = useDeleteConversationMutation()
		
		const {toast} = useToast()
		
		// auto focus
		useEffect(() => {if (isEditing) refInput.current!.select()}, [isEditing])
		
		const { id, name, platform_type } = conversation
		
		const view = (
			<Button
				variant={'ghost'}
				className={clsx(
					'group w-full p-3 flex items-center gap-2 cursor-pointer rounded-none border-b border-gray-200 dark:border-gray-700',
					isHighlight && 'bg-gray-200 dark:bg-gray-700',
				)}
			>
				<IconMessageCircle size={16} className={'shrink-0'}/>
				{
					!isEditing ? <p className={'w-full truncate text-left'}>{name || id}</p> : (
						<Input
							ref={refInput}
							defaultValue={name || id}
							onKeyDown={async (event) => {
								if (event.key === 'Enter') {
									setEditing(false)
									await updateConversation({ id, name: event.currentTarget.value, platform_type })
									toast({title: "已重命名会话"})
								}
							}}
							onBlur={() => setEditing(false)}
						/>
					)
				}
				
				{
					!isEditing && (
						<div className={'hidden group-hover:flex shrink-0 items-center gap-2 z-auto'}>
							
							<IconPencil className={'text-green-700'} onClick={(event) => {
								event.preventDefault()
								setEditing(true)
							}
							}/>
							
							<IconSquareRoundedX
								className={'text-red-500'}
								onClick={async (e) => {
									e.preventDefault()
									await deleteConversation({ id, platform_type })
									toast({title: "已删除一个会话"})
									// 当且仅当被删除conversation是当前conversation的时候才需要重定向
									if (isHighlight)
										router.push(getChatUrl({ platform_type }))
								}}/>
						</div>
					)
				}
			
			</Button>
		)
		
		return isEditing ? view : (
			<Link href={getChatUrl({ id, platform_type })}>{view}</Link>
		)
	}
	
	
	return (
		<div className={'w-full h-full flex flex-col bg-bg-sub'}>
			
			{
				isLoadingConversations ? <CentralLoadingComp/> : (
					<>
						<Button className={'w-full inline-flex items-center gap-2 rounded-none mb-1'} variant={'subtle'} onClick={() => {
							router.push(getChatUrl({ platform_type: platform_type }))
						}}>
							<IconPlus size={16}/>
							<p>New Chat</p>
						</Button>
						
						<div className={clsx(
							'w-full flex-1 overflow-y-auto',
							'flex justify-end flex-col-reverse', // 倒序展示
						)}>
							{
								conversations.map((conversation: IConversation<T>) =>
									<ConversationLineComp
										key={conversation.id}
										conversation={conversation}
										isHighlight={cid === conversation.id}
									/>)
							}
						</div>
					</>
				)
			}
		
		</div>
	)
}
