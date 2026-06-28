import { prisma } from '@/lib/prisma'

function dateFilter(desde?: string, hasta?: string) {
  return { ...(desde && { gte: new Date(desde) }), ...(hasta && { lte: new Date(hasta) }) }
}

// ── Dashboard data ──

export async function getDashboardData(params: { fechaDesde?: string; fechaHasta?: string }) {
  const { fechaDesde, fechaHasta } = params
  const df = dateFilter(fechaDesde, fechaHasta)

  // ── KPI counts ──

  const [totalDonantes, totalDonaciones, totalTransfusiones, totalEstudiosGestantes, totalRecienNacidos] =
    await Promise.all([
      prisma.donante.count({ where: { deletedAt: null, createdAt: df } }),
      prisma.donacion.count({ where: { fecha: df, deletedAt: null } }),
      prisma.transfusion.count({ where: { fecha: df, deletedAt: null } }),
      prisma.estudioGestante.count({ where: { fecha: df, deletedAt: null } }),
      prisma.recienNacido.count({ where: { deletedAt: null, createdAt: df } }),
    ])

  // ── Pacientes transfundidos (unique) ──

  const transfusiones = await prisma.transfusion.findMany({
    where: { fecha: df, deletedAt: null },
    select: { pacienteId: true },
  })
  const totalPacientesTransfundidos = new Set(transfusiones.map(t => t.pacienteId)).size

  // ── Porcentaje donaciones aptas ──

  const serologias = await prisma.resultadoSerologia.findMany({
    where: { donacion: { fecha: df, deletedAt: null } },
  })
  const totalSero = serologias.length
  const aptas = serologias.filter(s => !s.hiv && !s.hcv && !s.hbv && !s.chagas && !s.sifilis).length
  const descartadas = totalSero - aptas
  const porcentajeDonacionesAptas = totalSero > 0 ? Math.round((aptas / totalSero) * 100) : 0

  // ── Porcentaje compatibilidad exitosa ──

  const transfusionesConCompatibilidad = await prisma.transfusion.findMany({
    where: { fecha: df, deletedAt: null, compatibilidadId: { not: null } },
    select: { compatibilidadId: true },
  })
  const idsCompat = transfusionesConCompatibilidad
    .map(t => t.compatibilidadId)
    .filter((id): id is number => id !== null)

  let porcentajeCompatibilidadExitosa = 0
  if (idsCompat.length > 0) {
    const compatibilidades = await prisma.compatibilidadTransfusional.findMany({
      where: { id: { in: idsCompat } },
      select: { compatible: true },
    })
    const exitosas = compatibilidades.filter(c => c.compatible).length
    porcentajeCompatibilidadExitosa = Math.round((exitosas / compatibilidades.length) * 100)
  }

  // ── Donantes por estado de aptitud ──

  const donantesPorEstadoRaw = await prisma.donante.groupBy({
    by: ['semaforoAptitud'],
    where: { deletedAt: null, createdAt: df },
    _count: { id: true },
  })
  const donantesPorEstado = donantesPorEstadoRaw.map((d) => ({
    estado: d.semaforoAptitud,
    cantidad: d._count.id,
  }))

  // ── Donantes por grupo sanguíneo ──

  const donantes = await prisma.donante.findMany({
    where: { deletedAt: null, createdAt: df },
    include: { persona: { include: { grupoSanguineo: true } } },
  })

  const grupoMap = new Map<string, { tipo: string; factorRh: string; cantidad: number }>()
  for (const d of donantes) {
    const gs = d.persona.grupoSanguineo
    const key = `${gs.tipo}-${gs.factorRh}`
    const entry = grupoMap.get(key) ?? { tipo: gs.tipo, factorRh: gs.factorRh, cantidad: 0 }
    entry.cantidad++
    grupoMap.set(key, entry)
  }
  const donantesPorGrupo = Array.from(grupoMap.values())

  // ── Evolución donaciones por mes ──

  const donacionesRaw = await prisma.donacion.findMany({
    where: { fecha: df, deletedAt: null },
    select: { fecha: true },
  })
  const donacionesPorMes = new Map<string, number>()
  for (const d of donacionesRaw) {
    const mes = `${d.fecha.getFullYear()}-${String(d.fecha.getMonth() + 1).padStart(2, '0')}`
    donacionesPorMes.set(mes, (donacionesPorMes.get(mes) ?? 0) + 1)
  }
  const evolucionDonaciones = Array.from(donacionesPorMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, cantidad]) => ({ mes, cantidad }))

  // ── Aptas vs descartadas ──

  const donacionesAptasVsDescartadas = { aptas, descartadas }

  // ── Transfusiones por mes ──

  const transfRaw = await prisma.transfusion.findMany({
    where: { fecha: df, deletedAt: null },
    select: { fecha: true },
  })
  const transfPorMes = new Map<string, number>()
  for (const t of transfRaw) {
    const mes = `${t.fecha.getFullYear()}-${String(t.fecha.getMonth() + 1).padStart(2, '0')}`
    transfPorMes.set(mes, (transfPorMes.get(mes) ?? 0) + 1)
  }
  const transfusionesPorMes = Array.from(transfPorMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, cantidad]) => ({ mes, cantidad }))

  // ── Hemocomponentes utilizados ──

  const transfComponentes = await prisma.transfusion.findMany({
    where: { fecha: df, deletedAt: null },
    select: { componente: true, cantidadUnidades: true },
  })
  const compMap = new Map<string, { componente: string; cantidad: number; unidades: number }>()
  for (const t of transfComponentes) {
    const entry = compMap.get(t.componente) ?? { componente: t.componente, cantidad: 0, unidades: 0 }
    entry.cantidad++
    entry.unidades += t.cantidadUnidades
    compMap.set(t.componente, entry)
  }
  const hemocomponentesUtilizados = Array.from(compMap.values())

  // ── Coombs indirecto ──

  const estudios = await prisma.estudioGestante.findMany({
    where: { fecha: df, deletedAt: null },
    include: { pruebaCoombsIndirecta: true },
  })
  let coombsIndirectoPositivo = 0
  let coombsIndirectoNegativo = 0
  for (const e of estudios) {
    if (e.pruebaCoombsIndirecta.positivo) coombsIndirectoPositivo++
    else coombsIndirectoNegativo++
  }

  // ── Coombs directo ──

  const recienNacidos = await prisma.recienNacido.findMany({
    where: { deletedAt: null, createdAt: df },
    include: { pruebaCoombsDirecta: true },
  })
  let coombsDirectoPositivo = 0
  let coombsDirectoNegativo = 0
  for (const rn of recienNacidos) {
    if (rn.pruebaCoombsDirecta.positivo) coombsDirectoPositivo++
    else coombsDirectoNegativo++
  }

  // ── Response ──

  return {
    // KPIs
    totalDonantes,
    totalDonaciones,
    totalPacientesTransfundidos,
    totalTransfusiones,
    totalEstudiosGestantes,
    totalRecienNacidos,
    porcentajeDonacionesAptas,
    porcentajeCompatibilidadExitosa,

    // Charts
    donantesPorEstado,
    donantesPorGrupo,
    evolucionDonaciones,
    donacionesAptasVsDescartadas,
    transfusionesPorMes,
    hemocomponentesUtilizados,
    coombsIndirecto: { positivo: coombsIndirectoPositivo, negativo: coombsIndirectoNegativo },
    coombsDirecto: { positivo: coombsDirectoPositivo, negativo: coombsDirectoNegativo },
  }
}
