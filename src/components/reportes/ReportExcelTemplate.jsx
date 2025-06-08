// src/components/reportes/ReportExcelTemplate.jsx

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

async function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}

export async function generateReportExcel({
  logoUrl,
  title,
  summary,
  rowsDetalle,
  fileName = `reporte-${format(new Date(),'yyyyMMdd-HHmm')}`
}) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Reporte',{
    views:[{ state:'frozen', ySplit:10 }]
  })

  // —— Logo en columna A, filas 1–3 ——  
  const res    = await fetch(logoUrl)
  const blob   = await res.blob()
  const b64    = await blobToBase64(blob)
  const logoId = wb.addImage({ base64: b64, extension: 'png' })
  ws.addImage(logoId, {
    tl:  { col: 0, row: 0 },    // top-left en A1
    ext: { width: 80, height: 60 } // ancho 80px, alto 60px ≈ 3 filas
  })

  // —— Título ——  
  ws.mergeCells('C1','F2')
  const titleCell = ws.getCell('C1')
  titleCell.value     = title
  titleCell.font      = { size:24, bold:true, color:{ argb:'FF0033CC' } }
  titleCell.alignment = { horizontal:'center', vertical:'middle' }

  // —— Resumen justo debajo del logo/título ——  
  let rowCursor = 4
  summary.forEach((item,i) => {
    const row = ws.getRow(rowCursor + i)
    row.getCell(1).value  = item.label
    row.getCell(2).value  = item.value
    row.getCell(1).font   = { bold:true }
    row.getCell(2).numFmt = '"C$"#,##0.00;[Red]-"C$"#,##0.00'
  })

  // —— Encabezado de detalle ——  
  rowCursor += summary.length + 2
  const header = ws.getRow(rowCursor)
  header.values    = ['Fecha','Tipo','Categoría','Monto']
  header.font      = { bold:true, color:{ argb:'FFFFFFFF' } }
  header.fill      = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF0033CC' } }
  header.alignment = { horizontal:'center' }

  // —— Filas de detalle con banda alterna ——  
  rowsDetalle.forEach((r,idx) => {
    const row = ws.getRow(rowCursor + 1 + idx)
    row.getCell(1).value  = r.Fecha
    row.getCell(2).value  = r.Tipo
    row.getCell(3).value  = r.Categoría
    row.getCell(4).value  = r.Monto
    row.getCell(4).numFmt = '"C$"#,##0.00;[Red]-"C$"#,##0.00'
    if (idx % 2 === 0) {
      row.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFF0F8FF' } }
    }
  })

  // —— Ajuste de anchos ——  
  ws.columns = [
    { key:'Fecha',     width:15 },
    { key:'Tipo',      width:12 },
    { key:'Categoría', width:20 },
    { key:'Monto',     width:15 },
  ]

  // —— Footer con fecha de generación ——  
  const footerRow = ws.addRow([])
  footerRow.getCell(1).value = `Generado: ${format(new Date(),'yyyy-MM-dd HH:mm')}`
  footerRow.getCell(1).font  = { italic:true, size:9, color:{ argb:'FF888888' } }

  // —— Descargar ——  
  const buf       = await wb.xlsx.writeBuffer()
  const blobExcel = new Blob([buf], {
    type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blobExcel, `${fileName}.xlsx`)
}
