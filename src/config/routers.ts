export const routers = {
	apps: {
		chat: {
			chatGPT: '/apps/chat/chatGPT',
			dalle: '/apps/chat/dalle',
		},
	},
	
	user: {
		planning: '/user-planning',
		wallMessages: '/wall-messages',
	},
	
	about: {
		versions: '/about/versions',
		contactUS: '/about/contact',
		jobs: '/about/occupation',
	},
	
	legals: {
		termOfUse: '/legal/term-of-use',
		privacyPolicy: '/legal/privacy-policy',
	},
	
	admin: {
		home: '/admin',
	},
	home: '/',
	auth: {
		signin: '/auth/signin',
	},
}


export type IRouters = typeof routers
