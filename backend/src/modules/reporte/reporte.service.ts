import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/app-error'
import type { Prisma } from '@/generated/prisma/client'

// ── Helpers ──

function fmtFecha(iso: Date): string {
  return iso.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

type CellValue = string | number | boolean | null | undefined

// ── Excel helpers ──

const COLORS = {
  header: 'FF1A5276',
  subheader: 'FF2C3E50',
  muted: 'FF555555',
  body: 'FF222222',
  tableHeaderBg: 'FFEEEEFF',
  border: 'FFCCCCCC',
}

function addTitle(ws: ExcelJS.Worksheet, row: number, text: string, fontSize = 16, color = COLORS.header): void {
  ws.mergeCells(`A${row}:C${row}`)
  const cell = ws.getCell(`A${row}`)
  cell.value = text
  cell.font = { bold: true, size: fontSize, color: { argb: color } }
  cell.alignment = { horizontal: 'center' }
}

function addSection(ws: ExcelJS.Worksheet, row: number, title: string): void {
  ws.mergeCells(`A${row}:C${row}`)
  const cell = ws.getCell(`A${row}`)
  cell.value = title
  cell.font = { bold: true, size: 11, color: { argb: COLORS.header } }
  cell.border = { bottom: { style: 'thin', color: { argb: COLORS.header } } }
}

function addField(ws: ExcelJS.Worksheet, row: number, label: string, value: CellValue): void {
  const lbl = ws.getCell(`A${row}`)
  lbl.value = label
  lbl.font = { bold: true, color: { argb: COLORS.muted } }
  lbl.alignment = { horizontal: 'left' }

  const val = ws.getCell(`B${row}`)
  val.value = value ?? '______________'
  val.font = value != null && value !== ''
    ? { color: { argb: COLORS.body } }
    : { italic: true, color: { argb: COLORS.muted } }
}

function addTableHeaders(ws: ExcelJS.Worksheet, row: number, headers: string[]): void {
  headers.forEach((h, i) => {
    const cell = ws.getCell(row, i + 1)
    cell.value = h
    cell.font = { bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.tableHeaderBg } }
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.border } },
      bottom: { style: 'thin', color: { argb: COLORS.border } },
      left: { style: 'thin', color: { argb: COLORS.border } },
      right: { style: 'thin', color: { argb: COLORS.border } },
    }
    cell.alignment = { wrapText: true }
  })
}

function addTableRow(ws: ExcelJS.Worksheet, row: number, values: CellValue[]): void {
  values.forEach((v, i) => {
    const cell = ws.getCell(row, i + 1)
    cell.value = v
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.border } },
      bottom: { style: 'thin', color: { argb: COLORS.border } },
      left: { style: 'thin', color: { argb: COLORS.border } },
      right: { style: 'thin', color: { argb: COLORS.border } },
    }
  })
}

function addFooter(ws: ExcelJS.Worksheet, row: number): void {
  ws.mergeCells(`A${row}:C${row}`)
  const cell = ws.getCell(`A${row}`)
  cell.value = 'Documento generado por el Sistema de Hemoterapia — Hospital de las Flores'
  cell.font = { size: 8, color: { argb: 'FF999999' } }
  cell.alignment = { horizontal: 'center' }
}

// ── Workbook builder ──

async function buildWorkbook(
  title: string,
  periodo: string,
  buildContent: (ws: ExcelJS.Worksheet) => Promise<void>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistema de Hemoterapia — Hospital de las Flores'
  workbook.created = new Date()

  const ws = workbook.addWorksheet('Planilla')

  // Column widths: label / value / extra
  ws.columns = [
    { width: 42 },
    { width: 42 },
    { width: 18 },
  ]

  addTitle(ws, 1, 'Hospital de las Flores', 16, COLORS.header)
  addTitle(ws, 2, 'Servicio de Hemoterapia', 12, COLORS.subheader)
  addTitle(ws, 3, title, 14, COLORS.header)
  addTitle(ws, 4, `Período: ${periodo}`, 10, COLORS.muted)

  await buildContent(ws)

  return Buffer.from(await workbook.xlsx.writeBuffer())
}

// ── HEMO 1 ──

