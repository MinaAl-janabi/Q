// ─── DB shape (from Supabase) ───
export interface OrderI {
  id: string;
  customer_name: string;
  phone: string;
  area: string;
  address: string;
  delivery_fee: number;
  created_at: string;        // ISO string from Supabase
  status: string;
  notes?: string;
  items: {
    name: string;
    quantity: number;
    unit_price: number;
    special_instructions?: string;
  }[];
}

// ─── App shapes (used everywhere in components) ───
export type OrderStatus =
  | 'جديد'
  | 'قيد التحضير'
  | 'جاهز'
  | 'تم التسليم'
  | 'ملغى'
  | 'مدفوع';

export type OrderStatusFilter = 'الكل' | OrderStatus;

export interface OrderItem {
  flavorId: string;
  name: string;
  quantity: number;
  price: number;            // maps from unit_price
}

export interface Order {
  id: string;
  customerName: string;    // maps from customer_name
  phone: string;
  area: string;
  address: string;
  deliveryFee: number;     // maps from delivery_fee
  timestamp: number;       // ms epoch — used as number in sort/compare
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
}

export interface Flavor {
  id: string;
  name: string;
  price: number;
  category: 'مميزة' | 'فواكه' | 'منعشة' | 'كلاسيكية';
  special: boolean;
  image: string;
}