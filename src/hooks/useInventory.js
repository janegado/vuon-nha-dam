import { useState, useEffect, useCallback } from 'react'
import { supabase, isConnected } from '../lib/supabase'
import { generateProcessFollowUpTasks } from './useTasks'

// Danh mục nguyên vật liệu mẫu & Bảng giá niêm yết Nhà cung cấp 2026
const DEMO_INVENTORY = [
  // Nhóm 1: Vật tư nền tảng, Phụ phẩm & Cây giống
  { item_id: 'NL01', item_name: 'Mật rỉ đường', item_type: 'Nguyên liệu chính', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 10000, supplier: 'Nguồn vật tư tổng hợp', notes: 'Nguyên liệu trung tâm nhân nuôi vi sinh & làm GE' },
  { item_id: 'NL02', item_name: 'Men vi sinh gốc (EM1)', item_type: 'Men vi sinh', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 50000, supplier: 'Nguồn vật tư tổng hợp', notes: 'Dùng nhân EM gốc' },
  { item_id: 'NL03', item_name: 'Nha đam nguyên liệu/phế phẩm', item_type: 'Phụ phẩm vườn', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 5000, supplier: 'Nội bộ vườn', notes: 'Vỏ bã & lá nha đam phế phẩm làm GE' },
  { item_id: 'NL04', item_name: 'Cám gạo (nhân IMO)', item_type: 'Nguyên liệu chính', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Nguồn vật tư tổng hợp', notes: 'Dùng nhân sinh khối IMO vi sinh bản địa' },
  { item_id: 'NL05', item_name: 'Trấu sống (vỏ trấu)', item_type: 'Phụ phẩm vườn', unit: 'bao', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 20000, supplier: 'Nguồn vật tư nông nghiệp', notes: 'Dùng đốt than tro trấu hoặc ủ lót chuồng, phối trộn giá thể' },
  { item_id: 'NL06', item_name: 'Tro trấu (than trấu hun)', item_type: 'Phân hữu cơ', unit: 'bao', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 25000, supplier: 'Nội bộ vườn / Đốt từ trấu', notes: 'Tro trấu hun bón lót cải tạo đất, giữ ẩm, chống nghẹt rễ' },
  { item_id: 'BTP_IMO4', item_name: 'Sinh khối vi sinh IMO4', item_type: 'Men vi sinh', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Tự sản xuất nội bộ', notes: 'Sinh khối IMO4 nhân từ Cám gạo + Mật rỉ đường + Men vi sinh' },
  { item_id: 'NL07', item_name: 'Cây giống nha đam', item_type: 'Cây giống', unit: 'cây', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 15000, supplier: 'Vườn giống Ninh Thuận', notes: 'Cây giống nha đam Mỹ F1 chuẩn rễ mập' },

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
  { item_id: 'VTQ_18', item_name: 'Dinh dưỡng đạm cá đậm đặc', item_type: 'Phân hữu cơ', unit: 'lít', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 85000, supplier: 'Vương Trùn Quế (034.981.6802)', notes: 'Bảng giá 2026 - 85.000đ/Lít' },
]

const DEMO_PURCHASE_RECEIPTS = []
const DEMO_PRODUCTION_LOGS = []
const DEMO_NODES = []
const DEMO_BATCHES = []
const DEMO_CHEMICAL_LOGS = []

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
        const itemId = row.item_id || 'NL07'
        if (itemMap[itemId]) {
          const qty = parseFloat(row.total_received_qty || row.qty) || 0
          const unitPrice = parseFloat(row.unit_price) || 0
          itemMap[itemId].qty_in += qty
          itemMap[itemId].total_cost_pool += qty * unitPrice
        }
      })
    } else {
      const itemId = r.item_id || 'NL07'
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
    const itemId = log.material_code || log.item_id
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
    const plotCrops = (cropsData || []).filter(c => String(c.plot_id) === String(plot.plot_id))
    const crop = plotCrops[0]
    if (!crop) return

    const totalPlants = (crop.seed_batches && crop.seed_batches.length > 0)
      ? crop.seed_batches.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0)
      : (parseInt(crop.plant_count || crop.seed_count) || 0)

    const isPlantedOrReady = totalPlants > 0 && (
      ['Trồng cây', 'Chăm sóc', 'Thu hoạch'].includes(plot.cultivation_stage) ||
      (crop.seed_batches && crop.seed_batches.length > 0) ||
      parseInt(crop.plant_count) > 0 ||
      parseInt(crop.seed_count) > 0
    )

    if (isPlantedOrReady) {
      activePlotsWithPlants.push({
        plot,
        crop,
        totalPlants,
        batches: crop.seed_batches || []
      })
    }
  })

  // Với mỗi Lô có cây giống, đảm bảo có dòng nhật ký xuất trồng tương ứng
  activePlotsWithPlants.forEach(({ plot, crop, totalPlants, batches }) => {
    const existingLogIdx = logs.findIndex(l => 
      (l.plot_id && String(l.plot_id) === String(plot.plot_id)) ||
      (l.purpose && (l.purpose.includes(`Xuất trồng vườn ${plot.name}`) || l.purpose.includes(`Xuất trồng vườn: ${plot.name}`) || l.purpose.includes(`Xuống giống ${plot.name}`) || l.purpose.includes(`Trồng cây ${plot.name}`))) ||
      (l.target_name && (l.target_name.includes(`Trồng cây ${plot.name}`) || l.target_name.includes(plot.name)))
    )

    // Tính đơn giá vốn trung bình hoặc từ đợt nhập
    let unitCost = 14500
    let notesSummary = `Xuống giống ${plot.name}`
    if (batches.length > 0) {
      const batchDetails = batches.map(b => `${b.qty} cây ${b.plant_size || ''} (${b.seed_source || 'Kho'})`).join(', ')
      notesSummary = `Xuống giống ${plot.name} [${batchDetails}]`
      const totalCost = batches.reduce((sum, b) => sum + ((parseInt(b.qty) || 0) * (parseFloat(b.unit_cost) || 14500)), 0)
      if (totalPlants > 0 && totalCost > 0) {
        unitCost = Math.round(totalCost / totalPlants)
      }
    } else if (crop.seed_notes) {
      notesSummary = `Xuống giống ${plot.name} - ${crop.seed_notes}`
    }

    const logDate = crop.plant_date || crop.seed_date || new Date().toISOString().split('T')[0]

    const desiredLog = {
      log_id: existingLogIdx >= 0 ? logs[existingLogIdx].log_id : `plant_${plot.plot_id}_${Date.now()}`,
      plot_id: String(plot.plot_id),
      date: logDate,
      material_code: 'NL07',
      material_name: 'Cây giống nha đam',
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
      if (cur.qty_out !== totalPlants || cur.date !== logDate || cur.unit_cost !== unitCost || cur.plot_id !== String(plot.plot_id) || cur.notes !== notesSummary) {
        logs[existingLogIdx] = { ...cur, ...desiredLog }
        hasChange = true
      }
    } else {
      logs = [desiredLog, ...logs]
      hasChange = true
    }
  })

  // Nếu một lô bị xóa hoặc reset về 0 cây, loại bỏ log tự sinh của lô đó
  const currentPlotIds = new Set((plotsData || []).map(p => String(p.plot_id)))
  const filteredLogs = logs.filter(l => {
    if (l.is_auto_synced && l.plot_id && !currentPlotIds.has(String(l.plot_id))) {
      hasChange = true
      return false
    }
    return true
  })

  return { logs: filteredLogs, hasChange }
}

