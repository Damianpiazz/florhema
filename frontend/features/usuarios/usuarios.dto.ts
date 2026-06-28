import type { Usuario } from './usuarios.schema'

export function parseUsuario(data: any): Usuario {
  return {
    id: data.id,
    email: data.email,
    name: data.name ?? null,
    role: data.role,
    createdAt: data.createdAt,
  }
}

export function parseListarResponse(data: any): { items: Usuario[]; total: number; page: number; pageSize: number } {
  return {
    items: (data.data.items ?? []).map(parseUsuario),
    total: data.data.total,
    page: data.data.page,
    pageSize: data.data.pageSize,
  }
}
