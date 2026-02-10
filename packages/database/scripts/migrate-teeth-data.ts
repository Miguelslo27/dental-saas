#!/usr/bin/env tsx
/**
 * Migration script to convert old teeth data format to new format
 *
 * Old format: { "11": "Crown needed", "21": "Healthy" }
 * New format: { "11": { note: "Crown needed", status: "healthy" }, "21": { note: "Healthy", status: "healthy" } }
 *
 * Usage:
 *   pnpm --filter @dental/database migrate:teeth        # Run migration
 *   pnpm --filter @dental/database migrate:teeth:dry    # Dry run (preview only)
 */

import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

async function migrateTeethData(dryRun = false) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  const prisma = new PrismaClient({ adapter })

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Teeth Data Migration - ${dryRun ? 'DRY RUN MODE' : 'LIVE MODE'}`)
    console.log(`${'='.repeat(60)}\n`)

    // Find all patients with teeth data
    const patients = await prisma.patient.findMany({
      where: { teeth: { not: null } },
      select: { id: true, teeth: true, firstName: true, lastName: true },
    })

    console.log(`Found ${patients.length} patients with teeth data\n`)

    if (patients.length === 0) {
      console.log('✓ No patients to migrate\n')
      return
    }

    let migratedCount = 0
    let alreadyMigratedCount = 0
    let errorCount = 0

    for (const patient of patients) {
      try {
        const oldTeeth = patient.teeth as Record<string, unknown>
        const newTeeth: Record<string, { note: string; status: string }> = {}
        let needsMigration = false

        // Check each tooth entry
        for (const [toothNumber, value] of Object.entries(oldTeeth)) {
          if (typeof value === 'string') {
            // Old format detected - convert to new format
            newTeeth[toothNumber] = { note: value, status: 'healthy' }
            needsMigration = true
          } else if (typeof value === 'object' && value !== null) {
            // Already new format - keep as-is
            newTeeth[toothNumber] = value as { note: string; status: string }
          } else {
            console.warn(`⚠ Patient ${patient.id}: Unexpected value type for tooth ${toothNumber}`)
          }
        }

        if (needsMigration) {
          if (dryRun) {
            console.log(`[DRY RUN] Would migrate patient ${patient.id} (${patient.firstName} ${patient.lastName})`)
            console.log(`  Old format:`, JSON.stringify(oldTeeth))
            console.log(`  New format:`, JSON.stringify(newTeeth))
            console.log()
          } else {
            await prisma.patient.update({
              where: { id: patient.id },
              data: { teeth: newTeeth },
            })
            console.log(`✓ Migrated patient ${patient.id} (${patient.firstName} ${patient.lastName})`)
          }
          migratedCount++
        } else {
          alreadyMigratedCount++
        }
      } catch (error) {
        errorCount++
        console.error(`✗ Error migrating patient ${patient.id}:`, error)
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('Migration Summary:')
    console.log(`${'='.repeat(60)}`)
    console.log(`Total patients with teeth data: ${patients.length}`)
    console.log(`${dryRun ? 'Would migrate' : 'Migrated'}: ${migratedCount}`)
    console.log(`Already in new format: ${alreadyMigratedCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`${'='.repeat(60)}\n`)

    if (dryRun && migratedCount > 0) {
      console.log('ℹ This was a DRY RUN. No data was modified.')
      console.log('To perform the actual migration, run:')
      console.log('  pnpm --filter @dental/database migrate:teeth\n')
    } else if (!dryRun && migratedCount > 0) {
      console.log('✓ Migration completed successfully!\n')
    }
  } catch (error) {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

// Run migration
migrateTeethData(dryRun).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