export function useInventory() {
  const [items, setItems] = useState([])
  const [productionLogs, setProductionLogs] = useState([])
  const [purchaseReceipts, setPurchaseReceipts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      const savedReceipts = localStorage.getItem('app_purchase_receipts')
      const receiptsData = savedReceipts ? JSON.parse(savedReceipts) : DEMO_PURCHASE_RECEIPTS

      const savedLogs = localStorage.getItem('app_production_logs')
      let logsData = savedLogs ? JSON.parse(savedLogs) : DEMO_PRODUCTION_LOGS

      const savedPlots = localStorage.getItem('app_plots_data')
      const plotsData = savedPlots ? JSON.parse(savedPlots) : []

      const savedCrops = localStorage.getItem('app_crops_data')
      const cropsData = savedCrops ? JSON.parse(savedCrops) : []

      // Tự động đồng bộ các lần xuất trồng cây từ Lô đất sang Sổ nhật ký
      const syncResult = syncPlantingLogsWithCrops(logsData, cropsData, plotsData, receiptsData)
      if (syncResult.hasChange) {
        logsData = syncResult.logs
        localStorage.setItem('app_production_logs', JSON.stringify(logsData))
      }
      setProductionLogs(logsData)

      const saved = localStorage.getItem('app_inventory_items')
      let itemsData = saved ? JSON.parse(saved) : [...DEMO_INVENTORY]

      // Tự động chuẩn hóa đơn vị cho các phiếu nhập (Tránh hiển thị sai đơn vị cây cho men vi sinh/phân bón)
      let receiptsChanged = false
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
          receiptsChanged = true
          return { ...r, unit: correctUnit }
        }
        return r
      })

      if (receiptsChanged) {
        localStorage.setItem('app_purchase_receipts', JSON.stringify(normalizedReceipts))
        setPurchaseReceipts(normalizedReceipts)
      } else {
        setPurchaseReceipts(receiptsData)
      }

      // Loại bỏ các mục Sách kỹ thuật nông nghiệp khỏi kho
      const beforeLen = itemsData.length
      itemsData = itemsData.filter(i => i.item_id !== 'VTQ_19' && i.item_id !== 'VTQ_20' && !i.item_name?.toLowerCase().includes('sách'))
      let hasChange = itemsData.length !== beforeLen

      // Tự động đồng bộ các mặt hàng mới trong DEMO_INVENTORY (Vương Trùn Quế) vào danh sách kho
      const existingIds = new Set(itemsData.map(i => i.item_id))
      const existingNames = new Set(itemsData.map(i => (i.item_name || '').toLowerCase()))

      DEMO_INVENTORY.forEach(demoItem => {
        if (!existingIds.has(demoItem.item_id) && !existingNames.has(demoItem.item_name.toLowerCase())) {
          itemsData.push(demoItem)
          hasChange = true
        }
      })

      // Tự động cân đối tồn kho chuẩn xác từ các phiếu nhập và nhật ký xuất (đã gồm các Lô xuất trồng)
      itemsData = calculateInventoryFromReceiptsAndLogs(itemsData, receiptsData, logsData)

      localStorage.setItem('app_inventory_items', JSON.stringify(itemsData))
      setItems(itemsData)
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('inventory_items').select('*').order('item_name')
    if (!error) setItems(data || [])
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

    if (!isConnected()) {
      setPurchaseReceipts(prev => {
        const updated = [newReceipt, ...(prev || [])]
        try {
          localStorage.setItem('app_purchase_receipts', JSON.stringify(updated))
        } catch (err) {
          console.error('Error saving purchase receipts to localStorage', err)
        }
        return updated
      })

      // Cập nhật tồn kho cho từng mặt hàng trong danh sách
      setItems(prev => {
        let updated = [...(prev || [])]

        itemsList.forEach(row => {
          const rowName = (row.item_name || row.variety || '').toLowerCase()
          let foundIdx = updated.findIndex(i => {
            if (!i) return false
            const curName = (i.item_name || '').toLowerCase()
            return (
              (row.item_id && row.item_id !== 'CUSTOM' && i.item_id === row.item_id) ||
              (rowName && curName === rowName) ||
              (rowName.includes('giống') && i.item_id === 'NL07')
            )
          })

          const rowCostShare = totalReceivedQty > 0 ? (row.total_received_qty / totalReceivedQty) * totalCost : row.subtotal

          if (foundIdx >= 0) {
            const item = updated[foundIdx]
            const curQty = parseFloat(item.qty_remaining) || 0
            const curCost = parseFloat(item.unit_cost) || 0
            const newTotalQty = curQty + row.total_received_qty
            const newAvgCost = newTotalQty > 0 ? Math.round(((curQty * curCost) + rowCostShare) / newTotalQty) : effectiveUnitCost

            updated[foundIdx] = {
              ...item,
              qty_in: (parseFloat(item.qty_in) || 0) + row.total_received_qty,
              qty_remaining: newTotalQty,
              unit_cost: newAvgCost
            }
          } else {
            const newTotalQty = row.total_received_qty
            const newAvgCost = newTotalQty > 0 ? Math.round(rowCostShare / newTotalQty) : effectiveUnitCost
            const newItemId = (row.item_id && row.item_id !== 'CUSTOM') ? row.item_id : `NL${String(Date.now()).slice(-2)}_${Math.floor(Math.random()*1000)}`

            updated.push({
              item_id: newItemId,
              item_name: row.item_name || row.variety || 'Vật tư mới',
              item_type: rowName.includes('giống') ? 'Cây giống' : (rowName.includes('thuốc') ? 'Thuốc BVTV' : (rowName.includes('phân') ? 'Phân hữu cơ' : 'Nguyên liệu chính')),
              unit: row.unit || 'kg',
              qty_in: newTotalQty,
              qty_out: 0,
              qty_remaining: newTotalQty,
              unit_cost: newAvgCost,
              notes: row.row_notes || row.spec || ''
            })
          }
        })

        try {
          localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        } catch (err) {
          console.error('Error saving inventory items to localStorage', err)
        }
        return updated
      })

      return newReceipt
    }

    await fetchItems()
    return newReceipt
  }

  // Chỉnh sửa phiếu nhập mua hàng & Cập nhật lại kho
  const updatePurchaseReceipt = async (receiptId, updatedData) => {
    if (!isConnected()) {
      let oldReceipt = null
      let newReceiptObj = null

      setPurchaseReceipts(prev => {
        const currentList = prev || []
        const idx = currentList.findIndex(r => r.receipt_id === receiptId)
        if (idx === -1) return currentList

        oldReceipt = currentList[idx]

        // Chuẩn hóa danh sách hàng mới
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

        newReceiptObj = {
          ...oldReceipt,
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

        const nextList = [...currentList]
        nextList[idx] = newReceiptObj

        try {
          localStorage.setItem('app_purchase_receipts', JSON.stringify(nextList))
        } catch (err) {
          console.error('Error saving updated purchase receipts', err)
        }
        return nextList
      })

      // Cập nhật lại tồn kho: Trừ số lượng cũ, cộng số lượng mới
      setItems(prev => {
        let updated = [...(prev || [])]

        // 1. Hoàn nguyên số lượng cũ
        if (oldReceipt && oldReceipt.items_list) {
          oldReceipt.items_list.forEach(oldRow => {
            const oldName = (oldRow.item_name || oldRow.variety || '').toLowerCase()
            const foundIdx = updated.findIndex(i => {
              if (!i) return false
              const curName = (i.item_name || '').toLowerCase()
              return (
                (oldRow.item_id && oldRow.item_id !== 'CUSTOM' && i.item_id === oldRow.item_id) ||
                (oldName && curName === oldName) ||
                (oldName.includes('giống') && i.item_id === 'NL07')
              )
            })

            if (foundIdx >= 0) {
              const item = updated[foundIdx]
              const oldRecQty = parseFloat(oldRow.total_received_qty || oldRow.qty) || 0
              const newQtyIn = Math.max(0, (parseFloat(item.qty_in) || 0) - oldRecQty)
              const newQtyRem = Math.max(0, (parseFloat(item.qty_remaining) || 0) - oldRecQty)
              updated[foundIdx] = { ...item, qty_in: newQtyIn, qty_remaining: newQtyRem }
            }
          })
        }

        // 2. Cộng số lượng mới
        if (newReceiptObj && newReceiptObj.items_list) {
          newReceiptObj.items_list.forEach(newRow => {
            const rowName = (newRow.item_name || newRow.variety || '').toLowerCase()
            const foundIdx = updated.findIndex(i => {
              if (!i) return false
              const curName = (i.item_name || '').toLowerCase()
              return (
                (newRow.item_id && newRow.item_id !== 'CUSTOM' && i.item_id === newRow.item_id) ||
                (rowName && curName === rowName) ||
                (rowName.includes('giống') && i.item_id === 'NL07')
              )
            })

            const newRecQty = parseFloat(newRow.total_received_qty || newRow.qty) || 0
            const rowCostShare = newReceiptObj.total_received_qty > 0 ? (newRecQty / newReceiptObj.total_received_qty) * newReceiptObj.total_cost : newRow.subtotal

            if (foundIdx >= 0) {
              const item = updated[foundIdx]
              const curQty = parseFloat(item.qty_remaining) || 0
              const curCost = parseFloat(item.unit_cost) || 0
              const newTotalQty = curQty + newRecQty
              const newAvgCost = newTotalQty > 0 ? Math.round(((curQty * curCost) + rowCostShare) / newTotalQty) : newReceiptObj.effective_unit_cost

              updated[foundIdx] = {
                ...item,
                qty_in: (parseFloat(item.qty_in) || 0) + newRecQty,
                qty_remaining: newTotalQty,
                unit_cost: newAvgCost
              }
            } else {
              const newTotalQty = newRecQty
              const newAvgCost = newTotalQty > 0 ? Math.round(rowCostShare / newTotalQty) : newReceiptObj.effective_unit_cost
              const newItemId = (newRow.item_id && newRow.item_id !== 'CUSTOM') ? newRow.item_id : `NL${String(Date.now()).slice(-2)}_${Math.floor(Math.random()*1000)}`

              updated.push({
                item_id: newItemId,
                item_name: newRow.item_name || newRow.variety || 'Vật tư mới',
                item_type: rowName.includes('giống') ? 'Cây giống' : (rowName.includes('thuốc') ? 'Thuốc BVTV' : (rowName.includes('phân') ? 'Phân hữu cơ' : 'Nguyên liệu chính')),
                unit: newRow.unit || 'kg',
                qty_in: newTotalQty,
                qty_out: 0,
                qty_remaining: newTotalQty,
                unit_cost: newAvgCost,
                notes: newRow.row_notes || newRow.spec || ''
              })
            }
          })
        }

        try {
          localStorage.setItem('app_inventory_items', JSON.stringify(updated))
        } catch (err) {
          console.error('Error saving inventory items to localStorage', err)
        }
        return updated
      })

      return newReceiptObj
    }
    await fetchItems()
  }

  // Xóa phiếu nhập mua hàng & Hoàn nguyên kho
  const deletePurchaseReceipt = async (receiptId) => {
    if (!isConnected()) {
      let targetReceipt = null
      setPurchaseReceipts(prev => {
        const currentList = prev || []
        targetReceipt = currentList.find(r => r.receipt_id === receiptId)
        const updated = currentList.filter(r => r.receipt_id !== receiptId)
        try {
          localStorage.setItem('app_purchase_receipts', JSON.stringify(updated))
        } catch (err) {
          console.error('Error deleting purchase receipt from localStorage', err)
        }
        return updated
      })

      if (targetReceipt && targetReceipt.items_list) {
        setItems(prev => {
          let updated = [...(prev || [])]
          targetReceipt.items_list.forEach(row => {
            const rowName = (row.item_name || row.variety || '').toLowerCase()
            const foundIdx = updated.findIndex(i => {
              if (!i) return false
              const curName = (i.item_name || '').toLowerCase()
              return (
                (row.item_id && row.item_id !== 'CUSTOM' && i.item_id === row.item_id) ||
                (rowName && curName === rowName) ||
                (rowName.includes('giống') && i.item_id === 'NL07')
              )
            })
            if (foundIdx >= 0) {
              const item = updated[foundIdx]
              const recQty = parseFloat(row.total_received_qty || row.qty) || 0
              const newQtyIn = Math.max(0, (parseFloat(item.qty_in) || 0) - recQty)
              const newQtyRem = Math.max(0, (parseFloat(item.qty_remaining) || 0) - recQty)
              updated[foundIdx] = { ...item, qty_in: newQtyIn, qty_remaining: newQtyRem }
            }
          })
          try {
            localStorage.setItem('app_inventory_items', JSON.stringify(updated))
          } catch (err) {
            console.error('Error saving inventory items after deleting receipt', err)
          }
          return updated
        })
      }
      return true
    }
    await fetchItems()
    return true
  }

  // Ghi nhật ký sản xuất & Tự động trừ kho nguyên liệu & Cộng kho thành phẩm & Sinh lịch nhắc
  const addProductionLog = async (log) => {
    const newLog = {
      ...log,
      log_id: String(Date.now()),
      total_cost: (parseFloat(log.qty_out) || 0) * (parseFloat(log.unit_cost) || 0)
    }

    if (!isConnected()) {
      setProductionLogs(prev => {
        const updated = [newLog, ...prev]
        localStorage.setItem('app_production_logs', JSON.stringify(updated))
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

        localStorage.setItem('app_inventory_items', JSON.stringify(updated))
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
          const followUps = generateProcessFollowUpTasks(triggerType, log.purpose, log.date || today)
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

      return newLog
    }

    // Supabase logic
    const { data: logData } = await supabase.from('cost_records').insert({
      record_type: log.purpose,
      input_material: log.material_name,
      input_qty: log.qty_out,
      input_cost: newLog.total_cost,
      output_qty: log.output_qty,
      notes: `${log.material_code} -> ${log.target_code}`
    }).select().single()

    await fetchItems()
    return logData
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
    if (!isConnected()) {
      let targetLog = null
      setProductionLogs(prev => {
        const list = prev || []
        targetLog = list.find(l => String(l.log_id) === String(logId))
        const updated = list.filter(l => String(l.log_id) !== String(logId))
        localStorage.setItem('app_production_logs', JSON.stringify(updated))
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
          localStorage.setItem('app_inventory_items', JSON.stringify(updated))
          return updated
        })
      }
      return true
    }

    await supabase.from('cost_records').delete().eq('id', logId)
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
