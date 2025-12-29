import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: 'free' },
      update: {},
      create: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        maxAdmins: 1,
        maxDoctors: 3,
        maxPatients: 15,
        features: [
          'Basic patient management',
          'Appointment scheduling',
          'Email support',
        ],
      },
    }),
    prisma.plan.upsert({
      where: { name: 'basic' },
      update: {},
      create: {
        name: 'basic',
        displayName: 'Basic',
        price: 5.99,
        maxAdmins: 2,
        maxDoctors: 5,
        maxPatients: 25,
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
      update: {},
      create: {
        name: 'enterprise',
        displayName: 'Enterprise',
        price: 11.99,
        maxAdmins: 5,
        maxDoctors: 10,
        maxPatients: 60,
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
