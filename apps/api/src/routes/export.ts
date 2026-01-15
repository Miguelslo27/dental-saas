import { Router, Request, Response, NextFunction } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { ExportService } from '../services/export.service.js'

const router = Router()

/**
 * GET /api/export
 * Export all tenant data as JSON
 * Only OWNER and ADMIN can export data
 */
router.get(
  '/export',
  requireAuth,
  requireRole('OWNER', 'ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user!.tenantId

      if (!tenantId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required',
        })
      }

      const exportData = await ExportService.exportTenantData(tenantId)

      // Set headers for file download
      const filename = `export-${exportData.tenant.slug}-${new Date().toISOString().split('T')[0]}.json`
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

      res.json(exportData)
    } catch (error) {
      next(error)
    }
  }
)

export default router
