import { transfusionItemResponseSchema, listarTransfusionesResponseSchema } from './transfusiones.schema'
import type { Transfusion, ListarTransfusionesResponse } from './transfusiones.schema'

export function parseTransfusionResponse(data: unknown): Transfusion {
  return transfusionItemResponseSchema.parse(data).data.item
}

export function parseListarTransfusionesResponse(data: unknown): ListarTransfusionesResponse['data'] {
  return listarTransfusionesResponseSchema.parse(data).data
}
