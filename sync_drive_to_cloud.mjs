import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prtceszhyfsjddccoegz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGNlc3poeWZzamRkY2NvZWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTg0NTAsImV4cCI6MjEwNDA3NDQ1MH0.0-uo8zfhbKHK5AzU3plvLeQqBNJU6gzsYn1jSsGMx3E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function syncDriveDataToCloud() {
  console.log('🔄 Bắt đầu nạp toàn bộ số liệu từ Google Drive (File Excel & Nhật ký) lên Supabase...')

  // 1. LÔ ĐẤT & CÂY TRỒNG
  const plots = [
    {
      plot_id: 'plot_1',
      name: 'Lô A - Phía Đông',
      area_m2: 30,
      soil_ph: 6.5,
      soil_type: 'Thịt nhẹ',
      status: 'Đang canh tác',
      cultivation_stage: 'Chăm sóc',
      area_coord_code: 'A1',
      cultivation_history: 'Đã bón lót phân trùn quế + tro trấu hun và tưới GE Nha đam đợt 1'
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
      cultivation_history: 'Đang phơi ải, chuẩn bị bón lót phân trùn quế'
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

  const crops = [
    {
      crop_id: 'crop_plot_1',
      plot_id: 'plot_1',
      plant_type: 'Nha đam Mỹ F1',
      plant_date: '2026-08-25',
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

  // 2. PHIẾU NHẬP MUA HÀNG (THEO FILE EXCEL & VƯƠNG TRÙN QUẾ & NINH THUẬN)
  const purchaseReceipts = [
    {
      receipt_id: 'PN_EXCEL_01',
      date: '2026-08-01',
      item_id: 'NL01',
      item_name: 'Mật rỉ đường & Men vi sinh EM1 (Theo sổ gốc Excel)',
      variety: 'Nguyên liệu nền tảng ủ vi sinh',
      supplier: 'Nguồn cung cấp vật tư tổng hợp',
      unit: 'món',
      total_received_qty: 2,
      goods_cost: 1500000,
      shipping_cost: 0,
      discount_amount: 0,
      total_cost: 1500000,
      effective_unit_cost: 750000,
      items_list: [
        { line_id: '1', item_id: 'NL01', item_name: 'Mật rỉ đường', variety: 'Mật rỉ đường nguyên chất', spec: 'Phuy 100kg', qty: 100, bonus_qty: 0, unit_price: 10000, subtotal: 1000000, total_received_qty: 100, unit: 'kg' },
        { line_id: '2', item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', variety: 'Men vi sinh gốc EM1', spec: 'Can 10 Lít', qty: 10, bonus_qty: 0, unit_price: 50000, subtotal: 500000, total_received_qty: 10, unit: 'lít' }
      ],
      notes: 'Nhập theo Báo cáo Nhập - Xuất - Tồn đầu kỳ Google Drive'
    },
    {
      receipt_id: 'PN_EXCEL_02',
      date: '2026-08-05',
      item_id: 'NL04',
      item_name: 'Cám gạo & Phụ phẩm nha đam vườn',
      variety: 'Nguyên liệu nhân IMO & GE',
      supplier: 'Nội bộ vườn & Nguồn nông sản',
      unit: 'món',
      total_received_qty: 2,
      goods_cost: 550000,
      shipping_cost: 0,
      discount_amount: 0,
      total_cost: 550000,
      effective_unit_cost: 275000,
      items_list: [
        { line_id: '1', item_id: 'NL04', item_name: 'Cám gạo (nhân IMO)', variety: 'Cám gạo nguyên cám', spec: 'Bao 20kg', qty: 20, bonus_qty: 0, unit_price: 15000, subtotal: 300000, total_received_qty: 20, unit: 'kg' },
        { line_id: '2', item_id: 'NL03', item_name: 'Nha đam nguyên liệu/phế phẩm', variety: 'Vỏ bã & lá nha đam phế phẩm', spec: '50kg', qty: 50, bonus_qty: 0, unit_price: 5000, subtotal: 250000, total_received_qty: 50, unit: 'kg' }
      ],
      notes: 'Theo dõi dòng chảy nguyên liệu Sheet NhatKy_SanXuat'
    },
    {
      receipt_id: 'PN_NINHTHUAN_01',
      date: '2026-08-25',
      item_id: 'NL07',
      item_name: 'Cây giống nha đam Mỹ (Đa quy cách)',
      variety: 'Cây giống nha đam Mỹ F1',
      supplier: 'Vườn giống Ninh Thuận (098.xxx.xxxx)',
      unit: 'cây',
      total_received_qty: 46,
      goods_cost: 650000,
      shipping_cost: 30000,
      discount_amount: 0,
      total_cost: 680000,
      effective_unit_cost: 14782,
      items_list: [
        { line_id: '1', item_id: 'NL07', item_name: 'Cây giống nha đam Size 20-25cm', variety: 'Nha đam Mỹ F1 (Size 20-25cm)', spec: 'Size 20-25cm', qty: 33, bonus_qty: 0, unit_price: 15000, subtotal: 495000, total_received_qty: 33, unit: 'cây' },
        { line_id: '2', item_id: 'NL07', item_name: 'Cây giống nha đam Size 5-10cm', variety: 'Nha đam con (Size 5-10cm)', spec: 'Size 5-10cm', qty: 13, bonus_qty: 0, unit_price: 10000, subtotal: 130000, total_received_qty: 13, unit: 'cây' }
      ],
      notes: 'Giống chuẩn khỏe bón lót trồng Lô A và dự trữ Lô B'
    },
    {
      receipt_id: 'PN_VTQ_01',
      date: '2026-08-28',
      item_id: 'VTQ_01',
      item_name: 'Phân trùn quế & Chế phẩm dinh dưỡng Farm Vương Trùn Quế',
      variety: 'Vật tư sinh học Vương Trùn Quế',
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
    }
  ]

  // 3. SỔ NHẬT KÝ SẢN XUẤT / CHẾ BIẾN (TRÍCH XUẤT 100% TỪ FILE EXCEL GOOGLE DRIVE)
  const productionLogs = [
    {
      log_id: 'log_ex_01',
      date: '2026-08-01',
      material_code: 'NL01',
      material_name: 'Mật rỉ đường',
      purpose: 'Sản xuất EM gốc',
      qty_out: 10,
      unit: 'kg',
      unit_cost: 10000,
      total_cost: 100000,
      target_code: 'BTP_EMGOC',
      target_name: 'EM gốc',
      output_qty: 20,
      output_unit: 'lít',
      notes: '10kg Mật rỉ + 1L Men gốc EM1 ủ thu 20L EM gốc (Giá thành 7.500đ/Lít)',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_02',
      date: '2026-08-01',
      material_code: 'NL02',
      material_name: 'Men vi sinh gốc (EM1)',
      purpose: 'Sản xuất EM gốc',
      qty_out: 1,
      unit: 'lít',
      unit_cost: 50000,
      total_cost: 50000,
      target_code: 'BTP_EMGOC',
      target_name: 'EM gốc',
      output_qty: 0,
      output_unit: 'lít',
      notes: 'Phối trộn cùng Mật rỉ để nhân EM gốc',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_03',
      date: '2026-08-05',
      material_code: 'NL01',
      material_name: 'Mật rỉ đường',
      purpose: 'Ủ rác bếp',
      qty_out: 5,
      unit: 'kg',
      unit_cost: 10000,
      total_cost: 50000,
      target_code: 'NOIBO_RACBEP',
      target_name: 'Khử mùi rác nội bộ',
      output_qty: 0,
      output_unit: 'mẻ',
      notes: 'Xử lý rác thải nhà bếp và khử mùi hôi hữu cơ',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_04',
      date: '2026-08-10',
      material_code: 'NL01',
      material_name: 'Mật rỉ đường',
      purpose: 'Nhân sinh khối IMO',
      qty_out: 8,
      unit: 'kg',
      unit_cost: 10000,
      total_cost: 80000,
      target_code: 'BTP_IMO',
      target_name: 'Sinh khối vi sinh IMO',
      output_qty: 30,
      output_unit: 'kg',
      notes: 'Nhân sinh khối IMO từ Mật rỉ + Cám gạo',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_05',
      date: '2026-08-10',
      material_code: 'NL04',
      material_name: 'Cám gạo (nhân IMO)',
      purpose: 'Nhân sinh khối IMO',
      qty_out: 5,
      unit: 'kg',
      unit_cost: 15000,
      total_cost: 75000,
      target_code: 'BTP_IMO',
      target_name: 'Sinh khối vi sinh IMO',
      output_qty: 0,
      output_unit: 'kg',
      notes: 'Cám gạo phối trộn cùng mật rỉ',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_06',
      date: '2026-08-15',
      material_code: 'BTP_EMGOC',
      material_name: 'EM gốc (thu được)',
      purpose: 'Sản xuất EM2',
      qty_out: 2,
      unit: 'lít',
      unit_cost: 7500,
      total_cost: 15000,
      target_code: 'BTP_EM2',
      target_name: 'EM2',
      output_qty: 50,
      output_unit: 'lít',
      notes: 'Nhân 2L EM gốc + 5kg Mật rỉ -> Thu 50L EM2 (Giá thành 1.300đ/Lít)',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_07',
      date: '2026-08-15',
      material_code: 'NL01',
      material_name: 'Mật rỉ đường',
      purpose: 'Sản xuất EM2',
      qty_out: 5,
      unit: 'kg',
      unit_cost: 10000,
      total_cost: 50000,
      target_code: 'BTP_EM2',
      target_name: 'EM2',
      output_qty: 0,
      output_unit: 'lít',
      notes: 'Mật rỉ nhân EM2',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_08',
      date: '2026-08-20',
      material_code: 'BTP_EM2',
      material_name: 'EM2 (thu được)',
      purpose: 'Sản xuất GE Nha đam',
      qty_out: 5,
      unit: 'lít',
      unit_cost: 1300,
      total_cost: 6500,
      target_code: 'TP_GENHADAM',
      target_name: 'GE Nha đam',
      output_qty: 30,
      output_unit: 'lít',
      notes: '5L EM2 + 10kg Bã nha đam + 2kg Mật rỉ -> Thu 30L GE Nha đam (Giá thành 2.550đ/Lít)',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_09',
      date: '2026-08-20',
      material_code: 'NL03',
      material_name: 'Nha đam nguyên liệu/phế phẩm',
      purpose: 'Sản xuất GE Nha đam',
      qty_out: 10,
      unit: 'kg',
      unit_cost: 5000,
      total_cost: 50000,
      target_code: 'TP_GENHADAM',
      target_name: 'GE Nha đam',
      output_qty: 0,
      output_unit: 'kg',
      notes: 'Vỏ bã phế phẩm ủ GE',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_10',
      date: '2026-08-20',
      material_code: 'NL01',
      material_name: 'Mật rỉ đường',
      purpose: 'Sản xuất GE Nha đam',
      qty_out: 2,
      unit: 'kg',
      unit_cost: 10000,
      total_cost: 20000,
      target_code: 'TP_GENHADAM',
      target_name: 'GE Nha đam',
      output_qty: 0,
      output_unit: 'kg',
      notes: 'Mật rỉ ủ GE',
      is_auto_synced: false
    },
    {
      log_id: 'log_ex_11',
      plot_id: 'plot_1',
      date: '2026-08-25',
      material_code: 'TP_GENHADAM',
      material_name: 'GE Nha đam',
      purpose: 'Chăm sóc vườn Nha đam (Lô A)',
      qty_out: 10,
      unit: 'lít',
      unit_cost: 2550,
      total_cost: 25500,
      target_code: 'TP_NHADAM_CAY',
      target_name: 'Tưới dưỡng Lô A',
      output_qty: 0,
      output_unit: 'lít',
      notes: 'Xuất 10L GE Nha đam tưới dưỡng rễ Lô A',
      is_auto_synced: false
    },
    {
      log_id: 'log_plant_01',
      plot_id: 'plot_1',
      date: '2026-08-25',
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
      notes: 'Xuống giống 13 cây (11 cây size 20-25cm + 2 cây size 5-10cm) vào luống phía Đông',
      is_auto_synced: true
    }
  ]

  // 4. DANH MỤC TỒN KHO TỔNG HỢP THEO SHEET BAOCAO_TONKHO EXCEL + CÂY GIỐNG + VƯƠNG TRÙN QUẾ
  const inventoryItems = [
    { item_id: 'NL01', item_name: 'Mật rỉ đường', item_type: 'Nguyên liệu chính', unit: 'kg', qty_in: 100, qty_out: 30, qty_remaining: 70, unit_cost: 10000, supplier: 'Nguồn tổng hợp', notes: 'Nhập 100kg - Xuất 30kg (Ủ EM 10kg, Rác bếp 5kg, IMO 8kg, EM2 5kg, GE 2kg) = Tồn 70kg' },
    { item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 10, qty_out: 1, qty_remaining: 9, unit_cost: 50000, supplier: 'Nguồn tổng hợp', notes: 'Nhập 10L - Xuất 1L nhân EM gốc = Tồn 9L' },
    { item_id: 'NL03', item_name: 'Nha đam nguyên liệu/phế phẩm', item_type: 'Phụ phẩm vườn', unit: 'kg', qty_in: 50, qty_out: 10, qty_remaining: 40, unit_cost: 5000, supplier: 'Nội bộ vườn', notes: 'Nhập 50kg - Xuất 10kg làm GE = Tồn 40kg' },
    { item_id: 'NL04', item_name: 'Cám gạo (nhân IMO)', item_type: 'Nguyên liệu chính', unit: 'kg', qty_in: 20, qty_out: 5, qty_remaining: 15, unit_cost: 15000, supplier: 'Nguồn tổng hợp', notes: 'Nhập 20kg - Xuất 5kg nhân IMO = Tồn 15kg' },
    { item_id: 'NL07', item_name: 'Cây giống nha đam', item_type: 'Cây giống', unit: 'cây', qty_in: 46, qty_out: 13, qty_remaining: 33, unit_cost: 14782, supplier: 'Vườn giống Ninh Thuận', notes: 'Nhập 46 cây - Xuất trồng 13 cây Lô A = Tồn 33 cây sẵn sàng trồng Lô B' },
    { item_id: 'BTP_EMGOC', item_name: 'EM gốc (thu được)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 20, qty_out: 2, qty_remaining: 18, unit_cost: 7500, supplier: 'Tự sản xuất nội bộ', notes: 'Thu 20L - Xuất 2L nhân EM2 = Tồn 18L (Giá thành 7.500đ/Lít)' },
    { item_id: 'BTP_EM2', item_name: 'EM2 (thu được)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 50, qty_out: 5, qty_remaining: 45, unit_cost: 1300, supplier: 'Tự sản xuất nội bộ', notes: 'Thu 50L - Xuất 5L làm GE = Tồn 45L (Giá thành 1.300đ/Lít)' },
    { item_id: 'TP_GENHADAM', item_name: 'GE Nha đam (thu được)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 30, qty_out: 10, qty_remaining: 20, unit_cost: 2550, supplier: 'Tự sản xuất nội bộ', notes: 'Thu 30L - Xuất 10L tưới Lô A = Tồn 20L (Giá thành 2.550đ/Lít)' },
    { item_id: 'BTP_IMO', item_name: 'Sinh khối vi sinh IMO', item_type: 'Men vi sinh', unit: 'kg', qty_in: 30, qty_out: 0, qty_remaining: 30, unit_cost: 5166, supplier: 'Tự sản xuất nội bộ', notes: 'Thu 30kg từ mẻ nhân IMO' },
    { item_id: 'VTQ_01', item_name: 'Phân trùn tươi', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 50, qty_out: 0, qty_remaining: 50, unit_cost: 5000, supplier: 'Farm Vương Trùn Quế', notes: 'Bón lót cải tạo đất' },
    { item_id: 'VTQ_07', item_name: 'ALONUTRIPRO (Dinh dưỡng nha đam)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 85000, supplier: 'Farm Vương Trùn Quế', notes: 'Bổ sung dinh dưỡng bẹ lá' },
    { item_id: 'VTQ_04', item_name: 'GE Chuối', item_type: 'Men vi sinh', unit: 'lít', qty_in: 2, qty_out: 0, qty_remaining: 2, unit_cost: 65000, supplier: 'Farm Vương Trùn Quế', notes: 'Bổ sung kali hữu cơ' },
    { item_id: 'VTQ_15', item_name: 'Chế phẩm thảo mộc trừ sâu sinh học', item_type: 'Thuốc BVTV', unit: 'lít', qty_in: 1, qty_out: 0, qty_remaining: 1, unit_cost: 180000, supplier: 'Farm Vương Trùn Quế', notes: 'Trừ sâu thảo mộc' }
  ]

  // 5. LỊCH TÁC NGHIỆP LÔ A
  const fieldTasks = [
    { task_id: 'task_01', plot_id: 'plot_1', task_name: '🌿 Xuống giống & tưới giữ ẩm nhẹ luống đất (Lô A - Phía Đông)', task_type: 'Trồng cây', execute_date: '2026-08-25', status: 'Đã hoàn thành', worker_id: 'Thuý', stage_milestone: 'N+0 (Xuống giống)', is_auto_reminder: true, reminder_tag: 'Lô A - Phía Đông', notes: 'Đã xuống giống 13 cây' },
    { task_id: 'task_02', plot_id: 'plot_1', task_name: '💧 Kiểm tra độ ẩm luống & tưới GE Nha đam loãng (Lô A - Phía Đông)', task_type: 'Tưới', execute_date: '2026-08-28', status: 'Đã hoàn thành', worker_id: 'Thuý', stage_milestone: 'N+3 (Bén rễ ban đầu)', is_auto_reminder: true, reminder_tag: 'Lô A - Phía Đông', notes: 'Đã tưới 10L GE Nha đam' },
    { task_id: 'task_03', plot_id: 'plot_1', task_name: '🌱 Tưới nhử rễ đợt 1: Men vi sinh IMO + Đạm loãng (Lô A - Phía Đông)', task_type: 'Bón phân', execute_date: '2026-09-01', status: 'Đã hoàn thành', worker_id: 'Thuý', stage_milestone: 'N+7 (Kích rễ tuần 1)', is_auto_reminder: true, reminder_tag: 'Lô A - Phía Đông', notes: 'Cây bắt đầu bén rễ' },
    { task_id: 'task_04', plot_id: 'plot_1', task_name: '🔍 Kiểm tra tỷ lệ sống, làm cỏ đợt 1 (Lô A - Phía Đông)', task_type: 'Làm cỏ', execute_date: '2026-09-08', status: 'Chờ làm', worker_id: 'Thuý', stage_milestone: 'N+14 (Định hình cây 2 tuần)', is_auto_reminder: true, reminder_tag: 'Lô A - Phía Đông', notes: 'Đếm kiểm tra cây sống khỏe' }
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

  console.log('🎉 ĐÃ NẠP TOÀN BỘ SỐ LIỆU TỪ GOOGLE DRIVE LÊN SUPABASE CLOUD THÀNH CÔNG!')
}

syncDriveDataToCloud()
