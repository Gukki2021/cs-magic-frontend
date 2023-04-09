import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppDispatch, useAppSelector } from '@/states/hooks'
import { selectUserBasic, selectUserId, setUserBasic } from '@/states/features/userSlice'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { UserPlanningComp } from '@/components/shared/UserPlanningComp'
import { UserRegisterComp } from '@/components/shared/UserRegisterComp'
import { Input } from '@/components/ui/input'
import { Label } from '../ui/label'
import { Button } from '@/components/ui/button'
import _ from 'lodash'
import { updateUserName } from '@/api/user'

export const NavbarAvatarComp = () => {
	const dispatch = useAppDispatch()
	const userId = useAppSelector(selectUserId)!
	const userBasic = useAppSelector(selectUserBasic)
	const { toast } = useToast()
	
	return (
		<Dialog>
			<DialogTrigger>
				<Avatar>
					<AvatarFallback>{(userBasic.name || userId || 'U')[0]}</AvatarFallback>
				</Avatar>
			</DialogTrigger>
			
			<DialogContent>
				
				<DialogHeader>
					<DialogTitle>Your Profile</DialogTitle>
				</DialogHeader>
				
				<div className={'flex justify-between items-center'}>
					<div className={'inline-flex gap-2 items-center'}>
						<Label htmlFor={'id'}>id</Label>
						<p id={'id'} className={'text-blue-500 cursor-pointer'} onClick={() => {
							navigator.clipboard.writeText(userId)
							toast({ title: 'copied your user_id' })
						}}>
							{userId}
						</p>
					</div>
					<UserRegisterComp/>
				</div>
				
				<form className={'flex justify-between items-center'} onSubmit={async (event) => {
					event.preventDefault()
					const name = event.currentTarget.userName.value
					await updateUserName(userId!, name)
					dispatch(setUserBasic({ ...userBasic, name }))
				}}>
					<div className={'inline-flex gap-2 items-center'}>
						<Label htmlFor={'userName'}>name</Label>
						<Input id={'userName'} name={'userName'} placeholder={'Unknown'} defaultValue={userBasic.name}/>
					</div>
					<Button variant={'default'} size={'sm'} type={'submit'}>Rename</Button>
				</form>
				
				<div className={'inline-flex gap-2 items-center'}>
					<Label htmlFor={'userAvatar'}>avatar</Label>
					<label>
						<Avatar id={'userAvatar'} className={'cursor-pointer'}>
							<AvatarImage src={userBasic.avatar}/>
							<AvatarFallback>{(userBasic.name || userId || 'U')[0]}</AvatarFallback>
						</Avatar>
						<input hidden type={'file'} accept={'image/*'}/>
					</label>
				</div>
				
				<div className={'flex justify-between items-center'}>
					<div className={'inline-flex gap-2 items-center'}>
						<Label htmlFor={'planning'}>planning</Label>
						<p id={'planning'}>{_.upperCase(userBasic.planning)}</p>
					</div>
					<UserPlanningComp/>
				</div>
			</DialogContent>
		
		</Dialog>
	)
}
