import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const FIRST_NAMES = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Laura', 'Miguel', 'Sofia']
const LAST_NAMES = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres']
const SPECIALTIES = ['Ortodoncia', 'Endodoncia', 'Periodoncia', 'Odontopediatría', 'Cirugía Oral', 'Prostodoncia', 'Implantología', 'Odontología General', 'Estética Dental', 'Rehabilitación Oral']
const CONSULTING_ROOMS = ['Consultorio 1', 'Consultorio 2', 'Consultorio 3', 'Consultorio A', 'Consultorio B', 'Sala Principal']
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPhone(): string {
  return `+52 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`
}

function randomWorkingDays(): string[] {
  const numDays = Math.floor(Math.random() * 4) + 3 // 3-6 days
  const shuffled = [...DAYS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, numDays)
}

function randomWorkingHours(): { start: string; end: string } {
  const starts = ['08:00', '09:00', '10:00']
  const ends = ['17:00', '18:00', '19:00', '20:00']
  return { start: randomElement(starts), end: randomElement(ends) }
}

async function main() {
  // Find the first tenant
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) {
    console.error('No tenant found. Please create a tenant first.')
    process.exit(1)
  }

  console.log(`Using tenant: ${tenant.name} (${tenant.id})`)

  console.log('Creating 10 doctors...')
  
  for (let i = 0; i < 10; i++) {
    const firstName = FIRST_NAMES[i]
    const lastName = randomElement(LAST_NAMES)
    const email = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}@clinica.com`
    
    const doctor = {
      tenantId: tenant.id,
      firstName,
      lastName,
      email,
      phone: randomPhone(),
      specialty: randomElement(SPECIALTIES),
      consultingRoom: randomElement(CONSULTING_ROOMS),
      workingDays: randomWorkingDays(),
      workingHours: randomWorkingHours(),
      hourlyRate: Math.floor(Math.random() * 500 + 500), // 500-1000
      bio: `Dr. ${firstName} ${lastName} es especialista en ${randomElement(SPECIALTIES)} con más de ${Math.floor(Math.random() * 15 + 5)} años de experiencia.`,
      isActive: true,
    }
    
    const created = await prisma.doctor.create({ data: doctor })
    console.log(`✓ Created: Dr. ${created.firstName} ${created.lastName} - ${created.specialty}`)
  }

  console.log('\n✅ Done! 10 doctors created.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