async function buildHemo1(ws: ExcelJS.Worksheet, desde: Date | undefined, hasta: Date | undefined): Promise<void> {
  const where: Prisma.DonacionWhereInput = {
    fecha: { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) },
    deletedAt: null,
  }

  const totalDonaciones = await prisma.donacion.count({ where })

  const porTipo = await prisma.donacion.groupBy({
    by: ['tipoDonacion'],
    where,
    _count: { id: true },
  })
  const voluntarios = porTipo.find(t => t.tipoDonacion === 'VOLUNTARIA')?._count.id ?? 0
  const reposicion = porTipo.find(t => t.tipoDonacion === 'REPOSICION')?._count.id ?? 0

  const sero = await prisma.resultadoSerologia.findMany({
    where: { donacion: { ...where } },
  })
  const countSero = (key: 'hiv' | 'hcv' | 'hbv' | 'chagas' | 'sifilis') =>
    sero.filter(s => s[key]).length

  const tfWhere: Prisma.TransfusionWhereInput = {
    fecha: { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) },
    deletedAt: null,
  }

  const transfusiones = await prisma.transfusion.findMany({
    where: tfWhere,
    include: { paciente: true },
  })
  const compMap = new Map<string, { cantidad: number; unidades: number }>()
  for (const t of transfusiones) {
    const c = t.componente
    const entry = compMap.get(c) ?? { cantidad: 0, unidades: 0 }
    entry.cantidad++
    entry.unidades += t.cantidadUnidades
    compMap.set(c, entry)
  }

  // ── Build sheet ──
  let r = 6

  addSection(ws, r, 'Datos del establecimiento')
  r++
  addField(ws, r, 'Nombre del establecimiento', 'Hospital de las Flores')
  r++

  r++
  addSection(ws, r, 'Donantes')
  r++
  addField(ws, r, 'Donantes presentados', totalDonaciones)
  r++
  addField(ws, r, 'Donantes aceptados', totalDonaciones)
  r++
  addField(ws, r, 'Voluntarios', voluntarios)
  r++
  addField(ws, r, 'Reposición', reposicion)

  r++
  addSection(ws, r, 'Serologías positivas')
  r++
  addTableHeaders(ws, r, ['Marcador', 'Positivos'])
  r++
  for (const [label, key] of [['HIV', 'hiv'], ['HCV', 'hcv'], ['HBV', 'hbv'], ['Chagas', 'chagas'], ['Sífilis', 'sifilis']] as const) {
    addTableRow(ws, r, [label, countSero(key as 'hiv' | 'hcv' | 'hbv' | 'chagas' | 'sifilis')])
    r++
  }

  r++
  addSection(ws, r, 'Transfusiones por hemocomponente')
  r++
  addTableHeaders(ws, r, ['Componente', 'Cantidad', 'Unidades'])
  r++
  for (const [componente, v] of compMap) {
    addTableRow(ws, r, [componente.replace(/_/g, ' '), v.cantidad, v.unidades])
    r++
  }

  addFooter(ws, r + 1)
}

// ── HEMO 2 ──

async function buildHemo2(ws: ExcelJS.Worksheet, desde: Date | undefined, hasta: Date | undefined): Promise<void> {
  const where: Prisma.TransfusionWhereInput = {
    fecha: { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) },
    deletedAt: null,
  }

  const transfusiones = await prisma.transfusion.findMany({
    where,
    include: { paciente: { include: { persona: true } } },
    orderBy: { fecha: 'desc' },
  })

  const compMap = new Map<string, { cantidad: number; unidades: number }>()
  for (const t of transfusiones) {
    const c = t.componente
    const entry = compMap.get(c) ?? { cantidad: 0, unidades: 0 }
    entry.cantidad++
    entry.unidades += t.cantidadUnidades
    compMap.set(c, entry)
  }

  let r = 6

  addSection(ws, r, 'Resumen de hemocomponentes por tipo')
  r++
  addTableHeaders(ws, r, ['Componente', 'Cantidad de transfusiones', 'Total unidades'])
  r++
  if (compMap.size === 0) {
    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(`A${r}`).value = 'No hay datos en el período seleccionado'
    ws.getCell(`A${r}`).alignment = { horizontal: 'center' }
    ws.getCell(`A${r}`).font = { color: { argb: 'FF999999' } }
    r++
  } else {
    for (const [componente, v] of compMap) {
      addTableRow(ws, r, [componente.replace(/_/g, ' '), v.cantidad, v.unidades])
      r++
    }
  }

  r++
  addSection(ws, r, 'Detalle por paciente')
  r++
  addTableHeaders(ws, r, ['Fecha', 'Paciente', 'Componente', 'Unidades', 'Reacción'])
  r++
  if (transfusiones.length === 0) {
    ws.mergeCells(`A${r}:E${r}`)
    ws.getCell(`A${r}`).value = 'No hay datos en el período seleccionado'
    ws.getCell(`A${r}`).alignment = { horizontal: 'center' }
    ws.getCell(`A${r}`).font = { color: { argb: 'FF999999' } }
    r++
  } else {
    for (const t of transfusiones) {
      addTableRow(ws, r, [
        fmtFecha(t.fecha),
        `${t.paciente.persona.apellido}, ${t.paciente.persona.nombre}`,
        t.componente.replace(/_/g, ' '),
        t.cantidadUnidades,
        t.reaccionAdversa ?? '—',
      ])
      r++
    }
  }

  addFooter(ws, r + 1)
}

