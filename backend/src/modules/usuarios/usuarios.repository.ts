import { prisma } from '@/lib/prisma'

export interface ListarParams {
  page: number
  pageSize: number
  search?: string
}

export async function listar(params: ListarParams) {
  const where: Record<string, unknown> = {
    deletedAt: null,
    ...(params.search
      ? {
          OR: [
            { email: { contains: params.search, mode: 'insensitive' as const } },
            { name: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      omit: { password: true },
    }),
    prisma.user.count({ where: where as any }),
  ])

  return { items, total }
}

export async function findById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    omit: { password: true },
  })
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findByEmailWithPassword(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function crear(data: {
  email: string
  password: string
  name?: string | null
  role: string
}) {
  return prisma.user.create({
    data: data as any,
    omit: { password: true },
  })
}

export async function actualizar(
  id: number,
  data: { email?: string; name?: string | null; role?: string }
) {
  return prisma.user.update({
    where: { id },
    data: data as any,
    omit: { password: true },
  })
}

export async function softDelete(id: number) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    omit: { password: true },
  })
}
