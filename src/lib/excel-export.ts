/**
 * Styled Excel export shared by station-manager and admin reports.
 * Uses xlsx-js-style (SheetJS fork with cell styling): RTL sheets, bold colored
 * header row, zebra rows, borders, auto column widths, autofilter,
 * and an optional title row above the table.
 */

import * as XLSX from 'xlsx-js-style'

export type ExcelCell = string | number | null | undefined
export type ExcelRow = Record<string, ExcelCell>

export interface ExcelSheet {
  name: string
  rows: ExcelRow[]
  /** Optional title printed above the table (e.g. "תחנת ירושלים · 01/09–22/09/2026") */
  title?: string
  /** Header fill color (hex without #). Defaults to blue. */
  color?: string
}

const BORDER = { style: 'thin', color: { rgb: 'CBD5E1' } }
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

function buildSheet(sheet: ExcelSheet): XLSX.WorkSheet {
  const headers = sheet.rows.length ? Object.keys(sheet.rows[0]) : ['אין נתונים']
  const offset = sheet.title ? 2 : 0 // title row + blank row
  const aoa: ExcelCell[][] = []
  if (sheet.title) aoa.push([sheet.title], [])
  aoa.push(headers)
  sheet.rows.forEach(r => aoa.push(headers.map(h => r[h] ?? '')))

  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const headerColor = sheet.color || '2563EB'

  if (sheet.title) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: 0 })]
    if (cell) cell.s = { font: { bold: true, sz: 14, color: { rgb: '1E293B' } }, alignment: { horizontal: 'right' } }
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(0, headers.length - 1) } }]
  }

  headers.forEach((_, c) => {
    const cell = ws[XLSX.utils.encode_cell({ r: offset, c })]
    if (cell) cell.s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: headerColor } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: BORDERS,
    }
  })

  sheet.rows.forEach((_, i) => {
    const r = offset + 1 + i
    headers.forEach((__, c) => {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (!cell) return
      cell.s = {
        fill: i % 2 === 1 ? { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } } : undefined,
        alignment: { horizontal: 'right', vertical: 'center' },
        border: BORDERS,
      }
    })
  })

  ws['!cols'] = headers.map(h => {
    const longest = Math.max(h.length, ...sheet.rows.map(r => String(r[h] ?? '').length))
    return { wch: Math.min(45, Math.max(10, longest + 2)) }
  })
  ws['!rows'] = []
  ws['!rows'][offset] = { hpt: 24 }
  if (sheet.rows.length) {
    const lastCol = XLSX.utils.encode_col(headers.length - 1)
    ws['!autofilter'] = { ref: `A${offset + 1}:${lastCol}${offset + 1 + sheet.rows.length}` }
  }
  return ws
}

/** Builds and downloads a styled .xlsx. Returns false if every sheet is empty. */
export function exportStyledExcel(filename: string, sheets: ExcelSheet[]): boolean {
  const nonEmpty = sheets.filter(s => s.rows.length > 0)
  if (!nonEmpty.length) return false
  const wb = XLSX.utils.book_new()
  wb.Workbook = { Views: [{ RTL: true }] }
  const used = new Set<string>()
  nonEmpty.forEach(s => {
    // Excel sheet names: max 31 chars, unique, no []:*?/\
    let name = s.name.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31)
    let n = 2
    while (used.has(name)) name = `${s.name.slice(0, 28)} ${n++}`
    used.add(name)
    XLSX.utils.book_append_sheet(wb, buildSheet(s), name)
  })
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
  return true
}

export function formatDateForFile(d = new Date()): string {
  return d.toISOString().split('T')[0]
}
