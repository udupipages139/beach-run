import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting via Prisma ORM...');
  const count = await prisma.registration.count();
  console.log(`Prisma ORM Registration Count: ${count}`);
  const sample = await prisma.registration.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Sample from Prisma:', sample.map(s => ({
    regNum: s.registrationNumber,
    name: s.fullName,
    status: s.paymentStatus,
    amount: s.amountINR
  })));
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Prisma Error:', e);
  await prisma.$disconnect();
});
