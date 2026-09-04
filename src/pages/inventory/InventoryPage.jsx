import { useState, Fragment } from 'react'
import { useInventory } from '../../hooks/useInventory'
import { usePlots } from '../../hooks/usePlots'
import { useTasks } from '../../hooks/useTasks'
import { useProducts, useOrders } from '../../hooks/useSales'
import {
  Plus, Minus, Trash2, Edit, X, Package, AlertTriangle, Play,
  TrendingUp, Layers, Droplets, PieChart, Truck, DollarSign,
  History, Check, ChevronDown, ChevronUp, FileText, RotateCcw,
  Sparkles, Sprout, Leaf, ArrowRight, ArrowDownLeft, ArrowUpRight,
  Warehouse, Calendar, Gift, Search
} from 'lucide-react'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

const ITEM_TYPES = ['Cây giống', 'Nguyên liệu chính', 'Men vi sinh', 'Phân hữu cơ', 'Phụ phẩm vườn', 'Thuốc BVTV', 'Khác']
const UNITS = ['kg', 'lít', 'chai', 'cây', 'cm', 'bầu', 'chậu', 'bẹ', 'gói', 'bao', 'tấn', 'thùng', 'mẻ']

const PRESET_RECIPES = [
  {
    id: 'RECIPE_IMO4',
    name: 'Sản xuất IMO4 (Vi sinh bản địa)',
    icon: '🌱',
    tag: 'BTP IMO4',
    materialsText: '1 lít Mật rỉ + 2kg Cám gạo + Men giống',
    material_code: 'NL01',
    default_qty_out: 1,
    unit: 'lít',
    target_code: 'BTP_IMO4',
    target_name: 'Sinh khối vi sinh IMO4',
    default_output_qty: 10,
    output_unit: 'kg',
    unit_cost_estimate: '3.500đ / kg',
    desc: 'Ủ Mật rỉ đường + Cám gạo + Men giống 5-7 ngày. Hệ thống sẽ tự động nhắc kiểm tra nhiệt độ N+1, đảo mẻ N+3, thu hoạch N+5!',
    is_consumption: false
  },
  {
    id: 'RECIPE_DOT_TRAU',
    name: 'Đốt tro trấu (Hun bón lót)',
    icon: '🔥',
    tag: 'Tro trấu cải tạo đất',
    materialsText: '2 bao Trấu sống',
    material_code: 'NL05',
    default_qty_out: 2,
    unit: 'bao',
    target_code: 'NL06',
    target_name: 'Tro trấu (than trấu hun)',
    default_output_qty: 1,
    output_unit: 'bao',
    unit_cost_estimate: '40.000đ / bao',
    desc: 'Xuất trấu sống đốt than hun làm tro trấu tơi xốp bón lót luống trồng. Tự động sinh lịch nhắc bón lót luống!',
    is_consumption: false
  },
  {
    id: 'RECIPE_TUOI_MATRI',
    name: 'Xuất Mật rỉ / Vi sinh tưới cây',
    icon: '💧',
    tag: 'Tưới & Dưỡng rễ',
    materialsText: '1 lít Mật rỉ đường hòa nước tưới',
    material_code: 'NL01',
    default_qty_out: 1,
    unit: 'lít',
    target_code: 'TP_NHADAM_CAY',
    target_name: 'Tưới dưỡng rễ cây nha đam',
    default_output_qty: 0,
    output_unit: 'lít',
    unit_cost_estimate: '10.000đ / lần',
    desc: 'Pha loãng mật rỉ đường hoặc chế phẩm tưới gốc kích hoạt hệ vi sinh đất (tiêu thụ trực tiếp, không tạo tồn kho mới)',
    is_consumption: true
  },
  {
    id: 'RECIPE_EM_GOC',
    name: 'Sản xuất EM gốc',
    icon: '🧪',
    tag: 'BTP EM gốc',
    materialsText: '10kg/lít Mật rỉ + 1L Men gốc EM1',
    material_code: 'NL01',
    default_qty_out: 10,
    unit: 'lít',
    target_code: 'BTP_EMGOC',
    target_name: 'EM gốc',
    default_output_qty: 20,
    output_unit: 'lít',
    unit_cost_estimate: '7.500đ / Lít',
    desc: 'Ủ Mật rỉ đường + Men vi sinh gốc EM1 trong thùng kín 7-10 ngày. Tự động sinh lịch kiểm tra xả khí sau 7 ngày!',
    is_consumption: false
  },
  {
    id: 'RECIPE_EM2',
    name: 'Sản xuất EM2 (Thứ cấp)',
    icon: '🌿',
    tag: 'BTP EM2',
    materialsText: '5 lít Mật rỉ + 2L EM gốc',
    material_code: 'NL01',
    default_qty_out: 5,
    unit: 'lít',
    target_code: 'BTP_EM2',
    target_name: 'EM2',
    default_output_qty: 50,
    output_unit: 'lít',
    unit_cost_estimate: '1.300đ / Lít',
    desc: 'Nhân bản từ EM gốc + Mật rỉ + Nước sạch ủ 5-7 ngày',
    is_consumption: false
  },
  {
    id: 'RECIPE_GE_NHADAM',
    name: 'Sản xuất GE Nha Đam',
    icon: '✨',
    tag: 'TP GE Nha Đam',
    materialsText: '2 lít Mật rỉ + 5L EM2 + 10kg Bã nha đam',
    material_code: 'NL01',
    default_qty_out: 2,
    unit: 'lít',
    target_code: 'TP_GENHADAM',
    target_name: 'GE Nha đam',
    default_output_qty: 30,
    output_unit: 'lít',
    unit_cost_estimate: '2.550đ / Lít',
    desc: 'Phối trộn EM2 + Vỏ bã nha đam + Mật rỉ ủ làm phân bón lá vi sinh',
    is_consumption: false
  },
  {
    id: 'RECIPE_RACBEP',
    name: 'Ủ rác bếp / Môi trường',
    icon: '🗑️',
    tag: 'Xử lý rác nội bộ',
    materialsText: '5 lít Mật rỉ + Rác nhà bếp',
    material_code: 'NL01',
    default_qty_out: 5,
    unit: 'lít',
    target_code: 'NOIBO_RACBEP',
    target_name: 'Khử mùi rác nội bộ',
    default_output_qty: 0,
    output_unit: 'mẻ',
    unit_cost_estimate: '50.000đ / lần',
    desc: 'Ủ khử mùi hôi và phân hủy nhanh rác hữu cơ nội bộ (không nhập kho mới)',
    is_consumption: true
  },
  {
    id: 'RECIPE_TUOI_VUON',
    name: 'Tưới GE & Chăm sóc vườn',
    icon: '💦',
    tag: 'Tiêu thụ chăm sóc cây',
    materialsText: '10L GE Nha đam + IMO tưới cây',
    material_code: 'TP_GENHADAM',
    default_qty_out: 10,
    unit: 'lít',
    target_code: 'TP_NHADAM_CAY',
    target_name: 'Chăm sóc vườn',
    default_output_qty: 0,
    output_unit: 'lít',
    unit_cost_estimate: '75.500đ / đợt',
    desc: 'Xuất dùng GE Nha đam & IMO tưới cây, phân bổ chi phí chăm sóc (không nhập kho mới)',
    is_consumption: true
  }
]

const formatVND = (n) => (n || 0).toLocaleString('vi-VN') + 'đ'

// Phân nhóm vật tư theo Thư mục & Sắp xếp thứ tự bảng chữ cái tiếng Việt A-Z
const getGroupedItems = (itemList) => {
  const list = [...(itemList || [])]
  // Sắp xếp tiếng Việt A-Z toàn bộ danh sách
  list.sort((a, b) => (a.item_name || '').localeCompare(b.item_name || '', 'vi'))

  const vtqItems = list.filter(i => (i.item_id || '').startsWith('VTQ_') || (i.supplier || '').includes('Vương Trùn Quế'))
  const seedlingItems = list.filter(i => !vtqItems.includes(i) && (i.item_type === 'Cây giống' || (i.item_name || '').toLowerCase().includes('giống')))
  const bioItems = list.filter(i => !vtqItems.includes(i) && !seedlingItems.includes(i) && (i.item_type === 'Men vi sinh' || (i.item_name || '').toLowerCase().includes('men') || (i.item_name || '').toLowerCase().includes('em') || (i.item_name || '').toLowerCase().includes('imo') || (i.item_name || '').toLowerCase().includes('ge')))
  const fertItems = list.filter(i => !vtqItems.includes(i) && !seedlingItems.includes(i) && !bioItems.includes(i) && (i.item_type === 'Phân hữu cơ' || (i.item_name || '').toLowerCase().includes('phân') || (i.item_name || '').toLowerCase().includes('trùn') || (i.item_name || '').toLowerCase().includes('dinh dưỡng')))
  const pestItems = list.filter(i => !vtqItems.includes(i) && !seedlingItems.includes(i) && !bioItems.includes(i) && !fertItems.includes(i) && (i.item_type === 'Thuốc BVTV' || (i.item_name || '').toLowerCase().includes('thuốc') || (i.item_name || '').toLowerCase().includes('thảo mộc') || (i.item_name || '').toLowerCase().includes('bt')))
  const otherItems = list.filter(i => !vtqItems.includes(i) && !seedlingItems.includes(i) && !bioItems.includes(i) && !fertItems.includes(i) && !pestItems.includes(i))

  return {
    vtqItems,
    seedlingItems,
    bioItems,
    fertItems,
    pestItems,
    otherItems,
    allSorted: list
  }
}

