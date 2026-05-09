import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Receipt, Printer, Home, Plus, Pencil, Trash2,
  Search, X, ImageIcon, Star, ChevronLeft, LogOut, Shield, MapPin
} from 'lucide-react';
import type { Flavor, Order, OrderItem, OrderStatus, OrderStatusFilter } from '@/types';
import { useFlavors } from '@/contexts/FlavorsContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useToast } from '@/contexts/ToastContext';

type AdminTab = 'flavors' | 'orders';

const statusColors: Record<OrderStatus, string> = {
  'جديد': 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
  'قيد التحضير': 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6] border-[rgba(59,130,246,0.3)]',
  'جاهز': 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
  'تم التسليم': 'bg-[rgba(107,114,128,0.15)] text-[#6b7280] border-[rgba(107,114,128,0.3)]',
  'ملغى': 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
  'مدفوع': 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
};

const orderStatusFilters: OrderStatusFilter[] = ['الكل', 'جديد', 'قيد التحضير', 'جاهز', 'تم التسليم', 'ملغى', 'مدفوع'];

const categoryOptions = ['مميزة', 'فواكه', 'منعشة', 'كلاسيكية'];

// ─── Sound Effect ───
function playNewOrderSound() {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1109, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    console.error('Sound play failed:', e);
  }
}

