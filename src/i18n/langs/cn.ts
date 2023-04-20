import { II18nSchema } from '@/i18n/schema'

export const schemaCN: II18nSchema = {
	hero: {
		title: '欢迎来到CS魔法社',
		subtitle: '基于计算机技术的一些研究、分享，包括基于OpenAI的chatGPT、Dalle模型等',
		entrance: '开启您的新世界',
	},
	website: {
		platformName: 'CS魔法社',
		avatarPlaceholder: '登录',
	},
	routes: {
		about: {
			versions: '版本历史',
			sponsors: '赞助商',
			us: "关于我们",
		},
		admin: {
			home: "控制台"
		},
		home: "首页",
		service: {
			chat: 'AI陪聊',
			chatGPT: "ChatGPT 聊天",
			dalle: "Dalle 作图"
		},
		user: {
			planning: "会员计划",
			wall: "留言墙",
		},
		auth: {
			home: "用户系统",
		}
	},
	notify: {
		errorUserEmpty: "用户名不能为空！请先注册登录再使用！",
		errorSendEmpty: '不能发送空消息！',
	}
}
