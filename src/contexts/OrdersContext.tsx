import React, { createContext, useContext, useState, useCallback,  } from 'react';
import { supabase } from '../data/lib/supabase';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Order, OrderStatus } from '../data/types/order';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (payload: Omit<Order, 'id' | 'status' | 'created_at'>) => Promise<string>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  exportToExcel: () => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const saveToLocal = (orders: Order[]) => {
    localStorage.setItem('orders', JSON.stringify(orders));
  };

  const addOrder = useCallback(async (payload: Omit<Order, 'id' | 'status' | 'created_at'>) => {
    setLoading(true);
    try {
      // إنشاء الطلب الجديد
      const newOrder: Order = {
        ...payload,
        id: Date.now().toString(),
        status: 'جديد',
        created_at: new Date().toISOString(),
      };

      // حفظ محلي
      const newOrders = [newOrder, ...orders];
      setOrders(newOrders);
      saveToLocal(newOrders);

      // حفظ في Supabase (إذا موجود)
      try {
        await supabase.from('orders').insert([newOrder]);
      } catch (e) {
        console.warn('لم يتم حفظ الطلب في Supabase، محفوظ محلياً فقط', e);
      }

      return newOrder.id;
    } finally {
      setLoading(false);
    }
  }, [orders]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    // تحديث محلي
    const newOrders = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(newOrders);
    saveToLocal(newOrders);

    // تحديث Supabase (إذا موجود)
    try {
      await supabase.from('orders').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('تعذر تحديث الطلب في Supabase', e);
    }
  }, [orders]);

  const deleteOrder = useCallback(async (id: string) => {
    const newOrders = orders.filter((o) => o.id !== id);
    setOrders(newOrders);
    saveToLocal(newOrders);

    try {
      await supabase.from('orders').delete().eq('id', id);
    } catch (e) {
      console.warn('تعذر حذف الطلب في Supabase', e);
    }
  }, [orders]);

  const getOrderById = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const exportToExcel = useCallback(() => {
    if (!orders.length) return alert('لا توجد طلبات للتصدير');
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'orders.xlsx');
  }, [orders]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        getOrderById,
        exportToExcel,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within OrdersProvider');
  return context;
};