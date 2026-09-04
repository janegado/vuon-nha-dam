import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prtceszhyfsjddccoegz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGNlc3poeWZzamRkY2NvZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg0NTAsImV4cCI6MjEwNDA3NDQ1MH0.0-uo8zfhbKHK5AzU3plvLeQqBNJU6gzsYn1jSsGMx3E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const DEMO_PLOTS = [
  { plot_id: 'plot_1', name: 'Lô A - Phía Đông', area_m2: 30, soil_ph: 6.5, soil_type: 'Thịt nhẹ', status: 'Chuẩn bị', area_coord_code: 'A1', cultivation_stage: 'Làm đất', cultivation_history: 'Lô đầu đông' },
  { plot_id: 'plot_2', name: 'Lô B - Trung tâm', area_m2: 40, soil_ph: 6.8, soil_type: 'Thịt pha cát', status: 'Chuẩn bị', area_coord_code: 'B1', cultivation_stage: 'Làm đất', cultivation_history: 'Lô trung tâm' },
  { plot_id: 'plot_3', name: 'Lô C - Phía Tây', area_m2: 30, soil_ph: 6.3, soil_type: 'Thịt nhẹ', status: 'Chuẩn bị', area_coord_code: 'C1', cultivation_stage: 'Làm đất', cultivation_history: 'Lô phía tây' },
]

const DEMO_INVENTORY = [
  { item_id: 'NL01', item_name: 'Mật rỉ đường', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 50, qty_out: 0, qty_remaining: 50, unit_cost: 10000, supplier: 'Tổng hợp', notes: 'Nhân nuôi vi sinh & GE' },
  { item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 10, qty_out: 0, qty_remaining: 10, unit_cost: 50000, supplier: 'Tổng hợp', notes: 'Dùng nhân EM thứ cấp' },
  { item_id: 'VTQ_01', item_name: 'Phân trùn tươi', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 100, qty_out: 0, qty_remaining: 100, unit_cost: 5000, supplier: 'Vương Trùn Quế', notes: 'Bón lót cải tạo đất' },
  { item_id: 'NL07', item_name: 'Cây giống nha đam', item_type: 'Cây giống', unit: 'cây', qty_in: 200, qty_out: 0, qty_remaining: 200, unit_cost: 15000, supplier: 'Ninh Thuận', notes: 'Nha đam giống F1' },
]

async function seed() {
  console.log('Inserting demo plots with plot_id...')
  const { data: pData, error: pErr } = await supabase.from('plots').upsert(DEMO_PLOTS, { onConflict: 'plot_id' }).select()
  console.log('Plots upsert result:', { count: pData?.length, pErr })

  console.log('Inserting demo inventory with item_id...')
  const { data: iData, error: iErr } = await supabase.from('inventory_items').upsert(DEMO_INVENTORY, { onConflict: 'item_id' }).select()
  console.log('Inventory upsert result:', { count: iData?.length, iErr })

  const { data: plots } = await supabase.from('plots').select('*')
  console.log('Current plots on Supabase Cloud:', plots)
}

seed()
