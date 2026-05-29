import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

async function main(): Promise<void> {
  const name = process.env.PLATFORM_ADMIN_NAME;
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'PLATFORM_ADMIN_NAME, PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD must be set.',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    }),
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.platformAdmin.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { name, email, passwordHash },
    });
    console.log(`Seeded platform admin: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
