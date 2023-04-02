import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/states/hooks'
import { selectConversations } from '@/states/features/conversationsSlice'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as allIcons from '@tabler/icons-react'
import { IconLogout, IconMessageCircle, IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { ReactNode, useEffect } from 'react'
import { Separator } from '../ui/separator'
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react'
import { fetchConversations } from '@/states/thunks/chat'
import { useSelector } from 'react-redux'
import { selectUser, selectUserID } from '@/states/features/user'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CompUserAccount } from '@/components/shared/CompUserAccount'
import { useToast } from '@/hooks/use-toast'
import { HtmlAttributes } from 'csstype'

const CompLine = ({ icon, children, onClick }: { icon: string, children: ReactNode, onClick?: any }) => {
	// ref: https://stackoverflow.com/a/73846364
	// @ts-ignore
	const Icon = allIcons[icon]
	return (
		<div className={'w-full p-3 truncate inline-flex items-center gap-2 hover:bg-[#2A2B32] cursor-pointer'} onClick={onClick}>
			<Icon size={16}/>
			{children}
		</div>
	)
}

export const CompConversations = ({}) => {
	
	const user = useSelector(selectUser)
	
	const dispatch = useAppDispatch()
	
	useEffect(() => {
		if (user.id) dispatch(fetchConversations(user.id))
	}, [user.id])
	
	const { toast } = useToast()
	
	const conversations = useAppSelector(selectConversations)
	
	return (
		<div className={'dark hidden bg-gray-900 text-gray-100 md:flex md:w-[260px] md:flex-col'}>
			
			<Button className={'w-full inline-flex items-center gap-2'} variant={'subtle'} onClick={() => {
				toast({ title: 'todo', variant: 'destructive' })
			}}>
				<IconPlus size={16}/>New Chat
			</Button>
			
			<ScrollArea className={'flex-1'}>
				{
					conversations.map((conversation) => (
						<Link href={`/chat/${conversation.id}`} key={conversation.id}>
							<CompLine icon={'IconMessageCircle'}>
								{conversation.name || conversation.id}
							</CompLine>
						</Link>
					))
				}
			</ScrollArea>
			
			<Separator/>
			
			<Dialog>
				<DialogTrigger>
					<CompLine icon={'IconUser'}>My Account</CompLine>
				</DialogTrigger>
				
				<DialogContent>
					<CompUserAccount/>
				</DialogContent>
			</Dialog>
			
			<CompLine icon={'IconLogout'} onClick={() => {
				toast({ title: 'todo', variant: 'destructive' })
			}}>Log Out</CompLine>
		</div>
	)
}
