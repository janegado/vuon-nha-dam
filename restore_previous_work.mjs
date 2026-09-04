import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prtceszhyfsjddccoegz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGNlc3poeWZzamRkY2NvZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg0NTAsImV4cCI6MjEwNDA3NDQ1MH0.0-uo8zfhbKHK5AzU3plvLeQqBNJU6gzsYn1jSsGMx3E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function restoreFullData() {
  console.log('🔄 Đang khôi phục toàn bộ dữ liệu từ các phiên làm việc trước...')

  // 1. LÔ ĐẤT (3 Lô chuẩn)
  const plots = [
    {
      plot_id: 'plot_1',
      name: 'Lô A - Phía Đông',
      area_m2: 30,
      soil_ph: 6.5,
      soil_type: 'Thịt nhẹ',
      status: 'Đang canh tác',
      cultivation_stage: 'Trồng cây',
      area_coord_code: 'A1',
      cultivation_history: 'Đã bón lót phân trùn quế và tro trấu hun ngày 28/08'
    },
    {
      plot_id: 'plot_2',
      name: 'Lô B - Trung tâm',
      area_m2: 40,
      soil_ph: 6.8,
      soil_type: 'Thịt pha cát',
      status: 'Chuẩn bị',
      cultivation_stage: 'Làm đất',
      area_coord_code: 'B1',
      cultivation_history: 'Đang phơi ải, chuẩn bị lên luống'
    },
    {
      plot_id: 'plot_3',
      name: 'Lô C - Phía Tây',
      area_m2: 30,
      soil_ph: 6.3,
      soil_type: 'Thịt nhẹ',
      status: 'Chuẩn bị',
      cultivation_stage: 'Làm đất',
      area_coord_code: 'C1',
      cultivation_history: 'Lô dự phòng mở rộng'
    }
  ]

  // 2. CÂY TRỒNG TRÊN LÔ A (13 Cây giống nha đam F1)
  const crops = [
    {
      crop_id: 'crop_plot_1',
      plot_id: 'plot_1',
      plant_type: 'Nha đam Mỹ F1',
      plant_date: '2026-09-01',
      density: '25cm x 30cm',
      stage: 'Kiến thiết cơ bản',
      seed_source: 'Vườn giống Ninh Thuận',
      plant_count: 13,
      seed_count: 13,
      seed_batches: [
        { batch_id: 'PN01_L1', qty: 11, plant_size: 'Size 20-25cm', unit_cost: 15000, seed_source: 'Ninh Thuận (Đợt PN01)' },
        { batch_id: 'PN01_L2', qty: 2, plant_size: 'Size 5-10cm', unit_cost: 10000, seed_source: 'Ninh Thuận (Đợt PN01)' }
      ],
      seed_notes: '11 cây Size 20-25cm + 2 cây Size 5-10cm'
    }
  ]

  // 3. CÁC PHIẾU NHẬP MUA HÀNG (Đợt cây giống Ninh Thuận + Vật tư Vương Trùn Quế)
  const purchaseReceipts = [
    {
      receipt_id: 'PN01',
      date: '2026-09-01',
      item_id: 'NL07',
      item_name: 'Cây giống nha đam Mỹ (Đa quy cách)',
      variety: 'Cây giống nha đam Mỹ',
      supplier: 'Vườn giống Ninh Thuận (098.xxx.xxxx)',
      unit: 'cây',
      total_received_qty: 46, // 33 cây đặt + 13 cây bổ sung
      goods_cost: 650000,
      shipping_cost: 30000,
      discount_amount: 0,
      total_cost: 680000,
      effective_unit_cost: 14782,
      items_list: [
        { line_id: '1', item_id: 'NL07', item_name: 'Cây giống nha đam Size 20-25cm', variety: 'Nha đam Mỹ F1 (Size 20-25cm)', spec: 'Size 20-25cm', qty: 33, bonus_qty: 0, unit_price: 15000, subtotal: 495000, total_received_qty: 33, unit: 'cây' },
        { line_id: '2', item_id: 'NL07', item_name: 'Cây giống nha đam Size 5-10cm', variety: 'Nha đam con (Size 5-10cm)', spec: 'Size 5-10cm', qty: 13, bonus_qty: 0, unit_price: 10000, subtotal: 130000, total_received_qty: 13, unit: 'cây' }
      ],
      notes: 'Nhập lô giống đầu mùa chuẩn rễ mập, đọt xanh khỏe'
    },
    {
      receipt_id: 'PN02',
      date: '2026-09-02',
      item_id: 'VTQ_01',
      item_name: 'Phân trùn quế & Dinh dưỡng sinh học',
      variety: 'Combo dinh dưỡng Farm Vương Trùn Quế',
      supplier: 'Farm Vương Trùn Quế (034.981.6802)',
      unit: 'món',
      total_received_qty: 4,
      goods_cost: 720000,
      shipping_cost: 25000,
      discount_amount: 20000,
      total_cost: 725000,
      effective_unit_cost: 181250,
      items_list: [
        { line_id: '1', item_id: 'VTQ_01', item_name: 'Phân trùn tươi', variety: 'Phân trùn tươi nguyên chất', spec: 'Bao 50kg', qty: 50, bonus_qty: 0, unit_price: 5000, subtotal: 250000, total_received_qty: 50, unit: 'kg' },
        { line_id: '2', item_id: 'VTQ_07', item_name: 'ALONUTRIPRO (Dinh dưỡng nha đam)', variety: 'ALONUTRIPRO chuyên nha đam', spec: 'Chai 1 Lít', qty: 2, bonus_qty: 0, unit_price: 85000, subtotal: 170000, total_received_qty: 2, unit: 'lít' },
        { line_id: '3', item_id: 'VTQ_04', item_name: 'GE Chuối', variety: 'GE Chuối kali hữu cơ', spec: 'Can 2 Lít', qty: 2, bonus_qty: 0, unit_price: 65000, subtotal: 130000, total_received_qty: 2, unit: 'lít' },
        { line_id: '4', item_id: 'VTQ_15', item_name: 'Chế phẩm thảo mộc trừ sâu sinh học', variety: 'Trừ sâu thảo mộc', spec: 'Chai 1 Lít', qty: 1, bonus_qty: 0, unit_price: 180000, subtotal: 180000, total_received_qty: 1, unit: 'lít' }
      ],
      notes: 'Bổ sung dinh dưỡng & bón lót cải tạo luống trồng'
    },
    {
      receipt_id: 'PN03',
      date: '2026-09-02',
      item_id: 'NL01',
      item_name: 'Mật rỉ đường & Men vi sinh EM1',
      variety: 'Nguyên liệu nhân vi sinh',
      supplier: 'Nguồn vật tư nông nghiệp tổng hợp',
      unit: 'món',
      total_received_qty: 2,
      goods_cost: 400000,
      shipping_cost: 0,
      discount_amount: 0,
      total_cost: 400000,
      effective_unit_cost: 200000,
      items_list: [
        { line_id: '1', item_id: 'NL01', item_name: 'Mật rỉ đường', variety: 'Mật rỉ đường nguyên chất', spec: 'Can 20 Lít', qty: 20, bonus_qty: 0, unit_price: 10000, subtotal: 200000, total_received_qty: 20, unit: 'lít' },
        { line_id: '2', item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', variety: 'Men vi sinh EM1 gốc', spec: 'Can 4 Lít', qty: 4, bonus_qty: 0, unit_price: 50000, subtotal: 200000, total_received_qty: 4, unit: 'lít' }
      ],
      notes: 'Phục vụ nhân mẻ IMO4 và ủ rác hữu cơ tuần hoàn'
    }
  ]

  // 4. SỔ NHẬT KÝ XUẤT KHO / XUỐNG GIỐNG / CHẾ BIẾN
  const productionLogs = [
    {
      log_id: 'log_plant_01',
      plot_id: 'plot_1',
      date: '2026-09-01',
      material_code: 'NL07',
      material_name: 'Cây giống nha đam',
      purpose: 'Xuất trồng vườn Lô A - Phía Đông',
      qty_out: 13,
      unit: 'cây',
      unit_cost: 14782,
      total_cost: 192166,
      target_code: 'TP_NHADAM_CAY',
      target_name: 'Trồng cây Lô A - Phía Đông',
      output_qty: 0,
      output_unit: 'cây',
      notes: 'Xuống giống 13 cây chuẩn rễ (11 cây size 20-25cm + 2 cây size 5-10cm) vào luống phía Đông',
      is_auto_synced: true
    },
    {
      log_id: 'log_imo_01',
      plot_id: null,
      date: '2026-09-02',
      material_code: 'NL01',
      material_name: 'Mật rỉ đường',
      purpose: 'Sản xuất IMO4 (Vi sinh bản địa)',
      qty_out: 2,
      unit: 'lít',
      unit_cost: 10000,
      total_cost: 20000,
      target_code: 'BTP_IMO4',
      target_name: 'Sinh khối vi sinh IMO4',
      output_qty: 20,
      output_unit: 'kg',
      notes: 'Mẻ IMO4 đầu tiên: 2L Mật rỉ + 4kg Cám gạo + Men vi sinh. Đang ủ nhiệt độ 55°C.',
      is_auto_synced: false
    },
    {
      log_id: 'log_trau_01',
      plot_id: null,
      date: '2026-09-03',
      material_code: 'NL05',
      material_name: 'Trấu sống (vỏ trấu)',
      purpose: 'Đốt tro trấu (Hun bón lót)',
      qty_out: 2,
      unit: 'bao',
      unit_cost: 20000,
      total_cost: 40000,
      target_code: 'NL06',
      target_name: 'Tro trấu (than trấu hun)',
      output_qty: 1,
      output_unit: 'bao',
      notes: 'Hun than trấu tơi xốp đen cánh gián để phối trộn phân trùn bón lót Lô B',
      is_auto_synced: false
    }
  ]

  // 5. DANH MỤC TỒN KHO CHUẨN XÁC ĐÃ TỰ ĐỘNG CÂN ĐỐI
  // Cây giống: Nhập 46 cây - Xuất trồng 13 cây = Còn tồn 33 cây
  // Mật rỉ đường: Nhập 20L - Xuất 2L = Còn tồn 18L
  // Men EM1: Nhập 4L - Còn tồn 4L
  // Phân trùn: Nhập 50kg - Còn tồn 50kg
  // IMO4: Thu được 20kg
  // Tro trấu: Thu được 1 bao
  const inventoryItems = [
    { item_id: 'NL07', item_name: 'Cây giống nha đam', item_type: 'Cây giống', unit: 'cây', qty_in: 46, qty_out: 13, qty_remaining: 33, unit_cost: 14782, supplier: 'Vườn giống Ninh Thuận', notes: 'Còn 33 cây giống sẵn sàng xuống giống Lô B' },
    { item_id: 'NL01', item_name: 'Mật rỉ đường', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 20, qty_out: 2, qty_remaining: 18, unit_cost: 10000, supplier: 'Nguồn tổng hợp', notes: 'Nguyên liệu trung tâm nhân nuôi vi sinh & làm GE' },
    { item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 4, qty_out: 0, qty_remaining: 4, unit_cost: 50000, supplier: 'Nguồn tổng hợp', notes: 'Dùng nhân EM gốc' },
    { item_id: 'VTQ_01', item_name: 'Phân trùn tươi', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 50, qty_out: 0, qty_remaining: 50, unit_cost: 5000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bón lót cải tạo đất' },
    { item_id: 'BTP_IMO4', item_name: 'Sinh khối vi sinh IMO4', item_type: 'Men vi sinh', unit: 'kg', qty_in: 20, qty_out: 0, qty_remaining: 20, unit_cost: 3500, supplier: 'Tự sản xuất nội bộ', notes: 'Thu từ mẻ ủ ngày 02/09' },
    { item_id: 'NL06', item_name: 'Tro trấu (than trấu hun)', item_type: 'Phân hữu cơ', unit: 'bao', qty_in: 1, qty_out: 0, qty_remaining: 1, unit_cost: 40000, supplier: 'Tự đốt than hun', notes: 'Tro trấu hun bón lót cải tạo đất' },
    { item_id: 'VTQ_07', item_name: 'ALONUTRIPRO (Dinh dưỡng nha đam)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 85000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bổ sung dinh dưỡng bẹ lá' },
    { item_id: 'VTQ_04', item_name: 'GE Chuối', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 65000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Kali hữu cơ tự nhiên' },
    { item_id: 'VTQ_15', item_name: 'Chế phẩm thảo mộc trừ sâu sinh học', item_type: 'Thuốc BVTV', unit: 'lít', qty_in: 1, qty_out: 0, qty_remaining: 1, unit_cost: 180000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Phòng trừ bọ trĩ sinh học' }
  ]

  // 6. LỊCH TÁC NGHIỆP 12 MỐC THEO CHU KỲ LÔ A
  const fieldTasks = [
    { task_id: 'task_01', plot_id: 'plot_1', task_name: '🌿 Xuống giống & tưới giữ ẩm nhẹ luống đất (Lô A - Phía Đông)', task_type: 'Trồng cây', execute_date: '2026-09-01', status: 'Đã hoàn thành', worker_id: 'Thuý', stage_milestone: 'N+0 (Xuống giống)', is_auto_reminder: true, reminder_tag: 'Lô Lô A - Phía Đông', notes: 'Đã xuống giống 13 cây' },
    { task_id: 'task_02', plot_id: 'plot_1', task_name: '💧 Kiểm tra độ ẩm luống & dựng thẳng cây nghiêng đổ (Lô A - Phía Đông)', task_type: 'Tưới', execute_date: '2026-09-04', status: 'Chờ làm', worker_id: 'Thuý', stage_milestone: 'N+3 (Bén rễ ban đầu)', is_auto_reminder: true, reminder_tag: 'Lô Lô A - Phía Đông', notes: 'Tưới nhẹ sáng sớm' },
    { task_id: 'task_03', plot_id: 'plot_1', task_name: '🌱 Tưới nhử rễ đợt 1: Men vi sinh IMO4 + Đạm cá loãng 1:1000 (Lô A - Phía Đông)', task_type: 'Bón phân', execute_date: '2026-09-08', status: 'Chờ làm', worker_id: 'Thuý', stage_milestone: 'N+7 (Kích rễ tuần 1)', is_auto_reminder: true, reminder_tag: 'Lô Lô A - Phía Đông', notes: 'Kích thích rễ non' },
    { task_id: 'task_04', plot_id: 'plot_1', task_name: '🔍 Kiểm tra tỷ lệ sống, làm cỏ đợt 1 & dặm cây héo chết (Lô A - Phía Đông)', task_type: 'Làm cỏ', execute_date: '2026-09-15', status: 'Chờ làm', worker_id: 'Thuý', stage_milestone: 'N+14 (Định hình cây 2 tuần)', is_auto_reminder: true, reminder_tag: 'Lô Lô A - Phía Đông', notes: 'Đếm tỷ lệ sống' }
  ]

  console.log('1. Đang nạp Plots...')
  await supabase.from('plots').upsert(plots, { onConflict: 'plot_id' })

  console.log('2. Đang nạp Crops...')
  await supabase.from('crops').upsert(crops, { onConflict: 'crop_id' })

  console.log('3. Đang nạp Purchase Receipts...')
  await supabase.from('purchase_receipts').upsert(purchaseReceipts, { onConflict: 'receipt_id' })

  console.log('4. Đang nạp Production Logs...')
  await supabase.from('production_logs').upsert(productionLogs, { onConflict: 'log_id' })

  console.log('5. Đang nạp Inventory Items...')
  await supabase.from('inventory_items').upsert(inventoryItems, { onConflict: 'item_id' })

  console.log('6. Đang nạp Field Tasks...')
  await supabase.from('field_tasks').upsert(fieldTasks, { onConflict: 'task_id' })

  console.log('🎉 HOÀN TẤT KHÔI PHỤC TOÀN BỘ DỮ LIỆU LÊN CLOUD SUPABASE!')
}

restoreFullData()
