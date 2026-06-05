import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/generated/prisma/client'
import { createAuditExtension } from '@/lib/prisma-extension'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

const basePrisma = new PrismaClient({ adapter })

const prisma = createAuditExtension(basePrisma)

export { prisma }
