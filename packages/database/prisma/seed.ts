import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create Plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: 'free' },
      update: { maxStorageMb: 100 },
      create: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        maxAdmins: 1,
        maxDoctors: 3,
        maxPatients: 15,
        maxStorageMb: 100,
        features: [
          'Basic patient management',
          'Appointment scheduling',
          'Email support',
        ],
      },
    }),
    prisma.plan.upsert({
      where: { name: 'basic' },
      update: { maxStorageMb: 1024 },
      create: {
        name: 'basic',
        displayName: 'Basic',
        price: 5.99,
        maxAdmins: 2,
        maxDoctors: 5,
        maxPatients: 25,
        maxStorageMb: 1024,
        features: [
          'Everything in Free',
          'Lab work tracking',
          'Treatment history',
          'Priority email support',
        ],
      },
    }),
    prisma.plan.upsert({
      where: { name: 'enterprise' },
      update: { maxStorageMb: 5120 },
      create: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 11.99,
        maxAdmins: 5,
        maxDoctors: 10,
        maxPatients: 60,
        maxStorageMb: 5120,
        features: [
          'Everything in Basic',
          'Advanced analytics',
          'Custom branding',
          'API access',
          'Phone support',
        ],
      },
    }),
  ])

  console.log(`✅ Created ${plans.length} plans`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
