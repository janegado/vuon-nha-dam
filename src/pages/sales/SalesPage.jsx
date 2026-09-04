import { useState } from 'react'
import { useProducts, useCustomers, useOrders } from '../../hooks/useSales'
import {
  Plus, Trash2, Edit, X, ShoppingCart, Users,
  CreditCard, Package, Phone, TrendingUp, Check, Minus,
  Sparkles
} from 'lucide-react'

const CHANNELS = ['Tại vườn', 'Facebook', 'Zalo', 'Khác']
const PRODUCT_TYPES = ['Chậu cảnh', 'Cây giống', 'Lá tươi', 'Mật ong']

const formatVND = (n) => (n || 0).toLocaleString('vi-VN') + 'đ'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const getProductIcon = (type) => {
  if (type === 'Chậu cảnh') return '🪴'
  if (type === 'Cây giống') return '🌱'
  if (type === 'Lá tươi') return '🍃'
  if (type === 'Mật ong') return '🍯'
  return '📦'
}

export default function SalesPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const { customers, addCustomer } = useCustomers()
  const { orders, createOrder, updatePayment } = useOrders()
  const [activeTab, setActiveTab] = useState('orders')

  // Toast thông báo
  const [toastMsg, setToastMsg] = useState('')

  // Product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({
    product_name: '', product_type: 'Chậu cảnh', unit: 'chậu',
    unit_price: 0, qty_in_stock: 0, source_type: 'Tự làm'
  })

  // Customer form
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '', note: '' })

  // Order form (Tối giản theo UX ≤ 3 chạm — Bấm thẳng sản phẩm)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    channel: 'Tại vườn',
    is_full_paid: true, // Mặc định thu đủ tiền
    amount_paid: 0,
    note: ''
  })
  const [orderItems, setOrderItems] = useState([]) // Danh sách { product_id, qty }

  // Payment modal
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [payAmount, setPayAmount] = useState(0)

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + o.total_amount, 0)
  const totalDebt = orders.filter(o => o.payment_status === 'Còn nợ').reduce((s, o) => s + (o.total_amount - o.amount_paid), 0)
  const debtOrders = orders.filter(o => o.payment_status === 'Còn nợ')

  // Handlers
  const handleAddProduct = async (e) => {
    e.preventDefault()
    await addProduct(productForm)
    setProductForm({ product_name: '', product_type: 'Chậu cảnh', unit: 'chậu', unit_price: 0, qty_in_stock: 0, source_type: 'Tự làm' })
    setShowProductForm(false)
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    await addCustomer({ ...customerForm, first_purchase_date: new Date().toISOString().split('T')[0] })
    setCustomerForm({ name: '', phone: '', address: '', note: '' })
    setShowCustomerForm(false)
  }

  // 1-Chạm: Chọn / Bật tắt sản phẩm thẳng từ thẻ (Card)
  const handleToggleProduct = (productId) => {
    setOrderItems(prev => {
      const exists = prev.find(it => it.product_id === productId)
      if (exists) {
        // Nếu chỉ có 1 sản phẩm duy nhất thì không tắt, hoặc nếu có nhiều thì bỏ chọn
        if (prev.length === 1) return prev
        return prev.filter(it => it.product_id !== productId)
      } else {
        return [...prev, { product_id: productId, qty: 1 }]
      }
    })
  }

  // Tăng giảm số lượng sản phẩm trong đơn
  const handleQtyStep = (productId, delta) => {
    setOrderItems(prev => prev.map(it => {
      if (it.product_id === productId) {
        const newQty = Math.max(0.5, (parseFloat(it.qty) || 1) + delta)
        return { ...it, qty: newQty }
      }
      return it
    }))
  }

  const handleDirectQtyChange = (productId, val) => {
    setOrderItems(prev => prev.map(it => {
      if (it.product_id === productId) {
        return { ...it, qty: parseFloat(val) || 1 }
      }
      return it
    }))
  }

  const removeOrderItem = (productId) => {
    setOrderItems(prev => prev.filter(it => it.product_id !== productId))
  }

  const calcOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.product_id === item.product_id)
      return total + (product ? product.unit_price * (parseFloat(item.qty) || 0) : 0)
    }, 0)
  }

  const handleOpenOrderModal = () => {
    // Mặc định chọn ngay sản phẩm đầu tiên có sẵn
    const firstProd = products[0]?.product_id || ''
    setOrderItems(firstProd ? [{ product_id: firstProd, qty: 1 }] : [])
    setOrderForm({
      customer_id: '',
      channel: 'Tại vườn',
      is_full_paid: true,
      amount_paid: 0,
      note: ''
    })
    setShowOrderForm(true)
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    if (orderItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để tạo đơn!')
      return
    }

    const total = calcOrderTotal()
    const paid = orderForm.is_full_paid ? total : (parseFloat(orderForm.amount_paid) || 0)
    const order = {
      customer_id: orderForm.customer_id || null,
      order_date: new Date().toISOString().split('T')[0],
      channel: orderForm.channel,
      total_amount: total,
      amount_paid: paid,
      payment_status: paid >= total ? 'Đã thu đủ' : 'Còn nợ',
      note: orderForm.note
    }
    const items = orderItems
      .filter(it => it.product_id)
      .map(it => {
        const prod = products.find(p => p.product_id === it.product_id)
        return {
          product_id: it.product_id,
          qty: parseFloat(it.qty) || 0,
          unit_price: prod?.unit_price || 0,
          subtotal: (prod?.unit_price || 0) * (parseFloat(it.qty) || 0),
          product: prod
        }
      })
    await createOrder(order, items)
    setShowOrderForm(false)
    setToastMsg(`✅ Đã tạo thành công đơn bán ${formatVND(total)} (Kênh: ${orderForm.channel})`)
    setTimeout(() => setToastMsg(''), 5000)
  }

  const handlePayment = async () => {
    if (paymentOrder) {
      await updatePayment(paymentOrder.order_id, parseFloat(payAmount) || 0)
      setPaymentOrder(null)
      setToastMsg(`✅ Đã cập nhật thu tiền ${formatVND(payAmount)} thành công`)
      setTimeout(() => setToastMsg(''), 4000)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛒 Bán Hàng & Khách Hàng</h1>
          <p className="page-description">Tạo đơn nhanh ≤ 3 chạm — Bấm chọn sản phẩm trực tiếp, quản lý tồn & công nợ</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenOrderModal}>
          <Plus size={18} /> ⚡ Tạo đơn bán nhanh (≤ 3 chạm)
        </button>
      </div>

      {/* Toast thông báo */}
      {toastMsg && (
        <div className="alert alert-success fade-in" style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>
          <Check size={20} />
          <div>{toastMsg}</div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <h3>{formatVND(totalRevenue)}</h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <h3>{orders.length}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><CreditCard size={24} /></div>
          <div className="stat-info">
            <h3>{formatVND(totalDebt)}</h3>
            <p>Công nợ ({debtOrders.length} đơn)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-info">
            <h3>{customers.length}</h3>
            <p>Khách hàng</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Đơn bán ({orders.length})
        </button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          Sản phẩm ({products.length})
        </button>
        <button className={`tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
          Khách hàng ({customers.length})
        </button>
        <button className={`tab ${activeTab === 'debt' ? 'active' : ''}`} onClick={() => setActiveTab('debt')}>
          Công nợ ({debtOrders.length})
        </button>
      </div>

      {/* === TAB: Orders === */}
      {activeTab === 'orders' && (
        orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Chưa có đơn bán nào</h3>
            <p>Bấm nút "Tạo đơn bán nhanh" để ghi nhận đơn đầu tiên</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã / Ngày</th>
                  <th>Khách hàng</th>
                  <th>Kênh</th>
                  <th>Tổng tiền</th>
                  <th>Đã thu</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.order_id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{formatDate(order.order_date)}</div>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Mã: {order.order_id?.slice(0, 8) || order.order_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customer?.name || 'Khách lẻ (Tại vườn)'}</div>
                      {order.customer?.phone && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={12} /> {order.customer.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-info">{order.channel || 'Tại vườn'}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 15 }}>{formatVND(order.total_amount)}</td>
                    <td style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>{formatVND(order.amount_paid)}</td>
                    <td>
                      {order.payment_status === 'Đã thu đủ' ? (
                        <span className="badge badge-success">✅ Đã thu đủ</span>
                      ) : (
                        <span className="badge badge-danger" style={{ cursor: 'pointer' }} onClick={() => { setPaymentOrder(order); setPayAmount(order.total_amount - order.amount_paid) }} title="Bấm để thu nợ">
                          💰 Còn nợ {formatVND(order.total_amount - order.amount_paid)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* === TAB: Products === */}
      {activeTab === 'products' && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowProductForm(true)}><Plus size={18} /> Thêm sản phẩm</button>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>Chưa có sản phẩm</h3>
              <p>Thêm chậu cảnh, cây giống, lá tươi, mật ong...</p>
            </div>
          ) : (
            <div className="grid-2">
              {products.map(p => (
                <div key={p.product_id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 24 }}>{getProductIcon(p.product_type)}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16 }}>{p.product_name}</div>
                          <span className={`badge ${p.product_type === 'Chậu cảnh' ? 'badge-success' : p.product_type === 'Mật ong' ? 'badge-warning' : 'badge-info'}`}>{p.product_type}</span>
                        </div>
                      </div>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => { if(confirm('Xóa sản phẩm này?')) deleteProduct(p.product_id) }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-light)' }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Giá bán:</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-700)' }}>{formatVND(p.unit_price)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Tồn kho:</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: p.qty_in_stock <= 5 ? 'var(--color-danger)' : 'var(--color-text)' }}>
                          {p.qty_in_stock} {p.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* === TAB: Customers === */}
      {activeTab === 'customers' && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowCustomerForm(true)}><Plus size={18} /> Thêm khách hàng</button>
          </div>
          {customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>Chưa có khách hàng</h3>
            </div>
          ) : (
            <div className="grid-2">
              {customers.map(c => (
                <div key={c.customer_id} className="card">
                  <div className="card-body">
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                    {c.phone && <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>📞 {c.phone}</div>}
                    {c.address && <div style={{ fontSize: 13, color: 'var(--color-text-light)', marginTop: 2 }}>📍 {c.address}</div>}
                    <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>Mua lần đầu: <strong>{formatDate(c.first_purchase_date)}</strong></span>
                      <span className="badge badge-success">Thân thiết</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* === TAB: Debt Tracker === */}
      {activeTab === 'debt' && (
        debtOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3>Không có công nợ!</h3>
            <p>Tất cả khách hàng đã thanh toán đủ.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Khách hàng</th>
                  <th>Tổng đơn</th>
                  <th>Đã trả</th>
                  <th>Còn nợ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {debtOrders.map(o => (
                  <tr key={o.order_id}>
                    <td style={{ fontWeight: 600 }}>{formatDate(o.order_date)}</td>
                    <td style={{ fontWeight: 600 }}>{o.customer?.name || 'Khách lẻ'} ({o.customer?.phone || '—'})</td>
                    <td style={{ fontWeight: 700 }}>{formatVND(o.total_amount)}</td>
                    <td>{formatVND(o.amount_paid)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--color-danger)' }}>{formatVND(o.total_amount - o.amount_paid)}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => { setPaymentOrder(o); setPayAmount(o.total_amount - o.amount_paid) }}>
                        Thu tiền
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* === MODAL TẠO ĐƠN BÁN SIÊU TỐC (≤ 3 CHẠM — BẤM THẲNG SẢN PHẨM) === */}
      {showOrderForm && (
        <div className="modal-overlay" onClick={() => setShowOrderForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>🛒 Tạo Đơn Bán Hàng Nhanh</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowOrderForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                {/* 1. Kênh bán: Chọn bằng Chip to (1 chạm) */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>1. Kênh bán hàng:</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {CHANNELS.map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setOrderForm({...orderForm, channel: ch})}
                        style={{
                          flex: 1,
                          minWidth: 75,
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: orderForm.channel === ch ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                          background: orderForm.channel === ch ? 'var(--color-primary-50)' : '#ffffff',
                          color: orderForm.channel === ch ? 'var(--color-primary-900)' : 'var(--color-text-primary)',
                          fontWeight: orderForm.channel === ch ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        {ch === 'Tại vườn' ? '🏡 ' : ch === 'Facebook' ? '🌐 ' : ch === 'Zalo' ? '💬 ' : '📦 '}{ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Bấm thẳng vào sản phẩm để chọn (1 CHẠM!) */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                      2. Bấm vào sản phẩm để chọn (1 chạm):
                    </label>
                    <span style={{ fontSize: 12, color: 'var(--color-primary-700)', fontWeight: 600 }}>
                      Đã chọn {orderItems.length} món
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <div className="alert alert-warning" style={{ padding: 8, fontSize: 13 }}>
                      Chưa có sản phẩm nào trong hệ thống!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: 8, marginBottom: 12 }}>
                      {products.map(p => {
                        const isSelected = orderItems.some(it => it.product_id === p.product_id)
                        return (
                          <div
                            key={p.product_id}
                            onClick={() => handleToggleProduct(p.product_id)}
                            style={{
                              background: isSelected ? 'var(--color-primary-50)' : '#ffffff',
                              border: isSelected ? '2px solid var(--color-primary-600)' : '1.5px solid var(--color-border)',
                              borderRadius: 10,
                              padding: '10px 10px',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 0 0 1px var(--color-primary-600)' : 'none',
                              userSelect: 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <span style={{ fontSize: 22 }}>{getProductIcon(p.product_type)}</span>
                              {isSelected && (
                                <span style={{
                                  background: 'var(--color-primary-600)',
                                  color: '#ffffff',
                                  borderRadius: '50%',
                                  width: 18,
                                  height: 18,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 800
                                }}>✓</span>
                              )}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? 'var(--color-primary-900)' : 'var(--color-text)', lineHeight: 1.2 }}>
                              {p.product_name}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary-700)', marginTop: 4 }}>
                              {formatVND(p.unit_price)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                              Tồn: {p.qty_in_stock} {p.unit}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Danh sách sản phẩm đã chọn kèm nút tăng/giảm +/- số lượng */}
                  {orderItems.length > 0 && (
                    <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
                        Số lượng từng món trong đơn:
                      </div>
                      {orderItems.map(item => {
                        const prod = products.find(p => p.product_id === item.product_id)
                        if (!prod) return null
                        return (
                          <div key={item.product_id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            borderBottom: '1px dashed var(--color-border-light)'
                          }}>
                            <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                              <strong style={{ fontSize: 14, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {prod.product_name}
                              </strong>
                              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                {formatVND(prod.unit_price)} / {prod.unit}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ width: 34, height: 34, padding: 0 }}
                                onClick={() => handleQtyStep(item.product_id, -1)}
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                className="form-input"
                                type="number"
                                min="0.1"
                                step="0.5"
                                value={item.qty}
                                onChange={e => handleDirectQtyChange(item.product_id, e.target.value)}
                                style={{ width: 54, textAlign: 'center', fontWeight: 800, fontSize: 15, padding: '4px 2px' }}
                              />
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ width: 34, height: 34, padding: 0 }}
                                onClick={() => handleQtyStep(item.product_id, 1)}
                              >
                                <Plus size={16} />
                              </button>
                              <strong style={{ fontSize: 14, color: 'var(--color-primary-800)', minWidth: 65, textAlign: 'right' }}>
                                {formatVND(prod.unit_price * (parseFloat(item.qty) || 0))}
                              </strong>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Khách hàng: Mặc định khách lẻ */}
                <div className="form-group">
                  <label className="form-label">3. Khách hàng:</label>
                  <select className="form-select" value={orderForm.customer_id} onChange={e => setOrderForm({...orderForm, customer_id: e.target.value})}>
                    <option value="">👤 Khách lẻ (Bán trực tiếp tại vườn)</option>
                    {customers.map(c => <option key={c.customer_id} value={c.customer_id}>👤 {c.name} ({c.phone || 'Chưa có SĐT'})</option>)}
                  </select>
                </div>

                {/* Tổng tiền */}
                <div style={{
                  background: 'var(--color-primary-50)', padding: '12px 16px', borderRadius: 10,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0'
                }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng tiền thanh toán:</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary-700)' }}>{formatVND(calcOrderTotal())}</span>
                </div>

                {/* Thu tiền: Mặc định Đã thu đủ */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={orderForm.is_full_paid}
                      onChange={e => setOrderForm({...orderForm, is_full_paid: e.target.checked})}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-primary-600)' }}
                    />
                    <span>✅ Đã thu đủ tiền ({formatVND(calcOrderTotal())})</span>
                  </label>

                  {!orderForm.is_full_paid && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--color-border)' }}>
                      <label className="form-label" style={{ fontSize: 13 }}>Số tiền khách trả trước (VND):</label>
                      <input
                        className="form-input"
                        type="number"
                        value={orderForm.amount_paid}
                        onChange={e => setOrderForm({...orderForm, amount_paid: e.target.value})}
                        placeholder="VD: 50000"
                      />
                      <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4, fontWeight: 600 }}>
                        ⚠️ Ghi nợ: {formatVND(calcOrderTotal() - (parseFloat(orderForm.amount_paid) || 0))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (tùy chọn):</label>
                  <input className="form-input" value={orderForm.note} onChange={e => setOrderForm({...orderForm, note: e.target.value})} placeholder="Ghi chú thêm..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrderForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, fontSize: 15 }}>
                  ✅ Hoàn tất đơn bán (Chạm 3)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL THU TIỀN CÔNG NỢ === */}
      {paymentOrder && (
        <div className="modal-overlay" onClick={() => setPaymentOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>💰 Thu Tiền Nợ</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setPaymentOrder(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Đơn hàng của: <strong>{paymentOrder.customer?.name || 'Khách lẻ'}</strong> ({formatDate(paymentOrder.order_date)})</p>
              <div style={{ background: '#fee2e2', padding: 12, borderRadius: 8, margin: '12px 0' }}>
                <div>Còn nợ: <strong style={{ color: 'var(--color-danger)', fontSize: 18 }}>{formatVND(paymentOrder.total_amount - paymentOrder.amount_paid)}</strong></div>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền khách trả thêm (VND):</label>
                <input
                  className="form-input"
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPaymentOrder(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handlePayment}>✅ Xác nhận thu</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL THÊM SẢN PHẨM === */}
      {showProductForm && (
        <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>📦 Thêm Sản Phẩm Mới</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowProductForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm:</label>
                  <input className="form-input" value={productForm.product_name} onChange={e => setProductForm({...productForm, product_name: e.target.value})} placeholder="VD: Chậu nha đam kiểng loại 1" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Loại sản phẩm:</label>
                    <select className="form-select" value={productForm.product_type} onChange={e => setProductForm({...productForm, product_type: e.target.value})}>
                      {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đơn vị:</label>
                    <input className="form-input" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giá bán (VND):</label>
                    <input className="form-input" type="number" value={productForm.unit_price} onChange={e => setProductForm({...productForm, unit_price: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tồn kho:</label>
                    <input className="form-input" type="number" step="0.1" value={productForm.qty_in_stock} onChange={e => setProductForm({...productForm, qty_in_stock: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL THÊM KHÁCH HÀNG === */}
      {showCustomerForm && (
        <div className="modal-overlay" onClick={() => setShowCustomerForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2>👤 Thêm Khách Hàng Mới</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCustomerForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên khách hàng:</label>
                  <input className="form-input" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} placeholder="VD: Anh Nam" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại:</label>
                  <input className="form-input" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="VD: 0901234567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ:</label>
                  <input className="form-input" value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} placeholder="Địa chỉ giao hàng..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCustomerForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu khách hàng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
