export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'
  | 'paid';

export interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}