// ── HEMO 3 ──

async function buildHemo3(ws: ExcelJS.Worksheet, desde: Date | undefined, hasta: Date | undefined): Promise<void> {
  const where: Prisma.ResultadoSerologiaWhereInput = {
    donacion: {
      fecha: { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) },
      deletedAt: null,
    },
  }

  const sero = await prisma.resultadoSerologia.findMany({ where })
  const count = (key: 'hiv' | 'hcv' | 'hbv' | 'chagas' | 'sifilis') => sero.filter(s => s[key]).length
  const total = sero.filter(s => s.hiv || s.hcv || s.hbv || s.chagas || s.sifilis).length

  let r = 6

  addSection(ws, r, 'Unidades descartadas por serología positiva')
  r++
  addTableHeaders(ws, r, ['Motivo', 'Cantidad'])
  r++
  for (const [label, key] of [['HIV positivo', 'hiv'], ['HCV positivo', 'hcv'], ['HBV positivo', 'hbv'], ['Chagas positivo', 'chagas'], ['Sífilis positiva', 'sifilis']] as const) {
    addTableRow(ws, r, [label, count(key as 'hiv' | 'hcv' | 'hbv' | 'chagas' | 'sifilis')])
    r++
  }
  addTableRow(ws, r, ['Total descartes por serología', total])
  ws.getCell(`A${r}`).font = { bold: true }
  ws.getCell(`B${r}`).font = { bold: true }
  r++

  r++
  addSection(ws, r, 'Otros motivos de descarte')
  r++
  addField(ws, r, 'Hemólisis', null)
  r++
  addField(ws, r, 'Vencimiento', null)
  r++
  addField(ws, r, 'Bolsa dañada', null)
  r++
  addField(ws, r, 'Bajo volumen', null)
  r++
  addField(ws, r, 'Otros', null)

  addFooter(ws, r + 1)
}

// ── HEMO 4 ──

