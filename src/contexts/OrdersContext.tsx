import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { supabase } from '@/lib/supabase';
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

// تحويل بيانات Supabase للنوع المستخدم في التطبيق
function mapRow(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    area: row.area,
    address: row.address,
    deliveryFee: row.delivery_fee ?? 0,
    timestamp: new Date(row.created_at).getTime(),
    status: row.status,
    notes: row.notes ?? undefined,
    items: row.items ?? [],
  };
}

export const OrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── جلب الطلبات + Realtime ───
  useEffect(() => {
    // جلب أولي من Supabase
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data.map(mapRow));
      });

    // الاستماع للطلبات الجديدة والتحديثات
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [mapRow(payload.new), ...prev]);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? mapRow(payload.new) : o))
          );
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addOrder = useCallback(
    async (payload: Omit<Order, 'id' | 'status' | 'timestamp'>) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('orders').insert([{
          customer_name: payload.customerName,
          phone: payload.phone,
          area: payload.area,
          address: payload.address,
          delivery_fee: payload.deliveryFee,
          status: 'جديد',
          notes: payload.notes,
          items: payload.items,
        }]).select().single();

        if (error) throw error;
        return data.id;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      await supabase.from('orders').update({ status }).eq('id', id);
    },
    []
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      await supabase.from('orders').delete().eq('id', id);
    },
    []
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
      { header: 'الرقم',    key: 'id',          width: 20 },
      { header: 'الحالة',   key: 'status',       width: 15 },
      { header: 'التاريخ',  key: 'timestamp',    width: 25 },
      { header: 'العميل',   key: 'customerName', width: 20 },
      { header: 'الهاتف',   key: 'phone',        width: 15 },
      { header: 'المنطقة',  key: 'area',         width: 15 },
      { header: 'العنوان',  key: 'address',      width: 25 },
      { header: 'التوصيل',  key: 'deliveryFee',  width: 12 },
      { header: 'ملاحظات',  key: 'notes',        width: 25 },
      { header: 'المنتجات', key: 'items',        width: 40 },
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