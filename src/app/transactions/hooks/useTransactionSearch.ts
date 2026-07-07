// Extraído de: pages/TransactionsList.tsx
// Sin cambios de lógica — solo reubicado

import { useState, useRef, useEffect, useCallback } from 'react';

export function useTransactionSearch(setSearchQuery: (query: string) => void) {
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    // NO borra el texto al cerrar — el filtro sigue activo y los resultados permanecen
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, [setSearchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchInputRef.current?.blur();
      setShowSearch(false);
    } else if (e.key === 'Escape') {
      searchInputRef.current?.blur();
    }
  }, []);

  return {
    showSearch,
    setShowSearch,
    searchInputRef,
    toggleSearch,
    clearSearch,
    handleKeyDown
  };
}
