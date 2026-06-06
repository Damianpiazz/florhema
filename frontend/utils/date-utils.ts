export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(d: string): string {
  return new Date(d).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcEdad(fechaNac: string): number {
  const diff = Date.now() - new Date(fechaNac).getTime()
  return Math.floor(diff / (365.25 * 86400000))
}
