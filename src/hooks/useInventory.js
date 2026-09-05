import { useState, useEffect, useCallback } from 'react'
import { supabase, isConnected } from '../lib/supabase'
import { generateProcessFollowUpTasks } from './useTasks'

// Danh mục nguyên vật liệu mẫu & Bảng giá niêm yết Nhà cung cấp 2026
const DEMO_INVENTORY = [
  // Nhóm 1: Vật tư nền tảng, Phụ phẩm & Cây giống
  { item_id: 'NL01', item_name: 'Mật rỉ đường', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Nguồn vật tư tổng hợp', notes: 'Nguyên liệu trung tâm nhân nuôi vi sinh & làm GE' },
  { item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 50000, supplier: 'Nguồn vật tư tổng hợp', notes: 'Dùng nhân EM gốc' },
  { item_id: 'NL03', item_name: 'Nha đam nguyên liệu/phế phẩm', item_type: 'Phụ phẩm vườn', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 5000, supplier: 'Nội bộ vườn', notes: 'Vỏ bã & lá nha đam phế phẩm làm GE' },
  { item_id: 'NL04', item_name: 'Cám gạo (nhân IMO)', item_type: 'Nguyên liệu chính', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Nguồn vật tư tổng hợp', notes: 'Dùng nhân sinh khối IMO vi sinh bản địa' },
  { item_id: 'NL05', item_name: 'Trấu sống (vỏ trấu)', item_type: 'Phụ phẩm vườn', unit: 'bao', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Nguồn vật tư nông nghiệp', notes: 'Dùng đốt than tro trấu hoặc ủ lót chuồng, phối trộn giá thể' },
  { item_id: 'NL06', item_name: 'Tro trấu (than trấu hun)', item_type: 'Phân hữu cơ', unit: 'bao', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 25000, supplier: 'Nội bộ vườn / Đốt từ trấu', notes: 'Tro trấu hun bón lót cải tạo đất, giữ ẩm, chống nghẹt rễ' },
  { item_id: 'BTP_IMO4', item_name: 'Sinh khối vi sinh IMO4', item_type: 'Men vi sinh', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Tự sản xuất nội bộ', notes: 'Sinh khối IMO4 nhân từ Cám gạo + Mật rỉ đường + Men vi sinh' },
  
  // 3 Nguồn cây giống nha đam thực tế của Vườn (05/09/2026)
  { item_id: 'NL07_DT', item_name: 'Nha đam giống Đỗ Thưởng (Nam Định)', item_type: 'Cây giống', unit: 'cây', qty_in: 39, qty_out: 0, qty_remaining: 39, unit_cost: 4210, supplier: 'Đỗ Thưởng (Nam Định)', notes: '39 cây hàng lộn xộn: 19 mini 5-10cm, 10 cây 10-15cm, 7 cây 15-20cm, 3 cây 20-25cm' },
  { item_id: 'NL07_HN', item_name: 'Nha đam giống Huỳnh Nhiên (Bình Định)', item_type: 'Cây giống', unit: 'cây', qty_in: 13, qty_out: 0, qty_remaining: 13, unit_cost: 22308, supplier: 'Huỳnh Nhiên (Bình Định)', notes: '10 cây mua size 30-35cm (25k) + 1 cây tặng size 30-35cm + 2 cây mini (5-10cm) tặng kèm' },
  { item_id: 'NL07_VN', item_name: 'Nha đam Ta (Vườn nhà tách giống)', item_type: 'Cây giống', unit: 'cây', qty_in: 46, qty_out: 0, qty_remaining: 46, unit_cost: 0, supplier: 'Vườn nhà tách giống', notes: '46 cây tự tách từ cây mẹ (0đ): 7 cây size 40-45cm, 10 cây 35-40cm, 8 cây 25-30cm, 21 cây 5-10cm' },

  // Nhóm 2: BẢNG GIÁ NIÊM YẾT 2026 — FARM VƯƠNG TRÙN QUẾ (034.981.6802)
  // I. Phân trùn quế
  { item_id: 'VTQ_01', item_name: 'Phân trùn tươi', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 5000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 5.000đ/kg' },
  { item_id: 'VTQ_02', item_name: 'Sinh khối trùn quế', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 15.000đ/kg' },
  { item_id: 'VTQ_03', item_name: 'Phân trùn sỉ trên 1 tấn', item_type: 'Phân hữu cơ', unit: 'tấn', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 1600000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 1.600.000đ/Tấn (1.600đ/kg)' },

  // II. Dinh dưỡng chế phẩm sinh học cao cấp
  { item_id: 'VTQ_04', item_name: 'GE Chuối', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 65000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 65.000đ/Lít' },
  { item_id: 'VTQ_05', item_name: 'GE Nha Đam', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 65000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 65.000đ/Lít' },
  { item_id: 'VTQ_06', item_name: 'ALOBANAMIX (Sử dụng cho cây ăn trái)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 85000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 85.000đ/Lít' },
  { item_id: 'VTQ_07', item_name: 'ALONUTRIPRO (Sử dụng cho cây nha đam)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 85000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 85.000đ/Lít' },
  { item_id: 'VTQ_08', item_name: 'Dịch trùn trồng trọt (Chai 1 Lít)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 125000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 125.000đ/Lít' },
  { item_id: 'VTQ_09', item_name: 'Dịch trùn trồng trọt (Chai 100ml)', item_type: 'Men vi sinh', unit: 'chai', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 25000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 25.000đ/Chai 100ml' },
  { item_id: 'VTQ_10', item_name: 'Dịch trùn chăn nuôi', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 135000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 135.000đ/Lít' },
  { item_id: 'VTQ_11', item_name: 'Men vi sinh dạng lỏng (IMO PRO)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 100000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 100.000đ/Lít' },
  { item_id: 'VTQ_12', item_name: 'Cám men vi sinh IMO', item_type: 'Men vi sinh', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 55000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 55.000đ/kg' },
  { item_id: 'VTQ_13', item_name: 'Dinh Dưỡng Hành – Tỏi', item_type: 'Thuốc BVTV', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 125000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 125.000đ/Lít' },
  { item_id: 'VTQ_14', item_name: 'Chế phẩm sinh học trừ sâu thảo mộc (100ml)', item_type: 'Thuốc BVTV', unit: 'chai', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 25000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 25.000đ/Chai 100ml' },
  { item_id: 'VTQ_15', item_name: 'Chế phẩm thảo mộc trừ sâu sinh học (Chai 1L)', item_type: 'Thuốc BVTV', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 180000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 180.000đ/Lít' },
  { item_id: 'VTQ_16', item_name: 'Dịch trùn quế rong biển', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 125000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 125.000đ/Lít' },
  { item_id: 'VTQ_17', item_name: 'Dinh dưỡng trùn quế + nha đam Amino Alovera', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 95000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 95.000đ/Lít' },
  { item_id: 'NL08', item_name: 'Nấm đối kháng Trichoderma', item_type: 'Thuốc BVTV', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 60000, supplier: 'Nguồn vật tư nông nghiệp', notes: 'Nấm đối kháng Trichoderma phòng ngừa thối rễ' },
  { item_id: 'NL09', item_name: 'Vôi bột nông nghiệp', item_type: 'Phân hữu cơ', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 6000, supplier: 'Nguồn vật tư nông nghiệp', notes: 'Vôi bột khử trùng, diệt mầm bệnh và cân bằng pH đất' },
  { item_id: 'NL10', item_name: 'Sữa tươi (làm EM)', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 30000, supplier: 'Nguồn thực phẩm / Tạp hóa', notes: 'Sữa tươi nguyên chất tiệt trùng dùng nhân nuôi men vi sinh EM' },
]

const DEMO_PURCHASE_RECEIPTS = [
  // 1. Đợt Huỳnh Nhiên - Bình Định (17/07/2026)
  {
    receipt_id: 'PN-20260717-01',
    date: '2026-07-17',
    supplier: 'Huỳnh Nhiên (Bình Định)',
    item_id: 'NL07_HN',
    item_name: 'Nha đam giống Huỳnh Nhiên (Bình Định)',
    unit: 'cây',
    qty: 10,
    unit_price: 25000,
    goods_cost: 250000,
    shipping_fee: 40000,
    other_cost: 0,
    total_cost: 290000,
    effective_unit_cost: 22308,
    notes: '10 cây mua size 30-35cm (25k) + 1 cây tặng size 30-35cm + 2 cây mini (5-10cm) tặng kèm. Phí ship: 40k. Tổng nhận: 13 cây.',
    items_list: [
      { item_id: 'NL07_HN', variety: 'Nha đam giống Huỳnh Nhiên (Bình Định)', spec: 'Size 30-35cm', qty: 10, gift_qty: 1, total_received_qty: 11, unit_price: 25000, unit: 'cây', row_notes: '10 cây mua + 1 cây tặng size 30-35cm' },
      { item_id: 'NL07_HN', variety: 'Nha đam giống Huỳnh Nhiên (Bình Định) (Mini)', spec: 'Size 5-10cm', qty: 0, gift_qty: 2, total_received_qty: 2, unit_price: 0, unit: 'cây', row_notes: '2 cây mini tặng kèm' }
    ]
  },
  // 2. Đợt Đỗ Thưởng - Nam Định (02/09/2026)
  {
    receipt_id: 'PN-20260902-01',
    date: '2026-09-02',
    supplier: 'Đỗ Thưởng (Nam Định)',
    item_id: 'NL07_DT',
    item_name: 'Nha đam giống Đỗ Thưởng (Nam Định)',
    unit: 'cây',
    qty: 39,
    unit_price: 2564,
    goods_cost: 100000,
    shipping_fee: 64200,
    other_cost: 0,
    total_cost: 164200,
    effective_unit_cost: 4210,
    notes: 'Tổng 39 cây hàng lộn xộn: 19 cây mini 5-10cm, 10 cây 10-15cm, 7 cây 15-20cm, 3 cây 20-25cm. Tiền hàng: 100k + ship 64.2k.',
    items_list: [
      { item_id: 'NL07_DT', variety: 'Nha đam giống Đỗ Thưởng (Nam Định) (Mini)', spec: 'Size 5-10cm', qty: 19, total_received_qty: 19, unit_price: 2564, unit: 'cây', row_notes: '19 cây mini 5-10cm' },
      { item_id: 'NL07_DT', variety: 'Nha đam giống Đỗ Thưởng (Nam Định)', spec: 'Size 10-15cm', qty: 10, total_received_qty: 10, unit_price: 2564, unit: 'cây', row_notes: '10 cây 10-15cm' },
      { item_id: 'NL07_DT', variety: 'Nha đam giống Đỗ Thưởng (Nam Định)', spec: 'Size 15-20cm', qty: 7, total_received_qty: 7, unit_price: 2564, unit: 'cây', row_notes: '7 cây 15-20cm' },
      { item_id: 'NL07_DT', variety: 'Nha đam giống Đỗ Thưởng (Nam Định)', spec: 'Size 20-25cm', qty: 3, total_received_qty: 3, unit_price: 2564, unit: 'cây', row_notes: '3 cây 20-25cm' }
    ]
  },
  // 3. Đợt Nha Đam Ta - Tự tách giống nội bộ vườn (03/09/2026 - 0 đồng)
  {
    receipt_id: 'PN-NOIBO-01',
    date: '2026-09-03',
    supplier: 'Vườn nhà tách giống',
    item_id: 'NL07_VN',
    item_name: 'Nha đam Ta (Vườn nhà tách giống)',
    unit: 'cây',
    qty: 46,
    unit_price: 0,
    goods_cost: 0,
    shipping_fee: 0,
    other_cost: 0,
    total_cost: 0,
    effective_unit_cost: 0,
    notes: 'Tổng 46 cây tự tách từ cây mẹ (0đ): 7 cây size 40-45cm, 10 cây size 35-40cm, 8 cây size 25-30cm, 21 cây size 5-10cm.',
    items_list: [
      { item_id: 'NL07_VN', variety: 'Nha đam Ta (Vườn nhà tách giống) (Cây mẹ)', spec: 'Size 40-45cm', qty: 7, total_received_qty: 7, unit_price: 0, unit: 'cây', row_notes: '7 cây mẹ size 40-45cm' },
      { item_id: 'NL07_VN', variety: 'Nha đam Ta (Vườn nhà tách giống) (Lớn)', spec: 'Size 35-40cm', qty: 10, total_received_qty: 10, unit_price: 0, unit: 'cây', row_notes: '10 cây size 35-40cm' },
      { item_id: 'NL07_VN', variety: 'Nha đam Ta (Vườn nhà tách giống) (Vừa)', spec: 'Size 25-30cm', qty: 8, total_received_qty: 8, unit_price: 0, unit: 'cây', row_notes: '8 cây size 25-30cm' },
      { item_id: 'NL07_VN', variety: 'Nha đam Ta (Vườn nhà tách giống) (Mini)', spec: 'Size 5-10cm', qty: 21, total_received_qty: 21, unit_price: 0, unit: 'cây', row_notes: '21 cây mini size 5-10cm' }
    ]
  },
  // 4. Mật rỉ đường & Nấm Trichoderma (04/09/2026)
  {
    receipt_id: 'PN-20260904-01',
    date: '2026-09-04',
    supplier: 'Nguồn vật tư nông nghiệp',
    item_id: 'NL01',
    item_name: 'Mật rỉ đường + Nấm Trichoderma',
    unit: 'món',
    qty: 3,
    unit_price: 30000,
    goods_cost: 90000,
    shipping_fee: 0,
    other_cost: 0,
    total_cost: 90000,
    effective_unit_cost: 30000,
    notes: 'Nhập 2kg mật rỉ đường + 1kg nấm Trichoderma đối kháng',
    items_list: [
      { item_id: 'NL01', item_name: 'Mật rỉ đường', spec: 'Can 2kg', qty: 2, total_received_qty: 2, unit_price: 15000, unit: 'kg', row_notes: '2kg mật rỉ đường nhân vi sinh' },
      { item_id: 'NL08', item_name: 'Nấm đối kháng Trichoderma', spec: 'Gói 1kg', qty: 1, total_received_qty: 1, unit_price: 60000, unit: 'kg', row_notes: '1kg nấm đối kháng Trichoderma' }
    ]
  },
  // 5. Chế phẩm Vương Trùn Quế (04/09/2026)
  {
    receipt_id: 'PN-20260904-02',
    date: '2026-09-04',
    supplier: 'Vương Trùn Quế (034.981.6802)',
    item_id: 'VTQ_07',
    item_name: 'Cám IMO + ALONUTRIPRO + GE Nha Đam',
    unit: 'món',
    qty: 3,
    unit_price: 68333,
    goods_cost: 205000,
    shipping_fee: 0,
    other_cost: 0,
    total_cost: 205000,
    effective_unit_cost: 68333,
    notes: 'Nhập 1kg cám IMO (55k) + 1 lít ALONUTRIPRO (85k) + 1 lít GE nha đam (65k)',
    items_list: [
      { item_id: 'VTQ_12', item_name: 'Cám men vi sinh IMO', spec: 'Gói 1kg', qty: 1, total_received_qty: 1, unit_price: 55000, unit: 'kg', row_notes: '1kg cám men vi sinh IMO' },
      { item_id: 'VTQ_07', item_name: 'ALONUTRIPRO (Sử dụng cho cây nha đam)', spec: 'Chai 1 lít', qty: 1, total_received_qty: 1, unit_price: 85000, unit: 'lít', row_notes: '1 lít ALONUTRIPRO' },
      { item_id: 'VTQ_05', item_name: 'GE Nha Đam', spec: 'Can 1 lít', qty: 1, total_received_qty: 1, unit_price: 65000, unit: 'lít', row_notes: '1 lít GE Nha Đam đậm đặc' }
    ]
  },
  // 6. Vật tư xử lý đất & Nuôi EM (Sáng 05/09/2026)
  {
    receipt_id: 'PN-20260905-01',
    date: '2026-09-05',
    supplier: 'Vật tư nông nghiệp & Thực phẩm',
    item_id: 'NL09',
    item_name: 'Vôi bột + Sữa tươi + Vỏ trấu',
    unit: 'món',
    qty: 10,
    unit_price: 13500,
    goods_cost: 135000,
    shipping_fee: 0,
    other_cost: 0,
    total_cost: 135000,
    effective_unit_cost: 13500,
    notes: 'Mua 5kg vôi bột xử lý đất (30k) + 2 lít sữa tươi làm EM (60k) + 3 bao trấu (45k)',
    items_list: [
      { item_id: 'NL09', item_name: 'Vôi bột nông nghiệp', spec: 'Bao 5kg', qty: 5, total_received_qty: 5, unit_price: 6000, unit: 'kg', row_notes: '5kg vôi bột xử lý khử khuẩn đất' },
      { item_id: 'NL10', item_name: 'Sữa tươi (làm EM)', spec: '2 chai 1L', qty: 2, total_received_qty: 2, unit_price: 30000, unit: 'lít', row_notes: '2 lít sữa tươi tiệt trùng làm EM' },
      { item_id: 'NL05', item_name: 'Trấu sống (vỏ trấu)', spec: '3 bao', qty: 3, total_received_qty: 3, unit_price: 15000, unit: 'bao', row_notes: '3 bao trấu x 15k = 45k' }
    ]
  }
]
const DEMO_PRODUCTION_LOGS = []
const DEMO_NODES = []
const DEMO_BATCHES = []
const DEMO_CHEMICAL_LOGS = []

// Danh sách các cột hợp lệ trong bảng purchase_receipts của Supabase
const ALLOWED_RECEIPT_COLUMNS = [
  'receipt_id', 'date', 'item_id', 'item_name', 'variety', 'supplier',
  'unit', 'total_received_qty', 'goods_cost', 'shipping_cost',
  'discount_amount', 'total_cost', 'effective_unit_cost', 'items_list',
  'notes', 'data'
]

export function cleanReceiptForSupabase(receipt) {
  const clean = {}
  const extra = {}
  for (const [k, v] of Object.entries(receipt || {})) {
    if (ALLOWED_RECEIPT_COLUMNS.includes(k)) {
      clean[k] = v
    } else {
      extra[k] = v
    }
  }
  if (Object.keys(extra).length > 0) {
    clean.data = { ...(receipt?.data || {}), ...extra }
  }
  return clean
}

// Danh sách các cột hợp lệ trong bảng production_logs của Supabase
const ALLOWED_LOG_COLUMNS = [
  'log_id', 'plot_id', 'date', 'material_code', 'material_name',
  'purpose', 'qty_out', 'unit', 'unit_cost', 'total_cost',
  'target_code', 'target_name', 'output_qty', 'output_unit',
  'notes', 'is_auto_synced', 'data'
]

export function cleanLogForSupabase(log) {
  const clean = {}
  const extra = {}
  for (const [k, v] of Object.entries(log || {})) {
    if (ALLOWED_LOG_COLUMNS.includes(k)) {
      clean[k] = v
    } else {
      extra[k] = v
    }
  }
  if (Object.keys(extra).length > 0) {
    clean.data = { ...(log?.data || {}), ...extra }
  }
  return clean
}

// Hàm chuẩn hóa ID vật tư nếu dùng mã cũ hoặc khớp theo tên
function resolveInventoryItemId(rawId, rawName, itemMap) {
  if (rawId === 'NL_SUA') return 'NL10'
  if (rawId === 'NL_TRI') return 'NL08'
  if (rawId && itemMap[rawId]) return rawId
  if (rawName) {
    const n = rawName.trim().toLowerCase()
    const found = Object.values(itemMap).find(i => i.item_name?.toLowerCase() === n || i.item_name?.toLowerCase().includes(n) || n.includes(i.item_name?.toLowerCase()))
    if (found) return found.item_id
  }
  return rawId || null
}

// Hàm tự động cân đối và tính toán tồn kho chuẩn xác từ Phiếu nhập & Nhật ký xuất
export function calculateInventoryFromReceiptsAndLogs(rawItems, receipts, logs) {
  const itemMap = {}
  ;(rawItems || []).forEach(item => {
    itemMap[item.item_id] = {
      ...item,
      qty_in: 0,
      qty_out: 0,
      qty_remaining: 0,
      total_cost_pool: 0
    }
  })

  // 1. Cộng dồn tất cả các phiếu nhập hàng
  ;(receipts || []).forEach(r => {
    if (r.items_list && Array.isArray(r.items_list) && r.items_list.length > 0) {
      r.items_list.forEach(row => {
        const itemId = resolveInventoryItemId(row.item_id, row.item_name || row.variety, itemMap) || r.item_id || 'NL07_HN'
        if (itemMap[itemId]) {
          const qty = parseFloat(row.total_received_qty || row.qty) || 0
          const unitPrice = parseFloat(row.unit_price) || 0
          itemMap[itemId].qty_in += qty
          itemMap[itemId].total_cost_pool += qty * unitPrice
        }
      })
    } else {
      const itemId = resolveInventoryItemId(r.item_id, r.item_name, itemMap) || 'NL07_HN'
      if (itemMap[itemId]) {
        const qty = parseFloat(r.total_received_qty || r.qty) || 0
        const totalCost = parseFloat(r.total_cost || r.goods_cost) || 0
        itemMap[itemId].qty_in += qty
        itemMap[itemId].total_cost_pool += totalCost
      }
    }
  })

  // 2. Trừ đi tất cả các lần xuất trong Sổ nhật ký (mẻ vi sinh, xuất trồng, hao hụt, xuất tặng)
  ;(logs || []).forEach(log => {
    const itemId = resolveInventoryItemId(log.material_code || log.item_id, log.material_name, itemMap)
    if (itemId && itemMap[itemId]) {
      const qtyOut = parseFloat(log.quantity_used || log.qty_out || log.waste_qty || log.gift_qty) || 0
      itemMap[itemId].qty_out += qtyOut
    }
  })

  // 3. Tính tồn kho và đơn giá vốn bình quân
  return Object.values(itemMap).map(item => {
    const qtyRemaining = Math.max(0, item.qty_in - item.qty_out)
    let unitCost = item.unit_cost
    if (item.qty_in > 0 && item.total_cost_pool > 0) {
      unitCost = Math.round(item.total_cost_pool / item.qty_in)
    }
    return {
      ...item,
      qty_remaining: qtyRemaining,
      unit_cost: unitCost > 0 ? unitCost : item.unit_cost
    }
  })
}

// Hàm tự động cân đối và đồng bộ các lượt xuất trồng cây từ Lô đất (Crops & Plots) vào Sổ nhật ký kho
export function syncPlantingLogsWithCrops(existingLogs, cropsData, plotsData, receiptsData) {
  let logs = [...(existingLogs || [])]
  let hasChange = false

  const activePlotsWithPlants = []

  ;(plotsData || []).forEach(plot => {
    // Chỉ đồng bộ xuất trồng nếu Lô đang thực sự ở giai đoạn Trồng cây, Chăm sóc hoặc Thu hoạch
    if (!['Trồng cây', 'Chăm sóc', 'Thu hoạch'].includes(plot.cultivation_stage)) {
      return
    }

    const plotCrops = (cropsData || []).filter(c => String(c.plot_id) === String(plot.plot_id))
    const crop = plotCrops[0]
    if (!crop) return

    const totalPlants = (crop.seed_batches && crop.seed_batches.length > 0)
      ? crop.seed_batches.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0)
      : (parseInt(crop.plant_count || crop.seed_count) || 0)

    if (totalPlants > 0) {
      activePlotsWithPlants.push({
        plot,
        crop,
        totalPlants,
        batches: crop.seed_batches || []
      })
    }
  })

  // Với mỗi Lô thực sự có cây giống đã trồng, đảm bảo có dòng nhật ký xuất trồng tương ứng
  activePlotsWithPlants.forEach(({ plot, crop, totalPlants, batches }) => {
    const existingLogIdx = logs.findIndex(l => 
      (l.plot_id && String(l.plot_id) === String(plot.plot_id)) ||
      (l.purpose && (l.purpose.includes(`Xuất trồng vườn ${plot.name}`) || l.purpose.includes(`Xuất trồng vườn: ${plot.name}`) || l.purpose.includes(`Xuống giống ${plot.name}`) || l.purpose.includes(`Trồng cây ${plot.name}`))) ||
      (l.target_name && (l.target_name.includes(`Trồng cây ${plot.name}`) || l.target_name.includes(plot.name)))
    )

    let unitCost = 14500
    let notesSummary = `Xuống giống ${plot.name}`
    let materialCode = 'NL07_HN'
    let materialName = 'Nha đam giống Huỳnh Nhiên (Bình Định)'

    if (batches.length > 0) {
      const batchDetails = batches.map(b => `${b.qty} cây ${b.plant_size || ''} (${b.seed_source || 'Kho'})`).join(', ')
      notesSummary = `Xuống giống ${plot.name} [${batchDetails}]`
      const totalCost = batches.reduce((sum, b) => sum + ((parseInt(b.qty) || 0) * (parseFloat(b.unit_cost) || 14500)), 0)
      if (totalPlants > 0 && totalCost > 0) {
        unitCost = Math.round(totalCost / totalPlants)
      }
      if (batches[0].receipt_id === 'PN-20260902-01' || batches[0].seed_source?.includes('Đỗ Thưởng')) {
        materialCode = 'NL07_DT'
        materialName = 'Nha đam giống Đỗ Thưởng (Nam Định)'
      } else if (batches[0].receipt_id === 'PN-NOIBO-01' || batches[0].seed_source?.includes('Vườn nhà')) {
        materialCode = 'NL07_VN'
        materialName = 'Nha đam Ta (Vườn nhà tách giống)'
      } else {
        materialCode = 'NL07_HN'
        materialName = 'Nha đam giống Huỳnh Nhiên (Bình Định)'
      }
    } else if (crop.seed_notes) {
      notesSummary = `Xuống giống ${plot.name} - ${crop.seed_notes}`
    }

    const logDate = crop.plant_date || crop.seed_date || new Date().toISOString().split('T')[0]

    const desiredLog = {
      log_id: existingLogIdx >= 0 ? logs[existingLogIdx].log_id : `plant_${plot.plot_id}_${Date.now()}`,
      plot_id: String(plot.plot_id),
      date: logDate,
      material_code: materialCode,
      material_name: materialName,
      purpose: `Xuất trồng vườn ${plot.name}`,
      qty_out: totalPlants,
      unit: 'cây',
      unit_cost: unitCost,
      total_cost: totalPlants * unitCost,
      target_code: 'TP_NHADAM_CAY',
      target_name: `Trồng cây ${plot.name}`,
      output_qty: 0,
      output_unit: 'cây',
      notes: notesSummary,
      is_auto_synced: true
    }

    if (existingLogIdx >= 0) {
      const cur = logs[existingLogIdx]
      if (cur.qty_out !== totalPlants || cur.date !== logDate || cur.unit_cost !== unitCost || cur.plot_id !== String(plot.plot_id) || cur.notes !== notesSummary || cur.material_code !== materialCode) {
        logs[existingLogIdx] = { ...cur, ...desiredLog }
        hasChange = true
      }
    } else {
      logs = [desiredLog, ...logs]
      hasChange = true
    }
  })

  // Nếu một lô không còn trong activePlotsWithPlants (ví dụ đang ở Làm đất hoặc 0 cây), tự động XÓA log xuất trồng tự sinh của lô đó
  const activePlotIds = new Set(activePlotsWithPlants.map(p => String(p.plot.plot_id)))
  const filteredLogs = logs.filter(l => {
    if (l.is_auto_synced && l.plot_id && !activePlotIds.has(String(l.plot_id))) {
      hasChange = true
      return false
    }
    return true
  })

  return { logs: filteredLogs, hasChange }
}

export function useInventory() {
  const [items, setItems] = useState(DEMO_INVENTORY)
  const [productionLogs, setProductionLogs] = useState([])
  const [purchaseReceipts, setPurchaseReceipts] = useState(DEMO_PURCHASE_RECEIPTS)
  const [loading, setLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    let receiptsData = null
    let logsData = null
    let plotsData = null
    let cropsData = null
    let itemsData = null

    if (isConnected()) {
      try {
        const [resItems, resReceipts, resLogs, resPlots, resCrops] = await Promise.all([
          supabase.from('inventory_items').select('*').order('item_name'),
          supabase.from('purchase_receipts').select('*').order('date', { ascending: false }),
          supabase.from('production_logs').select('*').order('date', { ascending: false }),
          supabase.from('plots').select('*'),
          supabase.from('crops').select('*')
        ])

        if (resReceipts.data && resReceipts.data.length > 0) receiptsData = resReceipts.data
        if (resLogs.data) logsData = resLogs.data
        if (resPlots.data && resPlots.data.length > 0) plotsData = resPlots.data
        if (resCrops.data) cropsData = resCrops.data
        if (resItems.data && resItems.data.length > 0) itemsData = resItems.data
      } catch (err) {
        console.warn('Supabase fetch failed, fallback to local cache', err)
      }
    }

    if (!receiptsData || receiptsData.length === 0) {
      const savedReceipts = localStorage.getItem('app_purchase_receipts')
      if (savedReceipts) {
        try {
          const parsed = JSON.parse(savedReceipts)
          if (Array.isArray(parsed) && parsed.length > 0) receiptsData = parsed
        } catch (e) {}
      }
      if (!receiptsData || receiptsData.length === 0) receiptsData = DEMO_PURCHASE_RECEIPTS
    }

    if (!logsData) {
      const savedLogs = localStorage.getItem('app_production_logs')
      logsData = savedLogs ? JSON.parse(savedLogs) : DEMO_PRODUCTION_LOGS
    }

    if (!plotsData || plotsData.length === 0) {
      const savedPlots = localStorage.getItem('app_plots_data')
      plotsData = savedPlots ? JSON.parse(savedPlots) : []
    }

    if (!cropsData) {
      const savedCrops = localStorage.getItem('app_crops_data')
      cropsData = savedCrops ? JSON.parse(savedCrops) : []
    }

    if (!itemsData || itemsData.length === 0) {
      const saved = localStorage.getItem('app_inventory_items')
      itemsData = saved ? JSON.parse(saved) : [...DEMO_INVENTORY]
    }

    // Kiểm tra xem có lô nào thực sự đang ở giai đoạn Trồng cây / Chăm sóc / Thu hoạch không
    const hasPlantedPlots = (plotsData || []).some(p => ['Trồng cây', 'Chăm sóc', 'Thu hoạch'].includes(p.cultivation_stage))
    if (!hasPlantedPlots) {
      // Nếu tất cả các lô đang ở giai đoạn Làm đất / Chuẩn bị: Xóa sạch toàn bộ các dòng xuất trồng thử nghiệm cũ
      logsData = (logsData || []).filter(l => !l.purpose?.includes('Xuống giống') && !l.purpose?.includes('Xuất trồng') && !l.purpose?.includes('Trồng cây'))
    }

    // Tự động đồng bộ các lần xuất trồng cây từ Lô đất sang Sổ nhật ký
    const syncResult = syncPlantingLogsWithCrops(logsData, cropsData, plotsData, receiptsData)
    logsData = syncResult.logs
    localStorage.setItem('app_production_logs', JSON.stringify(logsData))
    setProductionLogs(logsData)

    // Tự động chuẩn hóa đơn vị cho các phiếu nhập
    const normalizedReceipts = (receiptsData || []).map(r => {
      let correctUnit = r.unit
      if (r.items_list && Array.isArray(r.items_list) && r.items_list.length > 0) {
        const distinctUnits = [...new Set(r.items_list.map(i => i.unit).filter(Boolean))]
        correctUnit = distinctUnits.length === 1 ? distinctUnits[0] : 'món'
      } else if (r.item_name) {
        const matchedItem = itemsData.find(i => i.item_id === r.item_id || i.item_name.toLowerCase() === r.item_name.toLowerCase())
        if (matchedItem && matchedItem.unit) {
          correctUnit = matchedItem.unit
        }
      }
      if (correctUnit && correctUnit !== r.unit) {
        return { ...r, unit: correctUnit }
      }
      return r
    })

    localStorage.setItem('app_purchase_receipts', JSON.stringify(normalizedReceipts))
    setPurchaseReceipts(normalizedReceipts)

    // Loại bỏ các mục Sách kỹ thuật nông nghiệp khỏi kho
    itemsData = itemsData.filter(i => i.item_id !== 'VTQ_19' && i.item_id !== 'VTQ_20' && !i.item_name?.toLowerCase().includes('sách'))

    // Đảm bảo 3 mặt hàng cây giống chuẩn luôn có trong kho
    const existingIds = new Set(itemsData.map(i => i.item_id))
    const existingNames = new Set(itemsData.map(i => (i.item_name || '').toLowerCase()))

    DEMO_INVENTORY.forEach(demoItem => {
      if (!existingIds.has(demoItem.item_id) && !existingNames.has(demoItem.item_name.toLowerCase())) {
        itemsData.push(demoItem)
      }
    })

    // Tự động cân đối tồn kho chuẩn xác từ các phiếu nhập và nhật ký xuất (đã gồm các Lô xuất trồng)
    itemsData = calculateInventoryFromReceiptsAndLogs(itemsData, normalizedReceipts, logsData)

    localStorage.setItem('app_inventory_items', JSON.stringify(itemsData))
    setItems(itemsData)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const addItem = async (item) => {
    if (!isConnected()) {
      const i = { ...item, item_id: item.item_id || `NL${String(Date.now()).slice(-2)}` }
      setItems(prev => {
        const updated = [...prev, i]
        localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        return updated
      })
      return i
    }
    const { data, error } = await supabase.from('inventory_items').insert(item).select().single()
    if (!error) { await fetchItems(); return data }
    return null
  }

  const updateItem = async (id, updates) => {
    if (!isConnected()) {
      setItems(prev => {
        const updated = prev.map(i => i.item_id === id ? { ...i, ...updates } : i)
        localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        return updated
      })
      return
    }
    await supabase.from('inventory_items').update(updates).eq('item_id', id)
    await fetchItems()
  }

  const deleteItem = async (id) => {
    if (!isConnected()) {
      setItems(prev => {
        const updated = prev.filter(i => i.item_id !== id)
        localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        return updated
      })
      return
    }
    await supabase.from('inventory_items').delete().eq('item_id', id)
    await fetchItems()
  }

  // Nhập hàng lô mới có kèm phí ship + HÀNG KHUYẾN MÃI / TẶNG KÈM / NHIỀU DÒNG QUY CÁCH
  const addPurchaseReceipt = async (receipt) => {
    let itemsList = receipt.items_list || []
    if (itemsList.length === 0) {
      const defaultName = receipt.item_name || receipt.variety || 'Cây giống nha đam'
      itemsList = [{
        item_id: receipt.item_id || 'NL07',
        item_name: defaultName,
        variety: defaultName,
        qty: parseFloat(receipt.qty) || 0,
        bonus_qty: parseFloat(receipt.bonus_qty) || 0,
        unit_price: parseFloat(receipt.purchase_price || receipt.unit_price) || 0,
        unit: receipt.unit || 'cây',
        notes: receipt.notes || ''
      }]
    }

    // Tính toán tổng các dòng
    let totalGoodsCost = 0
    let totalReceivedQty = 0
    itemsList = itemsList.map((row, idx) => {
      const q = parseFloat(row.qty) || 0
      const bq = parseFloat(row.bonus_qty) || 0
      const up = parseFloat(row.unit_price) || 0
      const rowGoods = q * up
      const rowTotalRec = q + bq
      totalGoodsCost += rowGoods
      totalReceivedQty += rowTotalRec
      const itemName = row.variety || row.item_name || 'Vật tư'
      return {
        ...row,
        item_name: itemName,
        variety: itemName,
        line_id: String(idx + 1),
        qty: q,
        bonus_qty: bq,
        unit_price: up,
        subtotal: rowGoods,
        total_received_qty: rowTotalRec
      }
    })

    const shippingCost = parseFloat(receipt.shipping_cost) || 0
    const discountAmount = parseFloat(receipt.discount_amount) || 0
    const totalCost = receipt.is_manual_total && receipt.total_paid
      ? parseFloat(receipt.total_paid)
      : Math.max(0, totalGoodsCost + shippingCost - discountAmount)

    const effectiveUnitCost = totalReceivedQty > 0 ? Math.round(totalCost / totalReceivedQty) : 0
    const summaryItemName = itemsList.map(r => r.item_name).filter(Boolean).join(', ') || receipt.item_name || 'Hàng nhập'
    
    // Đơn vị chính xác của phiếu
    const distinctUnits = [...new Set(itemsList.map(i => i.unit).filter(Boolean))]
    const receiptUnit = distinctUnits.length === 1 ? distinctUnits[0] : 'món'

    const newReceipt = {
      ...receipt,
      item_name: summaryItemName,
      receipt_id: receipt.receipt_id || `PN${String(Date.now()).slice(-4)}`,
      items_list: itemsList,
      unit: receiptUnit,
      total_received_qty: totalReceivedQty,
      goods_cost: totalGoodsCost,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total_cost: totalCost,
      effective_unit_cost: effectiveUnitCost
    }

    if (isConnected()) {
      try {
        const payload = cleanReceiptForSupabase(newReceipt)
        const { error } = await supabase.from('purchase_receipts').upsert(payload)
        if (error) console.error('Error saving receipt to Supabase:', error)
      } catch (err) {
        console.error('Error saving receipt to Supabase:', err)
      }
    }

    setPurchaseReceipts(prev => {
      const updated = [newReceipt, ...(prev || [])]
      try {
        localStorage.setItem('app_purchase_receipts', JSON.stringify(updated))
      } catch (err) {
        console.error('Error saving purchase receipts to localStorage', err)
      }
      return updated
    })

    await fetchItems()
    return newReceipt
  }

  // Chỉnh sửa phiếu nhập mua hàng & Cập nhật lại kho
  const updatePurchaseReceipt = async (receiptId, updatedData) => {
    let itemsList = updatedData.items_list || []
    if (itemsList.length === 0) {
      const defaultName = updatedData.variety || updatedData.item_name || 'Cây giống nha đam'
      itemsList = [{
        item_id: updatedData.item_id || 'NL07',
        item_name: defaultName,
        variety: defaultName,
        qty: parseFloat(updatedData.qty) || 0,
        bonus_qty: parseFloat(updatedData.bonus_qty) || 0,
        unit_price: parseFloat(updatedData.purchase_price || updatedData.unit_price) || 0,
        unit: updatedData.unit || 'cây',
        notes: updatedData.notes || ''
      }]
    }

    let totalGoodsCost = 0
    let totalReceivedQty = 0
    itemsList = itemsList.map((row, i) => {
      const q = parseFloat(row.qty) || 0
      const bq = parseFloat(row.bonus_qty) || 0
      const up = parseFloat(row.unit_price) || 0
      const rowGoods = q * up
      const rowTotalRec = q + bq
      totalGoodsCost += rowGoods
      totalReceivedQty += rowTotalRec
      const itemName = row.variety || row.item_name || 'Vật tư'
      return {
        ...row,
        item_name: itemName,
        variety: itemName,
        line_id: String(i + 1),
        qty: q,
        bonus_qty: bq,
        unit_price: up,
        subtotal: rowGoods,
        total_received_qty: rowTotalRec
      }
    })

    const shippingCost = parseFloat(updatedData.shipping_cost) || 0
    const discountAmount = parseFloat(updatedData.discount_amount) || 0
    const totalCost = updatedData.is_manual_total && updatedData.total_paid
      ? parseFloat(updatedData.total_paid)
      : Math.max(0, totalGoodsCost + shippingCost - discountAmount)

    const effectiveUnitCost = totalReceivedQty > 0 ? Math.round(totalCost / totalReceivedQty) : 0
    const summaryItemName = itemsList.map(r => r.item_name).filter(Boolean).join(', ') || updatedData.item_name || 'Hàng nhập'
    
    const distinctUnits = [...new Set(itemsList.map(i => i.unit).filter(Boolean))]
    const receiptUnit = distinctUnits.length === 1 ? distinctUnits[0] : 'món'

    const newReceiptObj = {
      ...updatedData,
      receipt_id: receiptId,
      item_name: summaryItemName,
      items_list: itemsList,
      unit: receiptUnit,
      total_received_qty: totalReceivedQty,
      goods_cost: totalGoodsCost,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total_cost: totalCost,
      effective_unit_cost: effectiveUnitCost
    }

    if (isConnected()) {
      try {
        const payload = cleanReceiptForSupabase(newReceiptObj)
        const { error } = await supabase.from('purchase_receipts').upsert(payload)
        if (error) console.error('Error updating receipt in Supabase:', error)
      } catch (err) {
        console.error('Error updating receipt in Supabase:', err)
      }
    }

    setPurchaseReceipts(prev => {
      const currentList = prev || []
      const idx = currentList.findIndex(r => r.receipt_id === receiptId)
      let nextList = [...currentList]
      if (idx !== -1) {
        nextList[idx] = newReceiptObj
      } else {
        nextList = [newReceiptObj, ...currentList]
      }
      try {
        localStorage.setItem('app_purchase_receipts', JSON.stringify(nextList))
      } catch (err) {
        console.error('Error saving updated purchase receipts', err)
      }
      return nextList
    })

    await fetchItems()
    return newReceiptObj
  }

  // Xóa phiếu nhập mua hàng & Hoàn nguyên kho
  const deletePurchaseReceipt = async (receiptId) => {
    if (isConnected()) {
      try {
        const { error } = await supabase.from('purchase_receipts').delete().eq('receipt_id', receiptId)
        if (error) console.error('Error deleting purchase receipt from Supabase:', error)
      } catch (err) {
        console.error('Error deleting purchase receipt from Supabase', err)
      }
    }

    setPurchaseReceipts(prev => {
      const currentList = prev || []
      const updated = currentList.filter(r => r.receipt_id !== receiptId)
      try {
        localStorage.setItem('app_purchase_receipts', JSON.stringify(updated))
      } catch (err) {
        console.error('Error deleting purchase receipt from localStorage', err)
      }
      return updated
    })

    await fetchItems()
    return true
  }

  // Ghi nhật ký sản xuất & Tự động trừ kho nguyên liệu & Cộng kho thành phẩm & Sinh lịch nhắc
  const addProductionLog = async (log) => {
    const newLog = {
      ...log,
      log_id: log.log_id || String(Date.now()),
      total_cost: (parseFloat(log.qty_out) || 0) * (parseFloat(log.unit_cost) || 0)
    }

    if (isConnected()) {
      try {
        const payload = cleanLogForSupabase(newLog)
        const { error } = await supabase.from('production_logs').insert(payload)
        if (error) console.error('Error inserting production log to Supabase:', error)
      } catch (err) {
        console.error('Error inserting production log to Supabase:', err)
      }
    }

    setProductionLogs(prev => {
      const updated = [newLog, ...(prev || [])]
      try {
        localStorage.setItem('app_production_logs', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })

    // 1. Tự động trừ nguyên liệu xuất kho & cộng sản phẩm thu được
    setItems(prev => {
      let updated = [...prev]
      // Trừ nguyên liệu xuất
      const outIdx = updated.findIndex(i => i.item_id === log.material_code || i.item_name?.toLowerCase() === log.material_name?.toLowerCase())
      if (outIdx >= 0) {
        const item = updated[outIdx]
        const newQtyOut = (parseFloat(item.qty_out) || 0) + (parseFloat(log.qty_out) || 0)
        const newQtyRem = Math.max(0, (parseFloat(item.qty_in) || 0) - newQtyOut)
        updated[outIdx] = { ...item, qty_out: newQtyOut, qty_remaining: newQtyRem }
      }

      // 2. Nếu có sản phẩm thu được và không phải là tiêu thụ thuần túy -> Cộng vào kho đích
      const outQty = parseFloat(log.output_qty) || 0
      if (outQty > 0 && !log.is_consumption && log.target_code) {
        const inIdx = updated.findIndex(i => i.item_id === log.target_code || i.item_name?.toLowerCase() === log.target_name?.toLowerCase())
        if (inIdx >= 0) {
          const targetItem = updated[inIdx]
          const newQtyIn = (parseFloat(targetItem.qty_in) || 0) + outQty
          const newQtyRem = (parseFloat(targetItem.qty_remaining) || 0) + outQty
          updated[inIdx] = { ...targetItem, qty_in: newQtyIn, qty_remaining: newQtyRem }
        } else {
          updated.push({
            item_id: log.target_code,
            item_name: log.target_name || 'Chế phẩm mới',
            item_type: log.target_code?.includes('IMO') || log.target_code?.includes('EM') || log.target_code?.includes('GE') ? 'Men vi sinh' : (log.target_code === 'NL06' ? 'Phân hữu cơ' : 'Nguyên liệu chính'),
            unit: log.output_unit || 'lít',
            qty_in: outQty,
            qty_out: 0,
            qty_remaining: outQty,
            unit_cost: outQty > 0 ? Math.round((newLog.total_cost || 0) / outQty) : 0,
            supplier: 'Tự sản xuất nội bộ',
            notes: `Thu từ mẻ ${log.purpose || 'chế biến'}`
          })
        }
      }

      try {
        localStorage.setItem('app_inventory_items', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })

    // 3. Tự động sinh chuỗi lịch nhắc nhở theo quy trình vi sinh / đốt tro vào app_field_tasks
    try {
      const purposeLower = (log.purpose || '').toLowerCase()
      let triggerType = null
      if (purposeLower.includes('imo4') || purposeLower.includes('imo 4') || log.target_code === 'BTP_IMO4') {
        triggerType = 'IMO4'
      } else if (purposeLower.includes('em gốc') || log.target_code === 'BTP_EMGOC') {
        triggerType = 'EM_GOC'
      } else if (purposeLower.includes('đốt tro') || purposeLower.includes('tro trấu') || log.target_code === 'NL06') {
        triggerType = 'DOT_TRAU'
      }

      if (triggerType) {
        const followUps = generateProcessFollowUpTasks(triggerType, log.purpose, log.date || new Date().toISOString().split('T')[0])
        if (followUps.length > 0) {
          const savedTasks = localStorage.getItem('app_field_tasks')
          let allTasks = savedTasks ? JSON.parse(savedTasks) : []
          allTasks = [...followUps, ...allTasks]
          localStorage.setItem('app_field_tasks', JSON.stringify(allTasks))
        }
      }
    } catch (e) {
      console.error('Error auto-generating process tasks', e)
    }

    await fetchItems()
    return newLog
  }

  // Xuất kho cây giống để xuống luống
  const recordPlantingUsage = async (qty, plotName) => {
    const deductQty = parseFloat(qty) || 0
    if (deductQty <= 0) return

    const logData = {
      date: new Date().toISOString().split('T')[0],
      material_code: 'NL07',
      material_name: 'Cây giống nha đam',
      purpose: `Xuống giống ${plotName}`,
      qty_out: deductQty,
      unit: 'cây',
      unit_cost: 14500,
      target_code: 'TP_NHADAM_CAY',
      target_name: `Trồng cây ${plotName}`,
      output_qty: 0,
      output_unit: 'cây'
    }

    return await addProductionLog(logData)
  }

  // Ghi nhận nhập kho thành phẩm sau khi Thu hoạch từ Vườn
  const recordHarvestInput = async (harvestKg, harvestSeedlings, plotName, harvestDate) => {
    const kg = parseFloat(harvestKg) || 0
    const seedlings = parseInt(harvestSeedlings) || 0
    if (kg <= 0 && seedlings <= 0) return

    if (!isConnected()) {
      setItems(prev => {
        let updated = [...prev]

        // 1. Cập nhật hoặc Thêm dòng "Lá nha đam tươi" vào bảng tồn kho chính
        if (kg > 0) {
          let leafItem = updated.find(i => i.item_id === 'TP_LA_TUOI' || i.item_name.includes('Lá nha đam tươi'))
          if (leafItem) {
            leafItem.qty_in = (parseFloat(leafItem.qty_in) || 0) + kg
            leafItem.qty_remaining = (parseFloat(leafItem.qty_remaining) || 0) + kg
          } else {
            updated.push({
              item_id: 'TP_LA_TUOI',
              item_name: 'Lá nha đam tươi (Thu hoạch từ vườn)',
              item_type: 'Thành phẩm nông sản',
              unit: 'kg',
              qty_in: kg,
              qty_out: 0,
              qty_remaining: kg,
              unit_cost: 0,
              notes: 'Thu hoạch từ các lô vườn'
            })
          }
        }

        // 2. Nếu có tách cây giống con -> Cộng thêm vào kho cây giống NL07
        if (seedlings > 0) {
          let seedlingItem = updated.find(i => i.item_id === 'NL07' || i.item_name.includes('Cây giống'))
          if (seedlingItem) {
            seedlingItem.qty_in = (parseFloat(seedlingItem.qty_in) || 0) + seedlings
            seedlingItem.qty_remaining = (parseFloat(seedlingItem.qty_remaining) || 0) + seedlings
          } else {
            updated.push({
              item_id: 'NL07',
              item_name: 'Cây giống nha đam',
              item_type: 'Cây giống',
              unit: 'cây',
              qty_in: seedlings,
              qty_out: 0,
              qty_remaining: seedlings,
              unit_cost: 0,
              notes: 'Tách từ cây mẹ trong vườn'
            })
          }
        }

        localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        return updated
      })
    }
  }

  // Ghi nhận hao hụt / chết hỏng / hư hao trong kho (Hỗ trợ truy xuất theo từng Đợt nhập / Nguồn giống)
  const recordWaste = async (itemId, wasteQty, reason, date = null, receiptId = null, supplier = '') => {
    const deductQty = parseFloat(wasteQty) || 0
    if (deductQty <= 0) return

    const targetItem = items.find(i => i.item_id === itemId) || items[0]
    const targetReceipt = purchaseReceipts.find(r => r.receipt_id === receiptId) || null
    const sourceInfo = targetReceipt ? ` [Đợt ${targetReceipt.receipt_id} - ${targetReceipt.supplier || supplier || 'Nguồn giống'}]` : (supplier ? ` [${supplier}]` : '')

    const logData = {
      date: date || new Date().toISOString().split('T')[0],
      material_code: targetItem?.item_id || itemId,
      material_name: targetItem?.item_name || 'Vật tư',
      purpose: `Hao hụt/hỏng kho${sourceInfo}: ${reason || 'Hư hao tự nhiên'}`,
      qty_out: deductQty,
      unit: targetItem?.unit || 'cây',
      unit_cost: targetReceipt?.effective_unit_cost || targetItem?.unit_cost || 0,
      target_code: 'HAOHUT_KHO',
      target_name: `Hao hụt ${sourceInfo || targetItem?.item_name} (${reason || 'Hỏng'})`,
      output_qty: 0,
      output_unit: targetItem?.unit || 'cây'
    }

    return await addProductionLog(logData)
  }

  // Ghi nhận xuất tặng khách hàng / quà biếu / tri ân / khuyến mãi (Tự động trừ kho & hạch toán chi phí quà tặng)
  const recordGift = async (itemId, giftQty, recipient, notes = '', date = null, receiptId = null) => {
    const deductQty = parseFloat(giftQty) || 0
    if (deductQty <= 0) return

    const targetItem = items.find(i => i.item_id === itemId) || items[0]
    const targetReceipt = purchaseReceipts.find(r => r.receipt_id === receiptId) || null
    const sourceInfo = targetReceipt ? ` [Đợt ${targetReceipt.receipt_id} - ${targetReceipt.supplier || 'Nguồn giống'}]` : ''
    const recipientText = recipient ? `Tặng: ${recipient}` : 'Tặng khách hàng'

    const logData = {
      date: date || new Date().toISOString().split('T')[0],
      material_code: targetItem?.item_id || itemId,
      material_name: targetItem?.item_name || 'Cây giống nha đam',
      purpose: `🎁 Xuất tặng khách hàng: ${recipient || 'Khách quen'}${sourceInfo}${notes ? ` (${notes})` : ''}`,
      qty_out: deductQty,
      unit: targetItem?.unit || 'cây',
      unit_cost: targetReceipt?.effective_unit_cost || targetItem?.unit_cost || 0,
      target_code: 'QUATANG_KHACH',
      target_name: `Quà tặng ${recipientText}${sourceInfo}`,
      output_qty: 0,
      output_unit: targetItem?.unit || 'cây'
    }

    return await addProductionLog(logData)
  }

  // Xóa dòng nhật ký xuất kho / xuất trồng / hao hụt / quà tặng & Tự động hoàn nguyên tồn kho
  const deleteProductionLog = async (logId) => {
    if (isConnected()) {
      try {
        const { error } = await supabase.from('production_logs').delete().eq('log_id', logId)
        if (error) console.error('Error deleting production log from Supabase:', error)
      } catch (err) {
        console.error('Error deleting production log from Supabase:', err)
      }
    }

    let targetLog = null
    setProductionLogs(prev => {
      const list = prev || []
      targetLog = list.find(l => String(l.log_id) === String(logId))
      const updated = list.filter(l => String(l.log_id) !== String(logId))
      try {
        localStorage.setItem('app_production_logs', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })

    if (targetLog) {
      setItems(prev => {
        const updated = prev.map(item => {
          if (item.item_id === targetLog.material_code || item.item_name === targetLog.material_name) {
            const newQtyOut = Math.max(0, (parseFloat(item.qty_out) || 0) - (parseFloat(targetLog.qty_out) || 0))
            const newQtyRem = Math.max(0, (parseFloat(item.qty_in) || 0) - newQtyOut)
            return { ...item, qty_out: newQtyOut, qty_remaining: newQtyRem }
          }
          return item
        })
        try {
          localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        } catch (e) {}
        return updated
      })
    }

    await fetchItems()
    return true
  }

  return {
    items,
    productionLogs,
    purchaseReceipts,
    loading,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    addPurchaseReceipt,
    updatePurchaseReceipt,
    deletePurchaseReceipt,
    addProductionLog,
    deleteProductionLog,
    recordPlantingUsage,
    recordHarvestInput,
    recordWaste,
    recordGift
  }
}

export function useCircularNodes() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNodes = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      setNodes(DEMO_NODES)
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('circular_nodes').select('*').order('node_type')
    if (!error) setNodes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchNodes() }, [fetchNodes])

  const addNode = async (node) => {
    if (!isConnected()) {
      const n = { ...node, node_id: String(Date.now()) }
      setNodes(prev => [...prev, n])
      return n
    }
    const { data, error } = await supabase.from('circular_nodes').insert(node).select().single()
    if (!error) { await fetchNodes(); return data }
    return null
  }

  return { nodes, loading, fetchNodes, addNode }
}

export function useCompostBatches(nodeId = null) {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      const filtered = nodeId ? DEMO_BATCHES.filter(b => b.node_id === nodeId) : DEMO_BATCHES
      setBatches(filtered)
      setLoading(false)
      return
    }
    let query = supabase.from('compost_batches').select('*').order('start_date', { ascending: false })
    if (nodeId) query = query.eq('node_id', nodeId)
    const { data, error } = await query
    if (!error) setBatches(data || [])
    setLoading(false)
  }, [nodeId])

  useEffect(() => { fetchBatches() }, [fetchBatches])

  const addBatch = async (batch) => {
    if (batch.compost_type === 'Ủ chuyên biệt bã nha đam') {
      batch.temp_target_min = 60
      batch.temp_target_max = 65
      batch.turn_interval_days = 14
      const start = new Date(batch.start_date)
      batch.cover_removal_date = new Date(start.getTime() + 70 * 86400000).toISOString().split('T')[0]
      batch.next_check_date = new Date(start.getTime() + 14 * 86400000).toISOString().split('T')[0]
    } else {
      batch.temp_target_min = 50
      batch.temp_target_max = 60
      batch.turn_interval_days = 3
      const start = new Date(batch.start_date)
      batch.cover_removal_date = new Date(start.getTime() + 10 * 86400000).toISOString().split('T')[0]
      batch.next_check_date = new Date(start.getTime() + 3 * 86400000).toISOString().split('T')[0]
    }

    if (!isConnected()) {
      const b = { ...batch, batch_id: String(Date.now()) }
      setBatches(prev => [b, ...prev])
      return b
    }
    const { data, error } = await supabase.from('compost_batches').insert(batch).select().single()
    if (!error) { await fetchBatches(); return data }
    return null
  }

  const updateBatch = async (id, updates) => {
    const targetBatch = batches.find(b => b.batch_id === id)
    if (!isConnected()) {
      setBatches(prev => prev.map(b => b.batch_id === id ? { ...b, ...updates } : b))

      if (updates.status === 'Hoàn thành' && targetBatch) {
        const outputKg = Math.round((parseFloat(targetBatch.input_mass_kg) || 0) * 0.6)
        try {
          const rawInv = localStorage.getItem('app_inventory_items')
          let items = rawInv ? JSON.parse(rawInv) : DEMO_INVENTORY
          let found = items.find(i => i.item_name.includes('Phân hữu cơ tự ủ') || i.item_type === 'Phân hữu cơ')
          if (found) {
            found.qty_in = (parseFloat(found.qty_in) || 0) + outputKg
            found.qty_remaining = (parseFloat(found.qty_remaining) || 0) + outputKg
          } else {
            items.push({
              item_id: String(Date.now()),
              item_name: 'Phân hữu cơ tự ủ từ bã nha đam',
              item_type: 'Phân hữu cơ',
              unit: 'kg',
              qty_in: outputKg,
              qty_out: 0,
              qty_remaining: outputKg,
              unit_cost: 0
            })
          }
          localStorage.setItem('app_inventory_items', JSON.stringify(items))
        } catch (e) {}
      }

      return
    }

    await supabase.from('compost_batches').update(updates).eq('batch_id', id)

    if (updates.status === 'Hoàn thành' && targetBatch) {
      const outputKg = Math.round((parseFloat(targetBatch.input_mass_kg) || 0) * 0.6)
      const { data: existing } = await supabase.from('inventory_items').select('*').ilike('item_name', '%Phân hữu cơ%').limit(1).single()
      if (existing) {
        await supabase.from('inventory_items').update({
          qty_in: (parseFloat(existing.qty_in) || 0) + outputKg,
          qty_remaining: (parseFloat(existing.qty_remaining) || 0) + outputKg
        }).eq('item_id', existing.item_id)
      } else {
        await supabase.from('inventory_items').insert({
          item_name: 'Phân hữu cơ tự ủ từ bã nha đam',
          item_type: 'Phân hữu cơ',
          unit: 'kg',
          qty_in: outputKg,
          qty_out: 0,
          qty_remaining: outputKg,
          unit_cost: 0
        })
      }
    }

    await fetchBatches()
  }

  return { batches, loading, fetchBatches, addBatch, updateBatch }
}

export function useChemicalLogs(plotId = null) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      const filtered = plotId ? DEMO_CHEMICAL_LOGS.filter(l => l.plot_id === plotId) : DEMO_CHEMICAL_LOGS
      setLogs(filtered)
      setLoading(false)
      return
    }
    let query = supabase.from('chemical_logs').select('*').order('date_applied', { ascending: false })
    if (plotId) query = query.eq('plot_id', plotId)
    const { data, error } = await query
    if (!error) setLogs(data || [])
    setLoading(false)
  }, [plotId])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = async (log) => {
    const applied = new Date(log.date_applied)
    log.harvest_allowed_date = new Date(applied.getTime() + log.phi_days * 86400000).toISOString().split('T')[0]

    if (!isConnected()) {
      const l = { ...log, log_id: String(Date.now()) }
      setLogs(prev => [l, ...prev])
      return l
    }
    const { data, error } = await supabase.from('chemical_logs').insert(log).select().single()
    if (!error) { await fetchLogs(); return data }
    return null
  }

  const isPlotLocked = (plotId) => {
    const today = new Date().toISOString().split('T')[0]
    return logs.some(l => l.plot_id === plotId && l.harvest_allowed_date > today)
  }

  const getPlotLockDate = (plotId) => {
    const today = new Date().toISOString().split('T')[0]
    const activeLogs = logs.filter(l => l.plot_id === plotId && l.harvest_allowed_date > today)
    if (activeLogs.length === 0) return null
    return activeLogs.reduce((max, l) => l.harvest_allowed_date > max ? l.harvest_allowed_date : max, '2000-01-01')
  }

  return { logs, loading, fetchLogs, addLog, isPlotLocked, getPlotLockDate }
}

export async function resetAllInventoryAndCloud() {
  localStorage.clear()
  if (isConnected()) {
    try {
      await Promise.all([
        supabase.from('inventory_items').update({ qty_out: 0, qty_remaining: 39, unit_cost: 4210 }).eq('item_id', 'NL07_DT'),
        supabase.from('inventory_items').update({ qty_out: 0, qty_remaining: 13, unit_cost: 22308 }).eq('item_id', 'NL07_HN'),
        supabase.from('inventory_items').update({ qty_out: 0, qty_remaining: 46, unit_cost: 0 }).eq('item_id', 'NL07_VN'),
        supabase.from('crops').delete().neq('crop_id', 'dummy'),
        supabase.from('production_logs').delete().neq('log_id', 'dummy')
      ])
    } catch (e) {
      console.error('Error resetting Supabase', e)
    }
  }
  window.location.reload()
}
