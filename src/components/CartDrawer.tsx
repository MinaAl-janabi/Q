import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, MapPin, Phone, User, FileText, ChevronRight, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useToast } from '@/contexts/ToastContext';
import confetti from 'canvas-confetti';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { showToast } = useToast();
  const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    area: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryFee = 2000;
  const grandTotal = totalPrice + deliveryFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'الاسم مطلوب';
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^07\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'رقم غير صحيح (مثال: 07XX XXX XXXX)';
    }
    if (!formData.area.trim()) newErrors.area = 'المنطقة مطلوبة';
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const orderItems = items.map((item) => ({
      flavorId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const id = addOrder({
      customerName: formData.customerName,
      phone: formData.phone,
      area: formData.area,
      address: formData.address,
      notes: formData.notes,
      items: orderItems,
      deliveryFee,
    });

    setOrderId(id);
    setStep('success');
    clearCart();

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#d4a853', '#f59e0b', '#22c55e', '#f3f4f6'],
    });

    showToast('تم تأكيد طلبك بنجاح!');
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep('cart');
      setFormData({ customerName: '', phone: '', area: '', address: '', notes: '' });
      setErrors({});
    }, 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 z-[70]"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#111827] border-l border-[#1f2937] z-[80] flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1f2937]">
              <h2 className="text-[#f3f4f6] text-xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                {step === 'cart' && 'سلة الطلبات'}
                {step === 'form' && 'إتمام الطلب'}
                {step === 'success' && 'تأكيد الطلب'}
              </h2>
              <button
                onClick={handleClose}
                className="text-[#9ca3af] hover:text-[#f3f4f6] transition-colors p-1"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                {/* Cart Items */}
                {step === 'cart' && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-[#6b7280] mb-3">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-[#9ca3af] text-lg">السلة فارغة</p>
                        <p className="text-[#6b7280] text-sm mt-1">أضف بعض النكهات للبدء</p>
                      </div>
                    ) : (
                      <>
                        {items.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 bg-[#1a2235] rounded-xl p-3"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[#f3f4f6] text-sm font-medium truncate">{item.name}</h4>
                              <p className="text-[#d4a853] text-sm font-semibold mt-0.5">
                                {(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-lg bg-[#111827] text-[#f3f4f6] flex items-center justify-center hover:bg-[#d4a853] hover:text-[#0a0e1a] transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-[#f3f4f6] text-sm font-semibold w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-lg bg-[#111827] text-[#f3f4f6] flex items-center justify-center hover:bg-[#d4a853] hover:text-[#0a0e1a] transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[#6b7280] hover:text-[#ef4444] transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        ))}

                        {/* Summary */}
                        <div className="border-t border-[#1f2937] pt-4 mt-4 space-y-2">
                          <div className="flex justify-between text-[#9ca3af]">
                            <span>المجموع الفرعي</span>
                            <span>{totalPrice.toLocaleString('ar-IQ')} د.ع</span>
                          </div>
                          <div className="flex justify-between text-[#9ca3af]">
                            <span>رسوم التوصيل</span>
                            <span>{deliveryFee.toLocaleString('ar-IQ')} د.ع</span>
                          </div>
                          <div className="flex justify-between text-[#d4a853] font-bold text-lg pt-2 border-t border-[#1f2937]">
                            <span>المجموع الكلي</span>
                            <span>{grandTotal.toLocaleString('ar-IQ')} د.ع</span>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Order Form */}
                {step === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <button
                      onClick={() => setStep('cart')}
                      className="flex items-center gap-2 text-[#9ca3af] hover:text-[#d4a853] text-sm mb-4"
                    >
                      <ChevronRight size={16} />
                      <span>العودة للسلة</span>
                    </button>

                    {/* Name */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block">الاسم الكامل *</label>
                      <div className="relative">
                        <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder="أدخل اسمك الكامل"
                          className={`w-full bg-[#1a2235] border rounded-xl pr-10 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)] transition-all ${
                            errors.customerName ? 'border-[#ef4444]' : 'border-[#1f2937]'
                          }`}
                        />
                      </div>
                      {errors.customerName && <p className="text-[#ef4444] text-xs mt-1">{errors.customerName}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block">رقم الهاتف *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="07XX XXX XXXX"
                          className={`w-full bg-[#1a2235] border rounded-xl pr-10 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)] transition-all text-left ${
                            errors.phone ? 'border-[#ef4444]' : 'border-[#1f2937]'
                          }`}
                        />
                      </div>
                      {errors.phone && <p className="text-[#ef4444] text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Area */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block">المنطقة *</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                        <input
                          type="text"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder="أدخل منطقتك"
                          className={`w-full bg-[#1a2235] border rounded-xl pr-10 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)] transition-all ${
                            errors.area ? 'border-[#ef4444]' : 'border-[#1f2937]'
                          }`}
                        />
                      </div>
                      {errors.area && <p className="text-[#ef4444] text-xs mt-1">{errors.area}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block">العنوان التفصيلي *</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="أدخل العنوان التفصيلي مع أقرب نقطة دالة"
                        rows={3}
                        className={`w-full bg-[#1a2235] border rounded-xl px-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)] transition-all resize-none ${
                          errors.address ? 'border-[#ef4444]' : 'border-[#1f2937]'
                        }`}
                      />
                      {errors.address && <p className="text-[#ef4444] text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block">ملاحظات إضافية</label>
                      <div className="relative">
                        <FileText size={16} className="absolute right-3 top-3 text-[#6b7280]" />
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="أي ملاحظات خاصة بالطلب؟"
                          rows={2}
                          className="w-full bg-[#1a2235] border border-[#1f2937] rounded-xl pr-10 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)] transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-[#1a2235] rounded-xl p-4 space-y-2">
                      <h4 className="text-[#f3f4f6] font-semibold text-sm mb-3">ملخص الطلب</h4>
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-[#9ca3af]">{item.name} × {item.quantity}</span>
                          <span className="text-[#f3f4f6]">{(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
                        </div>
                      ))}
                      <div className="border-t border-[#1f2937] pt-2 mt-2 space-y-1">
                        <div className="flex justify-between text-sm text-[#9ca3af]">
                          <span>التوصيل</span>
                          <span>{deliveryFee.toLocaleString('ar-IQ')} د.ع</span>
                        </div>
                        <div className="flex justify-between text-[#d4a853] font-bold">
                          <span>المجموع</span>
                          <span>{grandTotal.toLocaleString('ar-IQ')} د.ع</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Success */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-6"
                    >
                      <Check size={40} className="text-[#22c55e]" />
                    </motion.div>
                    <h3
                      className="text-[#22c55e] text-2xl font-bold mb-3"
                      style={{ fontFamily: 'Cairo, sans-serif' }}
                    >
                      تم تأكيد طلبك بنجاح!
                    </h3>
                    <p className="text-[#9ca3af] mb-2">سنقوم بالتواصل معك قريباً</p>
                    <p className="text-[#6b7280] text-sm mb-8">
                      رقم الطلب: <span className="text-[#d4a853] font-mono">#{orderId}</span>
                    </p>
                    <button
                      onClick={handleClose}
                      className="bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] px-8 py-3 rounded-xl font-semibold transition-colors"
                    >
                      طلب جديد
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step === 'cart' && items.length > 0 && (
              <div className="p-5 border-t border-[#1f2937] space-y-3">
                <div className="flex justify-between text-[#d4a853] font-bold text-lg">
                  <span>المجموع الكلي</span>
                  <span>{grandTotal.toLocaleString('ar-IQ')} د.ع</span>
                </div>
                <button
                  onClick={() => setStep('form')}
                  className="w-full bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3.5 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] active:scale-[0.97]"
                >
                  إتمام الطلب
                </button>
              </div>
            )}

            {step === 'form' && (
              <div className="p-5 border-t border-[#1f2937]">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3.5 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] active:scale-[0.97]"
                >
                  تأكيد الطلب
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