export default function InventoryPage() {
  const {
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
    recordWaste,
    recordGift
  } = useInventory()

  const grouped = getGroupedItems(items)

  const { plots } = usePlots()
  const { tasks } = useTasks()
  const { products } = useProducts()
  const { orders } = useOrders()

  // Thu hoạch từ vườn
  const harvestLogs = (tasks || []).filter(t => t.task_type === 'Thu hoạch')
  const totalHarvestKg = harvestLogs.reduce((sum, t) => sum + (parseFloat(t.harvest_qty_kg) || 0), 0)
  const totalHarvestLeaves = harvestLogs.reduce((sum, t) => sum + (parseInt(t.harvest_leaves) || 0), 0)
  const totalHarvestSeedlings = harvestLogs.reduce((sum, t) => sum + (parseInt(t.harvest_seedling_qty) || 0), 0)

  // Xuất trồng ra vườn
  const plantingLogs = (productionLogs || []).filter(l => l.purpose?.includes('Xuống giống') || l.material_code === 'NL07')

  // Tab chính quản trị kho toàn diện
  const [activeTab, setActiveTab] = useState('raw') // 'raw' | 'production' | 'harvest' | 'ledger'
  const [rawCategoryFilter, setRawCategoryFilter] = useState('ALL')
  const [rawSearchQuery, setRawSearchQuery] = useState('')

  // Toast thông báo phản hồi thao tác 1-chạm
  const [toastMsg, setToastMsg] = useState('')

  // Modal phụ xem Báo cáo & Bảng giá thành
  const [showCostingModal, setShowCostingModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // Modal Ghi nhận Hao hụt / Hư hỏng trong kho
  const [showWasteModal, setShowWasteModal] = useState(false)
  const [wasteForm, setWasteForm] = useState({
    item_id: 'NL07',
    waste_qty: 5,
    reason: 'Thối rễ khi dưỡng cây giống',
    date: new Date().toISOString().split('T')[0]
  })

  // Modal Xuất Tặng / Biếu / Khuyến mãi Khách hàng
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [showLowStockModal, setShowLowStockModal] = useState(false)
  const [giftForm, setGiftForm] = useState({
    item_id: 'NL07',
    gift_qty: 3,
    recipient: '',
    reason: 'Tặng kèm tri ân khách hàng',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    receipt_id: ''
  })

  // Modal thêm/sửa nguyên vật liệu trực tiếp
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState({
    item_id: '', item_name: '', item_type: 'Nguyên liệu chính', unit: 'kg',
    qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 0, notes: ''
  })

  // Modal Nhập Hàng Đa Quy Cách (Hỗ trợ chọn chủng loại, tên giống Nha đam Mỹ/Thái, tên thuốc/phân, kích cỡ & ghi chú)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [editingReceiptId, setEditingReceiptId] = useState(null)
  const initialPurchaseState = {
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    shipping_cost: 0,
    discount_amount: 0,
    is_manual_total: false,
    total_paid: 0,
    notes: '',
    items_list: [
      { item_id: 'NL07', variety: 'Cây giống nha đam', spec: '', row_notes: '', qty: 100, bonus_qty: 0, unit_price: 15000, unit: 'cây' }
    ]
  }
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseState)

  const resetPurchaseForm = () => {
    setEditingReceiptId(null)
    setPurchaseForm({
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      shipping_cost: 0,
      discount_amount: 0,
      is_manual_total: false,
      total_paid: 0,
      notes: '',
      items_list: [
        { item_id: 'NL07', variety: 'Cây giống nha đam', spec: '', row_notes: '', qty: 100, bonus_qty: 0, unit_price: 15000, unit: 'cây' }
      ]
    })
  }

  const handleOpenEditReceipt = (r) => {
    setEditingReceiptId(r.receipt_id)
    setPurchaseForm({
      date: r.date || new Date().toISOString().split('T')[0],
      supplier: r.supplier || '',
      shipping_cost: parseFloat(r.shipping_cost) || 0,
      discount_amount: parseFloat(r.discount_amount) || 0,
      is_manual_total: Boolean(r.is_manual_total),
      total_paid: parseFloat(r.total_cost || r.total_paid) || 0,
      notes: r.notes || '',
      items_list: (r.items_list && r.items_list.length > 0)
        ? r.items_list.map(i => ({
            item_id: i.item_id || 'NL07',
            variety: i.variety || i.item_name || '',
            spec: i.spec || i.notes || '',
            row_notes: i.row_notes || '',
            qty: parseFloat(i.qty) || 1,
            bonus_qty: parseFloat(i.bonus_qty) || 0,
            unit_price: parseFloat(i.unit_price) || 0,
            unit: i.unit || 'cây'
          }))
        : [{
            item_id: r.item_id || 'NL07',
            variety: r.item_name || 'Cây giống nha đam',
            spec: '',
            row_notes: '',
            qty: parseFloat(r.qty) || 1,
            bonus_qty: parseFloat(r.bonus_qty) || 0,
            unit_price: parseFloat(r.unit_price) || 0,
            unit: r.unit || 'cây'
          }]
    })
    setShowPurchaseForm(true)
  }

  const handleDeleteReceipt = async (receiptId) => {
    if (confirm(`🗑️ Bạn có chắc muốn xóa phiếu nhập [Đợt ${receiptId}]? Số lượng tồn kho tương ứng sẽ được tự động hoàn nguyên!`)) {
      if (deletePurchaseReceipt) {
        await deletePurchaseReceipt(receiptId)
      }
      setToastMsg(`🗑️ Đã xóa phiếu nhập [Đợt ${receiptId}] và cập nhật lại tồn kho!`)
      setTimeout(() => setToastMsg(''), 4000)
    }
  }

  const handleDeleteProductionLog = async (log) => {
    if (confirm(`🗑️ Bạn có chắc muốn xóa dòng nhật ký [${log.purpose || log.target_name}]? Số lượng (${log.qty_out} ${log.unit || 'cây'}) sẽ được tự động cộng hoàn lại vào kho!`)) {
      if (deleteProductionLog) {
        await deleteProductionLog(log.log_id)
      }
      setToastMsg(`🗑️ Đã xóa dòng nhật ký và hoàn lại +${log.qty_out} ${log.unit || 'cây'} vào kho!`)
      setTimeout(() => setToastMsg(''), 4000)
    }
  }

  const handleClearAllPlantingLogs = async () => {
    const plantingItems = (productionLogs || []).filter(l => l.purpose?.includes('Xuống giống') || l.purpose?.includes('Trồng cây') || l.target_code === 'TP_NHADAM_CAY')
    if (plantingItems.length === 0) {
      alert('Không tìm thấy dòng nhật ký xuất trồng nào để dọn!')
      return
    }
    if (confirm(`🧹 Bạn có chắc muốn xóa sạch toàn bộ ${plantingItems.length} dòng nhật ký xuất trồng vườn lỗi? Toàn bộ số lượng cây giống đã xuất sẽ được tự động cộng trả lại vào kho!`)) {
      for (const log of plantingItems) {
        if (deleteProductionLog) {
          await deleteProductionLog(log.log_id)
        }
      }
      setToastMsg(`🧹 Đã dọn sạch ${plantingItems.length} dòng xuất trồng lỗi và hoàn trả lại cây giống vào kho!`)
      setTimeout(() => setToastMsg(''), 5000)
    }
  }

  const handleSyncPlotsAndInventory = async () => {
    if (fetchItems) {
      await fetchItems()
      setToastMsg('🔄 Đã tự động cân đối và đồng bộ dữ liệu xuất trồng cây từ tất cả các Lô đất vào Kho!')
      setTimeout(() => setToastMsg(''), 4500)
    }
  }

  const handleQuickRestockItem = (item) => {
    setShowLowStockModal(false)
    setEditingReceiptId(null)
    setPurchaseForm({
      date: new Date().toISOString().split('T')[0],
      supplier: item.supplier || 'Vương Trùn Quế (034.981.6802)',
      shipping_cost: 0,
      discount_amount: 0,
      is_manual_total: false,
      total_paid: 0,
      notes: `Nhập bổ sung ${item.item_name}`,
      items_list: [
        {
          item_id: item.item_id || 'NL07',
          variety: item.item_name || 'Vật tư',
          spec: item.notes || '',
          row_notes: '',
          qty: item.unit === 'cây' ? 50 : (item.unit === 'kg' ? 20 : (item.unit === 'lít' ? 10 : 5)),
          bonus_qty: 0,
          unit_price: parseFloat(item.unit_cost) || 0,
          unit: item.unit || 'kg'
        }
      ]
    })
    setShowPurchaseForm(true)
  }

  const handleAddItemRow = () => {
    setPurchaseForm(prev => ({
      ...prev,
      items_list: [
        ...prev.items_list,
        { item_id: 'NL07', variety: 'Cây giống nha đam', spec: '', row_notes: '', qty: 50, bonus_qty: 0, unit_price: 15000, unit: 'cây' }
      ]
    }))
  }

  const handleUpdateItemRow = (index, field, value) => {
    setPurchaseForm(prev => {
      const updated = [...prev.items_list]
      const curRow = { ...updated[index] }
      curRow[field] = value

      // Khi người dùng đổi Nhóm vật tư trong dropdown -> Tự động đổi tên tương ứng, đơn giá, ĐVT và TỰ ĐỘNG ĐIỀN NHÀ CUNG CẤP
      if (field === 'item_id') {
        if (value === 'CUSTOM') {
          curRow.item_id = 'CUSTOM'
          curRow.variety = ''
          curRow.spec = ''
          curRow.row_notes = ''
          curRow.unit = 'kg'
          curRow.unit_price = 0
        } else {
          const found = items.find(i => i.item_id === value)
          if (found) {
            curRow.item_id = found.item_id
            curRow.variety = found.item_name
            curRow.spec = '' // Xóa trống kích cỡ cũ
            curRow.row_notes = found.notes || ''
            curRow.unit = found.unit
            curRow.unit_price = found.unit_cost || 0

            // Tự động nhảy Nhà cung cấp tương ứng nếu mặt hàng có NCC gắn liền
            if (found.supplier) {
              setPurchaseForm(prevForm => ({
                ...prevForm,
                supplier: found.supplier
              }))
            }
          }
        }
      }
      updated[index] = curRow
      return { ...prev, items_list: updated }
    })
  }

  const handleRemoveItemRow = (index) => {
    if (purchaseForm.items_list.length <= 1) {
      alert('Đơn nhập phải có ít nhất 1 dòng mặt hàng!')
      return
    }
    setPurchaseForm(prev => ({
      ...prev,
      items_list: prev.items_list.filter((_, i) => i !== index)
    }))
  }

  // Modal Ghi Mẻ Chế Biến Siêu Tốc (2 chạm theo công thức dựng sẵn)
  const [showProductionForm, setShowProductionForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(PRESET_RECIPES[0])
  const [batchMultiplier, setBatchMultiplier] = useState(1) // Số mẻ (mặc định 1)
  const [customQtyOut, setCustomQtyOut] = useState(10)
  const [customOutputQty, setCustomOutputQty] = useState(20)

  // Thống kê chung
  const totalStockValue = (items || []).reduce((sum, i) => sum + ((parseFloat(i?.qty_remaining) || 0) * (parseFloat(i?.unit_cost) || 0)), 0)
  const lowStock = (items || []).filter(i => (parseFloat(i?.qty_remaining) || 0) <= 5)
  const matRiItem = (items || []).find(i => i?.item_id === 'NL01' || i?.item_name?.includes('Mật rỉ'))

  // Mẻ gần nhất đã ghi
  const latestBatch = productionLogs && productionLogs.length > 0
    ? productionLogs[productionLogs.length - 1]
    : null

  // Thao tác 1-Chạm: Lặp lại mẻ gần nhất
  const handleRepeatLatestBatch = async () => {
    if (!latestBatch) {
      alert('Chưa có mẻ chế biến nào trước đó! Hãy dùng nút "⚡ Ghi mẻ chế biến" để tạo mẻ đầu tiên.')
      setShowProductionForm(true)
      return
    }

    const selectedMat = items.find(i => i.item_id === latestBatch.material_code)
    const isConsumption = !latestBatch.output_qty || parseFloat(latestBatch.output_qty) <= 0 || latestBatch.is_consumption || latestBatch.target_code === 'TP_NHADAM_CAY' || latestBatch.target_code === 'NOIBO_RACBEP'

    const logData = {
      date: new Date().toISOString().split('T')[0],
      material_code: latestBatch.material_code,
      material_name: selectedMat?.item_name || latestBatch.material_name || latestBatch.purpose,
      purpose: latestBatch.purpose,
      qty_out: latestBatch.qty_out,
      unit: latestBatch.unit,
      unit_cost: selectedMat?.unit_cost || latestBatch.unit_cost || 10000,
      target_code: latestBatch.target_code,
      target_name: latestBatch.target_name,
      output_qty: latestBatch.output_qty,
      output_unit: latestBatch.output_unit
    }

    await addProductionLog(logData)

    if (isConsumption) {
      setToastMsg(`✅ Đã dùng ${latestBatch.qty_out} ${latestBatch.unit} để ${latestBatch.purpose} (Đã phân bổ chăm sóc cây)`)
    } else {
      setToastMsg(`✅ Đã lặp lại thành công mẻ: ${latestBatch.purpose} (Xuất ${latestBatch.qty_out} ${latestBatch.unit} ➔ Thu ${latestBatch.output_qty} ${latestBatch.output_unit} ${latestBatch.target_name})`)
    }
    setTimeout(() => setToastMsg(''), 5000)
  }

  // Handlers cho nguyên vật liệu
  const resetItemForm = () => {
    setItemForm({ item_id: '', item_name: '', item_type: 'Nguyên liệu chính', unit: 'kg', qty_in: 0, qty_out: 0, qty_remaining: 0, unit_cost: 0, notes: '' })
    setEditingItem(null)
    setShowItemForm(false)
  }

  const handleEditItem = (item) => {
    setItemForm({ ...item })
    setEditingItem(item)
    setShowItemForm(true)
  }

  const handleSaveItem = async (e) => {
    e.preventDefault()
    const data = {
      ...itemForm,
      qty_remaining: Math.max(0, (parseFloat(itemForm.qty_in) || 0) - (parseFloat(itemForm.qty_out) || 0))
    }
    if (editingItem) {
      await updateItem(editingItem.item_id, data)
    } else {
      await addItem(data)
    }
    resetItemForm()
  }

  const handleSavePurchase = async (e) => {
    e.preventDefault()
    let saved
    const supplierName = purchaseForm.supplier || 'Nguồn giống'
    const totalRec = purchaseForm.items_list.reduce((s, r) => s + (parseFloat(r.qty) || 0) + (parseFloat(r.bonus_qty) || 0), 0)

    if (editingReceiptId) {
      saved = await updatePurchaseReceipt(editingReceiptId, purchaseForm)
      setToastMsg(`✏️ Đã cập nhật phiếu nhập [Đợt ${editingReceiptId}] (${totalRec} cây/vật tư từ ${supplierName}) và đồng bộ lại kho!`)
    } else {
      saved = await addPurchaseReceipt(purchaseForm)
      setToastMsg(`🚚 Đã lưu đơn nhập ${saved?.receipt_id || ''} (${totalRec} cây/vật tư từ ${supplierName}) thành công!`)
    }

    setShowPurchaseForm(false)
    setEditingReceiptId(null)
    resetPurchaseForm()
    setTimeout(() => setToastMsg(''), 5000)
  }

  // Handlers cho Ghi nhận hao hụt / hư hỏng theo từng Đợt nhập
  const handleSaveWaste = async (e) => {
    e.preventDefault()
    const selectedReceipt = wasteForm.mode === 'receipt'
      ? purchaseReceipts.find(r => r.receipt_id === wasteForm.receipt_id)
      : null
    const targetItemId = selectedReceipt ? selectedReceipt.item_id : wasteForm.item_id
    const targetItem = items.find(i => i.item_id === targetItemId)

    if (recordWaste) {
      await recordWaste(
        targetItemId,
        wasteForm.waste_qty,
        wasteForm.reason,
        wasteForm.date,
        selectedReceipt?.receipt_id || null,
        selectedReceipt?.supplier || ''
      )
    }
    setShowWasteModal(false)
    setToastMsg(`📉 Đã ghi nhận hao hụt ${wasteForm.waste_qty} ${targetItem?.unit || 'cây'} ${targetItem?.item_name || ''} do: ${wasteForm.reason}!`)
    setTimeout(() => setToastMsg(''), 5000)
  }

  // Handlers cho Xuất Tặng / Biếu / Khuyến Mãi Khách hàng
  const handleSaveGift = async (e) => {
    e.preventDefault()
    const targetItem = items.find(i => i.item_id === giftForm.item_id)
    const giftQtyNum = parseFloat(giftForm.gift_qty) || 0

    if (giftQtyNum <= 0) {
      alert('Vui lòng nhập số lượng xuất tặng hợp lệ!')
      return
    }

    if (recordGift) {
      await recordGift(
        giftForm.item_id,
        giftQtyNum,
        giftForm.recipient,
        giftForm.notes || giftForm.reason,
        giftForm.date,
        giftForm.receipt_id || null
      )
    }

    setShowGiftModal(false)
    setToastMsg(`🎁 Đã xuất tặng ${giftQtyNum} ${targetItem?.unit || 'cây'} ${targetItem?.item_name || ''} cho ${giftForm.recipient || 'khách hàng'} (Đã tự động trừ kho)!`)
    setTimeout(() => setToastMsg(''), 5000)
  }

  // Handlers cho Ghi mẻ chế biến siêu tốc (2 lần chạm)
  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe)
    setBatchMultiplier(1)
    setCustomQtyOut(recipe.default_qty_out)
    setCustomOutputQty(recipe.default_output_qty)
  }

  const handleMultiplierChange = (delta) => {
    const newMult = Math.max(0.5, batchMultiplier + delta)
    setBatchMultiplier(newMult)
    setCustomQtyOut(selectedRecipe.default_qty_out * newMult)
    setCustomOutputQty(selectedRecipe.default_output_qty * newMult)
  }

  const handleConfirmProduction = async () => {
    const selectedMat = items.find(i => i.item_id === selectedRecipe.material_code)
    const isConsumption = selectedRecipe.is_consumption || !customOutputQty || parseFloat(customOutputQty) <= 0

    const logData = {
      date: new Date().toISOString().split('T')[0],
      material_code: selectedRecipe.material_code,
      material_name: selectedMat?.item_name || selectedRecipe.name,
      purpose: selectedRecipe.name,
      qty_out: customQtyOut,
      unit: selectedRecipe.unit,
      unit_cost: selectedMat?.unit_cost || 10000,
      target_code: selectedRecipe.target_code,
      target_name: selectedRecipe.target_name,
      output_qty: customOutputQty,
      output_unit: selectedRecipe.output_unit
    }
    await addProductionLog(logData)
    setShowProductionForm(false)

    if (isConsumption) {
      setToastMsg(`✅ Đã dùng ${customQtyOut} ${selectedRecipe.unit} để ${selectedRecipe.name} (Đã phân bổ chăm sóc cây)`)
    } else {
      setToastMsg(`✅ Đã ghi thành công mẻ: ${selectedRecipe.name} (Xuất ${customQtyOut} ${selectedRecipe.unit} ➔ Thu ${customOutputQty} ${selectedRecipe.output_unit} ${selectedRecipe.target_name})`)
    }
    setTimeout(() => setToastMsg(''), 5000)
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Kho Nguyên Liệu & Chế Biến Vi Sinh</h1>
          <p className="page-description">Quản lý Mật rỉ đường, Men vi sinh EM1, GE Nha Đam & Tính giá vốn tự động</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Nút 1-Chạm: Lặp lại mẻ gần nhất */}
          {latestBatch && (
            <button
              className="btn btn-warning"
              onClick={handleRepeatLatestBatch}
              style={{ fontWeight: 700, background: '#d97706', color: '#ffffff', boxShadow: '0 2px 4px rgba(217,119,6,0.3)' }}
              title={`Bấm 1 chạm tạo ngay mẻ ${latestBatch.purpose} giống mẻ gần nhất`}
            >
              <RotateCcw size={18} /> 🔁 Lặp lại mẻ gần nhất ({latestBatch.purpose})
            </button>
          )}

          <button className="btn btn-primary" onClick={() => setShowProductionForm(true)}>
            <Play size={18} /> ⚡ Ghi mẻ chế biến (2 chạm)
          </button>
          <button className="btn btn-secondary" onClick={() => { resetPurchaseForm(); setShowPurchaseForm(true) }}>
            <Truck size={18} /> + Nhập hàng mới
          </button>
          <button className="btn btn-secondary" onClick={() => setShowWasteModal(true)} style={{ color: 'var(--color-danger)' }} title="Ghi nhận cây chết hoặc nguyên liệu hư hỏng trong kho">
            <Trash2 size={18} /> 📉 Ghi hao hụt / Hỏng kho
          </button>
          <button className="btn btn-secondary" onClick={() => setShowGiftModal(true)} style={{ color: '#be185d', fontWeight: 600 }} title="Xuất cây giống hoặc sản phẩm tặng khách hàng, tri ân, khuyến mãi">
            <Gift size={18} /> 🎁 Xuất tặng khách
          </button>
          <button className="btn btn-secondary" onClick={handleSyncPlotsAndInventory} style={{ color: 'var(--color-primary-800)', fontWeight: 700 }} title="Tự động quét tất cả các Lô đất và đồng bộ số liệu xuất trồng vào sổ nhật ký và tồn kho">
            <RotateCcw size={18} /> 🔄 Đồng bộ Lô & Kho
          </button>
          <button className="btn btn-ghost" onClick={() => setShowCostingModal(true)} title="Xem chi tiết cách tính giá thành">
            <DollarSign size={18} /> Bảng giá thành
          </button>
          <button className="btn btn-ghost" onClick={() => setShowReportModal(true)} title="Xem báo cáo nhập xuất tồn">
            <FileText size={18} /> Báo cáo NXT
          </button>
        </div>
      </div>

      {/* Toast thông báo 1-chạm */}
      {toastMsg && (
        <div className="alert alert-success fade-in" style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
          <Check size={20} />
          <div>{toastMsg}</div>
        </div>
      )}

      {/* KPI Cards Tinh Gọn */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>{formatVND(totalStockValue)}</h3>
            <p>Tổng giá trị tồn kho</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow"><Droplets size={24} /></div>
          <div className="stat-info">
            <h3>{matRiItem?.qty_remaining || 0} kg</h3>
            <p>Tồn Mật rỉ ({formatVND(matRiItem?.unit_cost || 10000)}/kg)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><Layers size={24} /></div>
          <div className="stat-info">
            <h3>2.550đ / Lít</h3>
            <p>Giá thành sản xuất GE Nha đam</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><Play size={24} /></div>
          <div className="stat-info">
            <h3>{productionLogs.length} mẻ</h3>
            <p>Đã chế biến & luân chuyển</p>
          </div>
        </div>

        {/* Ô KPI 5: Nhắc nhở danh mục hàng cần nhập thêm (Bấm để xem chi tiết) */}
        <div
          className="stat-card"
          onClick={() => setShowLowStockModal(true)}
          style={{
            cursor: 'pointer',
            border: lowStock.length > 0 ? '1.5px solid #f59e0b' : '1px solid var(--color-border)',
            background: lowStock.length > 0 ? '#fffbeb' : '#ffffff',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          title="Bấm vào để mở danh mục liệt kê chi tiết các mặt hàng cần nhập thêm"
        >
          <div className="stat-icon red" style={{ background: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3 style={{ color: lowStock.length > 0 ? '#b45309' : 'inherit' }}>
              {lowStock.length} mặt hàng
            </h3>
            <p style={{ fontWeight: 600, color: lowStock.length > 0 ? '#92400e' : 'var(--color-text-secondary)' }}>
              Cần nhập thêm
            </p>
            {lowStock.length > 0 && (
              <div className="stat-trend down" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 700, marginTop: 4, cursor: 'pointer' }}>
                📋 Xem danh sách ➔
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Tabs Quản Trị Kho Toàn Diện */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${activeTab === 'raw' ? 'active' : ''}`} onClick={() => setActiveTab('raw')}>
          📦 1. Vật tư đầu vào & Lịch sử nhập ({items.length})
        </button>
        <button className={`tab ${activeTab === 'production' ? 'active' : ''}`} onClick={() => setActiveTab('production')}>
          🧪 2. Chế biến & Dòng chảy vi sinh ({productionLogs.length} mẻ)
        </button>
        <button className={`tab ${activeTab === 'harvest' ? 'active' : ''}`} onClick={() => setActiveTab('harvest')}>
          🌾 3. Thu hoạch & Nông sản vườn ({harvestLogs.length} đợt thu)
        </button>
        <button className={`tab ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
          📜 4. Sổ Nhật ký Nhập - Xuất toàn vườn
        </button>
      </div>

      {/* === TAB 1: KHO NGUYÊN LIỆU & LỊCH SỬ NHẬP === */}
      {activeTab === 'raw' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Bảng tồn kho */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>🗂️ Danh Mục Tồn Kho & Bảng Giá Vốn (Phân Nhóm & Sắp Xếp A-Z)</h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Tất cả các mặt hàng được phân chia theo thư mục rõ ràng và sắp xếp bảng chữ cái từ A đến Z
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={() => { resetPurchaseForm(); setShowPurchaseForm(true) }}>
                  <Truck size={14} /> + Nhập đợt mới
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { resetItemForm(); setShowItemForm(true) }}>
                  <Plus size={14} /> Thêm món mới
                </button>
              </div>
            </div>

            {/* Thanh tìm kiếm & Bộ lọc nhanh thư mục */}
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginRight: 4 }}>Thư mục:</span>
                {[
                  { id: 'ALL', label: `Tất cả (${items.length})` },
                  { id: 'SEEDLING', label: `🌱 Cây giống (${grouped.seedlingItems.length})` },
                  { id: 'VTQ', label: `🪱 Vương Trùn Quế (${grouped.vtqItems.length})` },
                  { id: 'BIO', label: `🧪 Men vi sinh (${grouped.bioItems.length})` },
                  { id: 'FERT', label: `🌿 Phân hữu cơ (${grouped.fertItems.length})` },
                  { id: 'PEST', label: `🛡️ Thuốc BVTV (${grouped.pestItems.length})` },
                  { id: 'OTHER', label: `📦 Khác (${grouped.otherItems.length})` }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setRawCategoryFilter(cat.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: rawCategoryFilter === cat.id ? 700 : 500,
                      border: rawCategoryFilter === cat.id ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: rawCategoryFilter === cat.id ? 'var(--color-primary-600)' : '#ffffff',
                      color: rawCategoryFilter === cat.id ? '#ffffff' : 'var(--color-text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Tìm tên hoặc mã vật tư..."
                  value={rawSearchQuery}
                  onChange={e => setRawSearchQuery(e.target.value)}
                  style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 4, paddingBottom: 4, fontSize: 13, height: 32 }}
                />
              </div>
            </div>

            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên nguyên vật liệu</th>
                      <th>Phân loại</th>
                      <th>ĐVT</th>
                      <th>Tổng nhập</th>
                      <th>Đã xuất</th>
                      <th>Tồn kho</th>
                      <th>Đơn giá vốn</th>
                      <th>Tổng giá trị</th>
                      <th>Sửa giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sections = [
                        { id: 'SEEDLING', title: '🌱 1. CÂY GIỐNG NHA ĐAM', items: grouped.seedlingItems, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                        { id: 'VTQ', title: '🪱 2. SẢN PHẨM VƯƠNG TRÙN QUẾ (034.981.6802)', items: grouped.vtqItems, color: '#b45309', bg: '#fefce8', border: '#fde68a' },
                        { id: 'BIO', title: '🧪 3. MEN VI SINH & CHẾ PHẨM SINH HỌC', items: grouped.bioItems, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
                        { id: 'FERT', title: '🌿 4. PHÂN BÓN & DINH DƯỠNG HỮU CƠ', items: grouped.fertItems, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                        { id: 'PEST', title: '🛡️ 5. THUỐC BVTV & THẢO MỘC TRỪ SÂU', items: grouped.pestItems, color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
                        { id: 'OTHER', title: '📦 6. NGUYÊN VẬT LIỆU & PHỤ PHẨM KHÁC', items: grouped.otherItems, color: '#475569', bg: '#f8fafc', border: '#e2e8f0' }
                      ]

                      const filteredSections = sections.filter(sec => {
                        if (rawCategoryFilter === 'ALL') return sec.items.length > 0
                        return sec.id === rawCategoryFilter && sec.items.length > 0
                      })

                      const query = rawSearchQuery.trim().toLowerCase()
                      let totalRendered = 0

                      const rows = filteredSections.map(sec => {
                        let secItems = sec.items
                        if (query) {
                          secItems = secItems.filter(i =>
                            (i.item_name || '').toLowerCase().includes(query) ||
                            (i.item_id || '').toLowerCase().includes(query) ||
                            (i.supplier || '').toLowerCase().includes(query)
                          )
                        }

                        if (secItems.length === 0) return null
                        totalRendered += secItems.length

                        return (
                          <Fragment key={sec.id}>
                            {/* Dòng Tiêu Đề Thư Mục Nhóm */}
                            <tr style={{ background: sec.bg, borderTop: `2px solid ${sec.border}`, borderBottom: `1px solid ${sec.border}` }}>
                              <td colSpan="9" style={{ padding: '8px 14px', fontWeight: 800, color: sec.color, fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{sec.title}</span>
                                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>({secItems.length} mặt hàng đã xếp A-Z)</span>
                                </div>
                              </td>
                            </tr>

                            {/* Các dòng mặt hàng trong nhóm (đã sắp xếp A-Z) */}
                            {secItems.map(item => (
                              <tr key={item.item_id}>
                                <td>
                                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.item_name}</div>
                                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Mã: {item.item_id} {item.supplier && `· ${item.supplier}`}</span>
                                </td>
                                <td><span className="badge badge-info">{item.item_type}</span></td>
                                <td>{item.unit}</td>
                                <td>{item.qty_in} {item.unit}</td>
                                <td>{item.qty_out} {item.unit}</td>
                                <td>
                                  <strong style={{ fontSize: 15, color: item.qty_remaining <= 5 ? 'var(--color-danger)' : 'var(--color-primary-700)' }}>
                                    {item.qty_remaining} {item.unit} {item.qty_remaining <= 5 && '⚠️'}
                                  </strong>
                                </td>
                                <td>
                                  <strong style={{ color: 'var(--color-primary-800)', background: 'var(--color-primary-50)', padding: '4px 8px', borderRadius: 6 }}>
                                    {formatVND(item.unit_cost)} / {item.unit}
                                  </strong>
                                </td>
                                <td style={{ fontWeight: 700 }}>{formatVND(item.qty_remaining * item.unit_cost)}</td>
                                <td>
                                  <div className="table-actions">
                                    <button className="btn btn-ghost btn-icon btn-sm" title="Sửa thông tin & Đơn giá vốn trực tiếp" onClick={() => handleEditItem(item)}><Edit size={16} /></button>
                                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => { if(confirm('Xóa nguyên liệu này?')) deleteItem(item.item_id) }}><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </Fragment>
                        )
                      })

                      if (totalRendered === 0) {
                        return (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-secondary)' }}>
                              🔍 Không tìm thấy mặt hàng nào phù hợp với bộ lọc/tìm kiếm.
                            </td>
                          </tr>
                        )
                      }

                      return rows
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bảng lịch sử các đợt nhập hàng */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Lịch Sử Nhập Hàng, Phí Ship & Quà Tặng ({purchaseReceipts.length} đợt)</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ngày nhập</th>
                      <th>Nguyên liệu</th>
                      <th>SL mua</th>
                      <th>🎁 Quà tặng</th>
                      <th>Tổng nhận</th>
                      <th>Tổng tiền đã trả</th>
                      <th>Giá vốn thực tế</th>
                      <th>Nơi bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseReceipts.map(receipt => (
                      <tr key={receipt.receipt_id}>
                        <td style={{ fontWeight: 600 }}>{receipt.date}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{receipt.item_name || (receipt.items_list && receipt.items_list.map(r => r.variety || r.item_name).join(', ')) || 'Cây giống / Vật tư'}</div>
                          {receipt.gift_item_id && (
                            <div style={{ fontSize: 12, color: 'var(--color-primary-700)', fontWeight: 600 }}>
                              🎁 Tặng: {receipt.gift_qty} quà tặng khác
                            </div>
                          )}
                        </td>
                        <td>{receipt.qty} {receipt.unit}</td>
                        <td>
                          {receipt.bonus_qty > 0 ? (
                            <span className="badge badge-success">+{receipt.bonus_qty} {receipt.unit}</span>
                          ) : '—'}
                        </td>
                        <td><strong>{receipt.total_received_qty || receipt.qty} {receipt.unit}</strong></td>
                        <td style={{ fontWeight: 700, color: 'var(--color-danger)' }}>{formatVND(receipt.total_cost)}</td>
                        <td>
                          <span className="badge badge-success" style={{ fontSize: 13, fontWeight: 700 }}>
                            {formatVND(receipt.effective_unit_cost)} / {receipt.unit}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{receipt.supplier || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TAB 2: CHẾ BIẾN & DÒNG CHẢY VI SINH === */}
      {activeTab === 'production' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Repeat Banner & Recipe Chips */}
          <div className="card" style={{ background: 'var(--color-primary-50)', border: '1.5px solid var(--color-primary-200)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary-900)' }}>
                  ⚡ CHỌN CÔNG THỨC MẪU ĐỂ GHI MẺ NHANH (2 CHẠM):
                </h3>
                {latestBatch && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={handleRepeatLatestBatch}
                    style={{ fontWeight: 700, background: '#d97706', color: '#ffffff' }}
                  >
                    <RotateCcw size={14} /> 🔁 Lặp lại mẻ gần nhất ({latestBatch.purpose})
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {PRESET_RECIPES.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => { handleSelectRecipe(recipe); setShowProductionForm(true) }}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid var(--color-primary-200)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-600)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-primary-200)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 20 }}>{recipe.icon}</span>
                      <strong style={{ fontSize: 14, color: 'var(--color-primary-900)' }}>{recipe.name}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      {recipe.materialsText}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-success" style={{ fontSize: 11 }}>{recipe.tag}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-700)' }}>{recipe.unit_cost_estimate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nhật ký các mẻ đã làm */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Nhật Ký Chế Biến & Dòng Chảy Đã Ghi Nhận</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {latestBatch && (
                  <button className="btn btn-warning btn-sm" onClick={handleRepeatLatestBatch} style={{ fontWeight: 700, background: '#d97706', color: '#fff' }}>
                    <RotateCcw size={14} /> 🔁 Lặp lại mẻ gần nhất
                  </button>
                )}
                <button className="btn btn-primary btn-sm" onClick={() => setShowProductionForm(true)}>
                  <Play size={14} /> + Ghi mẻ mới
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Công đoạn / Mục đích</th>
                      <th>Nguyên liệu xuất dùng</th>
                      <th>SL xuất</th>
                      <th>Chi phí nguyên liệu</th>
                      <th>Sản phẩm thu được / Mục đích</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionLogs.map(log => {
                      const isLogConsumption = !log.output_qty || log.output_qty <= 0 || log.target_code === 'TP_NHADAM_CAY' || log.target_code === 'NOIBO_RACBEP'
                      return (
                        <tr key={log.log_id}>
                          <td style={{ fontWeight: 600 }}>{log.date}</td>
                          <td><span className="badge badge-success" style={{ fontSize: 13 }}>{log.purpose}</span></td>
                          <td><strong>{log.material_name}</strong></td>
                          <td><strong>{log.qty_out} {log.unit}</strong></td>
                          <td style={{ fontWeight: 700, color: 'var(--color-danger)' }}>{formatVND(log.total_cost)}</td>
                          <td>
                            {isLogConsumption ? (
                              <span className="badge badge-success" style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-800)', fontSize: 12 }}>
                                💧 {log.target_name || log.purpose} (Đã dùng cho vườn)
                              </span>
                            ) : (
                              <span className="badge badge-info">
                                {log.target_name} ({log.output_qty} {log.output_unit})
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TAB 3: THU HOẠCH & KHO NÔNG SẢN VƯỜN === */}
      {activeTab === 'harvest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Thẻ thống kê sản lượng thu hoạch & kho bán */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green"><Leaf size={24} /></div>
              <div className="stat-info">
                <h3>{products.find(p => p.product_type === 'Lá tươi')?.qty_in_stock || 0} kg</h3>
                <p>Tồn kho Lá tươi sẵn sàng bán</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon blue"><Sprout size={24} /></div>
              <div className="stat-info">
                <h3>{products.find(p => p.product_type === 'Cây giống')?.qty_in_stock || 0} cây</h3>
                <p>Tồn kho Cây giống con</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon yellow"><TrendingUp size={24} /></div>
              <div className="stat-info">
                <h3>{totalHarvestKg} kg</h3>
                <p>Tổng sản lượng lá đã cắt ({totalHarvestLeaves} bẹ)</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple"><Warehouse size={24} /></div>
              <div className="stat-info">
                <h3>{harvestLogs.length} đợt</h3>
                <p>Số đợt thu hoạch từ các lô</p>
              </div>
            </div>
          </div>

          {/* Bảng 1: Lịch sử Các Đợt Thu Hoạch Từ Vườn Nhập Vào Kho */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={20} style={{ color: '#16a34a' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>🌾 Lịch Sử Các Đợt Thu Hoạch Từ Lô Vườn Vào Kho Thành Phẩm</h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: 13, fontWeight: 700 }}>
                Tổng: {totalHarvestKg} kg lá tươi · {totalHarvestSeedlings} cây giống con
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {harvestLogs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Sprout size={40} style={{ margin: '0 auto 12px', color: 'var(--color-primary-300)' }} />
                  <p style={{ fontWeight: 600, fontSize: 15 }}>Chưa có đợt thu hoạch nào được ghi nhận.</p>
                  <p style={{ fontSize: 13 }}>Khi bạn vào trang Chi tiết Lô cây và bấm "Xác nhận thu hoạch", thông tin ngày thu, số kg và số bẹ sẽ tự động hiển thị tại đây!</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ngày thu</th>
                        <th>Lô xuất xứ</th>
                        <th>Sản lượng thu được</th>
                        <th>Quy cách / Số bẹ</th>
                        <th>Cây giống con tách gốc</th>
                        <th>Luân chuyển kho</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {harvestLogs.map(h => {
                        const plotInfo = plots.find(p => String(p.plot_id) === String(h.plot_id))
                        return (
                          <tr key={h.task_id}>
                            <td style={{ fontWeight: 700 }}>{formatDate(h.execute_date)}</td>
                            <td>
                              <strong style={{ color: 'var(--color-primary-800)' }}>
                                🌿 {plotInfo?.name || `Lô #${h.plot_id || 'vườn'}`}
                              </strong>
                            </td>
                            <td>
                              <strong style={{ color: '#16a34a', fontSize: 15 }}>
                                {parseFloat(h.harvest_qty_kg) > 0 ? `${h.harvest_qty_kg} kg lá tươi` : '—'}
                              </strong>
                            </td>
                            <td>
                              {h.harvest_leaves ? <span className="badge badge-info">{h.harvest_leaves} bẹ lá</span> : '—'}
                            </td>
                            <td>
                              {parseInt(h.harvest_seedling_qty) > 0 ? (
                                <strong style={{ color: '#2563eb' }}>🌱 +{h.harvest_seedling_qty} cây con</strong>
                              ) : (
                                '0'
                              )}
                            </td>
                            <td>
                              <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                                ➔ Đã tự động nhập Kho Bán hàng
                              </span>
                            </td>
                            <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                              {h.notes || h.task_name}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Bảng 2: Lịch sử Xuất Cây Giống & Vật Tư Ra Luống Canh Tác */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>🌱 Lịch Sử Xuất Cây Giống & Vật Tư Xuống Luống Canh Tác</h3>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {plantingLogs.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <p style={{ fontSize: 14 }}>Chưa có ghi nhận xuất cây giống nào.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ngày xuất</th>
                        <th>Vật tư / Cây giống</th>
                        <th>Số lượng xuất</th>
                        <th>Lô tiếp nhận</th>
                        <th>Mục đích sử dụng</th>
                        <th>Đơn giá vốn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plantingLogs.map(p => (
                        <tr key={p.log_id}>
                          <td style={{ fontWeight: 600 }}>{p.date}</td>
                          <td><strong>🌱 {p.material_name}</strong></td>
                          <td><strong style={{ color: 'var(--color-danger)', fontSize: 15 }}>-{p.qty_out} {p.unit}</strong></td>
                          <td><span className="badge badge-info">{p.target_name || p.purpose}</span></td>
                          <td>{p.purpose}</td>
                          <td>{formatVND(p.unit_cost)}/{p.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === TAB 4: SỔ NHẬT KÝ NHẬP - XUẤT TOÀN VƯỜN === */}
      {activeTab === 'ledger' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📜 Sổ Nhật Ký Nhập - Xuất - Tồn Toàn Vườn (Dòng Chảy Thời Gian Thực)</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                Tổng hợp mọi hoạt động: Nhập mua vật tư, Xuất trồng cây, Chế biến vi sinh, Thu hoạch nông sản & Bán hàng
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleClearAllPlantingLogs}
                style={{ color: '#d97706', borderColor: '#fde68a', fontWeight: 600 }}
                title="Xóa nhanh toàn bộ các dòng xuất trồng thử nghiệm và hoàn lại số cây vào kho"
              >
                🧹 Dọn sạch dòng Xuất Trồng thử nghiệm
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (confirm('🧹 Bạn có chắc muốn xóa sạch toàn bộ lịch sử trong sổ nhật ký và reset dữ liệu test về 0 để nhập mới không?')) {
                    localStorage.clear()
                    window.location.reload()
                  }
                }}
                style={{ color: 'var(--color-danger)', border: '1px dashed var(--color-danger)', fontWeight: 600 }}
                title="Xóa trắng sổ nhật ký và đưa toàn bộ kho về 0"
              >
                🧹 Xóa trắng sổ nhật ký & Dữ liệu test
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại nghiệp vụ</th>
                    <th>Tên hàng / Vật tư</th>
                    <th>Số lượng</th>
                    <th>Nguồn gốc ➔ Nơi đến</th>
                    <th>Chi phí / Doanh thu</th>
                    <th>Ghi chú</th>
                    <th style={{ width: 110, textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Lịch sử nhập mua */}
                  {purchaseReceipts && purchaseReceipts.map(r => (
                    <tr key={`p_${r.receipt_id}`}>
                      <td style={{ fontWeight: 600 }}>{formatDate(r.date)}</td>
                      <td><span className="badge badge-primary" style={{ background: '#eff6ff', color: '#1e40af' }}>📥 Nhập mua hàng</span></td>
                      <td><strong>{r.item_name || 'Vật tư'}</strong></td>
                      <td>
                        <strong style={{ color: '#16a34a' }}>
                          {(() => {
                            if (r.items_list && Array.isArray(r.items_list) && r.items_list.length > 0) {
                              const distinctUnits = [...new Set(r.items_list.map(i => i.unit).filter(Boolean))]
                              if (distinctUnits.length === 1) {
                                return `+${r.total_received_qty || r.qty} ${distinctUnits[0]}`
                              }
                              return `+${r.items_list.length} món (${r.items_list.map(i => `${i.total_received_qty || i.qty} ${i.unit}`).join(', ')})`
                            }
                            return `+${r.total_received_qty || r.qty} ${r.unit || 'món'}`
                          })()}
                        </strong>
                      </td>
                      <td>NCC: {r.supplier || 'Chưa rõ'} ➔ Kho</td>
                      <td style={{ color: 'var(--color-danger)', fontWeight: 700 }}>-{formatVND(r.total_cost)}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{r.notes || `Đợt ${r.receipt_id}`}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditReceipt(r)}
                            style={{ fontSize: 11, padding: '3px 8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Chỉnh sửa phiếu nhập này"
                          >
                            <Edit size={13} /> Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleDeleteReceipt(r.receipt_id)}
                            style={{ color: '#ef4444' }}
                            title="Xóa phiếu nhập này"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* 2. Lịch sử thu hoạch */}
                  {harvestLogs.map(h => {
                    const plotInfo = plots.find(p => String(p.plot_id) === String(h.plot_id))
                    return (
                      <tr key={`h_${h.task_id}`}>
                        <td style={{ fontWeight: 600 }}>{formatDate(h.execute_date)}</td>
                        <td><span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534' }}>🌾 Thu hoạch vườn</span></td>
                        <td><strong>Lá nha đam tươi ({h.harvest_leaves ? `${h.harvest_leaves} bẹ` : 'cắt tỉa'})</strong></td>
                        <td><strong style={{ color: '#16a34a', fontSize: 14 }}>+{h.harvest_qty_kg} kg</strong></td>
                        <td>{plotInfo?.name || `Lô #${h.plot_id}`} ➔ Kho thành phẩm</td>
                        <td style={{ color: '#16a34a', fontWeight: 700 }}>+Sản phẩm</td>
                        <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{h.notes || h.task_name}</td>
                        <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 11 }}>—</td>
                      </tr>
                    )
                  })}

                  {/* 3. Lịch sử xuất chế biến & trồng cây & thu hoạch & quà tặng */}
                  {productionLogs.map(log => {
                    const pLower = (log.purpose || '').toLowerCase()
                    const isHarvest = pLower.includes('thu hoạch')
                    const isPlanting = pLower.includes('xuất trồng') || pLower.includes('xuống giống')
                    const isWaste = pLower.includes('hao hụt') || pLower.includes('hỏng')
                    const isGift = pLower.includes('tặng') || log.target_code === 'QUATANG_KHACH'
                    const isImo4 = pLower.includes('imo4') || pLower.includes('imo 4') || log.target_code === 'BTP_IMO4'
                    const isImo = !isImo4 && (pLower.includes('imo') || log.target_code === 'BTP_IMO')
                    const isDotTrau = pLower.includes('đốt tro') || pLower.includes('tro trấu') || log.target_code === 'NL06'
                    const isWatering = pLower.includes('tưới') || log.target_code === 'TP_NHADAM_CAY'
                    const isEm = pLower.includes('em gốc') || pLower.includes('em1') || pLower.includes('em2') || log.target_code?.includes('EM')
                    const isGe = pLower.includes('ge ') || log.target_code?.includes('GE')

                    let badgeColor = '#f1f5f9'
                    let textColor = '#334155'
                    let badgeLabel = '⚡ Chế biến vi sinh'

                    if (isHarvest) {
                      badgeColor = '#dcfce7'
                      textColor = '#166534'
                      badgeLabel = '🌾 Thu hoạch vườn'
                    } else if (isPlanting) {
                      badgeColor = '#fef3c7'
                      textColor = '#b45309'
                      badgeLabel = '🌱 Xuất trồng vườn'
                    } else if (isImo4) {
                      badgeColor = '#dbeafe'
                      textColor = '#1e40af'
                      badgeLabel = '🌱 Làm men IMO4'
                    } else if (isImo) {
                      badgeColor = '#ede9fe'
                      textColor = '#6d28d9'
                      badgeLabel = '🌱 Nhân giống IMO'
                    } else if (isDotTrau) {
                      badgeColor = '#ffedd5'
                      textColor = '#c2410c'
                      badgeLabel = '🔥 Đốt tro trấu'
                    } else if (isWatering) {
                      badgeColor = '#e0f2fe'
                      textColor = '#0369a1'
                      badgeLabel = '💧 Tưới & Dưỡng cây'
                    } else if (isEm) {
                      badgeColor = '#f0fdf4'
                      textColor = '#15803d'
                      badgeLabel = '🧪 Sản xuất EM'
                    } else if (isGe) {
                      badgeColor = '#fdf4ff'
                      textColor = '#a21caf'
                      badgeLabel = '✨ Sản xuất GE'
                    } else if (isWaste) {
                      badgeColor = '#fee2e2'
                      textColor = '#991b1b'
                      badgeLabel = '📉 Hao hụt / Hỏng kho'
                    } else if (isGift) {
                      badgeColor = '#fdf2f8'
                      textColor = '#be185d'
                      badgeLabel = '🎁 Xuất tặng khách'
                    }

                    return (
                      <tr key={`pr_${log.log_id}`}>
                        <td style={{ fontWeight: 600 }}>{formatDate(log.date)}</td>
                        <td>
                          <span className="badge" style={{ background: badgeColor, color: textColor, fontWeight: 700 }}>
                            {badgeLabel}
                          </span>
                        </td>
                        <td><strong>{log.material_name}</strong></td>
                        <td>
                          {isHarvest ? (
                            <strong style={{ color: '#16a34a', fontSize: 14 }}>
                              +{log.output_qty || log.qty_out} {log.output_unit || 'kg'}
                            </strong>
                          ) : (
                            <strong style={{ color: isGift ? '#be185d' : 'var(--color-danger)' }}>
                              -{log.qty_out} {log.unit}
                            </strong>
                          )}
                        </td>
                        <td>{isHarvest ? `${log.material_name} ➔ Kho thành phẩm` : `Kho ➔ ${log.target_name || log.purpose}`}</td>
                        <td style={{ color: isHarvest ? '#16a34a' : (isGift ? '#be185d' : 'var(--color-danger)'), fontWeight: 700 }}>
                          {isHarvest ? '+Nông sản' : `-${formatVND(log.total_cost)}`}
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{log.purpose}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => handleDeleteProductionLog(log)}
                            style={{ color: '#ef4444' }}
                            title="Xóa dòng nhật ký này & hoàn lại số lượng vào tồn kho"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL GHI MẺ CHẾ BIẾN SIÊU TỐC (2 CHẠM) === */}
      {showProductionForm && (
        <div className="modal-overlay" onClick={() => setShowProductionForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2>⚡ Ghi Mẻ Chế Biến / Xuất Dùng</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowProductionForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <label className="form-label" style={{ fontWeight: 700 }}>1. Chọn công thức chế biến mẫu:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 16 }}>
                {PRESET_RECIPES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRecipe(r)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      textAlign: 'left',
                      border: selectedRecipe.id === r.id ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      background: selectedRecipe.id === r.id ? 'var(--color-primary-50)' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{r.icon}</div>
                    <strong style={{ fontSize: 13, display: 'block', color: selectedRecipe.id === r.id ? 'var(--color-primary-900)' : 'var(--color-text-primary)' }}>{r.name}</strong>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{r.tag}</div>
                  </button>
                ))}
              </div>

              {/* Chi tiết công thức đã chọn & Điều chỉnh số lượng */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary-900)' }}>
                      {selectedRecipe.icon} {selectedRecipe.name}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedRecipe.desc}</p>
                  </div>
                </div>

                {/* Điều chỉnh quy mô mẻ */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Quy mô / Số đợt:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMultiplierChange(-0.5)} style={{ width: 32, height: 32, padding: 0 }}>-</button>
                    <strong style={{ fontSize: 16, minWidth: 40, textAlign: 'center' }}>{batchMultiplier} {selectedRecipe.is_consumption ? 'đợt' : 'mẻ'}</strong>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleMultiplierChange(0.5)} style={{ width: 32, height: 32, padding: 0 }}>+</button>
                  </div>
                </div>

                {/* Dòng xuất vật tư & Thu thành phẩm / Mục đích tiêu thụ */}
                <div className="grid-2" style={{ gap: 10 }}>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>TỰ ĐỘNG XUẤT NGUYÊN LIỆU:</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                      {customQtyOut} {selectedRecipe.unit}
                    </div>
                    <div style={{ fontSize: 12, color: '#7f1d1d' }}>{selectedRecipe.material_code === 'NL01' ? 'Mật rỉ đường (trừ kho ngay)' : 'GE Nha đam (trừ kho ngay)'}</div>
                  </div>

                  {selectedRecipe.is_consumption ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>MỤC ĐÍCH SỬ DỤNG / TIÊU THỤ:</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginTop: 4 }}>
                        🌱 {selectedRecipe.target_name}
                      </div>
                      <div style={{ fontSize: 12, color: '#14532d' }}>Phân bổ chăm sóc cây (không tạo tồn kho mới)</div>
                    </div>
                  ) : (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>SẢN PHẨM THU ĐƯỢC:</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                        {customOutputQty} {selectedRecipe.output_unit}
                      </div>
                      <div style={{ fontSize: 12, color: '#14532d' }}>{selectedRecipe.target_name}</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowProductionForm(false)}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 2, fontWeight: 700, fontSize: 15 }} onClick={handleConfirmProduction}>
                  ✅ Xác nhận {selectedRecipe.is_consumption ? 'xuất dùng' : 'ghi mẻ'} (Chạm 2)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL NHẬP HÀNG ĐA QUY CÁCH (1 ĐƠN NHIỀU LOẠI / KÍCH CỠ) === */}
      {showPurchaseForm && (() => {
        const totalGoodsCost = purchaseForm.items_list.reduce((sum, row) => sum + ((parseFloat(row.qty) || 0) * (parseFloat(row.unit_price) || 0)), 0)
        const totalReceivedQty = purchaseForm.items_list.reduce((sum, row) => sum + (parseFloat(row.qty) || 0) + (parseFloat(row.bonus_qty) || 0), 0)
        const calcTotalPaid = Math.max(0, totalGoodsCost + (parseFloat(purchaseForm.shipping_cost) || 0) - (parseFloat(purchaseForm.discount_amount) || 0))
        const finalTotalPaid = purchaseForm.is_manual_total && purchaseForm.total_paid ? parseFloat(purchaseForm.total_paid) : calcTotalPaid
        const avgUnitCost = totalReceivedQty > 0 ? Math.round(finalTotalPaid / totalReceivedQty) : 0

        return (
          <div className="modal-overlay" onClick={() => setShowPurchaseForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
              <div className="modal-header">
                <div>
                  <h2>{editingReceiptId ? `✏️ Chỉnh sửa Đơn Nhập Hàng [Đợt ${editingReceiptId}]` : '🚚 Nhập Đơn Hàng Mới (Đa Quy Cách & Voucher)'}</h2>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {editingReceiptId ? 'Cập nhật lại số lượng, đơn giá, chi phí hoặc quà tặng và tự động đồng bộ tồn kho' : 'Nhập 1 đơn lớn có nhiều kích cỡ, quà tặng kèm, phí ship và voucher giảm tiền'}
                  </p>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => { setShowPurchaseForm(false); resetPurchaseForm(); }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSavePurchase}>
                <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  {/* Thông tin đơn nhập */}
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">📅 Ngày nhập kho <span className="form-required">*</span>:</label>
                      <input
                        className="form-input"
                        type="date"
                        value={purchaseForm.date}
                        onChange={e => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1.5 }}>
                      <label className="form-label">🏢 Nơi mua / Nhà cung cấp <span className="form-required">*</span>:</label>
                      <input
                        className="form-input"
                        list="supplier-presets"
                        value={purchaseForm.supplier}
                        onChange={e => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                        placeholder="VD: Vương Trùn Quế / Vườn giống Ninh Thuận..."
                        required
                      />
                      <datalist id="supplier-presets">
                        <option value="Vương Trùn Quế (034.981.6802)" />
                        <option value="Vườn giống Ninh Thuận" />
                        <option value="Nguồn vật tư tổng hợp" />
                        <option value="Nội bộ vườn" />
                      </datalist>
                    </div>
                  </div>

                  {/* Danh sách các dòng mặt hàng / kích cỡ */}
                  <div style={{ marginTop: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                        📦 Danh mục mặt hàng, phân thuốc & kích cỡ trong đơn:
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleAddItemRow}
                        style={{ color: 'var(--color-primary-700)', fontWeight: 700 }}
                      >
                        <Plus size={16} /> + Thêm chủng loại / kích cỡ khác
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {purchaseForm.items_list.map((row, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8,
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10
                          }}
                        >
                          {/* Hàng 1: Nhóm vật tư -> Tên giống / Tên thuốc cụ thể -> Kích cỡ / Quy cách -> ĐVT -> Nút Xóa */}
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--color-primary-700)', fontSize: 13, minWidth: 24 }}>
                              #{idx + 1}
                            </span>

                            {/* 1. Chọn Nhóm vật tư trong kho */}
                            <div style={{ flex: 1.2, minWidth: 150 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-900)', display: 'block', marginBottom: 2 }}>
                                🏷️ Nhóm vật tư:
                              </label>
                              <select
                                className="form-select"
                                value={row.item_id || 'NL07'}
                                onChange={e => handleUpdateItemRow(idx, 'item_id', e.target.value)}
                                style={{ fontWeight: 600 }}
                              >
                                {grouped.seedlingItems.length > 0 && (
                                  <optgroup label="🌱 1. CÂY GIỐNG NHA ĐAM (A-Z)">
                                    {grouped.seedlingItems.map(i => (
                                      <option key={i.item_id} value={i.item_id}>
                                        {i.item_name} — {formatVND(i.unit_cost)}/{i.unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                {grouped.vtqItems.length > 0 && (
                                  <optgroup label="🪱 2. SẢN PHẨM VƯƠNG TRÙN QUẾ (034.981.6802) (A-Z)">
                                    {grouped.vtqItems.map(i => (
                                      <option key={i.item_id} value={i.item_id}>
                                        {i.item_name} — {formatVND(i.unit_cost)}/{i.unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                {grouped.bioItems.length > 0 && (
                                  <optgroup label="🧪 3. MEN VI SINH & CHẾ PHẨM SINH HỌC (A-Z)">
                                    {grouped.bioItems.map(i => (
                                      <option key={i.item_id} value={i.item_id}>
                                        {i.item_name} — {formatVND(i.unit_cost)}/{i.unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                {grouped.fertItems.length > 0 && (
                                  <optgroup label="🌿 4. PHÂN BÓN & DINH DƯỠNG HỮU CƠ (A-Z)">
                                    {grouped.fertItems.map(i => (
                                      <option key={i.item_id} value={i.item_id}>
                                        {i.item_name} — {formatVND(i.unit_cost)}/{i.unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                {grouped.pestItems.length > 0 && (
                                  <optgroup label="🛡️ 5. THUỐC BVTV & THẢO MỘC TRỪ SÂU (A-Z)">
                                    {grouped.pestItems.map(i => (
                                      <option key={i.item_id} value={i.item_id}>
                                        {i.item_name} — {formatVND(i.unit_cost)}/{i.unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                {grouped.otherItems.length > 0 && (
                                  <optgroup label="📦 6. NGUYÊN LIỆU & PHỤ PHẨM KHÁC (A-Z)">
                                    {grouped.otherItems.map(i => (
                                      <option key={i.item_id} value={i.item_id}>
                                        {i.item_name} — {formatVND(i.unit_cost)}/{i.unit}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                <option value="CUSTOM">➕ Loại khác (tự ghi)...</option>
                              </select>
                            </div>

                            {/* 2. Tên giống / Tên thuốc cụ thể (Nha đam Mỹ, Nha đam Thái, Thuốc BT...) */}
                            <div style={{ flex: 1.5, minWidth: 160 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-800)', display: 'block', marginBottom: 2 }}>
                                🌿 Tên giống / Tên thuốc cụ thể:
                              </label>
                              <input
                                className="form-input"
                                value={row.variety || ''}
                                onChange={e => handleUpdateItemRow(idx, 'variety', e.target.value)}
                                placeholder="VD: Nha đam Mỹ / Nha đam Thái / Thuốc BT / Dầu neem..."
                                required
                              />
                            </div>

                            {/* 3. Kích cỡ / Quy cách chi tiết (Hỗ trợ chọn size cm) */}
                            <div style={{ flex: 1.2, minWidth: 140 }}>
                              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                                📏 Kích cỡ size (cm) / Quy cách:
                              </label>
                              <input
                                className="form-input"
                                list={`size-options-${idx}`}
                                value={row.spec || ''}
                                onChange={e => handleUpdateItemRow(idx, 'spec', e.target.value)}
                                placeholder="VD: Size 25 - 30 cm..."
                              />
                              <datalist id={`size-options-${idx}`}>
                                <option value="Size 5 - 10 cm (Cây con mới tách)" />
                                <option value="Size 10 - 15 cm (Cây con dưỡng bầu)" />
                                <option value="Size 15 - 20 cm (Cây giống chuẩn)" />
                                <option value="Size 20 - 25 cm (Cây giống phát triển)" />
                                <option value="Size 25 - 30 cm (Cây giống lớn)" />
                                <option value="Size 30 - 35 cm" />
                                <option value="Size 35 - 40 cm" />
                                <option value="Size > 40 cm (Cây mẹ lấy giống)" />
                                <option value="Cây con 5 - 10 cm" />
                                <option value="Cây con 10 - 15 cm" />
                                <option value="Cây giống 15 - 20 cm" />
                                <option value="Bầu ươm dưỡng rễ" />
                              </datalist>
                            </div>

                            {/* 4. Đơn vị tính */}
                            <div style={{ width: 85 }}>
                              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                                Đơn vị:
                              </label>
                              <select
                                className="form-select"
                                value={row.unit}
                                onChange={e => handleUpdateItemRow(idx, 'unit', e.target.value)}
                              >
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </div>

                            {/* 5. Nút Xóa */}
                            <div style={{ alignSelf: 'flex-end', paddingBottom: 2 }}>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => handleRemoveItemRow(idx)}
                                style={{ color: 'var(--color-danger)' }}
                                title="Xóa dòng này"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Hàng 2: Số lượng mua -> Quà tặng -> Đơn giá -> Thành tiền */}
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
                            <div style={{ flex: 1, minWidth: 110 }}>
                              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                                Số lượng mua:
                              </label>
                              <input
                                className="form-input"
                                type="number"
                                step="any"
                                min="0"
                                value={row.qty}
                                onChange={e => handleUpdateItemRow(idx, 'qty', parseFloat(e.target.value) || 0)}
                                placeholder="SL mua"
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: 110 }}>
                              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                                🎁 Tặng kèm:
                              </label>
                              <input
                                className="form-input"
                                type="number"
                                step="any"
                                min="0"
                                value={row.bonus_qty}
                                onChange={e => handleUpdateItemRow(idx, 'bonus_qty', parseFloat(e.target.value) || 0)}
                                placeholder="SL tặng"
                              />
                            </div>

                            <div style={{ flex: 1.2, minWidth: 120 }}>
                              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                                Đơn giá mua (đ):
                              </label>
                              <input
                                className="form-input"
                                type="number"
                                step="100"
                                min="0"
                                value={row.unit_price}
                                onChange={e => handleUpdateItemRow(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                placeholder="Đơn giá"
                              />
                            </div>

                            <div style={{ flex: 1.2, minWidth: 130, textAlign: 'right' }}>
                              <label style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                                Thành tiền:
                              </label>
                              <span style={{ fontWeight: 800, color: 'var(--color-primary-800)', fontSize: 14 }}>
                                {formatVND((parseFloat(row.qty) || 0) * (parseFloat(row.unit_price) || 0))}
                              </span>
                              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                                Thực nhận: {(parseFloat(row.qty) || 0) + (parseFloat(row.bonus_qty) || 0)} {row.unit}
                              </div>
                            </div>
                          </div>

                          {/* Hàng 3: Ô Ghi chú riêng cho mặt hàng này */}
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px' }}>
                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                              📝 Ghi chú dòng:
                            </span>
                            <input
                              className="form-input"
                              value={row.row_notes || ''}
                              onChange={e => handleUpdateItemRow(idx, 'row_notes', e.target.value)}
                              placeholder="VD: Cây mẹ giống F1 Ninh Thuận rễ mập / Thuốc vi sinh trừ sâu xanh, bọ trĩ / Quà tặng..."
                              style={{ border: 'none', background: 'transparent', padding: '2px 4px', fontSize: 12, height: 28 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chi phí, Giảm giá & Tổng thanh toán */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                    <div className="form-row" style={{ alignItems: 'center' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: 12 }}>🚚 Phí vận chuyển (VND):</label>
                        <input
                          className="form-input"
                          type="number"
                          step="100"
                          value={purchaseForm.shipping_cost}
                          onChange={e => setPurchaseForm({ ...purchaseForm, shipping_cost: parseFloat(e.target.value) || 0 })}
                        />
                      </div>

                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: 12, color: 'var(--color-danger)' }}>
                          🎟️ Giảm giá / Voucher / Chiết khấu (VND):
                        </label>
                        <input
                          className="form-input"
                          type="number"
                          step="100"
                          value={purchaseForm.discount_amount}
                          onChange={e => setPurchaseForm({ ...purchaseForm, discount_amount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          Tiền hàng: <strong>{formatVND(totalGoodsCost)}</strong> · Tổng thực nhận: <strong>{totalReceivedQty} cây/vật tư</strong>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-primary-800)', marginTop: 2 }}>
                          💡 Giá vốn bình quân thực tế: <strong>{formatVND(avgUnitCost)} / cây</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Tổng thanh toán thực tế:</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-700)' }}>
                          {formatVND(finalTotalPaid)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ghi chú chung đợt nhập:</label>
                    <input
                      className="form-input"
                      value={purchaseForm.notes}
                      onChange={e => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                      placeholder="VD: Đơn nhập cây giống lớn đầu vụ, Ninh Thuận hỗ trợ 15 cây con và voucher 200k..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowPurchaseForm(false); resetPurchaseForm(); }}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                    {editingReceiptId
                      ? `💾 Cập nhật Đơn Nhập [Đợt ${editingReceiptId}] (${totalReceivedQty} cây/vật tư)`
                      : `✅ Lưu Đơn Nhập (${totalReceivedQty} cây/vật tư · ${formatVND(finalTotalPaid)})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}

      {/* === MODAL THÊM / SỬA VẬT LIỆU TRỰC TIẾP === */}
      {showItemForm && (
        <div className="modal-overlay" onClick={() => resetItemForm()}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>{editingItem ? '✏️ Sửa Nguyên Vật Liệu' : '➕ Thêm Mới'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => resetItemForm()}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên vật liệu:</label>
                  <input className="form-input" value={itemForm.item_name} onChange={e => setItemForm({...itemForm, item_name: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phân loại:</label>
                    <select className="form-select" value={itemForm.item_type} onChange={e => setItemForm({...itemForm, item_type: e.target.value})}>
                      {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn vị tính:</label>
                    <input
                      className="form-input"
                      list="unit-list-presets"
                      value={itemForm.unit}
                      onChange={e => setItemForm({...itemForm, unit: e.target.value})}
                      placeholder="cm, cây, kg, lít..."
                      required
                    />
                    <datalist id="unit-list-presets">
                      {UNITS.map(u => <option key={u} value={u} />)}
                    </datalist>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tổng nhập:</label>
                    <input className="form-input" type="number" step="0.1" value={itemForm.qty_in} onChange={e => setItemForm({...itemForm, qty_in: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn giá vốn trực tiếp (VND):</label>
                    <input className="form-input" type="number" value={itemForm.unit_cost} onChange={e => setItemForm({...itemForm, unit_cost: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => resetItemForm()}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL BẢNG TÍNH GIÁ THÀNH === */}
      {showCostingModal && (
        <div className="modal-overlay" onClick={() => setShowCostingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>💲 Bảng Giá Thành Sản Phẩm Tự Động</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCostingModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                Giá vốn các chế phẩm vi sinh được tính toán tự động dựa trên chi phí Mật rỉ đường + Men vi sinh gốc đã nhập.
              </p>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sản phẩm / Chế phẩm</th>
                      <th>Công thức cấu thành</th>
                      <th>Giá vốn tự tính</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>🧪 EM gốc</strong></td>
                      <td>10kg Mật rỉ (100k) + 1L Men gốc (50k) ➔ 20L</td>
                      <td><strong style={{ color: 'var(--color-primary-700)' }}>7.500đ / Lít</strong></td>
                    </tr>
                    <tr>
                      <td><strong>🌿 EM2 (Thứ cấp)</strong></td>
                      <td>5kg Mật rỉ (50k) + 2L EM gốc (15k) ➔ 50L</td>
                      <td><strong style={{ color: 'var(--color-primary-700)' }}>1.300đ / Lít</strong></td>
                    </tr>
                    <tr>
                      <td><strong>✨ GE Nha Đam</strong></td>
                      <td>2kg Mật rỉ (20k) + 5L EM2 (6.5k) + 10kg Bã nha đam (50k) ➔ 30L</td>
                      <td><strong style={{ color: 'var(--color-primary-700)' }}>2.550đ / Lít</strong></td>
                    </tr>
                    <tr>
                      <td><strong>🌱 IMO Bản Địa</strong></td>
                      <td>8kg Mật rỉ (80k) + 5kg Cám gạo (75k) ➔ 30kg</td>
                      <td><strong style={{ color: 'var(--color-primary-700)' }}>5.167đ / kg</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowCostingModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL BÁO CÁO NHẬP XUẤT TỒN === */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>📊 Báo Cáo Nhập — Xuất — Tồn Kho</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowReportModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vật liệu</th>
                      <th>Nhập</th>
                      <th>Xuất</th>
                      <th>Tồn kho</th>
                      <th>Tổng giá trị tồn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(i => (
                      <tr key={i.item_id}>
                        <td><strong>{i.item_name}</strong></td>
                        <td>{i.qty_in} {i.unit}</td>
                        <td>{i.qty_out} {i.unit}</td>
                        <td><strong style={{ color: 'var(--color-primary-700)' }}>{i.qty_remaining} {i.unit}</strong></td>
                        <td style={{ fontWeight: 700 }}>{formatVND(i.qty_remaining * i.unit_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowReportModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL GHI NHẬN HAO HỤT / CHẾT HỎNG TRONG KHO (THEO ĐỢT NHẬP) === */}
      {showWasteModal && (
        <div className="modal-overlay" onClick={() => setShowWasteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>📉 Ghi Nhận Hao Hụt / Hỏng Kho (Theo Đợt)</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowWasteModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveWaste}>
              <div className="modal-body">
                {/* Chọn chế độ: Theo đợt nhập hay theo vật tư chung */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${wasteForm.mode === 'receipt' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWasteForm({ ...wasteForm, mode: 'receipt' })}
                    style={{ flex: 1, fontWeight: 700 }}
                  >
                    📦 Chọn theo Đợt nhập / Nguồn
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${wasteForm.mode === 'item' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWasteForm({ ...wasteForm, mode: 'item' })}
                    style={{ flex: 1, fontWeight: 700 }}
                  >
                    🗃️ Chọn theo Vật tư chung
                  </button>
                </div>

                {/* Nếu chọn theo ĐỢT NHẬP */}
                {wasteForm.mode === 'receipt' ? (
                  <div className="form-group">
                    <label className="form-label">Chọn Đợt nhập hàng / Nguồn giống bị hao hụt:</label>
                    <select
                      className="form-select"
                      value={wasteForm.receipt_id}
                      onChange={e => setWasteForm({ ...wasteForm, receipt_id: e.target.value })}
                    >
                      {purchaseReceipts.map(r => (
                        <option key={r.receipt_id} value={r.receipt_id}>
                          [{formatDate(r.date)}] {r.item_name} — {r.supplier || 'Nguồn không rõ'} ({r.receipt_id} · Nhập {r.total_received_qty || r.qty} {r.unit})
                        </option>
                      ))}
                    </select>

                    {/* Preview thông tin đợt nhập đang chọn */}
                    {(() => {
                      const selRec = purchaseReceipts.find(r => r.receipt_id === wasteForm.receipt_id)
                      if (!selRec) return null
                      return (
                        <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, marginTop: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            📅 Ngày nhập: <strong>{formatDate(selRec.date)}</strong> · Mã phiếu: <strong>{selRec.receipt_id}</strong>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                            🏢 Nguồn cung cấp: <strong>{selRec.supplier || 'Chưa ghi rõ'}</strong>
                          </div>
                          {selRec.notes && (
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                              📝 Quy cách / Ghi chú: <em>{selRec.notes}</em>
                            </div>
                          )}
                          <div style={{ fontSize: 12, color: 'var(--color-primary-800)', fontWeight: 700, marginTop: 4 }}>
                            💰 Đơn giá vốn đợt này: {formatVND(selRec.effective_unit_cost)} / {selRec.unit}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  /* Nếu chọn theo LOẠI VẬT TƯ CHUNG */
                  <div className="form-group">
                    <label className="form-label">Chọn nguyên vật liệu / Cây giống bị hao hụt:</label>
                    <select
                      className="form-select"
                      value={wasteForm.item_id}
                      onChange={e => setWasteForm({ ...wasteForm, item_id: e.target.value })}
                    >
                      {grouped.seedlingItems.length > 0 && (
                        <optgroup label="🌱 1. CÂY GIỐNG NHA ĐAM (A-Z)">
                          {grouped.seedlingItems.map(i => (
                            <option key={i.item_id} value={i.item_id}>
                              {i.item_name} (Hiện tồn: {i.qty_remaining} {i.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {grouped.vtqItems.length > 0 && (
                        <optgroup label="🪱 2. SẢN PHẨM VƯƠNG TRÙN QUẾ (A-Z)">
                          {grouped.vtqItems.map(i => (
                            <option key={i.item_id} value={i.item_id}>
                              {i.item_name} (Hiện tồn: {i.qty_remaining} {i.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {grouped.bioItems.length > 0 && (
                        <optgroup label="🧪 3. MEN VI SINH & CHẾ PHẨM (A-Z)">
                          {grouped.bioItems.map(i => (
                            <option key={i.item_id} value={i.item_id}>
                              {i.item_name} (Hiện tồn: {i.qty_remaining} {i.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {grouped.fertItems.length > 0 && (
                        <optgroup label="🌿 4. PHÂN BÓN & DINH DƯỠNG (A-Z)">
                          {grouped.fertItems.map(i => (
                            <option key={i.item_id} value={i.item_id}>
                              {i.item_name} (Hiện tồn: {i.qty_remaining} {i.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {grouped.pestItems.length > 0 && (
                        <optgroup label="🛡️ 5. THUỐC BVTV & THẢO MỘC (A-Z)">
                          {grouped.pestItems.map(i => (
                            <option key={i.item_id} value={i.item_id}>
                              {i.item_name} (Hiện tồn: {i.qty_remaining} {i.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {grouped.otherItems.length > 0 && (
                        <optgroup label="📦 6. VẬT TƯ & PHỤ PHẨM KHÁC (A-Z)">
                          {grouped.otherItems.map(i => (
                            <option key={i.item_id} value={i.item_id}>
                              {i.item_name} (Hiện tồn: {i.qty_remaining} {i.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số lượng bị hỏng / chết / hao hụt <span className="form-required">*</span>:</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={wasteForm.waste_qty}
                      onChange={e => setWasteForm({ ...wasteForm, waste_qty: parseFloat(e.target.value) || 0 })}
                      style={{ fontWeight: 800, color: 'var(--color-danger)', fontSize: 16 }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày ghi nhận hao hụt:</label>
                    <input
                      className="form-input"
                      type="date"
                      value={wasteForm.date}
                      onChange={e => setWasteForm({ ...wasteForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lý do hư hỏng / chết cây trong kho <span className="form-required">*</span>:</label>
                  <input
                    className="form-input"
                    value={wasteForm.reason}
                    onChange={e => setWasteForm({ ...wasteForm, reason: e.target.value })}
                    placeholder="VD: Cây giống thối rễ khi dưỡng bầu / Nắng gắt cháy lá non..."
                    required
                  />
                  <span className="form-hint">Số lượng này sẽ tự động trừ thẳng vào tồn kho và ghi rõ tên đợt nhập trong sổ nhật ký chi phí</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWasteModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)', fontWeight: 700 }}>
                  📉 Xác nhận Trừ Kho Hao Hụt Đợt Này
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL XUẤT TẶNG KHÁCH HÀNG / QUÀ BIẾU / KHUYẾN MÃI === */}
      {showGiftModal && (
        <div className="modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Gift size={22} style={{ color: '#be185d' }} />
                <h2 style={{ margin: 0 }}>🎁 Xuất Tặng / Biếu / Khuyến Mãi Khách Hàng</h2>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowGiftModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveGift}>
              <div className="modal-body">
                <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#9d174d' }}>
                  💡 <strong>Tự động trừ kho & Hạch toán quà tặng:</strong> Khi xuất tặng, kho sẽ giảm trừ chính xác số lượng và tự động ghi nhận giá vốn vào chi phí tri ân/khuyến mãi của vườn.
                </div>

                {/* Chọn mặt hàng tặng */}
                <div className="form-group">
                  <label className="form-label">Chọn sản phẩm / Cây giống xuất tặng <span className="form-required">*</span>:</label>
                  <select
                    className="form-select"
                    value={giftForm.item_id}
                    onChange={e => setGiftForm({ ...giftForm, item_id: e.target.value })}
                    style={{ fontWeight: 600 }}
                  >
                    {grouped.seedlingItems.length > 0 && (
                      <optgroup label="🌱 1. CÂY GIỐNG NHA ĐAM (A-Z)">
                        {grouped.seedlingItems.map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} (Hiện tồn kho: {i.qty_remaining} {i.unit})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {grouped.vtqItems.length > 0 && (
                      <optgroup label="🪱 2. SẢN PHẨM VƯƠNG TRÙN QUẾ (A-Z)">
                        {grouped.vtqItems.map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} (Hiện tồn kho: {i.qty_remaining} {i.unit})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {grouped.bioItems.length > 0 && (
                      <optgroup label="🧪 3. MEN VI SINH & CHẾ PHẨM (A-Z)">
                        {grouped.bioItems.map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} (Hiện tồn kho: {i.qty_remaining} {i.unit})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {grouped.fertItems.length > 0 && (
                      <optgroup label="🌿 4. PHÂN BÓN & DINH DƯỠNG (A-Z)">
                        {grouped.fertItems.map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} (Hiện tồn kho: {i.qty_remaining} {i.unit})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {grouped.pestItems.length > 0 && (
                      <optgroup label="🛡️ 5. THUỐC BVTV & THẢO MỘC (A-Z)">
                        {grouped.pestItems.map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} (Hiện tồn kho: {i.qty_remaining} {i.unit})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {grouped.otherItems.length > 0 && (
                      <optgroup label="📦 6. VẬT TƯ & PHỤ PHẨM KHÁC (A-Z)">
                        {grouped.otherItems.map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} (Hiện tồn kho: {i.qty_remaining} {i.unit})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Chọn đợt nhập kho liên kết nếu có */}
                {purchaseReceipts && purchaseReceipts.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Liên kết nguồn / Đợt giống trong kho (tùy chọn):</label>
                    <select
                      className="form-select"
                      value={giftForm.receipt_id || ''}
                      onChange={e => setGiftForm({ ...giftForm, receipt_id: e.target.value })}
                    >
                      <option value="">🌱 Không chọn đợt cụ thể (Trừ theo giá vốn bình quân kho)</option>
                      {purchaseReceipts.map(r => (
                        <option key={r.receipt_id} value={r.receipt_id}>
                          Đợt {r.receipt_id} ({formatDate(r.date)}) - {r.item_name} [{r.supplier || 'Nguồn giống'}] - Vốn: {formatVND(r.effective_unit_cost)}/{r.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Số lượng tặng & Ngày tặng */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1.2 }}>
                    <label className="form-label">Số lượng xuất tặng <span className="form-required">*</span>:</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        onClick={() => setGiftForm({ ...giftForm, gift_qty: Math.max(1, (parseFloat(giftForm.gift_qty) || 0) - 1) })}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        className="form-input"
                        type="number"
                        step="any"
                        min="1"
                        value={giftForm.gift_qty}
                        onChange={e => setGiftForm({ ...giftForm, gift_qty: parseFloat(e.target.value) || 0 })}
                        style={{ textAlign: 'center', fontWeight: 800, color: '#be185d', fontSize: 16 }}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        onClick={() => setGiftForm({ ...giftForm, gift_qty: (parseFloat(giftForm.gift_qty) || 0) + 1 })}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Ngày xuất tặng:</label>
                    <input
                      className="form-input"
                      type="date"
                      value={giftForm.date}
                      onChange={e => setGiftForm({ ...giftForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Người nhận & Ghi chú */}
                <div className="form-group">
                  <label className="form-label">Tên khách hàng / Người nhận quà <span className="form-required">*</span>:</label>
                  <input
                    className="form-input"
                    value={giftForm.recipient}
                    onChange={e => setGiftForm({ ...giftForm, recipient: e.target.value })}
                    placeholder="VD: Anh Minh (Khách quen mua 50kg lá), Chị Lan (Tặng mẫu thử)..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mục đích / Ghi chú tặng:</label>
                  <input
                    className="form-input"
                    value={giftForm.notes}
                    onChange={e => setGiftForm({ ...giftForm, notes: e.target.value })}
                    placeholder="VD: Tặng kèm tri ân khách hàng thân thiết, tặng cây con dưỡng rễ..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGiftModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#be185d', borderColor: '#be185d', fontWeight: 700 }}>
                  🎁 Xác nhận Xuất Tặng & Trừ Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DANH MỤC CÁC MẶT HÀNG CẦN NHẬP THÊM === */}
      {showLowStockModal && (
        <div className="modal-overlay" onClick={() => setShowLowStockModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 760 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    📋 Danh Mục Hàng Cần Nhập Thêm ({lowStock.length} mặt hàng)
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                    Danh sách các vật tư & cây giống đang hết hàng hoặc tồn kho dưới mức an toàn (≤ 5)
                  </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLowStockModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              {/* Thẻ tóm tắt */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>🚫 Hết hàng hoàn toàn (Tồn = 0):</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', marginTop: 2 }}>
                    {lowStock.filter(i => (parseFloat(i.qty_remaining) || 0) === 0).length} mặt hàng
                  </div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>⚠️ Sắp hết (Tồn 1 – 5):</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', marginTop: 2 }}>
                    {lowStock.filter(i => (parseFloat(i.qty_remaining) || 0) > 0).length} mặt hàng
                  </div>
                </div>
              </div>

              {/* Bảng danh mục */}
              {lowStock.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-icon">✅</div>
                  <p style={{ fontWeight: 700, color: '#16a34a' }}>Kho hàng đang ở mức an toàn, không có mặt hàng nào cần nhập thêm!</p>
                </div>
              ) : (
                <div className="table-container" style={{ border: '1px solid var(--color-border)', borderRadius: 8 }}>
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', fontSize: 12 }}>
                        <th style={{ width: 40, textAlign: 'center' }}>#</th>
                        <th>📦 Tên Mặt Hàng / Vật Tư</th>
                        <th>🏷️ Phân Loại</th>
                        <th style={{ textAlign: 'right' }}>Tồn Hiện Tại</th>
                        <th>🏢 Nhà Cung Cấp</th>
                        <th style={{ width: 110, textAlign: 'center' }}>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStock.map((item, idx) => {
                        const qty = parseFloat(item.qty_remaining) || 0
                        const isZero = qty === 0
                        return (
                          <tr key={item.item_id || idx}>
                            <td style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                {item.item_name}
                              </div>
                              {item.notes && (
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                  {item.notes}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="badge" style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                                {item.item_type || 'Vật tư'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span
                                className="badge"
                                style={{
                                  fontWeight: 800,
                                  fontSize: 12,
                                  background: isZero ? '#fee2e2' : '#fef3c7',
                                  color: isZero ? '#dc2626' : '#b45309'
                                }}
                              >
                                {qty} {item.unit}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                              {item.supplier || 'Chưa định NCC'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handleQuickRestockItem(item)}
                                style={{ fontSize: 11, padding: '4px 10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                title="Mở form nhập hàng cho mặt hàng này"
                              >
                                <Truck size={13} /> Nhập
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowLowStockModal(false)
                  resetPurchaseForm()
                  setShowPurchaseForm(true)
                }}
                style={{ fontWeight: 600 }}
              >
                🚚 Mở form nhập hàng tổng hợp
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setShowLowStockModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
