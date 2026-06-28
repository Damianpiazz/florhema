import { api } from '@/lib/axios'
import { parseUsuario, parseListarResponse } from './usuarios.dto'
import type { Usuario, CrearUsuarioInput, ActualizarUsuarioInput } from './usuarios.schema'

interface ListarParams {
  page?: number
  pageSize?: number
  search?: string
}

interface ListarResponse {
  items: Usuario[]
  total: number
  page: number
  pageSize: number
}

export const usuariosService = {
  async listar(params: ListarParams = {}): Promise<ListarResponse> {
    const { data } = await api.get('/usuarios', { params })
    return parseListarResponse(data)
  },

  async crear(input: CrearUsuarioInput): Promise<Usuario> {
    const { data } = await api.post('/usuarios', input)
    return parseUsuario(data.data.user)
  },

  async actualizar(id: number, input: ActualizarUsuarioInput): Promise<Usuario> {
    const { data } = await api.patch(`/usuarios/${id}`, input)
    return parseUsuario(data.data.user)
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`)
  },
}
