import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Flavor } from '@/types';
import { initialFlavors } from '@/data/flavors';

interface FlavorsContextType {
  flavors: Flavor[];
  addFlavor: (flavor: Omit<Flavor, 'id'>) => void;
  updateFlavor: (id: string, flavor: Partial<Flavor>) => void;
  deleteFlavor: (id: string) => void;
}

const FlavorsContext = createContext<FlavorsContextType | undefined>(undefined);

export function FlavorsProvider({ children }: { children: React.ReactNode }) {
  const [flavors, setFlavors] = useState<Flavor[]>(() => {
    const saved = localStorage.getItem('qcaFee_flavors');
    return saved ? JSON.parse(saved) : initialFlavors;
  });

  useEffect(() => {
    localStorage.setItem('qcaFee_flavors', JSON.stringify(flavors));
  }, [flavors]);

  const addFlavor = useCallback((flavor: Omit<Flavor, 'id'>) => {
    const newFlavor: Flavor = {
      ...flavor,
      id: `flavor-${Date.now()}`,
    };
    setFlavors((prev) => [...prev, newFlavor]);
  }, []);

  const updateFlavor = useCallback((id: string, updates: Partial<Flavor>) => {
    setFlavors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const deleteFlavor = useCallback((id: string) => {
    setFlavors((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <FlavorsContext.Provider value={{ flavors, addFlavor, updateFlavor, deleteFlavor }}>
      {children}
    </FlavorsContext.Provider>
  );
}

export function useFlavors() {
  const context = useContext(FlavorsContext);
  if (!context) throw new Error('useFlavors must be used within FlavorsProvider');
  return context;
}
