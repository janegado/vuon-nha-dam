import * as XLSX from 'xlsx'
import fs from 'fs'

try {
  const buf = fs.readFileSync('G:\\Drive của tôi\\PROJECTS\\vuon_nha_dam_app\\Quan_Ly_Lam_Vuon_Mat_Ri_Duong.xlsx')
  const wb = XLSX.read(buf, { type: 'buffer' })
  console.log('Sheet Names:', wb.SheetNames)
  wb.SheetNames.forEach(sheetName => {
    console.log(`\n=== SHEET: ${sheetName} ===`)
    const sheet = wb.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)
    console.log(JSON.stringify(data, null, 2))
  })
} catch (e) {
  console.error('Error reading xlsx:', e)
}
