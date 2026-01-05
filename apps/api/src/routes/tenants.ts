import { Router, type IRouter } from 'express'
import { z } from 'zod'
import { prisma } from '@dental/database'

const tenantsRouter: IRouter = Router()

// Validation schema for slug
const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

/**
 * Generate slug suggestions based on a taken slug
 */
function generateSlugSuggestions(baseSlug: string): string[] {
  return [
    `${baseSlug}-1`,
    `${baseSlug}-2`,
    `${baseSlug}-3`,
    `${baseSlug}-clinic`,
    `${baseSlug}-dental`,
  ]
}

/**
 * GET /api/tenants/check-slug/:slug
 * Check if a clinic slug is available for registration
 */
tenantsRouter.get('/check-slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params

    // Validate slug format
    const parseResult = slugSchema.safeParse(slug)
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid slug format',
          code: 'INVALID_SLUG',
          details: parseResult.error.errors,
        },
      })
    }

    // Check if slug exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (existingTenant) {
      // Slug is taken, provide suggestions
      const suggestions = generateSlugSuggestions(slug)

      // Check all suggestions in a single query to avoid N+1
      const takenSlugs = await prisma.tenant.findMany({
        where: { slug: { in: suggestions } },
        select: { slug: true },
      })
      const takenSlugSet = new Set(takenSlugs.map((t) => t.slug))

      // Filter to available suggestions (max 3)
      const availableSuggestions = suggestions
        .filter((s) => !takenSlugSet.has(s))
        .slice(0, 3)

      return res.status(200).json({
        success: true,
        data: {
          available: false,
          slug,
          suggestions: availableSuggestions,
        },
      })
    }

    // Slug is available
    return res.status(200).json({
      success: true,
      data: {
        available: true,
        slug,
      },
    })
  } catch (error) {
    next(error)
  }
})

export { tenantsRouter }
