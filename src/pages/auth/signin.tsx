import React, { useState } from 'react'
import { NextPage } from 'next'
import { getProviders, getSession, signIn } from 'next-auth/react'
import { TitleLineComp } from '@/components/shared/TitleLineComp'
import { Input } from '@/components/ui/input'
import { validate } from 'isemail'
import { NEXTAUTH_CALLBACK_URL } from '@/lib/env'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/router'
import { RootLayout } from '@/layouts/RootLayout'

const SigninPage: NextPage = () => {
	const { toast } = useToast()
	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const router = useRouter()
	const [email, setEmail] = useState('')
	
	
	return (
		<RootLayout>
			<div className={'bg-gray-900 text-gray-100 w-full h-full flex flex-col items-center justify-center gap-2'}>
				
				<form className={'flex flex-col gap-2'} onSubmit={async (event) => {
					event.preventDefault()
					const formData = new FormData(event.currentTarget)
					console.log(Object.fromEntries(formData))
					const email = event.currentTarget.email.value
					setLoading(true)
					setEmail(email)
					await signIn('email', {
						email,
						redirect: false,
					})
					setLoading(false)
				}}>
					
					{step >= 1 && <TitleLineComp content={'Pickup your favorite name'} onTypingDone={() => step === 1 && setStep(step + 1)}/>}
					
					{
						step >= 2 && (
							<Input
								name="username"
								onKeyDown={(event) => {
									if (['Enter', 'Tab'].includes(event.key)) {
										event.preventDefault()
										setStep(step + 1)
									}
								}}
								autoFocus
							/>
						)
					}
					
					{step >= 3 && <TitleLineComp content={'Create a password'} onTypingDone={() => step === 3 && setStep(step + 1)}/>}
					
					{
						step >= 4 && (
							<Input
								type="password"
								name="password"
								onKeyDown={(event) => {
									if (['Enter', 'Tab'].includes(event.key)) {
										event.preventDefault()
										setStep(step + 1)
									}
								}}
								autoFocus
							/>
						)
					}
					
					{step >= 5 && <TitleLineComp content={'Enter your email'} onTypingDone={() => step === 5 && setStep(step + 1)}/>}
					
					{
						step >= 6 && (
							<Input
								type="email"
								name="email"
								autoFocus
								onChange={() => setLoading(false)}
								onKeyDown={(event) => {
									if (!loading && ['Enter', 'Tab'].includes(event.key)) {
										setLoading(true)
										event.preventDefault() // suppress built-in validation
										const email = event.currentTarget.value
										if (!validate(email)) {
											toast({ variant: 'destructive', title: 'failed to validate your email' })
										} else {
											setEmail(email)
											setStep(step + 1)
											toast({ title: 'sent magic code to ' + email })
										}
									}
								}}
							/>
						)
					}
					
					{step >= 7 && <TitleLineComp content={'Input your magic code'} onTypingDone={() => step == 7 && setStep(step + 1)}/>}
					
					{step >= 8 && (
						<Input
							name={'code'}
							autoFocus
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault()
									const inputToken = event.currentTarget.value
									console.log({ inputToken })
									router.push(
										`/api/auth/callback/email?email=${encodeURIComponent(email)}&token=${inputToken}&callbackUrl=${NEXTAUTH_CALLBACK_URL}`,
									)
								}
							}}
						/>
					)}
				</form>
			</div>
		</RootLayout>
	)
}

SigninPage.getInitialProps = async (context) => {
	const { req } = context
	const session = await getSession({ req })
	// todo: detect by session
	return {
		isLoggedIn: session !== null,
		providers: await getProviders(),
	}
}

export default SigninPage