import { Router, type IRouter } from 'express'

const healthRouter: IRouter = Router()

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

export { healthRouter }
