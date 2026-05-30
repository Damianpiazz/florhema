export function formatGrupoSanguineo(tipo: string, factorRh: string): string {
  return `${tipo} ${factorRh === 'POSITIVO' ? '+' : '−'}`
}
