import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, Check, Package, HomeIcon, Clock, Receipt,
  MapPin, Phone, User, Trash2, ChevronLeft, LogOut, RotateCcw
} from 'lucide-react';
import type { OrderStatus } from '@/types';
import { useOrders } from '@/contexts/OrdersContext';
import { useToast } from '@/contexts/ToastContext';



export default function CashierPage() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { showToast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('qcaFee_cashier') === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = () => {
    if (password === 'cashier123') {
      sessionStorage.setItem('qcaFee_cashier', 'true');
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('qcaFee_cashier');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Filter active orders (not delivered)
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'تم التسليم').sort((a, b) => b.timestamp - a.timestamp),
    [orders]
  );

  // Today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => o.timestamp >= todayStart.getTime());
  const todayRevenue = todayOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0) + o.deliveryFee,
    0
  );
  const pendingCount = activeOrders.filter((o) => o.status === 'جديد' || o.status === 'قيد التحضير').length;
  const avgOrderValue = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    showToast(`تم تحديث الحالة إلى: ${status}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'جديد': return 'text-[#f59e0b]';
      case 'قيد التحضير': return 'text-[#3b82f6]';
      case 'جاهز': return 'text-[#22c55e]';
      case 'تم التسليم': return 'text-[#6b7280]';
    }
  };

  const timeSince = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    return `منذ ${hours} ساعة`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[rgba(212,168,83,0.15)] flex items-center justify-center mx-auto mb-4">
              <Printer size={32} className="text-[#d4a853]" />
            </div>
            <h2 className="text-[#f3f4f6] text-2xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
              نظام الكاشير
            </h2>
            <p className="text-[#9ca3af] text-sm mt-2">أدخل كلمة المرور للمتابعة</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="كلمة المرور"
              className={`w-full bg-[#1a2235] border rounded-xl px-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] transition-all ${
                passwordError ? 'border-[#ef4444]' : 'border-[#1f2937]'
              }`}
            />
            {passwordError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-sm">
                {passwordError}
              </motion.p>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3 rounded-xl font-semibold transition-all"
            >
              دخول
            </button>
          </div>

          <div className="text-center mt-6">
            <Link to="/admin" className="text-[#6b7280] hover:text-[#d4a853] text-sm transition-colors">
              العودة للوحة التحكم
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Top Bar */}
      <header className="bg-[#111827] border-b border-[#1f2937] px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-[#9ca3af] hover:text-[#d4a853] transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[#f3f4f6] font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
            نظام الكاشير
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[#6b7280] text-xs hidden sm:block">
            {currentTime.toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1.5 text-[#d4a853] text-sm font-mono">
            <Clock size={14} />
            <span>{currentTime.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#6b7280] hover:text-[#ef4444] transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6">
        <SummaryCard label="طلبات اليوم" value={todayOrders.length} color="text-[#d4a853]" />
        <SummaryCard label="الإيرادات" value={`${(todayRevenue / 1000).toFixed(0)}K`} color="text-[#22c55e]" />
        <SummaryCard label="معلق" value={pendingCount} color="text-[#f59e0b]" />
        <SummaryCard label="متوسط الطلب" value={`${(avgOrderValue / 1000).toFixed(0)}K`} color="text-[#3b82f6]" />
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Orders Queue */}
          <div className="flex-1">
            <h2 className="text-[#f3f4f6] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
              <Package size={18} className="text-[#d4a853]" />
              طلبات جديدة
              {activeOrders.length > 0 && (
                <span className="bg-[#d4a853] text-[#0a0e1a] text-xs px-2 py-0.5 rounded-full">
                  {activeOrders.length}
                </span>
              )}
            </h2>

            <div className="space-y-3">
              <AnimatePresence>
                {activeOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 1.02, borderColor: '#d4a853' }}
                    animate={{ opacity: 1, scale: 1, borderColor: '#1f2937' }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-[#111827] border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-[#d4a853]/30 ${
                      selectedOrderId === order.id ? 'border-[#d4a853]' : 'border-[#1f2937]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#f3f4f6] font-bold text-sm">#{order.id}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                        <span className="text-[#6b7280] text-xs">{timeSince(order.timestamp)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-[#9ca3af] mb-2">
                      <span className="font-medium text-[#f3f4f6]">{order.customerName}</span>
                      <span className="mx-2">—</span>
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9ca3af] text-xs">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} عنصر
                      </span>
                      <span className="text-[#d4a853] font-bold text-sm">
                        {(order.items.reduce((s, i) => s + i.price * i.quantity, 0) + order.deliveryFee).toLocaleString('ar-IQ')} د.ع
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {activeOrders.length === 0 && (
                <div className="text-center py-12 bg-[#111827] rounded-xl border border-[#1f2937]">
                  <Package size={48} className="text-[#6b7280] mx-auto mb-3" />
                  <p className="text-[#9ca3af]">لا توجد طلبات نشطة</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Detail */}
          <div className="lg:w-[420px]">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div
                  key={selectedOrder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 sticky top-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[#f3f4f6] font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      #{selectedOrder.id}
                    </h3>
                    <span className={`text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-[#1a2235] rounded-xl p-4 mb-5 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={14} className="text-[#d4a853]" />
                      <span className="text-[#f3f4f6]">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-[#d4a853]" />
                      <span className="text-[#9ca3af]">{selectedOrder.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={14} className="text-[#d4a853] mt-0.5" />
                      <span className="text-[#9ca3af]">{selectedOrder.area} — {selectedOrder.address}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="flex items-start gap-2 text-sm pt-2 border-t border-[#1f2937]">
                        <span className="text-[#6b7280] text-xs">ملاحظات: {selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mb-5">
                    <h4 className="text-[#9ca3af] text-xs mb-3">الطلبات</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[#d4a853] font-mono text-xs">{item.quantity}x</span>
                            <span className="text-[#f3f4f6]">{item.name}</span>
                          </div>
                          <span className="text-[#9ca3af]">{(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#1f2937] mt-3 pt-3 space-y-1">
                      <div className="flex justify-between text-sm text-[#9ca3af]">
                        <span>التوصيل</span>
                        <span>{selectedOrder.deliveryFee.toLocaleString('ar-IQ')} د.ع</span>
                      </div>
                      <div className="flex justify-between text-[#d4a853] font-bold text-lg">
                        <span>المجموع</span>
                        <span>
                          {(selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0) + selectedOrder.deliveryFee).toLocaleString('ar-IQ')} د.ع
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={handlePrint}
                      className="flex items-center justify-center gap-2 bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-2.5 rounded-xl text-sm font-semibold transition-all"
                    >
                      <Printer size={14} />
                      <span>طباعة</span>
                    </button>
                    {selectedOrder.status === 'جديد' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'قيد التحضير')}
                        className="flex items-center justify-center gap-2 bg-[#1a2235] hover:bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        <RotateCcw size={14} />
                        <span>تحضير</span>
                      </button>
                    )}
                    {selectedOrder.status === 'قيد التحضير' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'جاهز')}
                        className="flex items-center justify-center gap-2 bg-[#1a2235] hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        <Check size={14} />
                        <span>جاهز</span>
                      </button>
                    )}
                    {selectedOrder.status === 'جاهز' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'تم التسليم')}
                        className="flex items-center justify-center gap-2 bg-[#1a2235] hover:bg-[#6b7280]/20 text-[#6b7280] border border-[#6b7280]/30 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        <HomeIcon size={14} />
                        <span>تسليم</span>
                      </button>
                    )}
                    {selectedOrder.status === 'تم التسليم' && (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 bg-[#1a2235] text-[#6b7280] py-2.5 rounded-xl text-sm font-semibold opacity-50"
                      >
                        <Check size={14} />
                        <span>تم التسليم</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      deleteOrder(selectedOrder.id);
                      setSelectedOrderId(null);
                      showToast('تم حذف الطلب');
                    }}
                    className="w-full flex items-center justify-center gap-2 text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] py-2 rounded-xl text-sm transition-all"
                  >
                    <Trash2 size={14} />
                    <span>حذف الطلب</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-2xl p-8 text-center sticky top-4"
                >
                  <Receipt size={48} className="text-[#6b7280] mx-auto mb-3" />
                  <p className="text-[#9ca3af]">اختر طلباً لعرض التفاصيل</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Print Receipt */}
      {selectedOrder && (
        <div className="print-only">
          <div className="p-8 max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">Q Cafee</h2>
              <p className="text-sm text-gray-600">بغداد، العراق - شارع التانكي</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(selectedOrder.timestamp).toLocaleString('ar-IQ')}
              </p>
            </div>

            <div className="border-b border-gray-300 pb-3 mb-3">
              <p className="text-sm"><strong>رقم الطلب:</strong> #{selectedOrder.id}</p>
              <p className="text-sm"><strong>العميل:</strong> {selectedOrder.customerName}</p>
              <p className="text-sm"><strong>الهاتف:</strong> {selectedOrder.phone}</p>
              <p className="text-sm"><strong>العنوان:</strong> {selectedOrder.area} — {selectedOrder.address}</p>
            </div>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-right py-1">الصنف</th>
                  <th className="text-center py-1">الكمية</th>
                  <th className="text-left py-1">السعر</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{item.name}</td>
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-left py-1">{(item.price * item.quantity).toLocaleString('ar-IQ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-300 pt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>التوصيل</span>
                <span>{selectedOrder.deliveryFee.toLocaleString('ar-IQ')} د.ع</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>المجموع</span>
                <span>
                  {(selectedOrder.items.reduce((s, i) => s + i.price * i.quantity, 0) + selectedOrder.deliveryFee).toLocaleString('ar-IQ')} د.ع
                </span>
              </div>
            </div>

            <div className="text-center mt-8 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600">شكراً لاختياركم Q Cafee</p>
              <p className="text-xs text-gray-500 mt-1">نتمنى لكم وقتاً ممتعاً</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
      <p className="text-[#6b7280] text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`} style={{ fontFamily: 'Cairo, sans-serif' }}>
        {value}
      </p>
    </div>
  );
}
