export interface DashboardData {
  // KPIs
  totalDonantes: number
  totalDonaciones: number
  totalPacientesTransfundidos: number
  totalTransfusiones: number
  totalEstudiosGestantes: number
  totalRecienNacidos: number
  porcentajeDonacionesAptas: number
  porcentajeCompatibilidadExitosa: number

  // Charts
  donantesPorGrupo: { tipo: string; factorRh: string; cantidad: number }[]
  evolucionDonaciones: { mes: string; cantidad: number }[]
  donacionesAptasVsDescartadas: { aptas: number; descartadas: number }
  transfusionesPorMes: { mes: string; cantidad: number }[]
  hemocomponentesUtilizados: { componente: string; cantidad: number; unidades: number }[]
  coombsIndirecto: { positivo: number; negativo: number }
  coombsDirecto: { positivo: number; negativo: number }
}
