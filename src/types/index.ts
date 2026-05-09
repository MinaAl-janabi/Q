export type OrderStatus = 'جديد' | 'قيد التحضير' | 'جاهز' | 'تم التسليم' | 'ملغى' | 'مدفوع';
export type OrderStatusFilter = 'الكل' | OrderStatus;

export interface OrderItem {
  flavorId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  address: string;
  items: OrderItem[];
  deliveryFee: number;
  status: OrderStatus;
  notes?: string;
  timestamp: number;
}

export interface Flavor {
  id: string;
  name: string;
  price: number;
  category: 'مميزة' | 'فواكه' | 'منعشة' | 'كلاسيكية';
  special: boolean;
  image: string;
}
// أضف في نهاية الملف
export interface CartItem {
  flavorId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type CategoryFilter = 'الكل' | 'مميزة' | 'فواكه' | 'منعشة' | 'كلاسيكية';