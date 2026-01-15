process.env.DATABASE_URL = 'postgresql://dental:localdev123@127.0.0.1:5432/dental_saas?schema=public'

async function test() {
  const { prisma } = await import('@dental/database')
  console.log('Has tenantSettings:', 'tenantSettings' in prisma)
  
  const models = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'))
  console.log('Available models:', models)
  
  await prisma.$disconnect()
}

test().catch(console.error)
