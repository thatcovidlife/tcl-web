// Server-side bot detection pattern; differs from patterns in other middleware files.
import { shouldBlockBotRequest } from '../utils/botDetection'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    const { req, res } = event.node
    const path = req.url || '/'

    const blockResult = shouldBlockBotRequest(req, path)
    if (blockResult) {
      console.warn('[Security] Server: Bot detected', {
        path,
        ua: (req.headers['user-agent'] || '').substring(0, 50),
        reason: blockResult.reason,
      })
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'Access Denied',
          message: blockResult.message,
        }),
      )
      return
    }
  })
})
