export function formatDni(dni: string): string {
  const n = dni.replace(/\D/g, '')
  if (n.length <= 2) return n
  if (n.length <= 4) return n.replace(/(\d)(\d{3})/, '$1.$2')
  if (n.length === 7) return n.replace(/(\d)(\d{3})(\d{3})/, '$1.$2.$3')
  return n.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3')
}

export function formatPhone(phone: string): string {
  const n = phone.replace(/\D/g, '')
  if (n.length <= 2) return n
  if (n.length <= 6) return n.replace(/(\d{2})(\d+)/, '$1 $2')
  return n.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2-$3')
}
