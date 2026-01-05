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
  const suggestions: string[] = []
  const year = new Date().getFullYear()
  
  // Add number suffixes
  suggestions.push(`${baseSlug}-1`)
  suggestions.push(`${baseSlug}-2`)
  suggestions.push(`${baseSlug}-${year}`)
  
  // Add common suffixes
  suggestions.push(`${baseSlug}-clinic`)
  suggestions.push(`${baseSlug}-dental`)
  
  return suggestions.slice(0, 5)
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
      
      // Filter out suggestions that are also taken
      const availableSuggestions: string[] = []
      for (const suggestion of suggestions) {
        const exists = await prisma.tenant.findUnique({
          where: { slug: suggestion },
          select: { id: true },
        })
        if (!exists) {
          availableSuggestions.push(suggestion)
        }
        // Stop once we have 3 available suggestions
        if (availableSuggestions.length >= 3) break
      }

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