export default function AdminPage() {
  const { flavors, addFlavor, updateFlavor, deleteFlavor } = useFlavors();
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { showToast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('qcaFee_admin') === 'true';
  });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('flavors');
  const [orderFilter, setOrderFilter] = useState<OrderStatusFilter>('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Sound: detect new orders ───
  const prevOrdersLength = useRef(orders.length);
  useEffect(() => {
    if (isAuthenticated && orders.length > prevOrdersLength.current && prevOrdersLength.current > 0) {
      playNewOrderSound();
      showToast('طلب جديد وصل!', 'success');
    }
    prevOrdersLength.current = orders.length;
  }, [orders.length, isAuthenticated, showToast]);

  const [showFlavorModal, setShowFlavorModal] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [flavorForm, setFlavorForm] = useState({
    name: '',
    price: '',
    category: 'مميزة' as Flavor['category'],
    special: false,
    image: '',
  });

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'flavor' | 'order'; id: string } | null>(null);

  const handleLogin = () => {
    if (password === 'admin123') {
      sessionStorage.setItem('qcaFee_admin', 'true');
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('qcaFee_admin');
    setIsAuthenticated(false);
    setPassword('');
  };

  const openAddFlavor = () => {
    setEditingFlavor(null);
    setFlavorForm({ name: '', price: '', category: 'مميزة', special: false, image: '' });
    setShowFlavorModal(true);
  };

  const openEditFlavor = (flavor: Flavor) => {
    setEditingFlavor(flavor);
    setFlavorForm({
      name: flavor.name,
      price: flavor.price.toString(),
      category: flavor.category,
      special: flavor.special,
      image: flavor.image,
    });
    setShowFlavorModal(true);
  };

  const handleSaveFlavor = () => {
    if (!flavorForm.name || !flavorForm.price) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    const flavorData = {
      name: flavorForm.name,
      price: parseInt(flavorForm.price),
      category: flavorForm.category,
      special: flavorForm.special,
      image: flavorForm.image || '/images/flavor-special.jpg',
    };

    if (editingFlavor) {
      updateFlavor(editingFlavor.id, flavorData);
      showToast('تم تحديث النكهة بنجاح');
    } else {
      addFlavor(flavorData);
      showToast('تمت إضافة النكهة بنجاح');
    }

    setShowFlavorModal(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'flavor') {
      deleteFlavor(deleteTarget.id);
      showToast('تم حذف النكهة');
    } else {
      deleteOrder(deleteTarget.id);
      showToast('تم حذف الطلب');
    }
    setDeleteTarget(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlavorForm({ ...flavorForm, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredOrders = orderFilter === 'الكل'
    ? orders
    : orders.filter((o: Order) => o.status === orderFilter);

  const searchedFlavors = searchQuery
    ? flavors.filter((f: Flavor) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : flavors;

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
              <Shield size={32} className="text-[#d4a853]" />
            </div>
            <h2 className="text-[#f3f4f6] text-2xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
              لوحة التحكم
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
              className={`w-full bg-[#1a2235] border rounded-xl px-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)] transition-all ${
                passwordError ? 'border-[#ef4444]' : 'border-[#1f2937]'
              }`}
            />
            {passwordError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#ef4444] text-sm"
              >
                {passwordError}
              </motion.p>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3 rounded-xl font-semibold transition-all active:scale-[0.97]"
            >
              دخول
            </button>
          </div>

          <div className="text-center mt-6">
            <Link to="/" className="text-[#6b7280] hover:text-[#d4a853] text-sm transition-colors">
              العودة للموقع
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1729] border-l border-[#1f2937] hidden md:flex flex-col fixed right-0 top-0 bottom-0 z-40">
        <div className="p-6 border-b border-[#1f2937]">
          <h2 className="text-[#d4a853] text-xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
            Q Cafee
          </h2>
          <p className="text-[#6b7280] text-xs mt-1">لوحة التحكم</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('flavors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === 'flavors'
                ? 'bg-[rgba(212,168,83,0.1)] text-[#d4a853] border-r-2 border-[#d4a853]'
                : 'text-[#9ca3af] hover:bg-[#1a2235]'
            }`}
          >
            <Settings size={18} />
            <span>النكهات</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              activeTab === 'orders'
                ? 'bg-[rgba(212,168,83,0.1)] text-[#d4a853] border-r-2 border-[#d4a853]'
                : 'text-[#9ca3af] hover:bg-[#1a2235]'
            }`}
          >
            <Receipt size={18} />
            <span>الطلبات</span>
          </button>
          <Link
            to="/cashier"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#9ca3af] hover:bg-[#1a2235] transition-all"
          >
            <Printer size={18} />
            <span>الكاشير</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#1f2937] space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#9ca3af] hover:bg-[#1a2235] transition-all"
          >
            <Home size={18} />
            <span>العودة للموقع</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] transition-all"
          >
            <LogOut size={18} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0f1729] border-b border-[#1f2937] z-40 px-4 py-3 flex items-center justify-between">
        <h2 className="text-[#d4a853] font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>Q Cafee</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('flavors')}
            className={`px-3 py-1.5 rounded-lg text-xs ${activeTab === 'flavors' ? 'bg-[rgba(212,168,83,0.1)] text-[#d4a853]' : 'text-[#9ca3af]'}`}
          >
            النكهات
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs ${activeTab === 'orders' ? 'bg-[rgba(212,168,83,0.1)] text-[#d4a853]' : 'text-[#9ca3af]'}`}
          >
            الطلبات
          </button>
          <Link to="/" className="text-[#9ca3af]">
            <Home size={18} />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:mr-64 pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-5xl">
          {/* Flavors Tab */}
          {activeTab === 'flavors' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#f3f4f6] text-2xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  إدارة النكهات
                </h2>
                <button
                  onClick={openAddFlavor}
                  className="flex items-center gap-2 bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <Plus size={16} />
                  <span>إضافة نكهة</span>
                </button>
              </div>

              <div className="relative mb-6">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن نكهة..."
                  className="w-full bg-[#1a2235] border border-[#1f2937] rounded-xl pr-10 pl-4 py-2.5 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] transition-all"
                />
              </div>

              <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1f2937]">
                        <th className="text-right text-[#9ca3af] text-xs font-medium py-3 px-4">الصورة</th>
                        <th className="text-right text-[#9ca3af] text-xs font-medium py-3 px-4">اسم النكهة</th>
                        <th className="text-right text-[#9ca3af] text-xs font-medium py-3 px-4">السعر</th>
                        <th className="text-right text-[#9ca3af] text-xs font-medium py-3 px-4">التصنيف</th>
                        <th className="text-right text-[#9ca3af] text-xs font-medium py-3 px-4">مميز</th>
                        <th className="text-right text-[#9ca3af] text-xs font-medium py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchedFlavors.map((flavor: Flavor) => (
                        <tr key={flavor.id} className="border-b border-[#1f2937] last:border-0 hover:bg-[#1a2235]/50 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={flavor.image}
                              alt={flavor.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          </td>
                          <td className="py-3 px-4 text-[#f3f4f6] text-sm">{flavor.name}</td>
                          <td className="py-3 px-4 text-[#d4a853] font-semibold text-sm">
                            {flavor.price.toLocaleString('ar-IQ')} د.ع
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-[#1a2235] text-[#9ca3af]">
                              {flavor.category}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {flavor.special ? (
                              <Star size={16} className="text-[#d4a853]" fill="currentColor" />
                            ) : (
                              <span className="text-[#6b7280]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditFlavor(flavor)}
                                className="w-8 h-8 rounded-lg bg-[#1a2235] text-[#9ca3af] hover:text-[#d4a853] flex items-center justify-center transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'flavor', id: flavor.id })}
                                className="w-8 h-8 rounded-lg bg-[#1a2235] text-[#9ca3af] hover:text-[#ef4444] flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {searchedFlavors.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[#6b7280]">لا توجد نكهات</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-[#f3f4f6] text-2xl font-bold mb-6" style={{ fontFamily: 'Cairo, sans-serif' }}>
                الطلبات الواردة
              </h2>

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {orderStatusFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                      orderFilter === filter
                        ? 'bg-[#d4a853] text-[#0a0e1a]'
                        : 'bg-[#1a2235] text-[#9ca3af] hover:bg-[#1f2937]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredOrders.map((order: Order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={(status: OrderStatus) => updateOrderStatus(order.id, status)}
                      onDelete={() => setDeleteTarget({ type: 'order', id: order.id })}
                    />
                  ))}
                </AnimatePresence>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-16 bg-[#111827] rounded-2xl border border-[#1f2937]">
                    <Receipt size={48} className="text-[#6b7280] mx-auto mb-3" />
                    <p className="text-[#9ca3af]">لا توجد طلبات حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Flavor Modal */}
      <AnimatePresence>
        {showFlavorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[90] flex items-center justify-center p-4"
            onClick={() => setShowFlavorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#f3f4f6] text-xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {editingFlavor ? 'تعديل النكهة' : 'إضافة نكهة جديدة'}
                </h3>
                <button onClick={() => setShowFlavorModal(false)} className="text-[#6b7280] hover:text-[#f3f4f6]">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[#9ca3af] text-xs mb-1.5 block">اسم النكهة *</label>
                  <input
                    type="text"
                    value={flavorForm.name}
                    onChange={(e) => setFlavorForm({ ...flavorForm, name: e.target.value })}
                    className="w-full bg-[#1a2235] border border-[#1f2937] rounded-xl px-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] transition-all"
                    placeholder="اسم النكهة"
                  />
                </div>

                <div>
                  <label className="text-[#9ca3af] text-xs mb-1.5 block">السعر (د.ع) *</label>
                  <input
                    type="number"
                    value={flavorForm.price}
                    onChange={(e) => setFlavorForm({ ...flavorForm, price: e.target.value })}
                    className="w-full bg-[#1a2235] border border-[#1f2937] rounded-xl px-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] transition-all"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="text-[#9ca3af] text-xs mb-1.5 block">التصنيف</label>
                  <select
                    value={flavorForm.category}
                    onChange={(e) => setFlavorForm({ ...flavorForm, category: e.target.value as Flavor['category'] })}
                    className="w-full bg-[#1a2235] border border-[#1f2937] rounded-xl px-4 py-3 text-[#f3f4f6] text-sm focus:outline-none focus:border-[#d4a853] transition-all"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between bg-[#1a2235] rounded-xl px-4 py-3">
                  <span className="text-[#f3f4f6] text-sm">نكهة مميزة</span>
                  <button
                    onClick={() => setFlavorForm({ ...flavorForm, special: !flavorForm.special })}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      flavorForm.special ? 'bg-[#d4a853]' : 'bg-[#1f2937]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        flavorForm.special ? 'left-0.5' : 'right-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-[#9ca3af] text-xs mb-1.5 block">صورة النكهة</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="flavor-image"
                    />
                    <label
                      htmlFor="flavor-image"
                      className="flex items-center justify-center gap-2 w-full bg-[#1a2235] border border-dashed border-[#1f2937] rounded-xl px-4 py-6 text-[#9ca3af] text-sm cursor-pointer hover:border-[#d4a853] transition-colors"
                    >
                      {flavorForm.image ? (
                        <img src={flavorForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <>
                          <ImageIcon size={20} />
                          <span>اختر صورة</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveFlavor}
                    className="flex-1 bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3 rounded-xl font-semibold transition-all"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setShowFlavorModal(false)}
                    className="flex-1 border border-[#1f2937] text-[#9ca3af] hover:text-[#f3f4f6] py-3 rounded-xl transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[90] flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[rgba(239,68,68,0.15)] flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-[#ef4444]" />
              </div>
              <h3 className="text-[#f3f4f6] text-lg font-bold mb-2">تأكيد الحذف</h3>
              <p className="text-[#9ca3af] text-sm mb-6">
                هل أنت متأكد من حذف {deleteTarget.type === 'flavor' ? 'هذه النكهة' : 'هذا الطلب'}؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-xl font-semibold transition-all"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-[#1f2937] text-[#9ca3af] py-2.5 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderCard({
  order,
  onStatusChange,
  onDelete,
}: {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const total = order.items.reduce((sum: number, i: OrderItem) => sum + i.price * i.quantity, 0) + order.deliveryFee;

  const statusFlow: OrderStatus[] = ['جديد', 'قيد التحضير', 'جاهز', 'تم التسليم'];
  const currentIdx = statusFlow.indexOf(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h4 className="text-[#f3f4f6] font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
            #{order.id}
          </h4>
          <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
        <span className="text-[#6b7280] text-xs">
          {new Date(order.timestamp).toLocaleString('ar-IQ')}
        </span>
      </div>

      <div className="text-sm text-[#9ca3af] mb-3 space-y-1">
        <p>{order.customerName} — {order.phone}</p>
        <p className="flex items-center gap-1">
          <MapPin size={12} className="text-[#d4a853]" />
          <span>{order.area} — {order.address}</span>
        </p>
      </div>

      <div className="text-sm mb-4">
        {order.items.slice(0, expanded ? undefined : 2).map((item: OrderItem) => (
          <div key={item.flavorId} className="flex justify-between py-1">
            <span className="text-[#9ca3af]">{item.name} × {item.quantity}</span>
            <span className="text-[#f3f4f6]">{(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
          </div>
        ))}
        {!expanded && order.items.length > 2 && (
          <button onClick={() => setExpanded(true)} className="text-[#d4a853] text-xs mt-1">
            +{order.items.length - 2} المزيد
          </button>
        )}
        <div className="flex justify-between pt-2 border-t border-[#1f2937] mt-2">
          <span className="text-[#9ca3af]">التوصيل</span>
          <span className="text-[#f3f4f6]">{order.deliveryFee.toLocaleString('ar-IQ')} د.ع</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-[#d4a853] font-bold">المجموع</span>
          <span className="text-[#d4a853] font-bold">{total.toLocaleString('ar-IQ')} د.ع</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {currentIdx < statusFlow.length - 1 && (
          <button
            onClick={() => onStatusChange(statusFlow[currentIdx + 1])}
            className="flex items-center gap-1.5 bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] px-3 py-2 rounded-lg text-xs font-semibold transition-all"
          >
            <ChevronLeft size={14} />
            <span>{statusFlow[currentIdx + 1]}</span>
          </button>
        )}
        <select
          value={order.status}
          onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
          className="bg-[#1a2235] border border-[#1f2937] text-[#f3f4f6] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#d4a853]"
        >
          {statusFlow.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button onClick={onDelete} className="text-[#6b7280] hover:text-[#ef4444] p-2 transition-colors mr-auto">
          <Trash2 size={14} />
        </button>
      </div>
      
    </motion.div>
  );
}