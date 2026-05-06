import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Order, OrderStatus } from '@/types';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('qcaFee_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('qcaFee_orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((order: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const newOrder: Order = {
      ...order,
      id: orderId,
      timestamp: Date.now(),
      status: 'جديد',
    };
    setOrders((prev) => [newOrder, ...prev]);
    return orderId;
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  return (
    <OrdersContext.Provider
      value={{ orders, addOrder, updateOrderStatus, deleteOrder, getOrderById }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within OrdersProvider');
  return context;
}
