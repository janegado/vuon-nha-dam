import { useState, useEffect, useCallback } from 'react'
import { supabase, isConnected } from '../lib/supabase'

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// ====== Danh mục 3 Lô vườn chuẩn ban đầu ======
export const DEMO_PLOTS = [
  { plot_id: '11111111-1111-4111-8111-111111111111', name: 'Lô A - Phía Đông', area_m2: 30, soil_ph: 6.5, soil_type: 'Thịt nhẹ', status: 'Chuẩn bị', area_coord_code: 'A1', cultivation_stage: 'Làm đất' },
  { plot_id: '22222222-2222-4222-8222-222222222222', name: 'Lô B - Trung tâm', area_m2: 40, soil_ph: 6.8, soil_type: 'Thịt pha cát', status: 'Chuẩn bị', area_coord_code: 'B1', cultivation_stage: 'Làm đất' },
  { plot_id: '33333333-3333-4333-8333-333333333333', name: 'Lô C - Phía Tây', area_m2: 30, soil_ph: 6.3, soil_type: 'Thịt nhẹ', status: 'Chuẩn bị', area_coord_code: 'C1', cultivation_stage: 'Làm đất' },
]

export const DEMO_CROPS = []

export function usePlots() {
  const [plots, setPlots] = useState(DEMO_PLOTS)
  const [loading, setLoading] = useState(true)

  const fetchPlots = useCallback(async () => {
    setLoading(true)
    const saved = localStorage.getItem('app_plots_data')
    let localPlots = null
    try {
      const parsed = saved ? JSON.parse(saved) : null
      if (Array.isArray(parsed) && parsed.length > 0) localPlots = parsed
    } catch (e) {}

    const initialPlots = localPlots || DEMO_PLOTS

    if (!isConnected()) {
      setPlots(initialPlots)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from('plots').select('*').order('name', { ascending: true })
      if (!error && data && data.length > 0) {
        setPlots(data)
        localStorage.setItem('app_plots_data', JSON.stringify(data))
      } else {
        // Nếu Cloud chưa có lô nào -> Luôn hiển thị 3 Lô mặc định và lưu lên Cloud
        setPlots(initialPlots)
        localStorage.setItem('app_plots_data', JSON.stringify(initialPlots))
        
        const payload = initialPlots.map(p => ({
          plot_id: p.plot_id && p.plot_id.length > 10 ? p.plot_id : generateUUID(),
          name: p.name || 'Lô vườn',
          area_m2: parseFloat(p.area_m2) || 30,
          soil_ph: parseFloat(p.soil_ph) || 6.5,
          soil_type: p.soil_type || 'Thịt nhẹ',
          status: p.status || 'Chuẩn bị',
          cultivation_stage: p.cultivation_stage || 'Làm đất',
          area_coord_code: p.area_coord_code || 'A1'
        }))
        
        supabase.from('plots').insert(payload).catch(console.error)
      }
    } catch (e) {
      setPlots(initialPlots)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPlots() }, [fetchPlots])

  const addPlot = async (plot) => {
    const newPlot = {
      ...plot,
      plot_id: plot.plot_id || generateUUID(),
      created_at: new Date().toISOString()
    }

    if (!isConnected()) {
      setPlots(prev => {
        const updated = [...prev, newPlot]
        localStorage.setItem('app_plots_data', JSON.stringify(updated))
        return updated
      })
      return newPlot
    }

    const { data, error } = await supabase.from('plots').insert(newPlot).select().single()
    if (!error) {
      await fetchPlots()
      return data
    } else {
      // Fallback
      setPlots(prev => {
        const updated = [...prev, newPlot]
        localStorage.setItem('app_plots_data', JSON.stringify(updated))
        return updated
      })
      return newPlot
    }
  }

  const updatePlot = async (id, updates) => {
    if (!isConnected()) {
      setPlots(prev => {
        const updated = prev.map(p => String(p.plot_id) === String(id) ? { ...p, ...updates } : p)
        localStorage.setItem('app_plots_data', JSON.stringify(updated))
        return updated
      })
      return
    }
    await supabase.from('plots').update(updates).eq('plot_id', id)
    await fetchPlots()
  }

  const deletePlot = async (id) => {
    if (!isConnected()) {
      setPlots(prev => {
        const updated = prev.filter(p => String(p.plot_id) !== String(id))
        localStorage.setItem('app_plots_data', JSON.stringify(updated))
        return updated
      })
      return
    }
    await supabase.from('plots').delete().eq('plot_id', id)
    await fetchPlots()
  }

  return { plots, loading, fetchPlots, addPlot, updatePlot, deletePlot }
}

export function useCrops(plotId = null) {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCrops = useCallback(async () => {
    setLoading(true)
    const saved = localStorage.getItem('app_crops_data')
    const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
    const localFiltered = plotId ? allCrops.filter(c => String(c.plot_id) === String(plotId)) : allCrops

    if (!isConnected()) {
      setCrops(localFiltered)
      setLoading(false)
      return
    }

    try {
      let query = supabase.from('crops').select('*').order('created_at', { ascending: false })
      if (plotId) query = query.eq('plot_id', plotId)
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        const enriched = data.map(c => ({
          ...c,
          ...(c.data || {}),
          crop_id: c.crop_id,
          plot_id: c.plot_id,
          plant_type: c.plant_type || c.data?.plant_type || 'Nha đam Mỹ',
          plant_date: c.plant_date || c.data?.plant_date,
          plant_count: c.plant_count ?? c.data?.plant_count ?? c.data?.total_plants ?? 0,
          seed_count: c.seed_count ?? c.data?.seed_count ?? c.plant_count ?? 0,
          seed_batches: c.seed_batches || c.data?.seed_batches || [],
          plant_size: c.plant_size || c.data?.plant_size || '20–25 cm'
        }))
        setCrops(enriched)
        localStorage.setItem('app_crops_data', JSON.stringify(enriched))
      } else {
        setCrops(localFiltered)
      }
    } catch (e) {
      setCrops(localFiltered)
    }
    setLoading(false)
  }, [plotId])

  useEffect(() => { fetchCrops() }, [fetchCrops])

  const addCrop = async (crop) => {
    const newCrop = {
      ...crop,
      crop_id: crop.crop_id || generateUUID(),
      created_at: new Date().toISOString()
    }

    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const updated = [newCrop, ...allCrops]
      localStorage.setItem('app_crops_data', JSON.stringify(updated))
      setCrops(prev => [newCrop, ...prev])
      return newCrop
    }

    const { data, error } = await supabase.from('crops').insert(newCrop).select().single()
    if (!error) {
      await fetchCrops()
      return data
    } else {
      setCrops(prev => [newCrop, ...prev])
      return newCrop
    }
  }

  const updateCrop = async (id, updates) => {
    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const updated = allCrops.map(c => String(c.crop_id) === String(id) ? { ...c, ...updates } : c)
      localStorage.setItem('app_crops_data', JSON.stringify(updated))
      setCrops(prev => prev.map(c => String(c.crop_id) === String(id) ? { ...c, ...updates } : c))
      return
    }
    await supabase.from('crops').update(updates).eq('crop_id', id)
    await fetchCrops()
  }

  const deleteCrop = async (id) => {
    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const updated = allCrops.filter(c => String(c.crop_id) !== String(id))
      localStorage.setItem('app_crops_data', JSON.stringify(updated))
      setCrops(prev => prev.filter(c => String(c.crop_id) !== String(id)))
      return
    }
    await supabase.from('crops').delete().eq('crop_id', id)
    await fetchCrops()
  }

  return { crops, loading, fetchCrops, addCrop, updateCrop, deleteCrop }
}
