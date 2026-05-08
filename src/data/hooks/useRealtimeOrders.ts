import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  status: string;
  table_id: string;
  total_amount: number;
  customer_name?: string;
  created_at: string;
}

export function useRealtimeOrders(restaurantId: string) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 1. Fetch initial orders
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) setOrders(data as Order[]);
    };
    fetchOrders();

    // 2. Subscribe to new orders + updates
    const channel = supabase
      .channel(`restaurant-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return orders;
}