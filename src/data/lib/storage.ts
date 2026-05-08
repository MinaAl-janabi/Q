// src/lib/storage.ts

const ORDERS_KEY = 'hookah_orders'

export type Order = {
  id: string
  customerName: string
  items: string[]
  total: number
  createdAt: string
  status: 'pending' | 'delivered'
}

// جيب كل الطلبات
export function getOrders(): Order[] {
  const data = localStorage.getItem(ORDERS_KEY)
  return data ? JSON.parse(data) : []
}

// أضف طلب جديد
export function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getOrders()
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, newOrder]))
  return newOrder
}

// حدّث حالة الطلب
export function updateOrderStatus(id: string, status: Order['status']) {
  const orders = getOrders().map(o => o.id === id ? { ...o, status } : o)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

// احذف طلب
export function deleteOrder(id: string) {
  const orders = getOrders().filter(o => o.id !== id)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}