// src/lib/database.types.ts
export type OrderStatus = 'جديد' | 'قيد التنفيذ' | 'تم التسليم';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: number;
  deliveryFee: number;
}

// هيكل قاعدة بيانات Supabase
export type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'timestamp' | 'status'> & {
          id?: string;
          timestamp?: number;
          status?: OrderStatus;
        };
        Update: Partial<Omit<Order, 'id'>> & {
          status?: OrderStatus;
        };
      };
    };
    Views: {};
    Functions: {};
  };
};