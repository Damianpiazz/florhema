import puppeteer from 'puppeteer'
import Handlebars from 'handlebars'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/app-error'

const STYLES = `
  @page { margin: 2cm 2.5cm; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 12pt;
    color: #222;
    line-height: 1.6;
  }
  .header {
    text-align: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid #1a5276;
    padding-bottom: 1rem;
  }
  .header h1 {
    font-size: 16pt;
    color: #1a5276;
    margin: 0 0 0.25rem 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .header h2 {
    font-size: 13pt;
    color: #2c3e50;
    margin: 0;
    font-weight: normal;
  }
  .title {
    text-align: center;
    font-size: 18pt;
    font-weight: bold;
    color: #1a5276;
    margin: 1.5rem 0;
    text-decoration: underline;
  }
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
  }
  .data-table td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px dotted #ccc;
    vertical-align: top;
  }
  .data-table td:first-child {
    width: 40%;
    font-weight: 600;
    color: #555;
  }
  .serologia-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.3rem 1rem;
    margin: 0.25rem 0;
  }
  .serologia-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .serologia-item .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .dot.positive { background-color: #e74c3c; }
  .dot.negative { background-color: #27ae60; }
  .serologia-item .label {
    font-size: 10pt;
    color: #333;
  }
  .firma {
    margin-top: 3rem;
    text-align: center;
  }
  .firma .line {
    width: 60%;
    border-top: 1px solid #222;
    margin: 0 auto 0.5rem;
    padding-top: 0.5rem;
  }
  .footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    font-size: 8pt;
    color: #999;
    border-top: 1px solid #ddd;
    padding-top: 0.5rem;
  }
  .result-badge {
    display: inline-block;
    padding: 0.15rem 0.75rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 11pt;
  }
  .result-badge.positive { background: #fce4e4; color: #c0392b; }
  .result-badge.negative { background: #e4fce8; color: #1e8449; }
`

const CONSTANCIA_DONACION_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${STYLES}</style>
</head>
<body>
<div class="header">
  <h1>Hospital de las Flores</h1>
  <h2>Servicio de Hemoterapia</h2>
