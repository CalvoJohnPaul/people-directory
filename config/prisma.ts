import {PrismaPg} from '@prisma/adapter-pg';
import {withAccelerate} from '@prisma/extension-accelerate';
import {PrismaClient} from '~/prisma/generated/prisma/client';

const _global = globalThis as unknown as {prisma: PrismaClient};
const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL});
const prisma = _global.prisma || new PrismaClient({adapter}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') _global.prisma = prisma;

export {prisma};
