const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "Course" ALTER COLUMN "programId" DROP NOT NULL`);
  console.log('Column altered successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
