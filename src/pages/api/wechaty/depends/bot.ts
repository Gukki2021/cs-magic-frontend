/**
 * ref:
 * - prepareBot: https://github.com/wechaty/puppet-padlocal/wiki/API-%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3-(TypeScript-JavaScript)#%E5%90%AF%E5%8A%A8%E5%B9%B6%E7%99%BB%E5%BD%95bot
 */
import { log, ScanStatus, Wechaty, WechatyBuilder } from 'wechaty'
import { LOGPRE, PuppetType } from '@/pages/api/wechaty/ds'
import { handleMessage } from '@/pages/api/wechaty/depends/handleMessage'
import { IBridge } from '@/ds/general'
import { promises } from 'fs'

/****************************************
 * 去掉注释，可以完全打开调试日志
 ****************************************/
// log.level("silly");

export const botManager: Record<string, any> = {}

export const CACHE_DIR = 'cache'


export const initBot = async (wxid: string, pupetType: PuppetType): Promise<IBridge> => new Promise(async (resolve, reject) => {
	
	const userDir = `${CACHE_DIR}/${wxid}`
	await promises.mkdir(userDir, { recursive: true })
	log.info(`created user directory at ${userDir}`)
	
	// 出口1： 已登录
	if (botManager[wxid]) return resolve({ success: false, content: 'existed' })
	
	log.info(LOGPRE, `init bot(wxid=${wxid})`)
	const bot = WechatyBuilder.build({
		name: `${userDir}/${wxid}`,
		puppet: pupetType,
	})
		.on('scan', (qrcode, status) => {
				if (status === ScanStatus.Waiting && qrcode) {
					// 这是 wechaty 自己搞的qrcode 生成
					// const qrcodeImageUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`
					// 出口2： 扫码登录
					return resolve({ success: true, content: qrcode })
				} else {
					log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`)
				}
			},
		)
		.on('login', async (user) => {
			log.info(LOGPRE, `${user} login`)
			// 出口3： 缓存登录
			botManager[wxid] = {
				time: Date.now(),
			}
			
			await promises.writeFile(`${userDir}/${wxid}.rooms.json`, JSON.stringify((await bot.Room.findAll()).map((item) => item.payload), null, 2))
			await promises.writeFile(`${userDir}/${wxid}.members.json`, JSON.stringify((await bot.Contact.findAll()).map((item) => item.payload), null, 2))
			
			return resolve({ success: false, content: 'existed' })
		})
		
		.on('logout', (user, reason) => {
			log.info(LOGPRE, `${user} logout, reason: ${reason}`)
		})
		
		.on('message', async (message) => {
			log.info(LOGPRE, `on message: ${message.toString()}`)
			
			await handleMessage(message, bot)
			
			// await getMessagePayload(message, pupetType)
			//
			// await dingDongBot(message)
		})
		
		.on('room-invite', async (roomInvitation) => {
			log.info(LOGPRE, `on room-invite: ${roomInvitation}`)
		})
		
		.on('room-join', (room, inviteeList, inviter, date) => {
			log.info(LOGPRE, `on room-join, room:${room}, inviteeList:${inviteeList}, inviter:${inviter}, date:${date}`)
		})
		
		.on('room-leave', (room, leaverList, remover, date) => {
			log.info(LOGPRE, `on room-leave, room:${room}, leaverList:${leaverList}, remover:${remover}, date:${date}`)
		})
		
		.on('room-topic', (room, newTopic, oldTopic, changer, date) => {
			log.info(LOGPRE, `on room-topic, room:${room}, newTopic:${newTopic}, oldTopic:${oldTopic}, changer:${changer}, date:${date}`)
		})
		
		.on('friendship', (friendship) => {
			log.info(LOGPRE, `on friendship: ${friendship}`)
		})
		
		.on('error', (error) => {
			log.error(LOGPRE, `on error: ${error}`)
			return reject(false)
		})
	
	log.info(LOGPRE, '=== bot is starting')
	await bot.start()
})

export const getBot = async (wxid: string, pupetType: PuppetType): Promise<Wechaty | undefined> => new Promise(async (resolve, reject) => {
	// 出口1： 已登录
	
	log.info(LOGPRE, `init bot(wxid=${wxid})`)
	const bot: Wechaty = WechatyBuilder.build({
		name: wxid,
		puppet: pupetType,
	})
		.on('scan', (qrcode, status) => {
				if (status === ScanStatus.Waiting && qrcode) {
					// 这是 wechaty 自己搞的qrcode 生成
					// const qrcodeImageUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`
					// 出口2： 扫码登录
					return resolve(bot)
				} else {
					log.info(LOGPRE, `onScan: ${ScanStatus[status]}(${status})`)
				}
			},
		)
		.on('login', async (user) => {
			log.info(LOGPRE, `${user} login`)
			// 出口3： 缓存登录
			botManager[wxid] = {
				time: Date.now(),
			}
			return resolve(botManager[wxid])
		})
		
		.on('logout', (user, reason) => {
			log.info(LOGPRE, `${user} logout, reason: ${reason}`)
		})
		
		.on('message', async (message) => {
			log.info(LOGPRE, `on message: ${message.toString()}`)
			
			await handleMessage(message, bot)
			
			// await getMessagePayload(message, pupetType)
			//
			// await dingDongBot(message)
		})
		
		.on('room-invite', async (roomInvitation) => {
			log.info(LOGPRE, `on room-invite: ${roomInvitation}`)
		})
		
		.on('room-join', (room, inviteeList, inviter, date) => {
			log.info(LOGPRE, `on room-join, room:${room}, inviteeList:${inviteeList}, inviter:${inviter}, date:${date}`)
		})
		
		.on('room-leave', (room, leaverList, remover, date) => {
			log.info(LOGPRE, `on room-leave, room:${room}, leaverList:${leaverList}, remover:${remover}, date:${date}`)
		})
		
		.on('room-topic', (room, newTopic, oldTopic, changer, date) => {
			log.info(LOGPRE, `on room-topic, room:${room}, newTopic:${newTopic}, oldTopic:${oldTopic}, changer:${changer}, date:${date}`)
		})
		
		.on('friendship', (friendship) => {
			log.info(LOGPRE, `on friendship: ${friendship}`)
		})
		
		.on('error', (error) => {
			log.error(LOGPRE, `on error: ${error}`)
			return reject(false)
		})
	
	log.info(LOGPRE, '=== bot is starting')
	await bot.start()
})