</div>
<div class="title">Constancia de Donación</div>
<table class="data-table">
  <tr><td>Donante</td><td>{{nombre}} {{apellido}}</td></tr>
  <tr><td>DNI</td><td>{{dni}}</td></tr>
  <tr><td>Fecha de donación</td><td>{{fecha}}</td></tr>
  <tr><td>Tipo de donación</td><td>{{tipoDonacion}}</td></tr>
  <tr><td>Peso</td><td>{{peso}} kg</td></tr>
  <tr><td>Tensión Arterial</td><td>{{tensionArterial}}</td></tr>
  <tr><td>Hemoglobina</td><td>{{hemoglobina}} g/dL</td></tr>
  {{#if tieneSerologia}}
  <tr>
    <td>Serología</td>
    <td>
      <div class="serologia-grid">
        <div class="serologia-item">
          <span class="dot {{#if hiv}}positive{{else}}negative{{/if}}"></span>
          <span class="label">HIV: {{#if hiv}}Positivo{{else}}Negativo{{/if}}</span>
        </div>
        <div class="serologia-item">
          <span class="dot {{#if hcv}}positive{{else}}negative{{/if}}"></span>
          <span class="label">HCV: {{#if hcv}}Positivo{{else}}Negativo{{/if}}</span>
        </div>
        <div class="serologia-item">
          <span class="dot {{#if hbv}}positive{{else}}negative{{/if}}"></span>
          <span class="label">HBV: {{#if hbv}}Positivo{{else}}Negativo{{/if}}</span>
        </div>
        <div class="serologia-item">
          <span class="dot {{#if chagas}}positive{{else}}negative{{/if}}"></span>
          <span class="label">Chagas: {{#if chagas}}Positivo{{else}}Negativo{{/if}}</span>
        </div>
        <div class="serologia-item">
          <span class="dot {{#if sifilis}}positive{{else}}negative{{/if}}"></span>
          <span class="label">Sífilis: {{#if sifilis}}Positivo{{else}}Negativo{{/if}}</span>
        </div>
      </div>
    </td>
  </tr>
  {{/if}}
  <tr><td>Reacción adversa</td><td>{{reaccionAdversa}}</td></tr>
</table>
<div class="firma">
  <div class="line">Firma del profesional</div>
</div>
<div class="footer">
  Documento generado por el Sistema de Hemoterapia — Hospital de las Flores
</div>
</body>
</html>`

const CONSTANCIA_ESTUDIO_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${STYLES}</style>
</head>
<body>
<div class="header">
  <h1>Hospital de las Flores</h1>
  <h2>Servicio de Hemoterapia</h2>
</div>
<div class="title">Constancia de Estudio de Compatibilidad Conyugal</div>
<table class="data-table">
  <tr><td>Paciente</td><td>{{nombre}} {{apellido}}</td></tr>
  <tr><td>DNI</td><td>{{dni}}</td></tr>
  <tr><td>Grupo Sanguíneo</td><td>{{grupoSanguineo}}</td></tr>
  <tr><td>Fecha del estudio</td><td>{{fecha}}</td></tr>
  <tr>
    <td>Coombs Indirecto</td>
    <td>
      <span class="result-badge {{#if coombsPositivo}}positive{{else}}negative{{/if}}">
        {{coombsTexto}}
      </span>
    </td>
  </tr>
  <tr><td>Compatibilidad Conyugal</td><td>{{compatibilidadConyugal}}</td></tr>
  <tr><td>Estado</td><td>{{estadoEstudio}}</td></tr>
</table>
<div class="firma">
  <div class="line">Firma del profesional</div>
</div>
<div class="footer">
  Documento generado por el Sistema de Hemoterapia — Hospital de las Flores
</div>
</body>
</html>`

async function renderPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'domcontentloaded' })
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '2cm', bottom: '2cm', left: '2.5cm', right: '2.5cm' },
      printBackground: true,
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

interface DatosConstanciaEstudio {
  nombre: string
  apellido: string
  dni: string
  grupoSanguineo: string
  fecha: string
  coombsPositivo: boolean
  coombsTexto: string
  compatibilidadConyugal: string
  estadoEstudio: string
}

interface DatosConstancia {
  nombre: string
  apellido: string
  dni: string
  fecha: string
  tipoDonacion: string
  peso: string
  tensionArterial: string
  hemoglobina: string
  tieneSerologia: boolean
  hiv?: boolean
  hcv?: boolean
  hbv?: boolean
  chagas?: boolean
  sifilis?: boolean
  reaccionAdversa: string
}

function formatFecha(iso: Date): string {
  return iso.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTipoDonacion(tipo: string): string {
  const map: Record<string, string> = {
    VOLUNTARIA: 'Voluntaria',
    REPOSICION: 'Reposición',
  }
  return map[tipo] ?? tipo
}

function formatGrupoSanguineo(tipo: string, factorRh: string): string {
  const rh = factorRh === 'POSITIVO' ? '+' : '-'
  return `${tipo}${rh}`
}

function formatPeso(peso: number): string {
  return peso % 1 === 0 ? peso.toFixed(0) : peso.toFixed(1)
}

function formatHb(hb: number): string {
  return hb.toFixed(1)
}

export async function generarConstanciaDonacion(donacionId: number): Promise<Buffer> {
  const donacion = await prisma.donacion.findFirst({
    where: { id: donacionId, deletedAt: null },
    include: {
      donante: { include: { persona: true } },
      resultadoSerologia: true,
    },
  })

  if (!donacion) {
    throw new AppError(404, 'Donación no encontrada')
  }

  const persona = donacion.donante.persona
  const serologia = donacion.resultadoSerologia

  const datos: DatosConstancia = {
    nombre: persona.nombre,
    apellido: persona.apellido,
    dni: persona.dni,
    fecha: formatFecha(donacion.fecha),
    tipoDonacion: formatTipoDonacion(donacion.tipoDonacion),
    peso: formatPeso(donacion.peso),
    tensionArterial: donacion.tensionArterial,
    hemoglobina: formatHb(donacion.hemoglobina),
    tieneSerologia: !!serologia,
    hiv: serologia?.hiv,
    hcv: serologia?.hcv,
    hbv: serologia?.hbv,
    chagas: serologia?.chagas,
    sifilis: serologia?.sifilis,
    reaccionAdversa: donacion.reaccionAdversa ?? 'Ninguna',
  }

  const template = Handlebars.compile(CONSTANCIA_DONACION_TEMPLATE)
  const html = template(datos)

  return renderPdf(html)
}

export async function generarConstanciaEstudioGestante(estudioGestanteId: number): Promise<Buffer> {
  const estudio = await prisma.estudioGestante.findFirst({
    where: { id: estudioGestanteId, deletedAt: null },
    include: {
      gestante: {
        include: {
          persona: { include: { grupoSanguineo: true } },
        },
      },
      pruebaCoombsIndirecta: true,
    },
  })

  if (!estudio) {
    throw new AppError(404, 'Estudio de gestante no encontrado')
  }

  const persona = estudio.gestante.persona
  const coombs = estudio.pruebaCoombsIndirecta

  const datos: DatosConstanciaEstudio = {
    nombre: persona.nombre,
    apellido: persona.apellido,
    dni: persona.dni,
    grupoSanguineo: formatGrupoSanguineo(persona.grupoSanguineo.tipo, persona.grupoSanguineo.factorRh),
    fecha: formatFecha(estudio.fecha),
    coombsPositivo: coombs.positivo,
    coombsTexto: coombs.positivo ? 'Positivo' : 'Negativo',
    compatibilidadConyugal: estudio.compatibilidadConyugal ?? '—',
    estadoEstudio: estudio.estadoEstudio === 'FINALIZADO' ? 'Finalizado' : 'Pendiente',
  }

  const template = Handlebars.compile(CONSTANCIA_ESTUDIO_TEMPLATE)
  const html = template(datos)

  return renderPdf(html)
}
