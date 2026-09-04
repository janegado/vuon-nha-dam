import { useState, useEffect, useCallback } from 'react'
import { supabase, isConnected } from '../lib/supabase'

const DEMO_PRODUCTS = [
  { product_id: '1', product_name: 'Lá nha đam tươi', product_type: 'Lá tươi', unit: 'kg', unit_price: 30000, qty_in_stock: 0, source_type: 'Tự làm' },
  { product_id: '2', product_name: 'Cây giống nha đam', product_type: 'Cây giống', unit: 'cây', unit_price: 15000, qty_in_stock: 0, source_type: 'Tự làm' },
  { product_id: '3', product_name: 'Chậu nha đam mini', product_type: 'Chậu cảnh', unit: 'chậu', unit_price: 50000, qty_in_stock: 0, source_type: 'Tự làm' },
  { product_id: '4', product_name: 'Mật ong nha đam', product_type: 'Mật ong', unit: 'chai', unit_price: 150000, qty_in_stock: 0, source_type: 'Mua ngoài' },
]

const DEMO_CUSTOMERS = []
const DEMO_ORDERS = []

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      const saved = localStorage.getItem('app_products_data')
      setProducts(saved ? JSON.parse(saved) : DEMO_PRODUCTS)
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('products').select('*').order('product_name')
    if (!error) setProducts(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const addProduct = async (product) => {
    if (!isConnected()) {
      const p = { ...product, product_id: String(Date.now()), created_at: new Date().toISOString() }
      const saved = localStorage.getItem('app_products_data')
      const allProds = saved ? JSON.parse(saved) : DEMO_PRODUCTS
      const updated = [...allProds, p]
      localStorage.setItem('app_products_data', JSON.stringify(updated))
      setProducts(updated)
      return p
    }
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (!error) { await fetchProducts(); return data }
    return null
  }

  const updateProduct = async (id, updates) => {
    if (!isConnected()) {
      const saved = localStorage.getItem('app_products_data')
      const allProds = saved ? JSON.parse(saved) : DEMO_PRODUCTS
      const updated = allProds.map(p => String(p.product_id) === String(id) ? { ...p, ...updates } : p)
      localStorage.setItem('app_products_data', JSON.stringify(updated))
      setProducts(updated)
      return
    }
    await supabase.from('products').update(updates).eq('product_id', id)
    await fetchProducts()
  }

  const deleteProduct = async (id) => {
    if (!isConnected()) {
      const saved = localStorage.getItem('app_products_data')
      const allProds = saved ? JSON.parse(saved) : DEMO_PRODUCTS
      const updated = allProds.filter(p => String(p.product_id) !== String(id))
      localStorage.setItem('app_products_data', JSON.stringify(updated))
      setProducts(updated)
      return
    }
    await supabase.from('products').delete().eq('product_id', id)
    await fetchProducts()
  }

  return { products, loading, fetchProducts, addProduct, updateProduct, deleteProduct }
}

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      setCustomers(DEMO_CUSTOMERS)
      setLoading(false)
      return
    }
    const { data, error } = await supabase.from('customers').select('*').order('name')
    if (!error) setCustomers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const addCustomer = async (customer) => {
    if (!isConnected()) {
      const c = { ...customer, customer_id: String(Date.now()), created_at: new Date().toISOString() }
      setCustomers(prev => [...prev, c])
      return c
    }
    const { data, error } = await supabase.from('customers').insert(customer).select().single()
    if (!error) { await fetchCustomers(); return data }
    return null
  }

  const updateCustomer = async (id, updates) => {
    if (!isConnected()) {
      setCustomers(prev => prev.map(c => c.customer_id === id ? { ...c, ...updates } : c))
      return
    }
    await supabase.from('customers').update(updates).eq('customer_id', id)
    await fetchCustomers()
  }

  return { customers, loading, fetchCustomers, addCustomer, updateCustomer }
}

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    if (!isConnected()) {
      setOrders(DEMO_ORDERS)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*, customer:customers(*), items:sales_order_items(*, product:products(*))')
      .order('order_date', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const createOrder = async (order, items) => {
    if (!isConnected()) {
      const o = {
        ...order,
        order_id: String(Date.now()),
        items: items.map((it, i) => ({ ...it, order_item_id: String(Date.now() + i) })),
        created_at: new Date().toISOString()
      }
      setOrders(prev => [o, ...prev])
      return o
    }
    const { data: orderData, error } = await supabase.from('sales_orders').insert(order).select().single()
    if (error) return null

    const orderItems = items.map(it => ({ ...it, order_id: orderData.order_id }))
    await supabase.from('sales_order_items').insert(orderItems)

    // Trừ tồn kho
    for (const it of items) {
      await supabase.rpc('decrement_stock', { p_id: it.product_id, qty: it.qty })
        .then(() => {})
        .catch(() => {
          // Fallback: manual update
          supabase.from('products')
            .select('qty_in_stock')
            .eq('product_id', it.product_id)
            .single()
            .then(({ data }) => {
              if (data) {
                supabase.from('products')
                  .update({ qty_in_stock: Math.max(0, data.qty_in_stock - it.qty) })
                  .eq('product_id', it.product_id)
              }
            })
        })
    }

    await fetchOrders()
    return orderData
  }

  const updatePayment = async (orderId, amountPaid) => {
    const order = orders.find(o => o.order_id === orderId)
    if (!order) return

    const paymentStatus = amountPaid >= order.total_amount ? 'Đã thu đủ' : 'Còn nợ'

    if (!isConnected()) {
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, amount_paid: amountPaid, payment_status: paymentStatus } : o))
      return
    }
    await supabase.from('sales_orders').update({ amount_paid: amountPaid, payment_status: paymentStatus }).eq('order_id', orderId)
    await fetchOrders()
  }

  return { orders, loading, fetchOrders, createOrder, updatePayment }
}
