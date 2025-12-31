import { Router, type IRouter } from 'express'
import { requireAuthAsSuperAdmin } from '../../middleware/auth.js'
import { setupRouter } from './setup.js'
import { tenantsRouter } from './tenants.js'
import { usersRouter } from './users.js'
import { statsRouter } from './stats.js'

const adminRouter: IRouter = Router()

// Setup endpoint is public (but self-disabling)
adminRouter.use('/setup', setupRouter)

// All other admin routes require super admin authentication
adminRouter.use('/tenants', requireAuthAsSuperAdmin, tenantsRouter)
adminRouter.use('/users', requireAuthAsSuperAdmin, usersRouter)
adminRouter.use('/stats', requireAuthAsSuperAdmin, statsRouter)

export { adminRouter }
