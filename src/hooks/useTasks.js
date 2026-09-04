import { useState, useEffect, useCallback } from 'react'
import { supabase, isConnected } from '../lib/supabase'

const today = new Date().toISOString().split('T')[0]

const addDays = (dateStr, days) => {
  const d = new Date(dateStr || today)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const DEMO_TASKS = []

// Hàm tự động sinh chuỗi lịch tác nghiệp theo chu kỳ vòng đời của Lô Nha Đam từ Ngày Xuống Giống
export function generatePlotLifecycleTasks(plotId, plotName, plantDate = today) {
  const baseDate = plantDate || today
  const pid = String(plotId)
  const pname = plotName || `Lô ${plotId}`

  return [
    {
      task_id: `plot_${pid}_d0_${Date.now()}`,
      plot_id: pid,
      task_name: `🌿 Xuống giống & tưới giữ ẩm nhẹ luống đất (${pname})`,
      task_type: 'Trồng cây',
      execute_date: baseDate,
      day_offset: 0,
      stage_milestone: 'N+0 (Xuống giống)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+0: Xuống giống theo mật độ 25x30cm, nén chặt gốc vừa phải, tưới phun sương nhẹ giữ ẩm luống.`
    },
    {
      task_id: `plot_${pid}_d3_${Date.now() + 1}`,
      plot_id: pid,
      task_name: `💧 Kiểm tra độ ẩm luống & dựng thẳng các cây bị nghiêng đổ (${pname})`,
      task_type: 'Tưới',
      execute_date: addDays(baseDate, 3),
      day_offset: 3,
      stage_milestone: 'N+3 (Bén rễ ban đầu)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+3: Kiểm tra đất khô thì tưới bổ sung nhẹ vào sáng sớm hoặc chiều mát, không tưới trưa nắng gắt.`
    },
    {
      task_id: `plot_${pid}_d7_${Date.now() + 2}`,
      plot_id: pid,
      task_name: `🌱 Tưới nhử rễ đợt 1: Men vi sinh IMO4 + Đạm cá loãng 1:1000 (${pname})`,
      task_type: 'Bón phân',
      execute_date: addDays(baseDate, 7),
      day_offset: 7,
      stage_milestone: 'N+7 (Kích rễ tuần 1)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+7: Cây bắt đầu nhú đầu rễ non, tưới vi sinh IMO4 pha loãng kích thích hệ rễ ăn sâu vào đất.`
    },
    {
      task_id: `plot_${pid}_d14_${Date.now() + 3}`,
      plot_id: pid,
      task_name: `🔍 Kiểm tra tỷ lệ sống, làm cỏ đợt 1 & dặm cây héo chết (${pname})`,
      task_type: 'Làm cỏ',
      execute_date: addDays(baseDate, 14),
      day_offset: 14,
      stage_milestone: 'N+14 (Định hình cây 2 tuần)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+14: Đếm kiểm tra số cây bén rễ khỏe, nhổ sạch cỏ dại quanh gốc và dặm lại cây héo úng nếu có.`
    },
    {
      task_id: `plot_${pid}_d21_${Date.now() + 4}`,
      plot_id: pid,
      task_name: `🪨 Bón thúc đợt 1: Rải phân trùn quế + Tro trấu quanh gốc (${pname})`,
      task_type: 'Bón phân',
      execute_date: addDays(baseDate, 21),
      day_offset: 21,
      stage_milestone: 'N+21 (Bón thúc 3 tuần)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+21: Bón 200–300g trùn quế/gốc kết hợp tro trấu tạo xốp đất, tưới nước giữ ẩm.`
    },
    {
      task_id: `plot_${pid}_d30_${Date.now() + 5}`,
      plot_id: pid,
      task_name: `✂️ Tỉa lá chân vàng úng & xới xáo nhẹ mặt luống (${pname})`,
      task_type: 'Tỉa lá',
      execute_date: addDays(baseDate, 30),
      day_offset: 30,
      stage_milestone: 'N+30 (Tròn 1 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+30 (1 tháng): Cắt bỏ lá chân sát đất bị thâm héo, xới nhẹ đất mặt cho thoáng khí.`
    },
    {
      task_id: `plot_${pid}_d45_${Date.now() + 6}`,
      plot_id: pid,
      task_name: `💧 Tưới GE chuối gừng / đạm vi sinh dưỡng thân bẹ (${pname})`,
      task_type: 'Tưới',
      execute_date: addDays(baseDate, 45),
      day_offset: 45,
      stage_milestone: 'N+45 (Dưỡng bẹ 1.5 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+45: Bổ sung kali hữu cơ từ GE chuối giúp bẹ dày và tăng tích lũy gel thạch nha đam.`
    },
    {
      task_id: `plot_${pid}_d60_${Date.now() + 7}`,
      plot_id: pid,
      task_name: `🌿 Làm cỏ đợt 2 & Bón thúc đợt 2 (Phân hữu cơ + Trichoderma) (${pname})`,
      task_type: 'Bón phân',
      execute_date: addDays(baseDate, 60),
      day_offset: 60,
      stage_milestone: 'N+60 (Tròn 2 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+60 (2 tháng): Cây bắt đầu bung tán mạnh, làm sạch cỏ dại và bón bổ sung phân hữu cơ vi sinh.`
    },
    {
      task_id: `plot_${pid}_d90_${Date.now() + 8}`,
      plot_id: pid,
      task_name: `🐛 Kiểm tra bọ trĩ, đốm lá sinh học & tưới vi sinh IMO4 (${pname})`,
      task_type: 'Xịt thuốc',
      execute_date: addDays(baseDate, 90),
      day_offset: 90,
      stage_milestone: 'N+90 (Kiểm soát sâu bệnh 3 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+90 (3 tháng): Phun dung dịch tỏi ớt gừng sinh học phòng ngừa nếu có dấu hiệu bọ trĩ, đốm nâu.`
    },
    {
      task_id: `plot_${pid}_d120_${Date.now() + 9}`,
      plot_id: pid,
      task_name: `🌱 Tách bớt cây giống con nhảy gốc để dồn sức nuôi bẹ mẹ to (${pname})`,
      task_type: 'Tỉa lá',
      execute_date: addDays(baseDate, 120),
      day_offset: 120,
      stage_milestone: 'N+120 (Tách cây con 4 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+120 (4 tháng): Tách cây con 10-15cm đưa về vườn ươm hoặc nhân giống lô mới, giữ cây mẹ thoáng gốc.`
    },
    {
      task_id: `plot_${pid}_d150_${Date.now() + 10}`,
      plot_id: pid,
      task_name: `💧 Bón thúc vi sinh đợt 3 dưỡng bẹ chuẩn bị thu hoạch (${pname})`,
      task_type: 'Bón phân',
      execute_date: addDays(baseDate, 150),
      day_offset: 150,
      stage_milestone: 'N+150 (Chuẩn bị thu hoạch 5 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+150 (5 tháng): Tưới dưỡng bẹ lá đạt trọng lượng chuẩn (>500g/bẹ) và độ giòn ngọt.`
    },
    {
      task_id: `plot_${pid}_d180_${Date.now() + 11}`,
      plot_id: pid,
      task_name: `📦 Đánh giá tiêu chuẩn lá già (>500g/bẹ) & Thu hoạch tỉa lá đợt đầu (${pname})`,
      task_type: 'Thu hoạch',
      execute_date: addDays(baseDate, 180),
      day_offset: 180,
      stage_milestone: 'N+180 (Thu hoạch 6 tháng)',
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: `Lô ${pname}`,
      notes: `Ngày N+180 (6 tháng): Thu hoạch 1–2 bẹ lá già sát gốc mỗi cây, bảo đảm cách ly PHI an toàn.`
    }
  ]
}

// Hàm tự động sinh chuỗi nhiệm vụ & lịch nhắc nhở theo quy trình vi sinh / chế biến
export function generateProcessFollowUpTasks(triggerType, details, startDate = today) {
  const baseDate = startDate || today
  const newTasks = []

  if (triggerType === 'IMO4' || details?.toLowerCase().includes('imo4') || details?.toLowerCase().includes('imo 4')) {
    newTasks.push(
      {
        task_id: `auto_imo4_1_${Date.now()}`,
        task_name: `🔍 Kiểm tra nhiệt độ đống ủ IMO4 (duy trì 50–60°C) & độ ẩm`,
        task_type: 'Nhân vi sinh / IMO',
        execute_date: addDays(baseDate, 1),
        status: 'Chờ làm',
        is_auto_reminder: true,
        reminder_tag: 'Quy trình IMO4',
        notes: `Tự động nhắc sau 1 ngày làm IMO4 [${details || 'Mẻ IMO4'}]. Nếu nhiệt độ > 65°C cần đảo nhẹ để thoát nhiệt.`
      },
      {
        task_id: `auto_imo4_2_${Date.now() + 1}`,
        task_name: `🔄 Đảo đống ủ IMO4 lần 1 & kiểm tra màng men trắng`,
        task_type: 'Nhân vi sinh / IMO',
        execute_date: addDays(baseDate, 3),
        status: 'Chờ làm',
        is_auto_reminder: true,
        reminder_tag: 'Quy trình IMO4',
        notes: `Tự động nhắc sau 3 ngày làm IMO4 [${details || 'Mẻ IMO4'}]. Đảo đều từ ngoài vào trong để vi sinh vật yếm khí và hiếu khí phát triển đồng đều.`
      },
      {
        task_id: `auto_imo4_3_${Date.now() + 2}`,
        task_name: `📦 Thu hoạch sinh khối IMO4 hoàn thành (đóng bao hoặc bón lót)`,
        task_type: 'Nhân vi sinh / IMO',
        execute_date: addDays(baseDate, 5),
        status: 'Chờ làm',
        is_auto_reminder: true,
        reminder_tag: 'Quy trình IMO4',
        notes: `Tự động nhắc sau 5 ngày làm IMO4 [${details || 'Mẻ IMO4'}]. Khi đống ủ thơm mùi men nấm, nhiệt độ hạ về nhiệt độ môi trường là đạt chuẩn.`
      }
    )
  } else if (triggerType === 'EM_GOC' || details?.toLowerCase().includes('em gốc') || details?.toLowerCase().includes('em1')) {
    newTasks.push({
      task_id: `auto_em_${Date.now()}`,
      task_name: `👃 Kiểm tra mùi thơm lên men EM gốc & xả bớt khí ga`,
      task_type: 'Nhân vi sinh / IMO',
      execute_date: addDays(baseDate, 7),
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: 'Quy trình EM gốc',
      notes: `Tự động nhắc sau 7 ngày ủ EM gốc [${details || 'Mẻ EM gốc'}]. Mở nắp kiểm tra mùi thơm chua nhẹ, xả khí và chiết thùng bảo quản.`
    })
  } else if (triggerType === 'DOT_TRAU' || details?.toLowerCase().includes('tro trấu') || details?.toLowerCase().includes('đốt tro')) {
    newTasks.push({
      task_id: `auto_trau_${Date.now()}`,
      task_name: `🪨 Bón lót Tro trấu + Phân trùn quế cải tạo luống đất`,
      task_type: 'Bón lót & Tro trấu',
      execute_date: addDays(baseDate, 1),
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: 'Cải tạo đất',
      notes: `Tự động nhắc sau khi đốt tro trấu [${details || 'Mẻ đốt tro trấu'}]. Dùng tro trấu hun trộn phân trùn để tạo độ tơi xốp cho đất.`
    })
  } else if (triggerType === 'LAM_DAT' || details?.toLowerCase().includes('làm đất') || details?.toLowerCase().includes('lên luống')) {
    newTasks.push({
      task_id: `auto_soil_${Date.now()}`,
      task_name: `🌱 Bón lót hữu cơ & tưới vi sinh IMO dưỡng luống 3 ngày trước khi trồng`,
      task_type: 'Bón lót & Tro trấu',
      execute_date: addDays(baseDate, 2),
      status: 'Chờ làm',
      is_auto_reminder: true,
      reminder_tag: 'Chuẩn bị luống',
      notes: `Tự động nhắc sau khi làm đất. Rải phân lót và tưới giữ ẩm bằng vi sinh để ổn định hệ vi sinh đất trước khi xuống giống.`
    })
  }

  return newTasks
}

// Tự động đối chiếu và sinh lịch tác nghiệp 12 mốc cho tất cả các lô đã xuống giống
function autoReconcileAllPlotTasks(tasksList) {
  try {
    const rawCrops = localStorage.getItem('app_crops_data')
    const rawPlots = localStorage.getItem('app_plots_data')
    const allCrops = rawCrops ? JSON.parse(rawCrops) : []
    const allPlots = rawPlots ? JSON.parse(rawPlots) : []

    let updatedTasks = [...tasksList]
    let hasChanges = false

    allPlots.forEach(p => {
      const pid = String(p.plot_id)
      const pCrop = allCrops.find(c => String(c.plot_id) === pid)
      const plantDate = pCrop?.plant_date || p.planted_date
      
      // Nếu lô này đã có ngày trồng hoặc đang ở giai đoạn Trồng cây / Chăm sóc / Thu hoạch
      if (plantDate || p.cultivation_stage === 'Trồng cây' || p.cultivation_stage === 'Chăm sóc' || p.cultivation_stage === 'Thu hoạch') {
        const effectiveDate = plantDate || today
        const existingPlotTasks = updatedTasks.filter(t => String(t.plot_id) === pid && (t.task_id?.startsWith(`plot_${pid}_d`) || t.stage_milestone))
        
        // Nếu chưa có 12 mốc tác nghiệp tự động -> TỰ ĐỘNG SINH NGAY LẬP TỨC!
        if (existingPlotTasks.length === 0) {
          const newTasks = generatePlotLifecycleTasks(pid, p.name, effectiveDate)
          updatedTasks = [...newTasks, ...updatedTasks]
          hasChanges = true
        }
      }
    })

    if (hasChanges) {
      localStorage.setItem('app_field_tasks', JSON.stringify(updatedTasks))
    }
    return updatedTasks
  } catch (e) {
    return tasksList
  }
}

export function useTasks(filterDate = null) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const saved = localStorage.getItem('app_field_tasks')
    const rawTasks = saved ? JSON.parse(saved) : DEMO_TASKS
    const allLocalTasks = autoReconcileAllPlotTasks(rawTasks)
    const localFiltered = filterDate ? allLocalTasks.filter(t => t.execute_date === filterDate) : allLocalTasks

    if (!isConnected()) {
      setTasks(localFiltered)
      setLoading(false)
      return
    }

    try {
      let query = supabase.from('field_tasks').select('*').order('execute_date', { ascending: false })
      if (filterDate) query = query.eq('execute_date', filterDate)
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        setTasks(data)
        localStorage.setItem('app_field_tasks', JSON.stringify(data))
      } else if (localFiltered && localFiltered.length > 0) {
        setTasks(localFiltered)
        const sanitized = allLocalTasks.map(t => ({
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
        supabase.from('field_tasks').upsert(sanitized, { onConflict: 'task_id' }).catch(console.error)
      } else {
        setTasks([])
      }
    } catch (e) {
      setTasks(localFiltered)
    }
    setLoading(false)
  }, [filterDate])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = async (task) => {
    if (!isConnected()) {
      const newTask = {
        ...task,
        task_id: task.task_id || String(Date.now()),
        created_at: new Date().toISOString(),
        status: task.status || 'Chờ làm'
      }

      const saved = localStorage.getItem('app_field_tasks')
      let allTasks = saved ? JSON.parse(saved) : DEMO_TASKS
      allTasks = [newTask, ...allTasks]
      localStorage.setItem('app_field_tasks', JSON.stringify(allTasks))

      setTasks(prev => [newTask, ...prev])

      // TỰ ĐỘNG HÓA: Nếu là việc Thu hoạch, tự động cộng vào tồn kho sản phẩm
      if (task.task_type === 'Thu hoạch') {
        try {
          const rawProducts = localStorage.getItem('app_products_data')
          let prods = rawProducts ? JSON.parse(rawProducts) : []
          let updated = false

          // 1. Cộng lá tươi (kg)
          if (parseFloat(task.harvest_qty_kg) > 0) {
            let foundLeaf = prods.find(p => p.product_type === 'Lá tươi')
            if (foundLeaf) {
              foundLeaf.qty_in_stock = (parseFloat(foundLeaf.qty_in_stock) || 0) + parseFloat(task.harvest_qty_kg)
              updated = true
            }
          }

          // 2. Cộng cây giống con (cây)
          if (parseInt(task.harvest_seedling_qty) > 0) {
            let foundSeedling = prods.find(p => p.product_type === 'Cây giống')
            if (foundSeedling) {
              foundSeedling.qty_in_stock = (parseInt(foundSeedling.qty_in_stock) || 0) + parseInt(task.harvest_seedling_qty)
              updated = true
            }
          }

          if (updated) {
            localStorage.setItem('app_products_data', JSON.stringify(prods))
          }
        } catch (e) {}
      }

      return newTask
    }
    const { data, error } = await supabase.from('field_tasks').insert(task).select().single()
    if (!error) {
      // TỰ ĐỘNG HÓA: Cộng thẳng vào bảng products
      if (task.task_type === 'Thu hoạch' && task.harvest_qty_kg > 0) {
        const { data: leafProd } = await supabase.from('products').select('*').eq('product_type', 'Lá tươi').limit(1).single()
        if (leafProd) {
          await supabase.from('products').update({
            qty_in_stock: (parseFloat(leafProd.qty_in_stock) || 0) + parseFloat(task.harvest_qty_kg)
          }).eq('product_id', leafProd.product_id)
        }
      }
      await fetchTasks()
      return data
    }
    return null
  }

  // Tự động sinh và lưu chuỗi lịch nhắc việc
  const addProcessTasks = async (triggerType, details, startDate = today) => {
    const followUps = generateProcessFollowUpTasks(triggerType, details, startDate)
    if (followUps.length === 0) return []

    if (!isConnected()) {
      const saved = localStorage.getItem('app_field_tasks')
      let allTasks = saved ? JSON.parse(saved) : DEMO_TASKS
      allTasks = [...followUps, ...allTasks]
      localStorage.setItem('app_field_tasks', JSON.stringify(allTasks))
      setTasks(prev => [...followUps, ...prev])
      return followUps
    }

    const { data } = await supabase.from('field_tasks').insert(followUps).select()
    await fetchTasks()
    return data || []
  }

  // Hoãn lịch nhắc nhở thêm X ngày
  const snoozeTask = async (taskId, days = 1) => {
    const task = tasks.find(t => t.task_id === taskId)
    if (!task) return

    const newDate = addDays(task.execute_date || today, days)
    const updates = { execute_date: newDate }

    if (!isConnected()) {
      const saved = localStorage.getItem('app_field_tasks')
      let allTasks = saved ? JSON.parse(saved) : DEMO_TASKS
      allTasks = allTasks.map(t => t.task_id === taskId ? { ...t, ...updates } : t)
      localStorage.setItem('app_field_tasks', JSON.stringify(allTasks))
      setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, ...updates } : t))
      return
    }

    await supabase.from('field_tasks').update(updates).eq('task_id', taskId)
    await fetchTasks()
  }

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.task_id === taskId)
    if (!task) return

    const newStatus = task.status === 'Đã hoàn thành' ? 'Chờ làm' : 'Đã hoàn thành'
    const updates = {
      status: newStatus,
      completed_at: newStatus === 'Đã hoàn thành' ? new Date().toISOString() : null
    }

    if (!isConnected()) {
      const saved = localStorage.getItem('app_field_tasks')
      let allTasks = saved ? JSON.parse(saved) : DEMO_TASKS
      allTasks = allTasks.map(t => t.task_id === taskId ? { ...t, ...updates } : t)
      localStorage.setItem('app_field_tasks', JSON.stringify(allTasks))
      setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, ...updates } : t))
      return
    }
    await supabase.from('field_tasks').update(updates).eq('task_id', taskId)
    await fetchTasks()
  }

  const deleteTask = async (id) => {
    if (!isConnected()) {
      const saved = localStorage.getItem('app_field_tasks')
      let allTasks = saved ? JSON.parse(saved) : DEMO_TASKS
      allTasks = allTasks.filter(t => t.task_id !== id)
      localStorage.setItem('app_field_tasks', JSON.stringify(allTasks))
      setTasks(prev => prev.filter(t => t.task_id !== id))
      return
    }
    await supabase.from('field_tasks').delete().eq('task_id', id)
    await fetchTasks()
  }

  // Tự động đồng bộ toàn bộ lịch tác nghiệp theo chu kỳ của Lô từ ngày trồng
  const syncPlotLifecycleTasks = async (plotId, plotName, plantDate = today) => {
    const pid = String(plotId)
    const newLifecycleTasks = generatePlotLifecycleTasks(pid, plotName, plantDate)

    if (!isConnected()) {
      const saved = localStorage.getItem('app_field_tasks')
      let allTasks = saved ? JSON.parse(saved) : DEMO_TASKS
      // Giữ lại các task của lô khác hoặc các task thủ công/thu hoạch của lô này, chỉ thay thế các auto task theo chu kỳ
      const otherTasks = allTasks.filter(t => !(String(t.plot_id) === pid && (t.task_id?.startsWith(`plot_${pid}_d`) || t.stage_milestone)))
      const merged = [...newLifecycleTasks, ...otherTasks]
      localStorage.setItem('app_field_tasks', JSON.stringify(merged))
      setTasks(merged)
      return newLifecycleTasks
    }

    // Nếu có Supabase
    await supabase.from('field_tasks').delete().eq('plot_id', pid).like('task_id', `plot_${pid}_d%`)
    const { data } = await supabase.from('field_tasks').insert(newLifecycleTasks).select()
    await fetchTasks()
    return data || []
  }

  return {
    tasks, loading, fetchTasks, addTask, addProcessTasks,
    syncPlotLifecycleTasks, snoozeTask, toggleTask, deleteTask
  }
}

