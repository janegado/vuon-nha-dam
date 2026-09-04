import { useState, useEffect, useCallback } from 'react'
import { supabase, isConnected } from '../lib/supabase'

// ====== Danh mục Lô mẫu ban đầu ở trạng thái Mới (Chuẩn bị làm đất) ======
const DEMO_PLOTS = [
  { plot_id: '1', name: 'Lô A - Phía Đông', area_m2: 30, soil_ph: 6.5, soil_type: 'Thịt nhẹ', status: 'Chuẩn bị', area_coord_code: 'A1', cultivation_stage: 'Làm đất' },
  { plot_id: '2', name: 'Lô B - Trung tâm', area_m2: 40, soil_ph: 6.8, soil_type: 'Thịt pha cát', status: 'Chuẩn bị', area_coord_code: 'B1', cultivation_stage: 'Làm đất' },
  { plot_id: '3', name: 'Lô C - Phía Tây', area_m2: 30, soil_ph: 6.3, soil_type: 'Thịt nhẹ', status: 'Chuẩn bị', area_coord_code: 'C1', cultivation_stage: 'Làm đất' },
]

const DEMO_CROPS = []

export function usePlots() {
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPlots = useCallback(async () => {
    setLoading(true)
    const saved = localStorage.getItem('app_plots_data')
    const localPlots = saved ? JSON.parse(saved) : DEMO_PLOTS

    if (!isConnected()) {
      setPlots(localPlots)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from('plots').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setPlots(data)
        localStorage.setItem('app_plots_data', JSON.stringify(data))
      } else if (localPlots && localPlots.length > 0) {
        // Cloud trống nhưng Local có dữ liệu -> Hiển thị Local & Tự động đẩy lên Cloud
        setPlots(localPlots)
        const sanitized = localPlots.map(p => ({
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
        supabase.from('plots').upsert(sanitized, { onConflict: 'plot_id' }).catch(console.error)
      } else {
        setPlots([])
      }
    } catch (e) {
      setPlots(localPlots)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPlots() }, [fetchPlots])

  const addPlot = async (plot) => {
    if (!isConnected()) {
      const newPlot = { ...plot, plot_id: String(Date.now()), created_at: new Date().toISOString() }
      setPlots(prev => {
        const updated = [newPlot, ...prev]
        localStorage.setItem('app_plots_data', JSON.stringify(updated))
        return updated
      })
      return newPlot
    }
    const { data, error } = await supabase.from('plots').insert(plot).select().single()
    if (!error) { await fetchPlots(); return data }
    return null
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
        setCrops(data)
      } else if (localFiltered && localFiltered.length > 0) {
        setCrops(localFiltered)
        const sanitized = allCrops.map(c => ({
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
        supabase.from('crops').upsert(sanitized, { onConflict: 'crop_id' }).catch(console.error)
      } else {
        setCrops([])
      }
    } catch (e) {
      setCrops(localFiltered)
    }
    setLoading(false)
  }, [plotId])

  useEffect(() => { fetchCrops() }, [fetchCrops])

  const addCrop = async (crop) => {
    if (!isConnected()) {
      const newCrop = { ...crop, crop_id: String(Date.now()), created_at: new Date().toISOString() }
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const updated = [newCrop, ...allCrops]
      localStorage.setItem('app_crops_data', JSON.stringify(updated))
      setCrops(prev => [newCrop, ...prev])
      return newCrop
    }
    const { data, error } = await supabase.from('crops').insert(crop).select().single()
    if (!error) { await fetchCrops(); return data }
    return null
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
