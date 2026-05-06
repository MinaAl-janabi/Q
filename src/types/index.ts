export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Flavor {
  id: string;
  name: string;
  price: number;
  category: 'مميزة' | 'فواكه' | 'منعشة' | 'كلاسيكية';
  special: boolean;
  image: string;
}

export interface OrderItem {
  flavorId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'جديد' | 'قيد التحضير' | 'جاهز' | 'تم التسليم';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  address: string;
  notes: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: number;
  deliveryFee: number;
}

export type CategoryFilter = 'الكل' | 'مميزة' | 'فواكه' | 'منعشة' | 'كلاسيكية';
export type OrderStatusFilter = 'الكل' | 'جديد' | 'قيد التحضير' | 'جاهز' | 'تم التسليم';
