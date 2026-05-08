import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Star } from 'lucide-react';
import type { Flavor } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
interface FlavorCardProps {
  flavor: Flavor;
  index: number;
}

export default function FlavorCard({ flavor, index }: FlavorCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);
  
  

  const handleAdd = () => {
    addItem({
      id: flavor.id,
      name: flavor.name,
      price: flavor.price,
      image: flavor.image,
    });
    setAdded(true);
    showToast(`تمت إضافة ${flavor.name} إلى السلة`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      layout
      className={`group bg-[#111827] rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 ${
        flavor.special
          ? 'border-[#d4a853] hover:shadow-[0_8px_32px_rgba(212,168,83,0.15)]'
          : 'border-[#1f2937] hover:border-[#d4a853]/30 hover:shadow-[0_8px_32px_rgba(212,168,83,0.1)]'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={flavor.image}
          alt={flavor.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {flavor.special && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#d4a853] text-[#0a0e1a] px-2.5 py-1 rounded-full text-xs font-semibold">
            <Star size={12} fill="currentColor" />
            <span>مميز</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="text-[#f3f4f6] font-semibold text-lg mb-1 line-clamp-1"
          style={{ fontFamily: 'Cairo, sans-serif' }}
        >
          {flavor.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span
            className="text-[#d4a853] font-bold text-lg"
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            {flavor.price.toLocaleString('ar-IQ')} د.ع
          </span>
          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              added
                ? 'bg-[#22c55e] text-white'
                : 'bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check size={16} />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
    
  );
}
