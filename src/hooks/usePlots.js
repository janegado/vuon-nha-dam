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
    if (!isConnected()) {
      const saved = localStorage.getItem('app_plots_data')
      setPlots(saved ? JSON.parse(saved) : DEMO_PLOTS)
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('plots').select('*').order('created_at', { ascending: false })
    if (!error && data && data.length > 0) {
      setPlots(data)
    } else {
      setPlots(DEMO_PLOTS)
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
    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const filtered = plotId ? allCrops.filter(c => String(c.plot_id) === String(plotId)) : allCrops
      setCrops(filtered)
      setLoading(false)
      return
    }
    let query = supabase.from('crops').select('*').order('created_at', { ascending: false })
    if (plotId) query = query.eq('plot_id', plotId)
    const { data, error } = await query
    if (!error) setCrops(data || [])
    setLoading(false)
  }, [plotId])

  useEffect(() => { fetchCrops() }, [fetchCrops])

  const addCrop = async (crop) => {
    const cropId = crop.crop_id || crop.id || String(Date.now())
    const newCrop = {
      ...crop,
      crop_id: cropId,
      id: cropId,
      created_at: crop.created_at || new Date().toISOString()
    }
    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const updated = [newCrop, ...allCrops.filter(c => String(c.crop_id || c.id) !== cropId && (!crop.plot_id || String(c.plot_id) !== String(crop.plot_id)))]
      localStorage.setItem('app_crops_data', JSON.stringify(updated))
      setCrops(prev => [newCrop, ...prev.filter(c => String(c.crop_id || c.id) !== cropId && (!crop.plot_id || String(c.plot_id) !== String(crop.plot_id)))])
      return newCrop
    }
    const { data, error } = await supabase.from('crops').insert(newCrop).select().single()
    if (!error) { await fetchCrops(); return data }
    return null
  }

  const updateCrop = async (id, updates) => {
    const targetId = id ? String(id) : null
    const targetPlotId = updates.plot_id ? String(updates.plot_id) : null

    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      let found = false
      const updated = allCrops.map(c => {
        const matchId = targetId && (String(c.crop_id) === targetId || String(c.id) === targetId)
        const matchPlot = targetPlotId && String(c.plot_id) === targetPlotId
        if (matchId || matchPlot) {
          found = true
          return {
            ...c,
            ...updates,
            crop_id: c.crop_id || c.id || targetId || String(Date.now()),
            id: c.id || c.crop_id || targetId || String(Date.now())
          }
        }
        return c
      })

      const finalCrops = found
        ? updated
        : [{
            ...updates,
            crop_id: targetId || String(Date.now()),
            id: targetId || String(Date.now()),
            created_at: new Date().toISOString()
          }, ...allCrops]

      localStorage.setItem('app_crops_data', JSON.stringify(finalCrops))
      setCrops(finalCrops)
      return
    }
    if (targetId) {
      await supabase.from('crops').update(updates).eq('crop_id', targetId)
    } else if (targetPlotId) {
      await supabase.from('crops').update(updates).eq('plot_id', targetPlotId)
    }
    await fetchCrops()
  }

  const deleteCrop = async (id) => {
    const targetId = String(id)
    if (!isConnected()) {
      const saved = localStorage.getItem('app_crops_data')
      const allCrops = saved ? JSON.parse(saved) : DEMO_CROPS
      const updated = allCrops.filter(c => String(c.crop_id) !== targetId && String(c.id) !== targetId)
      localStorage.setItem('app_crops_data', JSON.stringify(updated))
      setCrops(prev => prev.filter(c => String(c.crop_id) !== targetId && String(c.id) !== targetId))
      return
    }
    await supabase.from('crops').delete().eq('crop_id', targetId)
    await fetchCrops()
  }

  return { crops, loading, fetchCrops, addCrop, updateCrop, deleteCrop }
}
