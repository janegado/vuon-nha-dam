import * as XLSX from 'xlsx'
import fs from 'fs'

const buf = fs.readFileSync('G:\\Drive của tôi\\PROJECTS\\vuon_nha_dam_app\\Quan_Ly_Lam_Vuon_Mat_Ri_Duong.xlsx')
const wb = XLSX.read(buf, { type: 'buffer' })

console.log('=== DM_NguyenVatLieu ===')
console.log(JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets['DM_NguyenVatLieu']), null, 2))

console.log('=== NhatKy_SanXuat ===')
console.log(JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets['NhatKy_SanXuat']), null, 2))
