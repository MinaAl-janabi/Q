// src/data/types/order.ts
export type OrderStatus =
  | 'جديد'
  | 'قيد التحضير'
  | 'جاهز'
  | 'تم التسليم'
  | 'ملغى'
  | 'مدفوع';

export interface OrderI {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  items: { name: string; quantity: number; unit_price: number; special_instructions?: string }[];
  notes?: string;
  status: 'جديد' | 'قيد التحضير' | 'تم';
  created_at: string;
}

// order.ts أو في نفس الملف
interface Order {
  id: number;
  total: number;
  area?: string;     // ? يعني الخصائص اختيارية
  address?: string;  // ? يعني الخصائص اختيارية
}

// إنشاء كائنات Order
const order1: Order = {
  id: 1,
  total: 150,
  area: "Downtown",
  address: "123 Main St"
};

const order2: Order = {
  id: 2,
  total: 200
};

// دالة لطباعة المعلومات
function printOrder(order: Order) {
  console.log("Order ID:", order.id);
  console.log("Total:", order.total);
  console.log("Area:", order.area ?? "غير محدد");       // ?? للتحقق إذا القيمة موجودة
  console.log("Address:", order.address ?? "غير محدد");
  console.log("----------");
}

// طباعة كل الطلبات
printOrder(order1);
printOrder(order2);