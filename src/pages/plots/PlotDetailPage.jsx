import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlots, useCrops } from '../../hooks/usePlots'
import { useStageTasks, STAGES, STAGE_ICONS, STAGE_DEFINITIONS } from '../../hooks/useCultivationStages'
import { useInventory, useChemicalLogs } from '../../hooks/useInventory'
import { useTasks } from '../../hooks/useTasks'
import {
  ArrowLeft, Check, ChevronRight, ChevronLeft, MapPin, Leaf,
  RotateCcw, AlertTriangle, Package, Sprout, Plus, Minus,
  Calendar, Skull, Sparkles, TrendingUp, Info, Edit3, Warehouse,
  Layers, Trash2, Edit, X, Bell, Clock, CheckCircle, RefreshCw
} from 'lucide-react'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : ''
const today = new Date().toISOString().split('T')[0]

export default function PlotDetailPage() {
  const { plotId } = useParams()
  const navigate = useNavigate()
  const { plots, loading, updatePlot } = usePlots()
  const { crops, addCrop, updateCrop } = useCrops()
  const {
    tasks: allFieldTasks, addTask, syncPlotLifecycleTasks,
    snoozeTask, toggleTask: toggleFieldTask, deleteTask: deleteFieldTask
  } = useTasks()
  const { items, purchaseReceipts, recordPlantingUsage, addProductionLog, recordHarvestInput, fetchItems } = useInventory()
  const { isPlotLocked, getPlotLockDate } = useChemicalLogs()

  const [plotTaskFilter, setPlotTaskFilter] = useState('all')
  const [showAddPlotTaskModal, setShowAddPlotTaskModal] = useState(false)
  const [plotTaskForm, setPlotTaskForm] = useState({
    task_name: '', task_type: 'Tưới', execute_date: today, notes: ''
  })

  const seedlingItem = items.find(i => i.item_id === 'NL07' || i.item_name.includes('Cây giống')) || null
  const seedlingStock = seedlingItem ? (parseFloat(seedlingItem.qty_remaining) || 0) : 0

  const plot = plots.find(p => String(p.plot_id) === String(plotId))
  const plotCrops = crops.filter(c => String(c.plot_id) === String(plotId))
  const currentCrop = plotCrops[0] || null

  // Giai đoạn chính thức của Lô
  const plotStage = plot?.cultivation_stage || 'Làm đất'
  const plotStageIdx = STAGES.indexOf(plotStage)

  // Giai đoạn người dùng đang bấm vào để xem / sửa (cho phép lùi lại hoặc tiến tới tự do)
  const [activeStage, setActiveStage] = useState(plotStage)
  const activeStageIdx = STAGES.indexOf(activeStage)

  useEffect(() => {
    if (plot?.cultivation_stage) {
      setActiveStage(plot.cultivation_stage)
    }
  }, [plot?.cultivation_stage])

  const {
    tasks, allRequiredDone, doneCount, totalCount,
    initStageForPlot, toggleTask, resetCycle
  } = useStageTasks(plotId, activeStage)

  // Toast thông báo
  const [toastMsg, setToastMsg] = useState('')

  // ==========================================
  // ==========================================
  // STATE 1: CHỌN GIỐNG ĐA CƠ CẤU (Giai đoạn 2)
  // ==========================================
  const [seedBatches, setSeedBatches] = useState([])
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [editingBatchIndex, setEditingBatchIndex] = useState(null)
  const [batchForm, setBatchForm] = useState({
    receipt_id: '',
    plant_type: 'Nha đam Mỹ',
    plant_size: '25 – 30 cm (Cây giống lớn)',
    qty: 50,
    seed_source: '',
    seed_date: today,
    seed_notes: '',
    unit_cost: 0
  })

  const [selectedReceiptId, setSelectedReceiptId] = useState(currentCrop?.receipt_id || '')
  const [plantType, setPlantType] = useState(currentCrop?.plant_type || 'Nha đam Mỹ')
  const [plantSize, setPlantSize] = useState(currentCrop?.plant_size || '15–20 cm')
  const [seedCount, setSeedCount] = useState(currentCrop?.seed_count || 0)
  const [seedSource, setSeedSource] = useState(currentCrop?.seed_source || '')
  const [seedDate, setSeedDate] = useState(currentCrop?.seed_date || today) // Ngày mua hoặc ngày tách từ cây mẹ
  const [seedNotes, setSeedNotes] = useState(currentCrop?.seed_notes || '')

  // ==========================================
  // STATE 2: TRỒNG CÂY (Giai đoạn 3)
  // ==========================================
  const [plantDate, setPlantDate] = useState(currentCrop?.plant_date || today) // Ngày xuống giống thực tế
  const [actualPlantCount, setActualPlantCount] = useState(currentCrop?.plant_count || 0)
  const [density, setDensity] = useState(currentCrop?.density || '25cm x 30cm')
  const [plantingNotes, setPlantingNotes] = useState(currentCrop?.planting_notes || 'Bón lót phân trùn quế + tưới giữ ẩm nhẹ')

  // ==========================================
  // STATE 3: CHĂM SÓC & CÂY CHẾT (Giai đoạn 4)
  // ==========================================
  const [deadPlantCount, setDeadPlantCount] = useState(currentCrop?.dead_plant_count || 0)
  const [deadReason, setDeadReason] = useState(currentCrop?.dead_reason || '')

  // ==========================================
  // STATE 4: THU HOẠCH (Giai đoạn 5)
  // ==========================================
  const [harvestKg, setHarvestKg] = useState(20)
  const [harvestLeaves, setHarvestLeaves] = useState(40)
  const [harvestSeedlings, setHarvestSeedlings] = useState(0)
  const [harvestDate, setHarvestDate] = useState(today)

  // Cập nhật form state khi crop thay đổi
  useEffect(() => {
    if (currentCrop) {
      let batches = currentCrop.seed_batches || []
      if (batches.length === 0 && currentCrop.seed_count && parseInt(currentCrop.seed_count) > 0) {
        batches = [{
          id: 'b1',
          receipt_id: currentCrop.receipt_id || null,
          plant_type: currentCrop.plant_type || 'Nha đam Mỹ',
          plant_size: currentCrop.plant_size || '15–20 cm',
          qty: parseInt(currentCrop.seed_count || currentCrop.plant_count) || 0,
          seed_source: currentCrop.seed_source || '',
          seed_date: currentCrop.seed_date || currentCrop.plant_date || today,
          seed_notes: currentCrop.seed_notes || ''
        }]
      }
      setSeedBatches(batches)

      const totalSeeds = batches.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0)
      setSelectedReceiptId(currentCrop.receipt_id || '')
      setPlantType(currentCrop.plant_type || 'Nha đam Mỹ')
      setPlantSize(currentCrop.plant_size || '15–20 cm')
      setSeedCount(totalSeeds || currentCrop.seed_count || 0)
      setSeedSource(currentCrop.seed_source || '')
      setSeedDate(currentCrop.seed_date || currentCrop.plant_date || today)
      setSeedNotes(currentCrop.seed_notes || '')

      setPlantDate(currentCrop.plant_date || today)
      setActualPlantCount(currentCrop.plant_count || totalSeeds || 0)
      setDensity(currentCrop.density || '25cm x 30cm')
      setPlantingNotes(currentCrop.planting_notes || 'Bón lót phân trùn quế + tưới giữ ẩm nhẹ')

      setDeadPlantCount(currentCrop.dead_plant_count || 0)
      setDeadReason(currentCrop.dead_reason || '')
    }
  }, [currentCrop])

  // Danh sách chi tiết từng dòng quy cách cây giống có trong tất cả các phiếu nhập kho
  const availableSeedlingOptions = []
  ;(purchaseReceipts || []).forEach(r => {
    if (r.items_list && Array.isArray(r.items_list) && r.items_list.length > 0) {
      r.items_list.forEach((item, idx) => {
        const itemName = (item.variety || item.item_name || '').toLowerCase()
        const specName = (item.spec || item.row_notes || r.notes || '').toLowerCase()
        const unitName = (item.unit || r.unit || '').toLowerCase()
        
        // Loại trừ tuyệt đối các loại phân bón, men vi sinh, thuốc trừ sâu, dịch lỏng
        const isExcludedMaterial = 
          unitName === 'lít' || 
          unitName === 'lit' || 
          unitName === 'kg' || 
          unitName === 'chai' || 
          unitName === 'gói' || 
          unitName === 'bao' || 
          unitName === 'tấn' ||
          itemName.includes('men vi sinh') ||
          itemName.includes('cám men') ||
          itemName.includes('trừ sâu') ||
          itemName.includes('ge ') ||
          itemName.includes('alobana') ||
          itemName.includes('alonutri') ||
          itemName.includes('mật rỉ') ||
          itemName.includes('đạm cá') ||
          itemName.includes('trùn quế') ||
          (item.item_id && item.item_id.startsWith('VTQ_'))

        const isSeedling = !isExcludedMaterial && (
          item.item_id === 'NL07' ||
          unitName === 'cây' ||
          unitName === 'bầu' ||
          unitName === 'chậu' ||
          itemName.includes('cây giống') ||
          itemName.includes('cây con') ||
          itemName.includes('cây mẹ') ||
          specName.includes('size')
        )

        if (isSeedling) {
          const qty = parseFloat(item.total_received_qty || item.qty) || 0
          const spec = item.spec || item.row_notes || r.notes || 'Size tiêu chuẩn'
          const name = item.variety || item.item_name || r.item_name || 'Cây giống nha đam'
          const cost = parseFloat(item.unit_price) || parseFloat(r.effective_unit_cost) || 0

          // Tính số lượng đã được phân bổ vào các Lô
          const optKey = `${r.receipt_id}__${idx}`
          const usedInCrops = (crops || []).flatMap(c => c.seed_batches || []).filter(b => 
            b.selected_option_key === optKey || (b.receipt_id === r.receipt_id && b.plant_size === spec)
          ).reduce((s, b) => s + (parseInt(b.qty) || 0), 0)
          const remainingOfRow = Math.max(0, qty - usedInCrops)

          availableSeedlingOptions.push({
            optionKey: optKey,
            receipt_id: r.receipt_id,
            item_index: idx,
            date: r.date,
            supplier: r.supplier || 'Chưa ghi rõ',
            name: name,
            spec: spec,
            qty: qty,
            used: usedInCrops,
            remaining: remainingOfRow,
            cost: cost,
            label: `[${formatDate(r.date)}] Đợt ${r.receipt_id} · Dòng #${idx + 1}: ${name} (${spec}) · Nhập: ${qty} cây — Đã chọn: ${usedInCrops} cây — Còn sẵn sàng: ${remainingOfRow} cây`
          })
        }
      })
    } else {
      const recName = (r.item_name || '').toLowerCase()
      const unitName = (r.unit || '').toLowerCase()
      const isExcluded = 
        unitName === 'lít' || unitName === 'lit' || unitName === 'kg' || unitName === 'chai' || unitName === 'gói' || unitName === 'bao' || unitName === 'tấn' ||
        recName.includes('men vi sinh') || recName.includes('cám men') || recName.includes('ge ') || recName.includes('trừ sâu') || recName.includes('mật rỉ')

      const isSeedling = !isExcluded && (r.item_id === 'NL07' || unitName === 'cây' || recName.includes('cây giống'))
      if (isSeedling) {
        const qty = parseFloat(r.total_received_qty || r.qty) || 0
        const spec = r.notes || 'Size tiêu chuẩn'
        const name = r.item_name || 'Cây giống nha đam'
        const cost = parseFloat(r.effective_unit_cost || r.unit_price) || 0

        const optKey = `${r.receipt_id}__0`
        const usedInCrops = (crops || []).flatMap(c => c.seed_batches || []).filter(b => 
          b.selected_option_key === optKey || b.receipt_id === r.receipt_id
        ).reduce((s, b) => s + (parseInt(b.qty) || 0), 0)
        const remainingOfRow = Math.max(0, qty - usedInCrops)

        availableSeedlingOptions.push({
          optionKey: optKey,
          receipt_id: r.receipt_id,
          item_index: 0,
          date: r.date,
          supplier: r.supplier || 'Chưa ghi rõ',
          name: name,
          spec: spec,
          qty: qty,
          used: usedInCrops,
          remaining: remainingOfRow,
          cost: cost,
          label: `[${formatDate(r.date)}] Đợt ${r.receipt_id} — ${name} (${spec}) · Nhập: ${qty} cây — Đã chọn: ${usedInCrops} cây — Còn sẵn sàng: ${remainingOfRow} cây`
        })
      }
    }
  })

  // Tính tổng số cây giống trong Lô
  const totalPlotSeeds = seedBatches && seedBatches.length > 0
    ? seedBatches.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0)
    : (parseInt(seedCount) || 0)

  // Tồn kho cây giống chưa trồng (Tự động trừ số cây đã chuẩn bị cho Lô này)
  const availableRemainingStock = Math.max(0, seedlingStock - totalPlotSeeds)

  // Mở form thêm đợt giống mới (Tự động liên kết dòng cây giống đầu tiên trong kho nếu có)
  const handleOpenAddBatch = () => {
    setEditingBatchIndex(null)
    if (availableSeedlingOptions.length > 0) {
      const firstOpt = availableSeedlingOptions.find(o => o.remaining > 0) || availableSeedlingOptions[0]
      setBatchForm({
        selected_option_key: firstOpt.optionKey,
        receipt_id: firstOpt.receipt_id,
        plant_type: firstOpt.name,
        plant_size: firstOpt.spec,
        qty: firstOpt.remaining > 0 ? firstOpt.remaining : firstOpt.qty,
        seed_source: firstOpt.supplier,
        seed_date: firstOpt.date || today,
        seed_notes: `Đợt ${firstOpt.receipt_id} (${formatDate(firstOpt.date)}) - NCC: ${firstOpt.supplier} - Size: ${firstOpt.spec}`,
        unit_cost: firstOpt.cost
      })
    } else {
      setBatchForm({
        selected_option_key: '',
        receipt_id: '',
        plant_type: 'Cây giống nha đam',
        plant_size: '15 – 20 cm (Cây giống chuẩn)',
        qty: availableRemainingStock || 0,
        seed_source: '',
        seed_date: today,
        seed_notes: '',
        unit_cost: 0
      })
    }
    setShowBatchModal(true)
  }

  // Mở form sửa đợt giống
  const handleEditBatch = (index) => {
    const b = seedBatches[index]
    setEditingBatchIndex(index)
    setBatchForm({ ...b })
    setShowBatchModal(true)
  }

  // Xóa 1 đợt giống khỏi lô
  const handleDeleteBatch = async (index) => {
    if (!confirm('Bạn có chắc muốn xóa đợt cây giống này khỏi lô?')) return
    const updated = seedBatches.filter((_, i) => i !== index)
    setSeedBatches(updated)

    const newTotalSeeds = updated.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0)
    const combinedTypes = [...new Set(updated.map(b => b.plant_type).filter(Boolean))].join(' + ') || 'Nha đam Mỹ'
    const combinedSizes = [...new Set(updated.map(b => b.plant_size).filter(Boolean))].join(', ') || '15–20 cm'
    const combinedSources = [...new Set(updated.map(b => b.seed_source).filter(Boolean))].join(', ') || ''

    const cropData = {
      ...(currentCrop || {}),
      plot_id: plotId,
      seed_batches: updated,
      plant_type: combinedTypes,
      plant_size: combinedSizes,
      seed_count: newTotalSeeds,
      plant_count: newTotalSeeds,
      seed_source: combinedSources,
      stage: 'Kiến thiết cơ bản'
    }

    if (currentCrop) {
      await updateCrop(currentCrop.crop_id, cropData)
    }
    if (fetchItems) await fetchItems()
    setToastMsg(`🗑️ Đã xóa đợt giống. Tổng số cây trong lô hiện tại: ${newTotalSeeds} cây! (Đã tự động cập nhật kho)`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Lưu đợt giống (Thêm mới hoặc Cập nhật)
  const handleSaveBatchForm = async (e) => {
    e.preventDefault()
    let updated = [...seedBatches]
    const newEntry = {
      ...batchForm,
      id: batchForm.id || `b_${Date.now()}`,
      qty: parseInt(batchForm.qty) || 1
    }

    if (editingBatchIndex !== null) {
      updated[editingBatchIndex] = newEntry
    } else {
      updated.push(newEntry)
    }

    setSeedBatches(updated)
    setShowBatchModal(false)

    const newTotalSeeds = updated.reduce((sum, b) => sum + (parseInt(b.qty) || 0), 0)
    const combinedTypes = [...new Set(updated.map(b => b.plant_type).filter(Boolean))].join(' + ') || 'Nha đam Mỹ'
    const combinedSizes = [...new Set(updated.map(b => b.plant_size).filter(Boolean))].join(', ') || '15–20 cm'
    const combinedSources = [...new Set(updated.map(b => b.seed_source).filter(Boolean))].join(', ') || ''

    const cropData = {
      ...(currentCrop || {}),
      plot_id: plotId,
      seed_batches: updated,
      receipt_id: newEntry.receipt_id || currentCrop?.receipt_id || null,
      plant_type: combinedTypes,
      plant_size: combinedSizes,
      seed_count: newTotalSeeds,
      plant_count: newTotalSeeds,
      seed_source: combinedSources,
      stage: 'Kiến thiết cơ bản'
    }

    if (currentCrop) {
      await updateCrop(currentCrop.crop_id, cropData)
    } else {
      await addCrop(cropData)
    }

    if (fetchItems) await fetchItems()

    // Tự động tick các nhiệm vụ chọn giống
    tasks.forEach(t => {
      if (!t.isDone) toggleTask(t.id)
    })

    setToastMsg(`🌱 Đã lưu đợt giống: ${newEntry.qty} cây ${newEntry.plant_type} (${newEntry.plant_size}) từ ${newEntry.seed_source || 'Nguồn giống'} vào lô! (Tổng cả lô: ${newTotalSeeds} cây · Đã tự động đồng bộ kho)`)
    setTimeout(() => setToastMsg(''), 5000)
  }

  // Chọn từ đợt nhập hàng trong kho cho Form đợt giống
  const handleSelectReceiptForBatch = (e) => {
    const selectedKey = e.target.value
    if (!selectedKey) {
      setBatchForm(prev => ({ ...prev, receipt_id: '', selected_option_key: '' }))
      return
    }

    const matchedOption = availableSeedlingOptions.find(o => o.optionKey === selectedKey)
    if (matchedOption) {
      setBatchForm(prev => ({
        ...prev,
        selected_option_key: selectedKey,
        receipt_id: matchedOption.receipt_id,
        plant_type: matchedOption.name,
        plant_size: matchedOption.spec,
        qty: matchedOption.remaining > 0 ? matchedOption.remaining : matchedOption.qty,
        seed_source: matchedOption.supplier,
        seed_date: matchedOption.date || today,
        unit_cost: matchedOption.cost,
        seed_notes: `Đợt ${matchedOption.receipt_id} (${formatDate(matchedOption.date)}) - NCC: ${matchedOption.supplier} - Size: ${matchedOption.spec} (Còn sẵn sàng: ${matchedOption.remaining} cây)`
      }))
    }
  }

  // Chọn từ đợt nhập hàng trong kho -> Tự động điền nguồn gốc, ngày nhập, giá vốn
  const handleSelectReceipt = (e) => {
    const rId = e.target.value
    setSelectedReceiptId(rId)
    if (!rId) return

    const r = (purchaseReceipts || []).find(rec => rec.receipt_id === rId)
    if (r) {
      const seedlingRow = r.items_list?.find(i => i.item_id === 'NL07' || i.item_name?.toLowerCase().includes('giống'))
      const name = seedlingRow?.item_name || r.item_name || 'Nha đam Mỹ'
      const qty = seedlingRow ? (seedlingRow.total_received_qty || seedlingRow.qty) : (r.total_received_qty || r.qty || 100)
      const unitCost = r.effective_unit_cost || (seedlingRow ? seedlingRow.unit_price : 0)

      setPlantType(name)
      setSeedSource(r.supplier || 'Vườn giống')
      setSeedDate(r.date || today)
      setSeedCount(qty)

      const matchSize = (r.notes || seedlingRow?.notes || '').match(/(\d+[\s–-]+\d+\s*cm|\d+\s*cm)/i)
      if (matchSize) {
        setPlantSize(matchSize[0])
      }

      const noteDetails = `Đợt ${r.receipt_id} (Ngày ${formatDate(r.date)}) - NCC: ${r.supplier || 'Chưa rõ'} - Giá vốn: ${unitCost?.toLocaleString('vi-VN')} đ/${r.unit || 'cây'}${r.notes ? ` - ${r.notes}` : ''}`
      setSeedNotes(noteDetails)
    }
  }

  // Khởi tạo checklist khi vào tab giai đoạn
  useEffect(() => {
    if (plotId && activeStage) {
      initStageForPlot(plotId, activeStage)
    }
  }, [plotId, activeStage, initStageForPlot])

  // Tính số cây sống thực tế & tỷ lệ sống
  const initialPlantCountNum = parseInt(actualPlantCount) || 0
  const deadCountNum = parseInt(deadPlantCount) || 0
  const livingCount = Math.max(0, initialPlantCountNum - deadCountNum)
  const survivalRate = initialPlantCountNum > 0 ? Math.round((livingCount / initialPlantCountNum) * 100) : 100

  // Lịch sử thu hoạch của Lô này
  const plotHarvestTasks = (allFieldTasks || []).filter(
    t => String(t.plot_id) === String(plotId) && t.task_type === 'Thu hoạch'
  )
  const totalHarvestKg = plotHarvestTasks.reduce((sum, t) => sum + (parseFloat(t.harvest_qty_kg) || 0), 0)
  const totalHarvestLeaves = plotHarvestTasks.reduce((sum, t) => sum + (parseInt(t.harvest_leaves) || 0), 0)
  const totalHarvestSeedlings = plotHarvestTasks.reduce((sum, t) => sum + (parseInt(t.harvest_seedling_qty) || 0), 0)

  // Lấy danh sách việc tác nghiệp của Lô này
  const plotTasks = (allFieldTasks || [])
    .filter(t => String(t.plot_id) === String(plotId))
    .sort((a, b) => (a.execute_date || '').localeCompare(b.execute_date || ''))

  const filteredPlotTasks = plotTasks.filter(t => {
    if (plotTaskFilter === 'pending') return t.status !== 'Đã hoàn thành'
    if (plotTaskFilter === 'done') return t.status === 'Đã hoàn thành'
    return true
  })

  const plotPendingTasksCount = plotTasks.filter(t => t.status !== 'Đã hoàn thành').length
  const plotDoneTasksCount = plotTasks.filter(t => t.status === 'Đã hoàn thành').length

  // Tuổi cây đã trồng (ngày) & Ngày xuống giống hiệu lực
  const effectivePlantDate = plantDate || currentCrop?.plant_date || (plotTasks.length > 0 ? plotTasks[0]?.execute_date : null)
  const ageDays = effectivePlantDate ? Math.max(0, Math.floor((new Date() - new Date(effectivePlantDate)) / 86400000)) : 0

  // TỰ ĐỘNG KÍCH HOẠT LỊCH TÁC NGHIỆP 12 MỐC NGAY KHI VÀO XEM LÔ (NẾU ĐÃ CÓ NGÀY TRỒNG HOẶC ĐANG Ở GIAI ĐOẠN TRỒNG/CHĂM SÓC/THU HOẠCH)
  useEffect(() => {
    if (plot && (effectivePlantDate || ['Trồng cây', 'Chăm sóc', 'Thu hoạch'].includes(plotStage))) {
      const pDate = effectivePlantDate || plantDate || today
      const hasTasks = (allFieldTasks || []).some(t => String(t.plot_id) === String(plotId))
      if (!hasTasks && syncPlotLifecycleTasks) {
        syncPlotLifecycleTasks(plotId, plot.name, pDate)
      }
    }
  }, [plotId, plot, effectivePlantDate, plotStage, allFieldTasks, syncPlotLifecycleTasks])

  // ==========================================
  // XỬ LÝ 1: LƯU THÔNG TIN CHỌN GIỐNG (Giai đoạn 2)
  // ==========================================
  const handleSaveSeedSelection = async (e) => {
    e?.preventDefault()
    const cropData = {
      ...(currentCrop || {}),
      plot_id: plotId,
      receipt_id: selectedReceiptId || null,
      plant_type: plantType || 'Nha đam Mỹ',
      plant_size: plantSize || '15–20 cm',
      seed_count: parseInt(seedCount) || 0,
      seed_source: seedSource,
      seed_date: seedDate,
      seed_notes: seedNotes,
      stage: 'Kiến thiết cơ bản'
    }

    if (currentCrop) {
      await updateCrop(currentCrop.crop_id, cropData)
    } else {
      await addCrop(cropData)
    }

    // Tự động tick các nhiệm vụ chọn giống
    tasks.forEach(t => {
      if (!t.isDone) toggleTask(t.id)
    })

    const sourceTag = selectedReceiptId ? ` [Đợt ${selectedReceiptId}]` : ''
    setToastMsg(`🌱 Đã lưu thông tin Chọn giống${sourceTag}: ${seedCount} cây ${plantType} (${plantSize}), ngày lấy giống: ${formatDate(seedDate)}!`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // ==========================================
  // XỬ LÝ 2: LƯU THÔNG TIN TRỒNG CÂY (Giai đoạn 3) -> TỰ ĐỘNG TRỪ KHO CÂY GIỐNG & KÍCH HOẠT LỊCH TÁC NGHIỆP TỰ ĐỘNG
  // ==========================================
  const handleSavePlanting = async (e) => {
    e?.preventDefault()
    const plantNum = parseInt(actualPlantCount) || 0

    const cropData = {
      ...(currentCrop || {}),
      plot_id: plotId,
      plant_type: plantType || 'Nha đam Mỹ',
      plant_size: plantSize || '15–20 cm',
      plant_count: plantNum,
      plant_date: plantDate,
      density: density,
      planting_notes: plantingNotes,
      stage: 'Kiến thiết cơ bản'
    }

    if (currentCrop) {
      await updateCrop(currentCrop.crop_id, cropData)
    } else {
      await addCrop(cropData)
    }

    // TỰ ĐỘNG KÍCH HOẠT & ĐỒNG BỘ 12 MỐC LỊCH TÁC NGHIỆP TỰ ĐỘNG TỪ NGÀY XUỐNG GIỐNG
    if (syncPlotLifecycleTasks && plot) {
      await syncPlotLifecycleTasks(plotId, plot.name, plantDate)
    }

    if (fetchItems) await fetchItems()

    // Tự động tick các nhiệm vụ trồng cây
    tasks.forEach(t => {
      if (!t.isDone) toggleTask(t.id)
    })

    const remStock = Math.max(0, seedlingStock - plantNum)
    setToastMsg(`🌿 Đã lưu Xuống giống ${plantNum} cây cho ${plot.name}! (Đã tự động trừ kho giống & thiết lập Lịch tác nghiệp 12 mốc chăm sóc)`)
    setTimeout(() => setToastMsg(''), 5000)
  }

  // Khởi tạo / Làm mới lại toàn bộ lịch tác nghiệp theo ngày xuống giống
  const handleReSyncPlotSchedule = async () => {
    if (!plot) return
    const pDate = plantDate || currentCrop?.plant_date || today
    if (syncPlotLifecycleTasks) {
      await syncPlotLifecycleTasks(plotId, plot.name, pDate)
      setToastMsg(`⚡ Đã làm mới Lịch tác nghiệp 12 mốc chăm sóc cho ${plot.name} từ ngày ${formatDate(pDate)}!`)
      setTimeout(() => setToastMsg(''), 4000)
    }
  }

  // Thêm nhanh việc tác nghiệp riêng cho lô này
  const handleAddPlotCustomTask = async (e) => {
    e?.preventDefault()
    if (!plotTaskForm.task_name.trim()) return
    await addTask({
      plot_id: plotId,
      task_name: plotTaskForm.task_name,
      task_type: plotTaskForm.task_type || 'Tưới',
      execute_date: plotTaskForm.execute_date || today,
      notes: plotTaskForm.notes || '',
      status: 'Chờ làm',
      worker_id: 'Thuý'
    })
    setPlotTaskForm({ task_name: '', task_type: 'Tưới', execute_date: today, notes: '' })
    setShowAddPlotTaskModal(false)
    setToastMsg(`✅ Đã thêm việc mới cho ${plot.name}!`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // ==========================================
  // XỬ LÝ 3: LƯU THEO DÕI CÂY CHẾT (Giai đoạn 4)
  // ==========================================
  const handleSaveCareAndDead = async (e) => {
    e?.preventDefault()
    if (currentCrop) {
      await updateCrop(currentCrop.crop_id, {
        dead_plant_count: deadCountNum,
        dead_reason: deadReason,
        living_plant_count: livingCount
      })
    }

    setToastMsg(`💧 Đã cập nhật số liệu chăm sóc: còn ${livingCount} cây sống (${survivalRate}%)!`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // ==========================================
  // XỬ LÝ 4: GHI NHẬN THU HOẠCH (Giai đoạn 5)
  // ==========================================
  const handleSaveHarvest = async (e) => {
    e?.preventDefault()
    const kg = parseFloat(harvestKg) || 0
    const leaves = parseInt(harvestLeaves) || 0
    const seedlings = parseInt(harvestSeedlings) || 0

    if (kg <= 0 && seedlings <= 0) {
      alert('Vui lòng nhập số kg lá tươi hoặc số cây giống thu được!')
      return
    }

    // Ghi vào Lịch tác nghiệp -> tự động cộng kho bán hàng (useTasks)
    await addTask({
      plot_id: plotId,
      task_name: `Thu hoạch ${plot.name} (${kg > 0 ? `${kg}kg lá` : ''}${kg > 0 && seedlings > 0 ? ' + ' : ''}${seedlings > 0 ? `${seedlings} cây giống` : ''})`,
      task_type: 'Thu hoạch',
      execute_date: harvestDate,
      status: 'Đã hoàn thành',
      harvest_qty_kg: kg,
      harvest_leaves: leaves,
      harvest_seedling_qty: seedlings,
      notes: `Thu hoạch vụ ${plot.name} - ${plantType || 'Nha đam'}${selectedReceiptId ? ` (Giống đợt ${selectedReceiptId})` : ''}`
    })

    // Đồng bộ trực tiếp vào Bảng Tồn Kho Chính (recordHarvestInput)
    if (recordHarvestInput) {
      await recordHarvestInput(kg, seedlings, plot.name, harvestDate)
    }

    // Đồng bộ vào Sổ luân chuyển Kho (addProductionLog)
    if (addProductionLog) {
      await addProductionLog({
        date: harvestDate,
        material_code: 'TP_NHADAM_CAY',
        material_name: `Lô vườn: ${plot.name}`,
        purpose: `Thu hoạch ${plot.name}`,
        qty_out: leaves || 1,
        unit: 'bẹ',
        unit_cost: 0,
        target_code: 'TP_LA_TUOI',
        target_name: `Lá nha đam tươi (${kg} kg)${seedlings > 0 ? ` + ${seedlings} cây con` : ''}`,
        output_qty: kg,
        output_unit: 'kg'
      })
    }

    if (fetchItems) await fetchItems()

    // Tự động tick hoàn thành checklist Thu hoạch
    tasks.forEach(t => {
      if (!t.isDone) toggleTask(t.id)
    })

    let successMsg = '🎉 Đã ghi nhận thu hoạch: '
    if (kg > 0) successMsg += `${kg} kg lá tươi (${leaves} bẹ) `
    if (seedlings > 0) successMsg += `${kg > 0 ? '+ ' : ''}${seedlings} cây giống con `
    successMsg += '➔ Đã tự động cộng vào Kho Bán hàng & Sổ Nhật ký!'

    setToastMsg(successMsg)
    setTimeout(() => setToastMsg(''), 5000)
  }

  // ==========================================
  // CHUYỂN BƯỚC / ĐẶT LÀM GIAI ĐOẠN HIỆN TẠI CỦA LÔ
  // ==========================================
  const handleSetAsCurrentPlotStage = async (stage) => {
    if (stage === 'Thu hoạch' && isPlotLocked(plotId)) {
      const lockDate = getPlotLockDate(plotId)
      alert(`⚠️ Lô này đang bị khóa PHI tới ${formatDate(lockDate)}! Không thể thu hoạch cho tới khi hết thời gian cách ly.`)
      return
    }

    await updatePlot(plotId, { cultivation_stage: stage })
    if (['Trồng cây', 'Chăm sóc', 'Thu hoạch'].includes(stage) && syncPlotLifecycleTasks && plot) {
      const pDate = effectivePlantDate || plantDate || today
      await syncPlotLifecycleTasks(plotId, plot.name, pDate)
    }
    if (fetchItems) await fetchItems()
    setToastMsg(`📌 Đã cập nhật tiến trình chính của ${plot.name} sang: ${STAGE_ICONS[stage]} ${stage}`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const handleNextStage = async () => {
    if (activeStageIdx < STAGES.length - 1) {
      const next = STAGES[activeStageIdx + 1]
      setActiveStage(next)
      // Nếu đang ở giai đoạn chính thì đẩy tiến trình lô lên luôn
      if (activeStage === plotStage) {
        await updatePlot(plotId, { cultivation_stage: next })
        if (['Trồng cây', 'Chăm sóc', 'Thu hoạch'].includes(next) && syncPlotLifecycleTasks && plot) {
          const pDate = effectivePlantDate || plantDate || today
          await syncPlotLifecycleTasks(plotId, plot.name, pDate)
        }
      }
      if (fetchItems) await fetchItems()
    } else {
      // Đang ở bước cuối (Thu hoạch)
      if (confirm('🔄 Hoàn tất toàn bộ chu kỳ vụ mùa này và bắt đầu chu kỳ mới (quay về Làm đất)?')) {
        const newStage = resetCycle()
        setActiveStage('Làm đất')
        await updatePlot(plotId, { cultivation_stage: 'Làm đất' })
        if (fetchItems) await fetchItems()
        setToastMsg('🔄 Đã hoàn tất vụ mùa và bắt đầu vòng canh tác mới — Làm đất!')
        setTimeout(() => setToastMsg(''), 4000)
      }
    }
  }

  const handlePrevStage = () => {
    if (activeStageIdx > 0) {
      setActiveStage(STAGES[activeStageIdx - 1])
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  if (!plot) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={() => navigate('/plots')}>
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="empty-state" style={{ marginTop: 32 }}>
          <div className="empty-state-icon">❓</div>
          <h3>Không tìm thấy lô vườn</h3>
        </div>
      </div>
    )
  }

  const stageDef = STAGE_DEFINITIONS[activeStage]
  const isViewingCurrentPlotStage = activeStage === plotStage

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => navigate('/plots')}
          style={{ flexShrink: 0 }}
        >
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {plot.name}
            </h1>
            <span className="badge badge-success" style={{ fontSize: 11 }}>
              {STAGE_ICONS[plotStage]} Đang ở: {plotStage}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 }}>
            {plot.area_m2 && <span>📐 {plot.area_m2} m²</span>}
            {plot.soil_ph && <span>🧪 pH {plot.soil_ph}</span>}
            {plot.soil_type && <span>🪨 {plot.soil_type}</span>}
          </div>
        </div>
      </div>

      {/* PHI Warning */}
      {isPlotLocked(plotId) && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <AlertTriangle size={20} />
          <div>
            <strong>⚠️ Lô đang bị khóa PHI</strong> — Không được thu hoạch tới {formatDate(getPlotLockDate(plotId))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="alert alert-success fade-in" style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
          <Check size={20} />
          <div>{toastMsg}</div>
        </div>
      )}

      {/* ========== TỔNG QUAN ĐẦU VÀO - ĐẦU RA CỦA LÔ ========== */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: 10, marginBottom: 16
      }}>
        {/* Thẻ 1: Đầu vào Cây giống */}
        <div
          className="card"
          style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', cursor: 'pointer' }}
          onClick={() => setActiveStage('Chọn giống')}
        >
          <div style={{ fontSize: 11, color: 'var(--color-primary-800)', fontWeight: 700 }}>🌱 1. CHỌN GIỐNG</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary-800)', marginTop: 2 }}>
            {totalPlotSeeds > 0 ? `${totalPlotSeeds} cây giống` : 'Chưa chọn giống'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {seedBatches.length > 1 ? `${seedBatches.length} nguồn/size giống khác nhau` : (totalPlotSeeds > 0 ? `${plantType} (${plantSize})` : 'Bấm để chọn đợt giống')}
          </div>
        </div>

        {/* Thẻ 2: Xuống giống & Cây sống */}
        <div
          className="card"
          style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', cursor: 'pointer' }}
          onClick={() => setActiveStage('Trồng cây')}
        >
          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 700 }}>🌿 2. TRỒNG & SỐNG</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1e40af', marginTop: 2 }}>
            {initialPlantCountNum > 0 ? `${livingCount} cây sống ${deadCountNum > 0 ? `(-${deadCountNum})` : ''}` : 'Chưa xuống giống'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {initialPlantCountNum > 0 ? `Trồng: ${formatDate(plantDate)} · Sống ${survivalRate}%` : '0 cây'}
          </div>
        </div>

        {/* Thẻ 3: Đầu ra Thu hoạch */}
        <div
          className="card"
          style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', cursor: 'pointer' }}
          onClick={() => setActiveStage('Thu hoạch')}
        >
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700 }}>📦 3. THU HOẠCH</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#b45309', marginTop: 2 }}>
            {totalHarvestKg > 0 ? `${totalHarvestKg} kg lá` : '0 kg lá'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {totalHarvestLeaves > 0 ? `${totalHarvestLeaves} bẹ lá` : 'Chưa cắt lá'}
            {totalHarvestSeedlings > 0 ? ` · ${totalHarvestSeedlings} cây con` : ''}
          </div>
        </div>
      </div>

      {/* ========== THANH 5 GIAI ĐOẠN (BẤM VÀO ĐỂ CHUYỂN BƯỚC TỰ DO) ========== */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            👇 Bấm vào bất kỳ bước nào dưới đây để xem hoặc sửa lại:
          </div>
          {!isViewingCurrentPlotStage && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleSetAsCurrentPlotStage(activeStage)}
              style={{ fontSize: 11, padding: '3px 8px' }}
            >
              📌 Đặt lô ở giai đoạn này
            </button>
          )}
        </div>

        <div className="stage-pipeline">
          {STAGES.map((stage, idx) => {
            const isSelected = stage === activeStage
            const isActualPlotStage = stage === plotStage
            const isPassed = idx < plotStageIdx

            return (
              <div
                key={stage}
                className={`stage-step ${isPassed ? 'done' : ''} ${isSelected ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveStage(stage)}
              >
                <div className="stage-step-circle">
                  {isPassed ? <Check size={14} /> : <span>{STAGE_ICONS[stage]}</span>}
                </div>
                <div className="stage-step-label">{stage}</div>
                {isActualPlotStage && <div className="stage-step-badge">Đang ở đây</div>}
                {idx < STAGES.length - 1 && <div className="stage-step-connector" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GIAI ĐOẠN 2: CHỌN GIỐNG ĐA CƠ CẤU (NHIỀU KÍCH CỠ, NHIỀU NHÀ CUNG CẤP) */}
      {/* ========================================================================= */}
      {activeStage === 'Chọn giống' && (
        <div className="card" style={{ marginTop: 16, border: '2px solid var(--color-primary-light)' }}>
          <div className="card-header" style={{ background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sprout size={20} />
              Giai đoạn 2: Chọn giống & Quản lý Cơ cấu Giống trồng trong Lô
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAddBatch}
              style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} /> Thêm Kích cỡ / NCC khác vào Lô
            </button>
          </div>
          <div className="card-body">
            {/* Hiển thị tồn kho giống & Tổng số cây trong lô */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', border: '1px dashed var(--color-border)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Warehouse size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Tồn kho cây giống chưa trồng:</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: availableRemainingStock <= 5 ? 'var(--color-danger)' : 'var(--color-primary-800)' }}>
                  {availableRemainingStock} cây <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)' }}>(Tổng kho: {seedlingStock} cây)</span>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Layers size={16} />
                  <span>Tổng số cây giống chuẩn bị cho Lô:</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-primary-800)' }}>
                  {totalPlotSeeds} cây <span style={{ fontSize: 12, fontWeight: 500 }}>({seedBatches.length} đợt)</span>
                </div>
              </div>
            </div>

            {/* BẢNG DANH SÁCH CÁC ĐỢT / NHÓM GIỐNG TRONG LÔ */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-primary-900)' }}>
                  📋 Danh mục các nguồn & kích cỡ cây giống trồng trong Lô ({seedBatches.length} nhóm):
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  💡 Một lô có thể kết hợp trồng nhiều size và từ nhiều nguồn khác nhau
                </span>
              </div>

              {seedBatches && seedBatches.length > 0 ? (
                <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', fontSize: 12 }}>
                        <th style={{ width: 40, textAlign: 'center' }}>#</th>
                        <th>🌿 Loại giống & Kích cỡ (cm)</th>
                        <th style={{ width: 110, textAlign: 'right' }}>Số lượng</th>
                        <th>🏢 Nhà cung cấp / Nguồn gốc</th>
                        <th>📅 Ngày chọn / Giá vốn</th>
                        <th>📝 Vị trí luống / Ghi chú</th>
                        <th style={{ width: 90, textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seedBatches.map((b, idx) => (
                        <tr key={b.id || idx}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--color-primary-900)' }}>
                              🌱 {b.plant_type || 'Nha đam Mỹ'}
                            </div>
                            <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 600, marginTop: 2 }}>
                              📏 Size: {b.plant_size || 'Chưa định size'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary-800)' }}>
                              {b.qty || 0} cây
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                              ({totalPlotSeeds > 0 ? Math.round(((b.qty || 0) / totalPlotSeeds) * 100) : 0}%)
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {b.seed_source || 'Tự tách từ cây mẹ'}
                            </div>
                            {b.receipt_id && (
                              <span className="badge badge-primary" style={{ fontSize: 10, marginTop: 2, padding: '2px 6px' }}>
                                📦 Đợt {b.receipt_id}
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 12 }}>
                              {formatDate(b.seed_date)}
                            </div>
                            {b.unit_cost > 0 && (
                              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                Vốn: {b.unit_cost.toLocaleString('vi-VN')}đ/cây
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: b.seed_notes ? 'normal' : 'italic' }}>
                              {b.seed_notes || '—'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => handleEditBatch(idx)}
                                title="Chỉnh sửa đợt giống này"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => handleDeleteBatch(idx)}
                                style={{ color: '#ef4444' }}
                                title="Xóa đợt giống này"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f0fdf4', fontWeight: 800 }}>
                        <td colSpan={2} style={{ textAlign: 'right', color: 'var(--color-primary-900)' }}>
                          🌟 TỔNG CỘNG CẢ LÔ:
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--color-primary-900)', fontSize: 15 }}>
                          {totalPlotSeeds} cây
                        </td>
                        <td colSpan={4} style={{ fontSize: 12, color: 'var(--color-primary-800)', fontWeight: 600 }}>
                          Gồm {seedBatches.length} nguồn giống & kích cỡ khác nhau
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '24px 16px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', border: '1px dashed var(--color-border)' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌱</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>Chưa có thông tin đợt giống nào trong lô này</div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOpenAddBatch}
                    style={{ marginTop: 12, fontWeight: 700 }}
                  >
                    <Plus size={16} /> Thêm đợt giống đầu tiên
                  </button>
                </div>
              )}
            </div>

            {/* Nút thêm nhanh */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleOpenAddBatch}
                style={{ flex: 1, padding: '10px', fontWeight: 700, borderColor: 'var(--color-primary)', color: 'var(--color-primary-800)' }}
              >
                ➕ Thêm Kích cỡ / Nhà cung cấp khác vào Lô này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA ĐỢT GIỐNG TRONG LÔ */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sprout size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 className="modal-title">
                  {editingBatchIndex !== null ? '✏️ Chỉnh sửa Đợt giống trong Lô' : '🌱 Thêm Đợt giống / Kích cỡ / NCC vào Lô'}
                </h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowBatchModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBatchForm}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {/* 1. Chọn từ Đợt nhập kho */}
                <div className="form-group" style={{ marginBottom: 16, background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Package size={18} style={{ color: 'var(--color-primary)' }} />
                    <span>Chọn từ Phiếu nhập kho (Tự động điền NCC, Size, Ngày, Giá vốn):</span>
                  </label>
                  <select
                    className="form-input"
                    value={batchForm.selected_option_key || (batchForm.receipt_id ? `${batchForm.receipt_id}__0` : '')}
                    onChange={handleSelectReceiptForBatch}
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      background: batchForm.receipt_id ? '#f0fdf4' : '#fff',
                      borderColor: batchForm.receipt_id ? 'var(--color-primary)' : 'var(--color-border)'
                    }}
                  >
                    <option value="">✏️ Tự ghi tay / Tách từ cây mẹ trong vườn (Không qua phiếu nhập)</option>
                    {availableSeedlingOptions.map(opt => (
                      <option key={opt.optionKey} value={opt.optionKey}>
                        🌱 {opt.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: 12, color: batchForm.receipt_id ? 'var(--color-primary-800)' : 'var(--color-text-secondary)', marginTop: 4 }}>
                    {batchForm.receipt_id
                      ? `✅ Đang liên kết Đợt ${batchForm.receipt_id} (${batchForm.plant_size || 'Size giống'}): Đã tự động tải thông tin nhà cung cấp và giá vốn.`
                      : '💡 Bạn có thể chọn từng dòng kích cỡ trong phiếu nhập kho hoặc tự nhập tay phía dưới.'}
                  </div>
                </div>

                {/* 2. Loại giống & Kích cỡ */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label className="form-label">Loại Nha Đam <span className="form-required">*</span></label>
                    <input
                      className="form-input"
                      value={batchForm.plant_type || ''}
                      onChange={e => setBatchForm({ ...batchForm, plant_type: e.target.value })}
                      placeholder="VD: Nha đam Mỹ / Nha đam Thái..."
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label className="form-label">Kích cỡ cây giống (cm) <span className="form-required">*</span></label>
                    <input
                      className="form-input"
                      list="plot-seedling-sizes-modal"
                      value={batchForm.plant_size || ''}
                      onChange={e => setBatchForm({ ...batchForm, plant_size: e.target.value })}
                      placeholder="VD: 5–10 cm / 10–15 cm / 25–30 cm..."
                      required
                    />
                    <datalist id="plot-seedling-sizes-modal">
                      <option value="5 – 10 cm (Cây con mới tách)" />
                      <option value="10 – 15 cm (Cây con dưỡng bầu)" />
                      <option value="15 – 20 cm (Cây giống chuẩn)" />
                      <option value="20 – 25 cm (Cây giống phát triển)" />
                      <option value="25 – 30 cm (Cây giống lớn)" />
                      <option value="30 – 35 cm" />
                      <option value="35 – 40 cm" />
                      <option value="> 40 cm (Cây mẹ lấy giống)" />
                    </datalist>
                  </div>
                </div>

                {/* 3. Số lượng cây & Ngày chọn */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label className="form-label">Số lượng cây cho đợt này (cây) <span className="form-required">*</span></label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        onClick={() => setBatchForm({ ...batchForm, qty: Math.max(1, (parseInt(batchForm.qty) || 0) - 10) })}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        value={batchForm.qty}
                        onChange={e => setBatchForm({ ...batchForm, qty: e.target.value })}
                        style={{ textAlign: 'center', fontWeight: 800, fontSize: 16 }}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        onClick={() => setBatchForm({ ...batchForm, qty: (parseInt(batchForm.qty) || 0) + 10 })}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Ngày chọn / đặt mua <span className="form-required">*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={batchForm.seed_date || today}
                      onChange={e => setBatchForm({ ...batchForm, seed_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* 4. Nguồn gốc & Ghi chú */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label className="form-label">🏢 Nhà cung cấp / Nguồn gốc giống <span className="form-required">*</span></label>
                    <input
                      className="form-input"
                      list="plot-batch-supplier-list"
                      value={batchForm.seed_source || ''}
                      onChange={e => setBatchForm({ ...batchForm, seed_source: e.target.value })}
                      placeholder="VD: Bình Định - Huỳnh Nhiên / Ninh Thuận..."
                      required
                    />
                    <datalist id="plot-batch-supplier-list">
                      <option value="Bình Định - Huỳnh Nhiên" />
                      <option value="Vườn giống Ninh Thuận" />
                      <option value="Vương Trùn Quế (034.981.6802)" />
                      <option value="Tách từ cây mẹ Lô A" />
                      <option value="Tách từ cây mẹ Lô B" />
                      <option value="Tách từ cây mẹ Lô C" />
                    </datalist>
                  </div>

                  <div className="form-group" style={{ flex: 1.5 }}>
                    <label className="form-label">📝 Vị trí hàng luống / Ghi chú</label>
                    <input
                      className="form-input"
                      value={batchForm.seed_notes || ''}
                      onChange={e => setBatchForm({ ...batchForm, seed_notes: e.target.value })}
                      placeholder="VD: Trồng luống 1 đến 3, cây khỏe..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBatchModal(false)}>
                  Đóng
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, minWidth: 140 }}>
                  💾 {editingBatchIndex !== null ? 'Cập nhật đợt giống' : 'Lưu vào Lô'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GIAI ĐOẠN 3: TRỒNG CÂY (NGÀY XUỐNG GIỐNG THỰC TẾ, SỐ LƯỢNG THỰC TRỒNG) */}
      {/* ========================================================================= */}
      {activeStage === 'Trồng cây' && (
        <div className="card" style={{ marginTop: 16, border: '2px solid #3b82f6' }}>
          <div className="card-header" style={{ background: '#eff6ff' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={20} />
              Giai đoạn 3: Trồng cây (Ngày xuống giống thực tế & Số cây trồng)
            </div>
          </div>
          <div className="card-body">
            {/* Hiển thị cơ cấu giống đã chuẩn bị cho Lô */}
            {seedBatches && seedBatches.length > 0 ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span>🌱 Đã chuẩn bị {totalPlotSeeds} cây giống ({seedBatches.length} nhóm quy cách) cho Lô:</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActualPlantCount(totalPlotSeeds)}
                    style={{ fontSize: 11, padding: '2px 8px', background: '#ffffff' }}
                  >
                    ⚡ Điền tất cả {totalPlotSeeds} cây
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {seedBatches.map((b, idx) => (
                    <div key={b.id || idx} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', background: '#ffffff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                      <div>
                        <strong>#{idx + 1}. {b.plant_type}</strong> — <span style={{ color: 'var(--color-primary-800)', fontWeight: 600 }}>{b.plant_size}</span> {b.seed_source && `(${b.seed_source})`}
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--color-primary-800)' }}>
                        {b.qty} cây
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: 8, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#92400e' }}>
                  ⚠️ Lô này chưa chọn đợt giống ở Giai đoạn 2.
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveStage('Chọn giống')}
                  style={{ fontSize: 11 }}
                >
                  🌱 Đến Chọn giống
                </button>
              </div>
            )}

            <form onSubmit={handleSavePlanting}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ngày xuống giống thực tế <span className="form-required">*</span></label>
                  <input
                    className="form-input"
                    type="date"
                    value={plantDate}
                    onChange={e => setPlantDate(e.target.value)}
                    required
                  />
                  <span className="form-hint">Ngày chính thức trồng cây giống xuống luống đất</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Số lượng cây thực tế đã trồng (cây) <span className="form-required">*</span></label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setActualPlantCount(Math.max(1, parseInt(actualPlantCount || 0) - 10))}>
                      <Minus size={16} />
                    </button>
                    <input
                      className="form-input"
                      type="number"
                      value={actualPlantCount}
                      onChange={e => setActualPlantCount(e.target.value)}
                      style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#1e40af' }}
                      required
                    />
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setActualPlantCount(parseInt(actualPlantCount || 0) + 10)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mật độ trồng</label>
                  <input
                    className="form-input"
                    value={density}
                    onChange={e => setDensity(e.target.value)}
                    placeholder="25cm x 30cm"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bón lót & Phương pháp trồng</label>
                  <input
                    className="form-input"
                    value={plantingNotes}
                    onChange={e => setPlantingNotes(e.target.value)}
                    placeholder="VD: Bón lót phân trùn quế + tưới ẩm nhẹ"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontWeight: 700, background: '#2563eb' }}>
                🌿 Lưu thông tin Xuống giống thực tế
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GIAI ĐOẠN 4: CHĂM SÓC & THEO DÕI CÂY CHẾT (HAO HỤT)                   */}
      {/* ========================================================================= */}
      {activeStage === 'Chăm sóc' && (
        <div className="card" style={{ marginTop: 16, border: '2px solid #10b981' }}>
          <div className="card-header" style={{ background: '#ecfdf5' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} />
              Theo dõi Hao hụt & Số cây sống thực tế
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveCareAndDead}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                    Số cây bị chết / thối / hao hụt (cây)
                  </label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setDeadPlantCount(Math.max(0, parseInt(deadPlantCount || 0) - 1))}>
                      <Minus size={16} />
                    </button>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      max={actualPlantCount}
                      value={deadPlantCount}
                      onChange={e => setDeadPlantCount(e.target.value)}
                      style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: 'var(--color-danger)' }}
                    />
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setDeadPlantCount(parseInt(deadPlantCount || 0) + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lý do cây chết</label>
                  <input
                    className="form-input"
                    value={deadReason}
                    onChange={e => setDeadReason(e.target.value)}
                    placeholder="VD: Nắng gắt héo rễ non / úng nước / sùng cắn gốc..."
                  />
                </div>
              </div>

              <div style={{
                background: '#f0fdf4', padding: '10px 14px', borderRadius: 8,
                marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Số cây trồng ban đầu: <strong>{initialPlantCountNum}</strong></span>
                  {deadCountNum > 0 && <span style={{ color: 'var(--color-danger)', fontSize: 13 }}> · Chết: <strong>{deadCountNum}</strong></span>}
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46' }}>
                  📊 Còn sống: {livingCount} cây ({survivalRate}%)
                </div>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '10px', fontWeight: 700 }}>
                💾 Cập nhật số liệu hao hụt cây
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GIAI ĐOẠN 5: THU HOẠCH (LÁ TƯƠI KG & CÂY GIỐNG CON TÁCH GỐC)          */}
      {/* ========================================================================= */}
      {activeStage === 'Thu hoạch' && (
        <div className="card" style={{ marginTop: 16, border: '2px solid #f59e0b' }}>
          <div className="card-header" style={{ background: '#fef3c7' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#b45309', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={20} />
              Ghi nhận Thu hoạch (Lá tươi kg & Cây giống con tách gốc)
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveHarvest}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">1. Sản lượng lá tươi (kg) <span className="form-required">*</span></label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setHarvestKg(Math.max(0, parseFloat(harvestKg || 0) - 5))}>
                      <Minus size={16} />
                    </button>
                    <input
                      className="form-input"
                      type="number"
                      step="0.5"
                      value={harvestKg}
                      onChange={e => setHarvestKg(e.target.value)}
                      style={{ textAlign: 'center', fontWeight: 800, fontSize: 18, color: '#b45309' }}
                    />
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setHarvestKg(parseFloat(harvestKg || 0) + 5)}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Số bẹ lá đã cắt (bẹ/lá)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={harvestLeaves}
                    onChange={e => setHarvestLeaves(e.target.value)}
                    placeholder="VD: 40"
                  />
                  <span className="form-hint">Chuẩn VietGAP: cắt 1–2 bẹ lá già sát gốc/cây</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">2. Thu gom / Tách cây giống con (cây)</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setHarvestSeedlings(Math.max(0, parseInt(harvestSeedlings || 0) - 5))}>
                      <Minus size={16} />
                    </button>
                    <input
                      className="form-input"
                      type="number"
                      value={harvestSeedlings}
                      onChange={e => setHarvestSeedlings(e.target.value)}
                      placeholder="0"
                      style={{ textAlign: 'center', fontWeight: 800, fontSize: 16, color: 'var(--color-primary-800)' }}
                    />
                    <button type="button" className="btn btn-secondary btn-icon" onClick={() => setHarvestSeedlings(parseInt(harvestSeedlings || 0) + 5)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="form-hint">Tách cây con từ gốc mẹ để bán hoặc nhân luống mới</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày thu hoạch / tách giống</label>
                  <input
                    className="form-input"
                    type="date"
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 800, background: '#16a34a' }}
              >
                📦 Xác nhận Thu hoạch (Tự động cộng vào Kho Bán hàng & Sổ Nhật ký)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 LỊCH TÁC NGHIỆP & NHẮC VIỆC TỰ ĐỘNG CỦA LÔ (THEO NGÀY XUỐNG GIỐNG)     */}
      {/* ========================================================================= */}
      <div className="card" style={{ marginTop: 20, border: '2px solid #86efac', background: '#ffffff', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.06)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={22} color="#16a34a" />
              <span>Lịch Tác Nghiệp & Nhắc Việc Tự Động Của {plot.name}</span>
            </div>
            <div style={{ fontSize: 13, color: '#15803d', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {effectivePlantDate ? (
                <>
                  <span>🌱 Ngày xuống giống: <strong>{formatDate(effectivePlantDate)}</strong></span>
                  <span>⏳ Tuổi cây: <strong>{ageDays} ngày</strong></span>
                </>
              ) : (
                <span>⚠️ Chưa có ngày xuống giống chính thức</span>
              )}
              <span>🎯 Tiến độ: <strong>{plotDoneTasksCount}/{plotTasks.length} việc hoàn thành</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReSyncPlotSchedule}
              style={{ background: '#ffffff', borderColor: '#86efac', color: '#166534', fontSize: 12 }}
              title="Lập mới lại lộ trình 12 mốc theo ngày trồng"
            >
              <RefreshCw size={14} /> ⚡ Đồng bộ lại lịch
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddPlotTaskModal(true)}
              style={{ background: '#16a34a', borderColor: '#16a34a', fontSize: 12 }}
            >
              <Plus size={14} /> + Thêm việc cho lô
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Filter tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className={`btn btn-sm ${plotTaskFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPlotTaskFilter('all')}
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Tất cả ({plotTasks.length})
              </button>
              <button
                className={`btn btn-sm ${plotTaskFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPlotTaskFilter('pending')}
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Chờ làm ({plotPendingTasksCount})
              </button>
              <button
                className={`btn btn-sm ${plotTaskFilter === 'done' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPlotTaskFilter('done')}
                style={{ fontSize: 12, padding: '4px 10px' }}
              >
                Đã xong ({plotDoneTasksCount})
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              🔔 Tự động nhắc việc theo đúng chu kỳ sinh trưởng của Nha Đam Mỹ
            </div>
          </div>

          {plotTasks.length === 0 ? (
            <div style={{ padding: '24px 16px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>📅</div>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 15 }}>Chưa có chuỗi lịch tác nghiệp tự động cho {plot.name}</div>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 460, margin: '6px auto 14px' }}>
                Kích hoạt ngay để hệ thống tự động tính toán 12 mốc chăm sóc chuẩn kỹ thuật (Tưới nhử rễ, bón phân trùn quế, tỉa lá, xịt tỏi ớt...) từ ngày xuống giống!
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleReSyncPlotSchedule}
                style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
              >
                <Sparkles size={16} /> ⚡ Kích hoạt Lịch Tác Nghiệp Tự Động (12 Mốc)
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredPlotTasks.map(task => {
                const isDone = task.status === 'Đã hoàn thành'
                const isToday = task.execute_date === today
                const isOverdue = !isDone && task.execute_date < today
                const daysDiff = task.execute_date ? Math.floor((new Date(task.execute_date) - new Date(today)) / 86400000) : 0

                return (
                  <div
                    key={task.task_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isDone ? '#f8fafc' : isToday ? '#f0fdf4' : isOverdue ? '#fef2f2' : '#ffffff',
                      border: isDone ? '1px solid #e2e8f0' : isToday ? '1.5px solid #86efac' : isOverdue ? '1.5px solid #fca5a5' : '1px solid #cbd5e1',
                      borderRadius: 10,
                      padding: '12px 14px',
                      gap: 12,
                      flexWrap: 'wrap',
                      opacity: isDone ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 260 }}>
                      <div
                        onClick={() => toggleFieldTask(task.task_id)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: isDone ? 'none' : '2px solid #94a3b8',
                          background: isDone ? '#16a34a' : '#ffffff',
                          color: '#ffffff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0, marginTop: 2
                        }}
                      >
                        {isDone && <Check size={14} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          {task.stage_milestone && (
                            <span style={{
                              background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 700,
                              padding: '2px 8px', borderRadius: 12
                            }}>
                              {task.stage_milestone}
                            </span>
                          )}
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: isDone ? '#64748b' : isOverdue ? '#dc2626' : isToday ? '#16a34a' : '#475569'
                          }}>
                            📅 {task.execute_date} {isDone ? '(Đã xong)' : isToday ? '🔔 (Hôm nay)' : isOverdue ? `⚠️ (Quá hạn ${Math.abs(daysDiff)} ngày)` : `⏳ (Còn ${daysDiff} ngày)`}
                          </span>
                        </div>

                        <div style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: isDone ? '#64748b' : '#1e293b',
                          textDecoration: isDone ? 'line-through' : 'none',
                          marginTop: 4
                        }}>
                          {task.task_name}
                        </div>

                        {task.notes && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                            💡 {task.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${isDone ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => toggleFieldTask(task.task_id)}
                        style={{
                          fontSize: 12, padding: '5px 12px',
                          background: isDone ? '#f1f5f9' : '#16a34a',
                          borderColor: isDone ? '#cbd5e1' : '#16a34a',
                          color: isDone ? '#475569' : '#ffffff'
                        }}
                      >
                        {isDone ? '↩️ Đánh dấu lại' : '✅ Đã làm'}
                      </button>

                      {!isDone && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => snoozeTask(task.task_id, 1)}
                          style={{ fontSize: 12, padding: '5px 8px' }}
                          title="Hoãn lại 1 ngày"
                        >
                          <Clock size={13} /> +1 ngày
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => { if(confirm('Xóa công việc này khỏi lô?')) deleteFieldTask(task.task_id) }}
                        title="Xóa việc"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHECKLIST GIAI ĐOẠN ĐANG CHỌN                                             */}
      {/* ========================================================================= */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>{STAGE_ICONS[activeStage]}</span>
              {activeStage}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {stageDef?.description}
            </div>
          </div>
          <span className="badge badge-info">{doneCount}/{totalCount}</span>
        </div>

        <div className="card-body">
          {/* Progress bar */}
          {totalCount > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 6, background: 'var(--color-border-light)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, transition: 'width 0.4s ease',
                  width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                  background: doneCount === totalCount ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))'
                }} />
              </div>
            </div>
          )}

          {/* Task items */}
          <div className="task-list">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`task-card ${task.isDone ? 'completed' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="task-check">
                  {task.isDone && <Check size={16} />}
                </div>
                <div className="task-info">
                  <div className="task-name">{task.taskName}</div>
                  <div className="task-meta">
                    {task.required && <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>Bắt buộc</span>}
                    {!task.required && <span>Tùy chọn</span>}
                    {task.isDone && task.completedAt && (
                      <span> · ✅ {new Date(task.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nút Điều hướng Lùi / Tiến giữa các bước */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {activeStageIdx > 0 && (
              <button
                className="btn btn-secondary"
                onClick={handlePrevStage}
                style={{ flex: 1, padding: '12px', fontWeight: 700 }}
              >
                <ChevronLeft size={18} /> Quay lại: {STAGES[activeStageIdx - 1]}
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={handleNextStage}
              style={{ flex: 1.5, padding: '12px', fontWeight: 700 }}
            >
              {activeStageIdx < STAGES.length - 1 ? (
                <>Tiếp theo: {STAGE_ICONS[STAGES[activeStageIdx + 1]]} {STAGES[activeStageIdx + 1]} <ChevronRight size={18} /></>
              ) : (
                <>🔄 Hoàn thành vòng vụ & Bắt đầu vụ mới</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* === MODAL THÊM VIỆC TÙY CHỈNH CHO LÔ === */}
      {showAddPlotTaskModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlotTaskModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>+ Thêm việc tác nghiệp cho {plot.name}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddPlotTaskModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPlotCustomTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên công việc <span className="form-required">*</span></label>
                  <input
                    className="form-input"
                    value={plotTaskForm.task_name}
                    onChange={e => setPlotTaskForm({ ...plotTaskForm, task_name: e.target.value })}
                    placeholder="VD: Tưới bổ sung đạm cá / Dọn cỏ rãnh..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Loại công việc</label>
                    <select
                      className="form-select"
                      value={plotTaskForm.task_type}
                      onChange={e => setPlotTaskForm({ ...plotTaskForm, task_type: e.target.value })}
                    >
                      <option value="Tưới">💧 Tưới</option>
                      <option value="Bón phân">🌱 Bón phân</option>
                      <option value="Làm cỏ">🌿 Làm cỏ</option>
                      <option value="Tỉa lá">✂️ Tỉa lá</option>
                      <option value="Xịt thuốc">🐛 Xịt thuốc</option>
                      <option value="Khác">📋 Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày thực hiện</label>
                    <input
                      className="form-input"
                      type="date"
                      value={plotTaskForm.execute_date}
                      onChange={e => setPlotTaskForm({ ...plotTaskForm, execute_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú & Hướng dẫn</label>
                  <textarea
                    className="form-textarea"
                    value={plotTaskForm.notes}
                    onChange={e => setPlotTaskForm({ ...plotTaskForm, notes: e.target.value })}
                    rows={2}
                    placeholder="Ghi chú chi tiết cách thực hiện..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPlotTaskModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm việc vào lô</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== LỊCH SỬ THU HOẠCH CỦA LÔ ========== */}
      {plotHarvestTasks.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} style={{ color: '#b45309' }} />
              Lịch sử các đợt thu hoạch ({plotHarvestTasks.length} đợt · Tổng {totalHarvestKg} kg lá, {totalHarvestSeedlings} cây giống)
            </div>
          </div>
          <div className="card-body">
            {plotHarvestTasks.map(t => (
              <div key={t.task_id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--color-border-light)'
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {parseFloat(t.harvest_qty_kg) > 0 ? `${t.harvest_qty_kg} kg lá tươi ` : ''}
                    {t.harvest_leaves ? `(${t.harvest_leaves} bẹ) ` : ''}
                    {parseInt(t.harvest_seedling_qty) > 0 ? `+ ${t.harvest_seedling_qty} cây giống con` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {formatDate(t.execute_date)} · Người cắt: {t.worker_id || 'Thuý'}
                  </div>
                </div>
                <span className="badge badge-success">Đã nhập kho bán</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
