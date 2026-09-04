import { supabase, isConnected } from './supabase'

// 1. ĐẨY TOÀN BỘ DỮ LIỆU TỪ MÁY TÍNH LÊN CLOUD SUPABASE
export async function pushLocalToCloud() {
  if (!isConnected() || !supabase) {
    throw new Error('Chưa kết nối Supabase Cloud Database')
  }

  const results = { plots: 0, crops: 0, inventory: 0, receipts: 0, logs: 0, tasks: 0 }

  // 1. Plots
  const rawPlots = localStorage.getItem('app_plots_data')
  if (rawPlots) {
    const plots = JSON.parse(rawPlots)
    if (plots && plots.length > 0) {
      const sanitized = plots.map(p => ({
        plot_id: String(p.plot_id || p.id),
        name: p.name || 'Lô vườn',
        area_m2: parseFloat(p.area_m2) || 0,
        soil_ph: parseFloat(p.soil_ph) || 6.5,
        soil_type: p.soil_type || 'Thịt nhẹ',
        status: p.status || 'Chuẩn bị',
        cultivation_stage: p.cultivation_stage || 'Làm đất',
        area_coord_code: p.area_coord_code || '',
        cultivation_history: p.cultivation_history || '',
        last_soil_treatment_date: p.last_soil_treatment_date || null
      }))
      const { error } = await supabase.from('plots').upsert(sanitized, { onConflict: 'plot_id' })
      if (!error) results.plots = sanitized.length
    }
  }

  // 2. Crops
  const rawCrops = localStorage.getItem('app_crops_data')
  if (rawCrops) {
    const crops = JSON.parse(rawCrops)
    if (crops && crops.length > 0) {
      const sanitized = crops.map(c => ({
        crop_id: String(c.crop_id || c.id || `crop_${c.plot_id}`),
        plot_id: String(c.plot_id),
        plant_type: c.plant_type || 'Nha đam',
        plant_date: c.plant_date || c.seed_date || null,
        density: c.density || '25cm x 30cm',
        stage: c.stage || 'Kiến thiết cơ bản',
        seed_source: c.seed_source || '',
        plant_count: parseInt(c.plant_count) || 0,
        seed_count: parseInt(c.seed_count) || 0,
        seed_batches: c.seed_batches || null,
        seed_notes: c.seed_notes || ''
      }))
      const { error } = await supabase.from('crops').upsert(sanitized, { onConflict: 'crop_id' })
      if (!error) results.crops = sanitized.length
    }
  }

  // 3. Inventory Items
  const rawInv = localStorage.getItem('app_inventory_items')
  if (rawInv) {
    const items = JSON.parse(rawInv)
    if (items && items.length > 0) {
      const sanitized = items.map(i => ({
        item_id: String(i.item_id),
        item_name: i.item_name,
        item_type: i.item_type || 'Nguyên liệu',
        unit: i.unit || 'kg',
        qty_in: parseFloat(i.qty_in) || 0,
        qty_out: parseFloat(i.qty_out) || 0,
        qty_remaining: parseFloat(i.qty_remaining) || 0,
        unit_cost: parseFloat(i.unit_cost) || 0,
        supplier: i.supplier || '',
        notes: i.notes || ''
      }))
      const { error } = await supabase.from('inventory_items').upsert(sanitized, { onConflict: 'item_id' })
      if (!error) results.inventory = sanitized.length
    }
  }

  // 4. Purchase Receipts
  const rawReceipts = localStorage.getItem('app_purchase_receipts')
  if (rawReceipts) {
    const receipts = JSON.parse(rawReceipts)
    if (receipts && receipts.length > 0) {
      const sanitized = receipts.map(r => ({
        receipt_id: String(r.receipt_id),
        date: r.date || null,
        item_id: r.item_id || 'NL07',
        item_name: r.item_name || 'Vật tư',
        variety: r.variety || '',
        supplier: r.supplier || '',
        unit: r.unit || 'cây',
        total_received_qty: parseFloat(r.total_received_qty || r.qty) || 0,
        goods_cost: parseFloat(r.goods_cost) || 0,
        shipping_cost: parseFloat(r.shipping_cost) || 0,
        discount_amount: parseFloat(r.discount_amount) || 0,
        total_cost: parseFloat(r.total_cost) || 0,
        effective_unit_cost: parseFloat(r.effective_unit_cost) || 0,
        items_list: r.items_list || null,
        notes: r.notes || ''
      }))
      const { error } = await supabase.from('purchase_receipts').upsert(sanitized, { onConflict: 'receipt_id' })
      if (!error) results.receipts = sanitized.length
    }
  }

  // 5. Production Logs
  const rawLogs = localStorage.getItem('app_production_logs')
  if (rawLogs) {
    const logs = JSON.parse(rawLogs)
    if (logs && logs.length > 0) {
      const sanitized = logs.map(l => ({
        log_id: String(l.log_id),
        plot_id: l.plot_id ? String(l.plot_id) : null,
        date: l.date || null,
        material_code: l.material_code || '',
        material_name: l.material_name || '',
        purpose: l.purpose || '',
        qty_out: parseFloat(l.qty_out || l.quantity_used) || 0,
        unit: l.unit || '',
        unit_cost: parseFloat(l.unit_cost) || 0,
        total_cost: parseFloat(l.total_cost) || 0,
        target_code: l.target_code || '',
        target_name: l.target_name || '',
        output_qty: parseFloat(l.output_qty) || 0,
        output_unit: l.output_unit || '',
        notes: l.notes || '',
        is_auto_synced: Boolean(l.is_auto_synced)
      }))
      const { error } = await supabase.from('production_logs').upsert(sanitized, { onConflict: 'log_id' })
      if (!error) results.logs = sanitized.length
    }
  }

  // 6. Field Tasks
  const rawTasks = localStorage.getItem('app_field_tasks')
  if (rawTasks) {
    const tasks = JSON.parse(rawTasks)
    if (tasks && tasks.length > 0) {
      const sanitized = tasks.map(t => ({
        task_id: String(t.task_id),
        plot_id: t.plot_id ? String(t.plot_id) : null,
        task_name: t.task_name,
        task_type: t.task_type || 'Khác',
        execute_date: t.execute_date || new Date().toISOString().split('T')[0],
        status: t.status || 'Chờ làm',
        worker_id: t.worker_id || 'Thuý',
        harvest_qty_kg: parseFloat(t.harvest_qty_kg) || 0,
        harvest_leaves: parseInt(t.harvest_leaves) || 0,
        stage_milestone: t.stage_milestone || null,
        reminder_tag: t.reminder_tag || null,
        day_offset: t.day_offset || null,
        is_auto_reminder: Boolean(t.is_auto_reminder),
        notes: t.notes || '',
        completed_at: t.completed_at || null
      }))
      const { error } = await supabase.from('field_tasks').upsert(sanitized, { onConflict: 'task_id' })
      if (!error) results.tasks = sanitized.length
    }
  }

  return results
}

