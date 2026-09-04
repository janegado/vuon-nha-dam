import { useState, useEffect, useCallback } from 'react'

// ============================================================
// 5 giai đoạn canh tác — checklist chuẩn theo framework
// Tách biệt rõ: Chọn giống (ngày mua/tách) vs Trồng cây (ngày xuống giống)
// ============================================================

export const STAGES = ['Làm đất', 'Chọn giống', 'Trồng cây', 'Chăm sóc', 'Thu hoạch']

export const STAGE_ICONS = {
  'Làm đất': '🪨',
  'Chọn giống': '🌱',
  'Trồng cây': '🌿',
  'Chăm sóc': '💧',
  'Thu hoạch': '📦'
}

export const STAGE_DEFINITIONS = {
  'Làm đất': {
    description: 'Chuẩn bị đất trước khi trồng vụ mới',
    tasks: [
      { name: 'Cày phơi ải & làm tơi xốp đất', required: true },
      { name: 'Bón vôi khử trùng & xử lý nấm đất', required: true },
      { name: 'Kiểm tra pH đất & làm rãnh thoát nước', required: true },
    ]
  },
  'Chọn giống': {
    description: 'Xác định loại giống, kích cỡ cm, ngày đặt mua hoặc ngày tách từ cây mẹ',
    tasks: [
      { name: 'Ghi loại nha đam, kích cỡ cm & nguồn gốc giống', required: true },
      { name: 'Ghi ngày đặt mua hoặc ngày tách từ cây mẹ', required: true },
      { name: 'Xác nhận số lượng cây giống & để râm mát cho khô vết cắt', required: true },
    ]
  },
  'Trồng cây': {
    description: 'Xuống giống thực tế vào luống, bón lót và tưới ẩm',
    tasks: [
      { name: 'Ghi ngày xuống giống thực tế & số lượng cây đã trồng', required: true },
      { name: 'Xuống giống theo mật độ (25cm x 30cm)', required: true },
      { name: 'Bón lót phân trùn quế / vi sinh & tưới giữ ẩm nhẹ', required: false },
    ]
  },
  'Chăm sóc': {
    description: 'Tưới, làm cỏ, tỉa lá, bón phân & theo dõi hao hụt cây chết',
    tasks: [
      { name: 'Tưới nhỏ giọt (2–3 lần/tuần tùy độ ẩm đất)', required: false },
      { name: 'Làm cỏ (định kỳ / khi có cỏ)', required: false },
      { name: 'Tỉa lá chân & lá già sát gốc', required: false },
      { name: 'Bón phân vi sinh / tưới GE định kỳ', required: false },
      { name: 'Ghi nhận cây chết & lý do hao hụt (nếu có)', required: false },
      { name: 'Phun BVTV sinh học khi có sâu bệnh', required: false },
    ]
  },
  'Thu hoạch': {
    description: 'Kiểm tra an toàn PHI, thu hoạch lá tươi (kg) & tách cây giống con',
    tasks: [
      { name: 'Kiểm tra đủ ngày cách ly PHI', required: true },
      { name: 'Thu hoạch lá tươi (1–2 bẹ lá già sát gốc/cây)', required: true },
      { name: 'Ghi sản lượng lá tươi (kg) & số cây giống con tách ra', required: true },
    ]
  }
}

const STORAGE_KEY = 'app_stage_tasks_v2'

function loadStageTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveStageTasks(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Tạo danh sách việc mặc định cho 1 giai đoạn của 1 lô
 */
function createDefaultTasks(plotId, stage) {
  const def = STAGE_DEFINITIONS[stage]
  if (!def) return []
  return def.tasks.map((t, idx) => ({
    id: `${plotId}_${stage}_${idx}`,
    plotId,
    stage,
    taskName: t.name,
    required: t.required,
    isDone: false,
    completedAt: null
  }))
}

/**
 * Hook quản lý checklist giai đoạn canh tác cho từng lô
 * Hỗ trợ lưu độc lập từng giai đoạn, cho phép bấm lùi/tiến tự do mà không mất dữ liệu!
 */
export function useStageTasks(plotId, activeStage) {
  const [allData, setAllData] = useState(loadStageTasks)
  const currentStageKey = `${plotId}_${activeStage}`
  const tasks = allData[currentStageKey] || []

  const setTasksForStage = useCallback((plotId, stage, newTasks) => {
    setAllData(prev => {
      const key = `${plotId}_${stage}`
      const updated = { ...prev, [key]: newTasks }
      saveStageTasks(updated)
      return updated
    })
  }, [])

  /**
   * Khởi tạo checklist cho 1 giai đoạn nếu chưa có
   */
  const initStageForPlot = useCallback((plotId, stage) => {
    const key = `${plotId}_${stage}`
    const existing = allData[key]
    if (existing && existing.length > 0) {
      return // Đã có checklist cho giai đoạn này
    }
    const newTasks = createDefaultTasks(plotId, stage)
    setTasksForStage(plotId, stage, newTasks)
  }, [allData, setTasksForStage])

  /**
   * Tick / Untick 1 việc
   */
  const toggleTask = useCallback((taskId) => {
    setAllData(prev => {
      const key = `${plotId}_${activeStage}`
      const plotTasks = (prev[key] || []).map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            isDone: !t.isDone,
            completedAt: !t.isDone ? new Date().toISOString() : null
          }
        }
        return t
      })
      const updated = { ...prev, [key]: plotTasks }
      saveStageTasks(updated)
      return updated
    })
  }, [plotId, activeStage])

  /**
   * Kiểm tra đã hoàn thành hết việc bắt buộc chưa
   */
  const allRequiredDone = tasks.length > 0 && tasks.filter(t => t.required).every(t => t.isDone)

  /**
   * Tổng tiến độ
   */
  const doneCount = tasks.filter(t => t.isDone).length
  const totalCount = tasks.length

  /**
   * Reset lại toàn bộ vòng canh tác
   */
  const resetCycle = useCallback(() => {
    STAGES.forEach(stage => {
      const newTasks = createDefaultTasks(plotId, stage)
      setTasksForStage(plotId, stage, newTasks)
    })
    return 'Làm đất'
  }, [plotId, setTasksForStage])

  return {
    tasks,
    allRequiredDone,
    doneCount,
    totalCount,
    initStageForPlot,
    toggleTask,
    resetCycle
  }
}
