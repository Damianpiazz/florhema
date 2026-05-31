export function extractErrorMessage(err: unknown, fallback = 'Error inesperado'): string {
  return err instanceof Error ? err.message : fallback
}