async function buildHemo4(ws: ExcelJS.Worksheet, desde: Date | undefined, hasta: Date | undefined): Promise<void> {
  const fechaFilter = { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) }

  const donaciones = await prisma.donacion.findMany({
    where: { fecha: fechaFilter, deletedAt: null, reaccionAdversa: { not: null } } satisfies Prisma.DonacionWhereInput,
    select: { reaccionAdversa: true },
  })
  const transfusiones = await prisma.transfusion.findMany({
    where: { fecha: fechaFilter, deletedAt: null, reaccionAdversa: { not: null } } satisfies Prisma.TransfusionWhereInput,
    select: { reaccionAdversa: true },
  })

  const agrupar = (items: { reaccionAdversa: string | null }[]) => {
    const map = new Map<string, number>()
    for (const item of items) {
      const t = item.reaccionAdversa || 'Sin especificar'
      map.set(t, (map.get(t) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([tipo, cantidad]) => ({ tipo, cantidad }))
  }

  let r = 6

  addSection(ws, r, 'Reacciones adversas en donantes')
  r++
  addTableHeaders(ws, r, ['Tipo de reacción', 'Cantidad'])
  r++
  const dReacciones = agrupar(donaciones)
  if (dReacciones.length === 0) {
    ws.mergeCells(`A${r}:B${r}`)
    ws.getCell(`A${r}`).value = 'Sin reacciones registradas'
    ws.getCell(`A${r}`).alignment = { horizontal: 'center' }
    ws.getCell(`A${r}`).font = { color: { argb: 'FF999999' } }
    r++
  } else {
    for (const item of dReacciones) {
      addTableRow(ws, r, [item.tipo, item.cantidad])
      r++
    }
  }

  r++
  addSection(ws, r, 'Reacciones adversas en pacientes transfundidos')
  r++
  addTableHeaders(ws, r, ['Tipo de reacción', 'Cantidad'])
  r++
  const pReacciones = agrupar(transfusiones)
  if (pReacciones.length === 0) {
    ws.mergeCells(`A${r}:B${r}`)
    ws.getCell(`A${r}`).value = 'Sin reacciones registradas'
    ws.getCell(`A${r}`).alignment = { horizontal: 'center' }
    ws.getCell(`A${r}`).font = { color: { argb: 'FF999999' } }
    r++
  } else {
    for (const item of pReacciones) {
      addTableRow(ws, r, [item.tipo, item.cantidad])
      r++
    }
  }

  r++
  addSection(ws, r, 'Severidad y evolución')
  r++
  addField(ws, r, 'Severidad', null)
  r++
  addField(ws, r, 'Evolución', null)

  addFooter(ws, r + 1)
}

// ── HEMO 5 ──

async function buildHemo5(ws: ExcelJS.Worksheet, desde: Date | undefined, hasta: Date | undefined): Promise<void> {
  const where: Prisma.EstudioGestanteWhereInput = {
    fecha: { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) },
    deletedAt: null,
  }

  const estudios = await prisma.estudioGestante.findMany({
    where,
    include: { pruebaCoombsIndirecta: true },
    orderBy: { fecha: 'desc' },
  })

  const gestantesUnicas = new Set(estudios.map(e => e.gestanteId)).size
  const coombsPos = estudios.filter(e => e.pruebaCoombsIndirecta.positivo).length
  const coombsNeg = estudios.filter(e => !e.pruebaCoombsIndirecta.positivo).length

  let totalRecienNacidos = 0
  if (desde || hasta) {
    const rnWhere: Prisma.RecienNacidoWhereInput = { deletedAt: null }
    if (desde || hasta) {
      rnWhere.createdAt = { ...(desde && { gte: desde }), ...(hasta && { lte: hasta }) }
    }
    totalRecienNacidos = await prisma.recienNacido.count({ where: rnWhere })
  }

  let r = 6

  addSection(ws, r, 'Resumen de gestantes estudiadas')
  r++
  const resumen = [
    ['Total gestantes', gestantesUnicas],
    ['Total estudios realizados', estudios.length],
    ['Coombs indirecto positivo', coombsPos],
    ['Coombs indirecto negativo', coombsNeg],
    ['Recién nacidos evaluados', totalRecienNacidos],
  ] as const
  for (const [label, val] of resumen) {
    addTableRow(ws, r, [label, val])
    ws.getCell(`A${r}`).font = { bold: true }
    r++
  }

  r++
  addSection(ws, r, 'Detalle de estudios')
  r++
  addTableHeaders(ws, r, ['Fecha', 'Compatibilidad Conyugal', 'Coombs Indirecto', 'Estado'])
  r++
  if (estudios.length === 0) {
    ws.mergeCells(`A${r}:D${r}`)
    ws.getCell(`A${r}`).value = 'No hay datos en el período seleccionado'
    ws.getCell(`A${r}`).alignment = { horizontal: 'center' }
    ws.getCell(`A${r}`).font = { color: { argb: 'FF999999' } }
    r++
  } else {
    for (const e of estudios) {
      addTableRow(ws, r, [
        fmtFecha(e.fecha),
        e.compatibilidadConyugal ?? '—',
        e.pruebaCoombsIndirecta.positivo ? 'Positivo' : 'Negativo',
        e.estadoEstudio === 'FINALIZADO' ? 'Finalizado' : 'Pendiente',
      ])
      r++
    }
  }

  addFooter(ws, r + 1)
}

// ── Service ──

export async function generarReporte(params: {
  planilla: number
  fechaDesde?: string
  fechaHasta?: string
}): Promise<Buffer> {
  const desde = params.fechaDesde ? new Date(params.fechaDesde) : undefined
  const hasta = params.fechaHasta ? new Date(params.fechaHasta) : undefined

  if (desde && hasta && desde > hasta) {
    throw new AppError(400, 'La fecha desde no puede ser posterior a la fecha hasta')
  }

  const periodo = [desde && fmtFecha(desde), hasta && fmtFecha(hasta)].filter(Boolean).join(' — ') || 'Sin especificar'
  const titles: Record<number, string> = {
    1: 'HEMO 1 — Resumen Estadístico del Servicio',
    2: 'HEMO 2 — Hemocomponentes Transfundidos',
    3: 'HEMO 3 — Unidades Descartadas',
    4: 'HEMO 4 — Reacciones Adversas',
    5: 'HEMO 5 — Gestantes Estudiadas',
  }

  return buildWorkbook(titles[params.planilla] ?? `HEMO ${params.planilla}`, periodo, async (ws) => {
    switch (params.planilla) {
      case 1:
        await buildHemo1(ws, desde, hasta)
        break
      case 2:
        await buildHemo2(ws, desde, hasta)
        break
      case 3:
        await buildHemo3(ws, desde, hasta)
        break
      case 4:
        await buildHemo4(ws, desde, hasta)
        break
      case 5:
        await buildHemo5(ws, desde, hasta)
        break
      default:
        throw new AppError(400, 'Planilla inválida. Use 1-5')
    }
  })
}
