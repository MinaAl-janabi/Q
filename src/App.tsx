import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from '@/contexts/CartContext';
import { FlavorsProvider } from '@/contexts/FlavorsContext';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { ToastProvider } from '@/contexts/ToastContext';
import Navbar from '@/components/Navbar';
import CustomerPage from '@/pages/CustomerPage';
import AdminPage from '@/pages/AdminPage';
import CashierPage from '@/pages/CashierPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<CustomerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cashier" element={<CashierPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <FlavorsProvider>
      <OrdersProvider>
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <AnimatedRoutes />
          </ToastProvider>
        </CartProvider>
      </OrdersProvider>
    </FlavorsProvider>
  );
}
