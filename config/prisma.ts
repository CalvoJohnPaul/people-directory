import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '~/prisma/generated/prisma/client';

const _global = globalThis as unknown as {prisma: PrismaClient | undefined};
const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = _global.prisma || new PrismaClient({adapter});

if (process.env.NODE_ENV !== 'production') _global.prisma = prisma;

export {prisma};
