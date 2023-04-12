import Link from 'next/link'
import { IconMessageCircle, IconPencil, IconSquareRoundedX } from '@tabler/icons-react'
import { asyncDelConversation } from '@/states/thunks/chatgpt'
import { useAppDispatch, useAppSelector } from '@/states/hooks'
import { selectChatgptConversationID, setConversationName } from '@/states/features/conversationSlice'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { updateChatgptConversationName } from '@/api/chatgpt'
import { selectUserId } from '@/states/features/userSlice'
import { IChatgptConversation } from '@/ds/chatgpt'
import { useDeleteConversationMutation, useUpdateConversationMutation } from '@/states/apis/chatgptConversationApi'

export const ConversationLineComp = ({ conversation }: {
	conversation: IChatgptConversation
}) => {
	const router = useRouter()
	const user_id = useAppSelector(selectUserId)!
	const conversation_id = useAppSelector(selectChatgptConversationID)
	
	const [isEditing, setEditing] = useState(false)
	const refInput = useRef<HTMLInputElement>(null)
	
	const [deleteConversation, {}] = useDeleteConversationMutation()
	const [updateConversation, {}] = useUpdateConversationMutation()
	
	useEffect(() => {
		if (isEditing) {
			refInput.current!.select()
		}
	}, [isEditing])
	
	const view = (
		<Button
			variant={'ghost'}
			className={clsx(
				'group w-full p-3 flex items-center gap-2 cursor-pointer rounded-none border-b border-gray-200 dark:border-gray-700',
				conversation_id === conversation.id && 'bg-gray-200 dark:bg-gray-700',
			)}
		>
			<IconMessageCircle size={16} className={'shrink-0'}/>
			{
				!isEditing ? <p className={'w-full truncate text-left'}>{conversation.name || conversation.id}</p> : (
					<Input
						ref={refInput}
						defaultValue={conversation.name || conversation.id}
						onKeyDown={async (event) => {
							if (event.key === 'Enter') {
								setEditing(false)
								const name = event.currentTarget.value
								updateConversation({ id: conversation.id, name })
								// await updateChatgptConversationName({ user_id, id: conversation.id, model: conversation.model }, name)
								// await dispatch(setConversationName({ id: conversation.id, name }))
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
							onClick={(e) => {
								e.preventDefault()
								deleteConversation({ user_id, id: conversation.id, model: conversation.model })
								// dispatch(asyncDelConversation(conversation.id))
								// 当且仅当被删除conversation是当前conversation的时候才需要重定向
								if (conversation.id === conversation_id)
									router.push('/chat')
							}}/>
					</div>
				)
			}
		
		</Button>
	)
	
	return isEditing ? view : (
		<Link href={`/chat/${conversation.id}`}>{view}</Link>
	)
}
