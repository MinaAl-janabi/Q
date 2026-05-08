import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Phone, MapPin, Menu, X, Home } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCustomerPage = location.pathname === '/';

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      setHidden(currentY > lastScrollY && currentY > 100);
      lastScrollY = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isCustomerPage) return null;

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-colors duration-300 ${
          scrolled
            ? 'bg-[rgba(10,14,26,0.95)] backdrop-blur-xl shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between">
          {/* Right side - Logo & Location */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[#d4a853] font-bold text-xl" style={{ fontFamily: 'Cairo, sans-serif' }}>
                Q Cafee
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1.5 bg-[#1a2235] rounded-full px-3 py-1.5">
              <MapPin size={13} className="text-[#9ca3af]" />
              <span className="text-[#9ca3af] text-xs">بغداد - شارع التانكي</span>
            </div>
          </div>

          {/* Left side - Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#1a2235] border border-[#1f2937] hover:border-[#d4a853] rounded-xl px-4 py-2 transition-all duration-300"
            >
              <ShoppingCart size={18} className="text-[#d4a853]" />
              <span className="text-[#f3f4f6] text-sm hidden sm:inline">السلة</span>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-[#d4a853] text-[#0a0e1a] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              to="/admin"
              className="hidden md:block text-[#6b7280] hover:text-[#d4a853] text-sm transition-colors"
            >
              لوحة التحكم
            </Link>

            <a
              href="tel:+9647700000000"
              className="flex items-center gap-2 bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] rounded-xl px-4 py-2 transition-all duration-300"
            >
              <Phone size={16} />
              <span className="text-sm font-semibold hidden sm:inline">اتصل بنا</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#9ca3af] hover:text-[#d4a853]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.7)] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#111827] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[#d4a853] font-bold text-xl">Q Cafee</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#9ca3af]">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-[#f3f4f6] hover:text-[#d4a853] py-2 transition-colors"
                >
                  <Home size={20} />
                  <span>الرئيسية</span>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-[#f3f4f6] hover:text-[#d4a853] py-2 transition-colors"
                >
                  <Menu size={20} />
                  <span>لوحة التحكم</span>
                </Link>
                <a
                  href="tel:+9647700059992"
                  className="flex items-center gap-3 text-[#f3f4f6] hover:text-[#d4a853] py-2 transition-colors"
                >
                  <Phone size={20} />
                  <span>اتصل بنا</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
