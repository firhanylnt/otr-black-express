import { Router } from 'express'
import { config } from '../config.js'
import auth from './auth.js'
import upload from './upload.js'
import songs from './songs.js'
import albums from './albums.js'
import playlists from './playlists.js'
import events from './events.js'
import genres from './genres.js'
import moods from './moods.js'
import users from './users.js'
import creators from './creators.js'
import residents from './residents.js'
import subscribers from './subscribers.js'
import products from './products.js'
import program from './program.js'
import picks from './picks.js'
import highlights from './highlights.js'
import settings from './settings.js'
import history from './history.js'

const prefix = config.apiPrefix
const router = Router()

router.use(`${prefix}/auth`, auth)
router.use(`${prefix}/upload`, upload)
router.use(`${prefix}/songs`, songs)
router.use(`${prefix}/albums`, albums)
router.use(`${prefix}/playlists`, playlists)
router.use(`${prefix}/events`, events)
router.use(`${prefix}/genres`, genres)
router.use(`${prefix}/moods`, moods)
router.use(`${prefix}/users`, users)
router.use(`${prefix}/creators`, creators)
router.use(`${prefix}/residents`, residents)
router.use(`${prefix}/subscribers`, subscribers)
router.use(`${prefix}/products`, products)
router.use(`${prefix}/program`, program)
router.use(`${prefix}/picks`, picks)
router.use(`${prefix}/highlights`, highlights)
router.use(`${prefix}/settings`, settings)
router.use(`${prefix}/history`, history)

router.get(prefix + '/health', (_req, res) => {
  res.json({ success: true, message: 'OK' })
})

export default router
