import { useState, useCallback, useRef, useEffect } from 'react';
import { Json } from '@/integrations/supabase/types';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  ingredientes?: string;
  validade_armazenamento_dias?: number;
  sabores?: string[];
  sabor_images?: Json | null;
  is_featured: boolean;
  is_active: boolean;
}

interface CachedProduct {
  data: Product;
  timestamp: number;
  isComplete: boolean;
}

const CACHE_KEY = 'product_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 20; // Máximo 20 produtos em cache

export const useProductCache = () => {
  const cacheRef = useRef<Map<string, CachedProduct>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);
  const [initialized, setInitialized] = useState(false);
  
  // Inicializar cache do sessionStorage usando useEffect
  useEffect(() => {
    if (!initialized && cacheRef.current.size === 0) {
      try {
        const stored = sessionStorage.getItem(CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          cacheRef.current = new Map(Object.entries(parsed));
          setCacheSize(cacheRef.current.size);
        }
      } catch (error) {
        console.warn('Erro ao carregar cache de produtos:', error);
      } finally {
        setInitialized(true);
      }
    }
  }, [initialized]);

  const saveToStorage = useCallback((newCache: Map<string, CachedProduct>) => {
    try {
      const cacheObject = Object.fromEntries(newCache);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.warn('Erro ao salvar cache de produtos:', error);
    }
  }, []);

  const getProduct = useCallback((id: string): CachedProduct | null => {
    const cached = cacheRef.current.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, []);

  const setProduct = useCallback((id: string, product: Product, isComplete: boolean = false) => {
    cacheRef.current.set(id, {
      data: product,
      timestamp: Date.now(),
      isComplete
    });

    // Limitar tamanho do cache (LRU simples)
    if (cacheRef.current.size > MAX_CACHE_SIZE) {
      const oldestKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(oldestKey);
    }

    setCacheSize(cacheRef.current.size);
    saveToStorage(cacheRef.current);
  }, [saveToStorage]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const cached = cacheRef.current.get(id);
    if (cached) {
      const updatedProduct = { ...cached.data, ...updates };
      setProduct(id, updatedProduct, true);
    }
  }, [setProduct]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setCacheSize(0);
    sessionStorage.removeItem(CACHE_KEY);
  }, []);

  const preloadProduct = useCallback((product: Product) => {
    setProduct(product.id, product, false);
  }, [setProduct]);

  return {
    getProduct,
    setProduct,
    updateProduct,
    clearCache,
    preloadProduct,
    cacheSize
  };
};