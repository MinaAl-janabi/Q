import React, { createContext, useContext, useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import { supabase } from '../data/lib/supabase';
import type { Order, OrderItem, OrderStatus } from '@/types';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (payload: Omit<Order, 'id' | 'status' | 'timestamp'>) => Promise<string>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  exportToExcel: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const saveToLocal = (updated: Order[]) => {
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const addOrder = useCallback(
    async (payload: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
      setLoading(true);
      try {
        const newOrder: Order = {
          ...payload,
          id: Date.now().toString(),
          status: 'جديد',
          timestamp: Date.now(),
        };

        const newOrders = [newOrder, ...orders];
        setOrders(newOrders);
        saveToLocal(newOrders);

        // حفظ في Supabase بالشكل الذي يتوقعه (snake_case)
        try {
          await supabase.from('orders').insert([{
            id: newOrder.id,
            customer_name: newOrder.customerName,
            phone: newOrder.phone,
            area: newOrder.area,
            address: newOrder.address,
            delivery_fee: newOrder.deliveryFee,
            status: newOrder.status,
            notes: newOrder.notes,
            items: newOrder.items,
            created_at: new Date(newOrder.timestamp).toISOString(),
          }]);
        } catch (e) {
          console.warn('لم يتم حفظ الطلب في Supabase، محفوظ محلياً فقط', e);
        }

        return newOrder.id;
      } finally {
        setLoading(false);
      }
    },
    [orders]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const newOrders = orders.map((o) => (o.id === id ? { ...o, status } : o));
      setOrders(newOrders);
      saveToLocal(newOrders);
      try {
        await supabase.from('orders').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('تعذر تحديث الطلب في Supabase', e);
      }
    },
    [orders]
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      const newOrders = orders.filter((o) => o.id !== id);
      setOrders(newOrders);
      saveToLocal(newOrders);
      try {
        await supabase.from('orders').delete().eq('id', id);
      } catch (e) {
        console.warn('تعذر حذف الطلب في Supabase', e);
      }
    },
    [orders]
  );

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const exportToExcel = useCallback(async () => {
    if (!orders.length) { alert('لا توجد طلبات للتصدير'); return; }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('الطلبات');

    worksheet.columns = [
      { header: 'الرقم',    key: 'id',           width: 20 },
      { header: 'الحالة',   key: 'status',        width: 15 },
      { header: 'التاريخ',  key: 'timestamp',     width: 25 },
      { header: 'العميل',   key: 'customerName',  width: 20 },
      { header: 'الهاتف',   key: 'phone',         width: 15 },
      { header: 'المنطقة',  key: 'area',          width: 15 },
      { header: 'العنوان',  key: 'address',       width: 25 },
      { header: 'التوصيل',  key: 'deliveryFee',   width: 12 },
      { header: 'ملاحظات',  key: 'notes',         width: 25 },
      { header: 'المنتجات', key: 'items',         width: 40 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        ...order,
        timestamp: new Date(order.timestamp).toLocaleString('ar-IQ'),
        items: order.items.map((i: OrderItem) => `${i.name} (${i.quantity})`).join('، '),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  }, [orders]);

  return (
    <OrdersContext.Provider value={{
      orders, loading,
      addOrder, updateOrderStatus, deleteOrder, getOrderById, exportToExcel,
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within OrdersProvider');
  return context;
};