// 2. KÉO DỮ LIỆU TỪ CLOUD VỀ LƯU VÀO TRÌNH DUYỆT
export async function pullCloudToLocal() {
  if (!isConnected() || !supabase) return false

  try {
    const [pRes, cRes, iRes, rRes, lRes, tRes] = await Promise.all([
      supabase.from('plots').select('*'),
      supabase.from('crops').select('*'),
      supabase.from('inventory_items').select('*'),
      supabase.from('purchase_receipts').select('*'),
      supabase.from('production_logs').select('*'),
      supabase.from('field_tasks').select('*')
    ])

    if (pRes.data && pRes.data.length > 0) {
      localStorage.setItem('app_plots_data', JSON.stringify(pRes.data))
    }
    if (cRes.data && cRes.data.length > 0) {
      localStorage.setItem('app_crops_data', JSON.stringify(cRes.data))
    }
    if (iRes.data && iRes.data.length > 0) {
      localStorage.setItem('app_inventory_items', JSON.stringify(iRes.data))
    }
    if (rRes.data && rRes.data.length > 0) {
      localStorage.setItem('app_purchase_receipts', JSON.stringify(rRes.data))
    }
    if (lRes.data && lRes.data.length > 0) {
      localStorage.setItem('app_production_logs', JSON.stringify(lRes.data))
    }
    if (tRes.data && tRes.data.length > 0) {
      localStorage.setItem('app_field_tasks', JSON.stringify(tRes.data))
    }

    return true
  } catch (err) {
    console.error('Error pulling cloud data', err)
    return false
  }
}

// 3. XUẤT FILE SAO LƯU JSON ĐỂ TẢI VỀ MÁY HOẶC CHUYỂN SANG IPHONE
export function exportBackupJSON() {
  const data = {
    exported_at: new Date().toISOString(),
    version: '2026.1',
    app_plots_data: JSON.parse(localStorage.getItem('app_plots_data') || '[]'),
    app_crops_data: JSON.parse(localStorage.getItem('app_crops_data') || '[]'),
    app_inventory_items: JSON.parse(localStorage.getItem('app_inventory_items') || '[]'),
    app_purchase_receipts: JSON.parse(localStorage.getItem('app_purchase_receipts') || '[]'),
    app_production_logs: JSON.parse(localStorage.getItem('app_production_logs') || '[]'),
    app_field_tasks: JSON.parse(localStorage.getItem('app_field_tasks') || '[]'),
    app_chemical_logs: JSON.parse(localStorage.getItem('app_chemical_logs') || '[]'),
    app_products_data: JSON.parse(localStorage.getItem('app_products_data') || '[]'),
    app_sales_orders: JSON.parse(localStorage.getItem('app_sales_orders') || '[]'),
    app_customers_data: JSON.parse(localStorage.getItem('app_customers_data') || '[]')
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `sao_luu_vuon_nha_dam_${dateStr}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 4. NHẬP FILE SAO LƯU JSON
export function importBackupJSON(fileContent, syncToCloud = true) {
  try {
    const data = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent
    const keys = [
      'app_plots_data', 'app_crops_data', 'app_inventory_items',
      'app_purchase_receipts', 'app_production_logs', 'app_field_tasks',
      'app_chemical_logs', 'app_products_data', 'app_sales_orders', 'app_customers_data'
    ]

    keys.forEach(k => {
      if (data[k]) {
        localStorage.setItem(k, JSON.stringify(data[k]))
      }
    })

    if (syncToCloud && isConnected()) {
      pushLocalToCloud().catch(console.error)
    }

    return true
  } catch (err) {
    console.error('Import error', err)
    return false
  }
}
