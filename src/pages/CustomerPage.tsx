import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Phone, ChevronDown, MapPin, Clock, Instagram } from 'lucide-react';
import { useFlavors } from '@/contexts/FlavorsContext';
import type { CategoryFilter } from '@/types';
import FlavorCard from '@/components/FlavorCard';
import CartDrawer from '@/components/CartDrawer';

const categories: { key: CategoryFilter; label: string }[] = [
  { key: 'الكل', label: 'الكل' },
  { key: 'مميزة', label: 'مميزة' },
  { key: 'فواكه', label: 'فواكه' },
  { key: 'منعشة', label: 'منعشة' },
  { key: 'كلاسيكية', label: 'كلاسيكية' },
];

export default function CustomerPage() {
  const { flavors } = useFlavors();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('الكل');
  const flavorsRef = useRef<HTMLDivElement>(null);

  const filteredFlavors =
    activeCategory === 'الكل'
      ? flavors
      : flavors.filter((f) => f.category === activeCategory);

  const scrollToFlavors = () => {
    flavorsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Floating particles
  const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 4 + Math.random() * 6,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 10,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end pb-[15vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Q Cafee"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a]/40 to-transparent" />
        </div>

        {/* Floating Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#d4a853] animate-float-up pointer-events-none"
            style={{
              left: p.left,
              bottom: '-10px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        {/* Amber Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[#f3f4f6] text-5xl md:text-7xl font-black mb-4"
            style={{
              fontFamily: 'Cairo, sans-serif',
              textShadow: '0 2px 30px rgba(0,0,0,0.8)',
              letterSpacing: '-0.02em',
            }}
          >
            Q Cafee
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[#9ca3af] text-lg md:text-xl max-w-[500px] mx-auto mb-8"
          >
xxxxxxxxxx          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <button
              onClick={scrollToFlavors}
              className="bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] px-8 py-3.5 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              اطلب الآن
            </button>
            <a
              href="tel:+9647700000000"
              className="border border-[#d4a853] text-[#d4a853] hover:bg-[rgba(212,168,83,0.1)] px-8 py-3.5 rounded-xl font-semibold transition-all active:scale-[0.97]"
            >
              اتصل بنا
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="inline-flex items-center gap-2 bg-[rgba(212,168,83,0.15)] text-[#d4a853] px-4 py-2 rounded-full text-sm"
          >
            <Star size={14} fill="currentColor" />
            <span>+{flavors.length} نكهة متوفرة</span>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={28} className="text-[#9ca3af] animate-bounce-gentle" />
        </motion.div>
      </section>

      {/* Flavors Section */}
      <section ref={flavorsRef} className="py-20 bg-[#0a0e1a]">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Section Header */}
          <div className="mb-10">
            <div className="w-10 h-0.5 bg-[#d4a853] mb-4" />
            <h2
              className="text-[#f3f4f6] text-3xl md:text-4xl font-bold mb-3"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            >
              قائمة النكهات
            </h2>
            <p className="text-[#9ca3af] max-w-[600px]">
              اختر من تشكيلتنا الواسعة من نكهات الأرجيلة المميزة
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.key
                    ? 'bg-[#d4a853] text-[#0a0e1a]'
                    : 'bg-[#1a2235] text-[#9ca3af] hover:bg-[#1f2937]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Flavors Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredFlavors.map((flavor, idx) => (
              <FlavorCard key={flavor.id} flavor={flavor} index={idx} />
            ))}
          </motion.div>

          {filteredFlavors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#6b7280] text-lg">لا توجد نكهات في هذا التصنيف</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0e1a] border-t border-[#1f2937] py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h3
            className="text-[#d4a853] text-2xl font-bold mb-6"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            Q Cafee
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8 text-[#9ca3af]">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#d4a853]" />
              <span className="text-sm">بغداد، العراق</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#d4a853]" />
              <a href="tel:+9647700000000" className="text-sm hover:text-[#d4a853] transition-colors">
                0770-000-0000
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#d4a853]" />
              <span className="text-sm">مفتوح يومياً من x عصراً حتىx صباحاً</span>
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <a
              href="https://wa.me/9647700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#1a2235] flex items-center justify-center text-[#9ca3af] hover:bg-[#d4a853] hover:text-[#0a0e1a] transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a2235] flex items-center justify-center text-[#9ca3af] hover:bg-[#d4a853] hover:text-[#0a0e1a] transition-all"
            >
              <Instagram size={18} />
            </a>
          </div>

          <p className="text-[#6b7280] text-xs">
            &copy; 2026 Q Cafee. 
          </p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
