import _ from 'lodash'
import { AspectRatio } from '@radix-ui/react-aspect-ratio'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { Label } from '../ui/label'
import { useState } from 'react'
import { UserPlanningView } from '@/components/userPlanning/UserPlanningView'
import { IUserPlanningPurchaseComp } from '@/ds/userPlanning'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { useAppSelector } from '@/hooks/use-redux'
import { selectU } from '@/states/features/i18nSlice'
import { Button } from '@/components/ui/button'
import { routers } from '@/config/routers'


export const UserPlanningPurchaseComp = (
	{
		name, prices, features, cover, tags, chatgptTokens,
	}:
		IUserPlanningPurchaseComp) => {
	
	const u = useAppSelector(selectU)
	
	const [byYear, setByYear] = useState(false)
	
	return (
		
		<Card className={'flex flex-col'}>
			<CardHeader>
				<div className={'w-full inline-flex items-center justify-between my-2'}>
					<h2 className={'text-2xl font-bold'}>{_.startCase(_.camelCase(name)).split(' ').join('-').toUpperCase()}</h2>
					<div className={'inline-flex items-center gap-2'}>
						{tags.map((tag) => (
							// <div key={tag} className="badge badge-secondary">{tag}</div>
							<Badge key={tag}>{tag}</Badge>
						))}
					</div>
				</div>
			</CardHeader>
			
			<CardContent className={'grow'}>
				<div className={'md:hidden'}>
					<AspectRatio ratio={5 / 3}>
						<Image src={cover} alt={name} fill priority sizes={'33vw'} className={'object-contain'}/>
					</AspectRatio>
				</div>
				
				<div className={'hidden md:block'}>
					<AspectRatio ratio={9 / 12}>
						<Image src={cover} alt={name} fill priority sizes={'33vw'} className={'object-cover'}/>
					</AspectRatio>
				</div>
				
				
				<div className="grow">
					<div className={'flex flex-col gap-2'}>
						{/*<label className="cursor-pointer label">*/}
						{/*	<span className="label-text">ChatGPT专属账号 <span className={'text-primary font-semibold text-lg'}>{chatgptTokens}w</span> token</span>*/}
						{/*	<input type="checkbox" checked readOnly className={clsx(*/}
						{/*		'checkbox checkbox-sm ',*/}
						{/*		'checkbox-success',*/}
						{/*	)}/>*/}
						{/*</label>*/}
						
						<div className="flex items-center space-x-2">
							<Checkbox checked/>
							<Label>OpenAI专属账号 <span className={'text-primary font-semibold text-lg'}>{chatgptTokens}w</span> token</Label>
						</div>
						
						{features.map((feature) => (
							<div className="flex items-center space-x-2" key={feature.name}>
								<Checkbox checked={feature.status === 'finished'}/>
								<Label>{feature.name}</Label>
							</div>
							// <label className="cursor-pointer label" key={feature.name}>
							// 	<span className="label-text">{feature.name}</span>
							// 	<input type="checkbox" checked readOnly className={clsx(
							// 		'checkbox checkbox-sm',
							// 		feature.status === 'finished' && 'checkbox-success',
							// 	)}/>
							// </label>
						))}
						<label className="cursor-pointer label">
							<span className="label-text">...</span>
						</label>
					</div>
				
				</div>
			</CardContent>
			
			<CardFooter>
				<div className={'w-full p-4 flex items-center justify-start gap-2'}>
					{
						prices.period ? (
							<>
								<p>按{byYear ? '年' : '月'}付费</p>
								<Switch onCheckedChange={(checked) => {
									setByYear(checked)
								}}/>
								<Label>￥{(byYear ? prices.period.year : prices.period.month) || '?'}</Label>
							</>
						) : (
							<>
								<p>按量付费</p>
								<Label htmlFor={'price'}>￥{prices.quantity}</Label>
							</>
						)
					}
					
					<Link href={routers.abouts.contactUS} className={'ml-auto'}>
						<Button variant={'destructive'} size={null} className={'px-4 py-0'}>Buy</Button>
					</Link>
				</div>
			</CardFooter>
		</Card>
	
	)
}
