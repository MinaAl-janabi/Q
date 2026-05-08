import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Minus, Trash2, MapPin, Phone, User, FileText,
  ChevronRight, Check, LocateFixed, Search, Loader2, Navigation2
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useToast } from '@/contexts/ToastContext';
import confetti from 'canvas-confetti';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    county?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSuggestion(s: Suggestion): { primary: string; secondary: string } {
  const a = s.address || {};
  const primary = a.road || a.suburb || a.neighbourhood || s.display_name.split(',')[0];
  const secondary = [a.suburb || a.neighbourhood, a.city || a.town || a.county, 'العراق']
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join('، ');
  return { primary, secondary };
}

function buildAddress(s: Suggestion): string {
  const a = s.address || {};
  return (
    [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.county]
      .filter(Boolean)
      .join('، ') ||
    s.display_name.split(',').slice(0, 3).join('،')
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`
    );
    const data = await res.json();
    const a = data.address || {};
    return (
      [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.county]
        .filter(Boolean)
        .join('، ') ||
      data.display_name?.split(',').slice(0, 3).join('،') ||
      ''
    );
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// ─── LocationInput — autocomplete search box ──────────────────────────────────
interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (lat: number, lng: number, address: string) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  error?: string;
}

function LocationInput({ value, onChange, onSelect, onLocateMe, isLocating, error }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); setIsOpen(false); return; }
    setIsSearching(true);
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', `${query}، العراق`);
      url.searchParams.set('format', 'json');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '6');
      url.searchParams.set('countrycodes', 'iq');
      url.searchParams.set('accept-language', 'ar');
      const res = await fetch(url.toString(), { headers: { 'Accept-Language': 'ar' } });
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
      setActiveIdx(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 320);
  };

  const handleSelect = (s: Suggestion) => {
    const addr = buildAddress(s);
    onChange(addr);
    onSelect(parseFloat(s.lat), parseFloat(s.lon), addr);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]); }
    if (e.key === 'Escape') setIsOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className={`
        flex items-center gap-2 bg-[#1a2235] border rounded-xl px-3 py-2.5 transition-all duration-200
        ${error
          ? 'border-[#ef4444]'
          : isOpen
            ? 'border-[#d4a853] shadow-[0_0_0_3px_rgba(212,168,83,0.12)]'
            : 'border-[#1f2937] hover:border-[#374151]'}
      `}>
        <div className="flex-shrink-0 text-[#6b7280]">
          {isSearching
            ? <Loader2 size={15} className="animate-spin text-[#d4a853]" />
            : <Search size={15} />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="ابحث… المنصور، الأعظمية، الكرادة…"
          dir="rtl"
          autoComplete="off"
          className="flex-1 bg-transparent text-[#f3f4f6] text-sm placeholder-[#4b5563] focus:outline-none min-w-0"
          style={{ fontFamily: 'Cairo, sans-serif' }}
        />

        {/* Locate me */}
        <button
          type="button"
          onClick={onLocateMe}
          disabled={isLocating}
          className={`
            flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all
            ${isLocating
              ? 'border-[#d4a853]/40 text-[#d4a853]/60 cursor-wait'
              : 'border-[#1f2937] text-[#9ca3af] hover:border-[#d4a853] hover:text-[#d4a853]'}
          `}
          style={{ fontFamily: 'Cairo, sans-serif' }}
        >
          {isLocating
            ? <Loader2 size={12} className="animate-spin" />
            : <LocateFixed size={12} />}
          <span>موقعي</span>
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-[#141d2e] border border-[#1f2937] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-[9999] overflow-hidden"
          >
            {suggestions.map((s, i) => {
              const { primary, secondary } = formatSuggestion(s);
              return (
                <button
                  key={s.place_id}
                  type="button"
                  onMouseDown={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-right transition-colors
                    ${i === activeIdx ? 'bg-[#d4a853]/10' : 'hover:bg-[#1a2235]'}
                    ${i !== suggestions.length - 1 ? 'border-b border-[#1f2937]' : ''}
                  `}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${i === activeIdx ? 'bg-[#d4a853]/20' : 'bg-[#1f2937]'}`}>
                    <MapPin size={13} className={i === activeIdx ? 'text-[#d4a853]' : 'text-[#6b7280]'} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-[#f3f4f6] text-sm font-medium truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>{primary}</div>
                    {secondary && (
                      <div className="text-[#6b7280] text-xs truncate mt-0.5" style={{ fontFamily: 'Cairo, sans-serif' }}>{secondary}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[#ef4444] text-xs mt-1.5" style={{ fontFamily: 'Cairo, sans-serif' }}>{error}</p>}
    </div>
  );
}

// ─── InteractiveMap ───────────────────────────────────────────────────────────
interface MapProps {
  onPinDrop: (lat: number, lng: number, address: string) => void;
  flyToRef: React.MutableRefObject<((lat: number, lng: number) => void) | null>;
  onReady: () => void;
}

function InteractiveMap({ onPinDrop, flyToRef, onReady }: MapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [pinPlaced, setPinPlaced] = useState(false);

  const buildGoldIcon = (L: any) =>
    L.divIcon({
      className: '',
      html: `<div style="width:40px;height:50px;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.8))">
        <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30S40 35 40 20C40 8.954 31.046 0 20 0z" fill="#d4a853"/>
          <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30S40 35 40 20C40 8.954 31.046 0 20 0z" fill="url(#g1)" opacity="0.35"/>
          <circle cx="20" cy="20" r="9" fill="#0a0e1a"/>
          <circle cx="20" cy="20" r="4.5" fill="#d4a853"/>
          <defs>
            <radialGradient id="g1" cx="35%" cy="25%">
              <stop offset="0%" stop-color="white" stop-opacity="0.7"/>
              <stop offset="100%" stop-color="white" stop-opacity="0"/>
            </radialGradient>
          </defs>
        </svg>
      </div>`,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
    });

  const placeOrMoveMarker = useCallback(
    async (lat: number, lng: number, map: any, L: any, skipGeocode = false) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = buildGoldIcon(L);
        markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', async (e: any) => {
          const pos = e.target.getLatLng();
          const addr = await reverseGeocode(pos.lat, pos.lng);
          onPinDrop(pos.lat, pos.lng, addr);
        });
      }
      setPinPlaced(true);
      if (!skipGeocode) {
        const addr = await reverseGeocode(lat, lng);
        onPinDrop(lat, lng, addr);
      }
    },
    [onPinDrop]
  );

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const init = async () => {
      if (!(window as any).L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        await new Promise<void>((res) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          s.onload = () => res();
          document.head.appendChild(s);
        });
      }

      const L = (window as any).L;
      const map = L.map(mapDivRef.current, {
        center: [33.3152, 44.3661],
        zoom: 11,
        zoomControl: false,
      });

      // CARTO dark tiles — free, no key, great in Iraq
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©<a href="https://openstreetmap.org">OSM</a> ©<a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      map.on('click', async (e: any) => {
        await placeOrMoveMarker(e.latlng.lat, e.latlng.lng, map, L);
      });

      flyToRef.current =async(lat: number, lng: number) => {
        map.flyTo([lat, lng], 15, { duration: 1.0, easeLinearity: 0.3 });
        await placeOrMoveMarker(lat, lng, map, L, true);
      };

      mapRef.current = map;
      setLoading(false);
      onReady();
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        flyToRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#1f2937]" style={{ height: '280px' }}>
      <div ref={mapDivRef} className="w-full h-full" />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 bg-[#0d1117] flex flex-col items-center justify-center gap-3 z-10">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#1f2937]" />
            <div className="absolute inset-0 rounded-full border-2 border-[#d4a853] border-t-transparent animate-spin" />
          </div>
          <span className="text-[#6b7280] text-xs" style={{ fontFamily: 'Cairo, sans-serif' }}>جاري تحميل الخريطة…</span>
        </div>
      )}

      {/* Tap hint — fades once pin is placed */}
      {!loading && !pinPlaced && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#d4a853]/10 animate-ping absolute inset-0" />
              <div className="w-12 h-12 rounded-full bg-[#d4a853]/20 flex items-center justify-center relative">
                <Navigation2 size={20} className="text-[#d4a853]" />
              </div>
            </div>
            <span className="text-[#d4a853] text-xs bg-[#0a0e1a]/80 px-3 py-1 rounded-full backdrop-blur-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
              اضغط لتحديد الموقع
            </span>
          </motion.div>
        </div>
      )}

      <style>{`
        .leaflet-control-attribution { background: rgba(10,14,26,0.8) !important; color: #374151 !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: #4b5563 !important; }
        .leaflet-control-zoom a { background: #141d2e !important; color: #9ca3af !important; border-color: #1f2937 !important; }
        .leaflet-control-zoom a:hover { background: #1a2235 !important; color: #f3f4f6 !important; }
      `}</style>
    </div>
  );
}

// ─── LocationSection — orchestrates input + map ───────────────────────────────
interface LocationSectionProps {
  address: string;
  area: string;
  lat: number | null;
  onAddressChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onLocationSet: (lat: number, lng: number, address: string) => void;
  errors: Record<string, string>;
}

function LocationSection({
  address, area, lat,
  onAddressChange, onAreaChange, onLocationSet, errors,
}: LocationSectionProps) {
  const [mapVisible, setMapVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);

  // Autocomplete pick → fly map
  const handleAutocompleteSelect = (la: number, lo: number, addr: string) => {
    onLocationSet(la, lo, addr);
    if (!mapVisible) setMapVisible(true);
    setTimeout(() => flyToRef.current?.(la, lo), 80);
  };

  // Pin drop on map → fill input
  const handlePinDrop = (la: number, lo: number, addr: string) => {
    onLocationSet(la, lo, addr);
    onAddressChange(addr);
  };

  // GPS locate me
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: la, longitude: lo } = pos.coords;
        if (!mapVisible) setMapVisible(true);
        setTimeout(() => flyToRef.current?.(la, lo), 80);
        const addr = await reverseGeocode(la, lo);
        onLocationSet(la, lo, addr);
        onAddressChange(addr);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Row: label + map toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[#9ca3af] text-xs" style={{ fontFamily: 'Cairo, sans-serif' }}>
          الموقع والعنوان *
        </label>
        <button
          type="button"
          onClick={() => setMapVisible(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
            mapVisible
              ? 'bg-[#d4a853]/15 border-[#d4a853]/60 text-[#d4a853]'
              : 'border-[#1f2937] text-[#6b7280] hover:border-[#d4a853]/50 hover:text-[#d4a853]'
          }`}
          style={{ fontFamily: 'Cairo, sans-serif' }}
        >
          <MapPin size={11} />
          {mapVisible ? 'إخفاء الخريطة' : 'فتح الخريطة'}
        </button>
      </div>

      {/* Smart search input with autocomplete */}
      <LocationInput
        value={address}
        onChange={onAddressChange}
        onSelect={handleAutocompleteSelect}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        error={errors.address}
      />

      {/* Collapsible map */}
      <AnimatePresence>
        {mapVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <InteractiveMap
              onPinDrop={handlePinDrop}
              flyToRef={flyToRef}
              onReady={() => {}}
            />

            {/* Pinned badge */}
            <AnimatePresence>
              {lat !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-2 flex items-center gap-2 bg-[#d4a853]/8 border border-[#d4a853]/20 rounded-xl px-3 py-2"
                >
                  <div className="w-5 h-5 rounded-full bg-[#d4a853]/20 flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-[#d4a853]" />
                  </div>
                  <span className="text-[#d4a853] text-xs flex-1 truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    {address || 'تم تحديد الموقع على الخريطة'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Area field */}
      <div>
        <label className="text-[#9ca3af] text-xs mb-1.5 block" style={{ fontFamily: 'Cairo, sans-serif' }}>
          المنطقة / الحي *
        </label>
        <div className="relative">
          <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            value={area}
            onChange={e => onAreaChange(e.target.value)}
            placeholder="مثال: الكرادة، المنصور، الأعظمية…"
            dir="rtl"
            className={`w-full bg-[#1a2235] border rounded-xl pr-9 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#4b5563] focus:outline-none transition-all ${
              errors.area ? 'border-[#ef4444]' : 'border-[#1f2937] focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)]'
            }`}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          />
        </div>
        {errors.area && <p className="text-[#ef4444] text-xs mt-1">{errors.area}</p>}
      </div>
    </div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────
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
    lat: null as number | null,
    lng: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryFee = 2000;
  const grandTotal = totalPrice + deliveryFee;

  const set = (field: string, value: string | number | null) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.customerName.trim()) e.customerName = 'الاسم مطلوب';
    if (!formData.phone.trim()) e.phone = 'رقم الهاتف مطلوب';
    else if (!/^07\d{9}$/.test(formData.phone.trim())) e.phone = 'رقم غير صحيح (مثال: 07XX XXX XXXX)';
    if (!formData.area.trim()) e.area = 'المنطقة مطلوبة';
    if (!formData.address.trim()) e.address = 'العنوان مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const id = await addOrder({
      customerName: formData.customerName,
      phone: formData.phone,
      area: formData.area,
      address: formData.address,
      notes: formData.notes,
      items: items.map(i => ({ flavorId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      deliveryFee,
      ...(formData.lat ? { lat: formData.lat, lng: formData.lng } : {}),
    });
    setOrderId(id);
    setStep('success');
    clearCart();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.8 }, colors: ['#d4a853', '#f59e0b', '#22c55e', '#f3f4f6'] });
    showToast('تم تأكيد طلبك بنجاح!');
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      setStep('cart');
      setFormData({ customerName: '', phone: '', area: '', address: '', notes: '', lat: null, lng: null });
      setErrors({});
    }, 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 z-[70]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-[#111827] border-l border-[#1f2937] z-[80] flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2937]">
              <h2 className="text-[#f3f4f6] text-xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                {step === 'cart' ? 'سلة الطلبات' : step === 'form' ? 'إتمام الطلب' : 'تأكيد الطلب'}
              </h2>
              <button onClick={handleClose} className="text-[#9ca3af] hover:text-[#f3f4f6] transition-colors p-1">
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">

                {/* ── Cart ── */}
                {step === 'cart' && (
                  <motion.div key="cart" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-16">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto text-[#374151] mb-4">
                          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-[#9ca3af] text-base" style={{ fontFamily: 'Cairo, sans-serif' }}>السلة فارغة</p>
                        <p className="text-[#4b5563] text-sm mt-1" style={{ fontFamily: 'Cairo, sans-serif' }}>أضف بعض النكهات للبدء</p>
                      </div>
                    ) : (
                      <>
                        {items.map((item, idx) => (
                          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 bg-[#1a2235] rounded-xl p-3">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[#f3f4f6] text-sm font-medium truncate" style={{ fontFamily: 'Cairo, sans-serif' }}>{item.name}</h4>
                              <p className="text-[#d4a853] text-sm font-semibold mt-0.5">{(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-[#111827] text-[#f3f4f6] flex items-center justify-center hover:bg-[#d4a853] hover:text-[#0a0e1a] transition-colors"><Minus size={14} /></button>
                              <span className="text-[#f3f4f6] text-sm font-semibold w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-[#111827] text-[#f3f4f6] flex items-center justify-center hover:bg-[#d4a853] hover:text-[#0a0e1a] transition-colors"><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-[#4b5563] hover:text-[#ef4444] transition-colors p-1"><Trash2 size={16} /></button>
                          </motion.div>
                        ))}
                        <div className="border-t border-[#1f2937] pt-4 space-y-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                          <div className="flex justify-between text-[#9ca3af] text-sm"><span>المجموع الفرعي</span><span>{totalPrice.toLocaleString('ar-IQ')} د.ع</span></div>
                          <div className="flex justify-between text-[#9ca3af] text-sm"><span>رسوم التوصيل</span><span>{deliveryFee.toLocaleString('ar-IQ')} د.ع</span></div>
                          <div className="flex justify-between text-[#d4a853] font-bold text-lg pt-2 border-t border-[#1f2937]"><span>المجموع الكلي</span><span>{grandTotal.toLocaleString('ar-IQ')} د.ع</span></div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── Form ── */}
                {step === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <button onClick={() => setStep('cart')} className="flex items-center gap-2 text-[#9ca3af] hover:text-[#d4a853] text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      <ChevronRight size={16} /><span>العودة للسلة</span>
                    </button>

                    {/* Name */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block" style={{ fontFamily: 'Cairo, sans-serif' }}>الاسم الكامل *</label>
                      <div className="relative">
                        <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                        <input type="text" value={formData.customerName} onChange={e => set('customerName', e.target.value)}
                          placeholder="أدخل اسمك الكامل" dir="rtl"
                          className={`w-full bg-[#1a2235] border rounded-xl pr-9 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#4b5563] focus:outline-none transition-all ${errors.customerName ? 'border-[#ef4444]' : 'border-[#1f2937] focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)]'}`}
                          style={{ fontFamily: 'Cairo, sans-serif' }} />
                      </div>
                      {errors.customerName && <p className="text-[#ef4444] text-xs mt-1">{errors.customerName}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block" style={{ fontFamily: 'Cairo, sans-serif' }}>رقم الهاتف *</label>
                      <div className="relative">
                        <Phone size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                        <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                          placeholder="07XX XXX XXXX"
                          className={`w-full bg-[#1a2235] border rounded-xl pr-9 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#4b5563] focus:outline-none transition-all text-left ${errors.phone ? 'border-[#ef4444]' : 'border-[#1f2937] focus:border-[#d4a853] focus:shadow-[0_0_0_3px_rgba(212,168,83,0.1)]'}`} />
                      </div>
                      {errors.phone && <p className="text-[#ef4444] text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Location */}
                    <LocationSection
                      address={formData.address}
                      area={formData.area}
                      lat={formData.lat}
                      onAddressChange={v => set('address', v)}
                      onAreaChange={v => set('area', v)}
                      onLocationSet={(la, lo, addr) =>
                        setFormData(prev => ({ ...prev, lat: la, lng: lo, address: addr || prev.address }))
                      }
                      errors={errors}
                    />

                    {/* Notes */}
                    <div>
                      <label className="text-[#9ca3af] text-xs mb-1.5 block" style={{ fontFamily: 'Cairo, sans-serif' }}>ملاحظات إضافية</label>
                      <div className="relative">
                        <FileText size={15} className="absolute right-3 top-3 text-[#6b7280]" />
                        <textarea value={formData.notes} onChange={e => set('notes', e.target.value)}
                          placeholder="أي ملاحظات خاصة بالطلب؟" rows={2} dir="rtl"
                          className="w-full bg-[#1a2235] border border-[#1f2937] rounded-xl pr-9 pl-4 py-3 text-[#f3f4f6] text-sm placeholder-[#4b5563] focus:outline-none focus:border-[#d4a853] transition-all resize-none"
                          style={{ fontFamily: 'Cairo, sans-serif' }} />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-[#1a2235] rounded-xl p-4 space-y-2">
                      <h4 className="text-[#f3f4f6] font-semibold text-sm mb-3" style={{ fontFamily: 'Cairo, sans-serif' }}>ملخص الطلب</h4>
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
                          <span className="text-[#9ca3af]">{item.name} × {item.quantity}</span>
                          <span className="text-[#f3f4f6]">{(item.price * item.quantity).toLocaleString('ar-IQ')} د.ع</span>
                        </div>
                      ))}
                      <div className="border-t border-[#1f2937] pt-2 mt-2 space-y-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                        <div className="flex justify-between text-sm text-[#9ca3af]"><span>التوصيل</span><span>{deliveryFee.toLocaleString('ar-IQ')} د.ع</span></div>
                        <div className="flex justify-between text-[#d4a853] font-bold"><span>المجموع</span><span>{grandTotal.toLocaleString('ar-IQ')} د.ع</span></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Success ── */}
                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }} className="text-center py-12">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-6">
                      <Check size={40} className="text-[#22c55e]" />
                    </motion.div>
                    <h3 className="text-[#22c55e] text-2xl font-bold mb-3" style={{ fontFamily: 'Cairo, sans-serif' }}>تم تأكيد طلبك بنجاح!</h3>
                    <p className="text-[#9ca3af] mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>سنقوم بالتواصل معك قريباً</p>
                    <p className="text-[#6b7280] text-sm mb-8" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      رقم الطلب: <span className="text-[#d4a853] font-mono">#{orderId}</span>
                    </p>
                    <button onClick={handleClose} className="bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] px-8 py-3 rounded-xl font-semibold transition-colors" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      طلب جديد
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step === 'cart' && items.length > 0 && (
              <div className="p-5 border-t border-[#1f2937] space-y-3">
                <div className="flex justify-between text-[#d4a853] font-bold text-lg" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  <span>المجموع الكلي</span><span>{grandTotal.toLocaleString('ar-IQ')} د.ع</span>
                </div>
                <button onClick={() => setStep('form')}
                  className="w-full bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3.5 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] active:scale-[0.97]"
                  style={{ fontFamily: 'Cairo, sans-serif' }}>
                  إتمام الطلب
                </button>
              </div>
            )}
            {step === 'form' && (
              <div className="p-5 border-t border-[#1f2937]">
                <button onClick={handleSubmit}
                  className="w-full bg-[#d4a853] hover:bg-[#e8c068] text-[#0a0e1a] py-3.5 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] active:scale-[0.97]"
                  style={{ fontFamily: 'Cairo, sans-serif' }}>
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