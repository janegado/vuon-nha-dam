import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prtceszhyfsjddccoegz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGNlc3poeWZzamRkY2NvZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg0NTAsImV4cCI6MjEwNDA3NDQ1MH0.0-uo8zfhbKHK5AzU3plvLeQqBNJU6gzsYn1jSsGMx3E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ALL_INVENTORY = [
  { item_id: 'NL01', item_name: 'Mật rỉ đường', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 50, qty_out: 0, qty_remaining: 50, unit_cost: 10000, supplier: 'Tổng hợp', notes: 'Nhân nuôi vi sinh & GE' },
  { item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 10, qty_out: 0, qty_remaining: 10, unit_cost: 50000, supplier: 'Tổng hợp', notes: 'Dùng nhân EM thứ cấp' },
  { item_id: 'NL03', item_name: 'Nha đam nguyên liệu/phế phẩm', item_type: 'Phụ phẩm vườn', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 5000, supplier: 'Nội bộ vườn', notes: 'Vỏ bã & lá phế phẩm' },
  { item_id: 'NL04', item_name: 'Cám gạo (nhân IMO)', item_type: 'Nguyên liệu chính', unit: 'kg', qty_in: 20, qty_out: 0, qty_remaining: 20, unit_cost: 15000, supplier: 'Tổng hợp', notes: 'Nhân sinh khối IMO' },
  { item_id: 'NL05', item_name: 'Trấu sống (vỏ trấu)', item_type: 'Phụ phẩm vườn', unit: 'bao', qty_in: 10, qty_out: 0, qty_remaining: 10, unit_cost: 20000, supplier: 'Nông nghiệp', notes: 'Đốt than tro trấu' },
  { item_id: 'NL06', item_name: 'Tro trấu (than trấu hun)', item_type: 'Phân hữu cơ', unit: 'bao', qty_in: 5, qty_out: 0, qty_remaining: 5, unit_cost: 25000, supplier: 'Nội bộ', notes: 'Cải tạo đất' },
  { item_id: 'BTP_IMO4', item_name: 'Sinh khối vi sinh IMO4', item_type: 'Men vi sinh', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Tự sản xuất', notes: 'Sinh khối IMO4' },
  { item_id: 'NL07', item_name: 'Cây giống nha đam', item_type: 'Cây giống', unit: 'cây', qty_in: 200, qty_out: 0, qty_remaining: 200, unit_cost: 15000, supplier: 'Ninh Thuận', notes: 'Cây giống F1' },
  { item_id: 'VTQ_01', item_name: 'Phân trùn tươi', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 100, qty_out: 0, qty_remaining: 100, unit_cost: 5000, supplier: 'Vương Trùn Quế', notes: '5.000đ/kg' },
  { item_id: 'VTQ_02', item_name: 'Sinh khối trùn quế', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 10, qty_out: 0, qty_remaining: 10, unit_cost: 15000, supplier: 'Vương Trùn Quế', notes: '15.000đ/kg' },
  { item_id: 'VTQ_04', item_name: 'GE Chuối', item_type: 'Men vi sinh', unit: 'lít', qty_in: 5, qty_out: 0, qty_remaining: 5, unit_cost: 65000, supplier: 'Vương Trùn Quế', notes: '65.000đ/Lít' },
  { item_id: 'VTQ_05', item_name: 'GE Nha Đam', item_type: 'Men vi sinh', unit: 'lít', qty_in: 5, qty_out: 0, qty_remaining: 5, unit_cost: 65000, supplier: 'Vương Trùn Quế', notes: '65.000đ/Lít' },
  { item_id: 'VTQ_07', item_name: 'ALONUTRIPRO (Dinh dưỡng nha đam)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 85000, supplier: 'Vương Trùn Quế', notes: '85.000đ/Lít' },
  { item_id: 'VTQ_08', item_name: 'Dịch trùn trồng trọt (Chai 1 Lít)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 125000, supplier: 'Vương Trùn Quế', notes: '125.000đ/Lít' },
  { item_id: 'VTQ_11', item_name: 'Men vi sinh dạng lỏng (IMO PRO)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 100000, supplier: 'Vương Trùn Quế', notes: '100.000đ/Lít' },
  { item_id: 'VTQ_15', item_name: 'Chế phẩm thảo mộc trừ sâu sinh học', item_type: 'Thuốc BVTV', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 180000, supplier: 'Vương Trùn Quế', notes: '180.000đ/Lít' }
]

const ALL_NODES = [
  { node_id: 'node_1', node_type: 'Ủ phân hữu cơ vi sinh', input_source: 'Bã nha đam + Phân trùn + Tro trấu', capacity: '500 kg', status: 'Hoạt động' },
  { node_id: 'node_2', node_type: 'Nuôi trùn quế sinh khối', input_source: 'Phân bò + Bã hữu cơ', capacity: '20 m²', status: 'Hoạt động' }
]

async function seedAll() {
  console.log('Seeding all items to Supabase Cloud...')
  await supabase.from('inventory_items').upsert(ALL_INVENTORY, { onConflict: 'item_id' })
  await supabase.from('circular_nodes').upsert(ALL_NODES, { onConflict: 'node_id' })
  console.log('Done seeding all data to Supabase!')
}

seedAll()
