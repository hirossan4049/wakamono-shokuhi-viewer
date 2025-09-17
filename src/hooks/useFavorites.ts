import { useState, useEffect, useCallback, useMemo } from 'react';

const FAVORITES_KEY = 'wakamono-shokuhi-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load favorites from localStorage on component mount
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (savedFavorites) {
        const favoritesArray = JSON.parse(savedFavorites) as string[];
        setFavorites(new Set(favoritesArray));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  const saveFavoritesToStorage = (newFavorites: Set<string>) => {
    try {
      const favoritesArray = Array.from(newFavorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  };

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      saveFavoritesToStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.has(productId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
    try {
      localStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites from localStorage:', error);
    }
  }, []);

  // Memoize API object to keep reference stable unless dependencies change
  return useMemo(() => ({
    favorites: Array.from(favorites),
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }), [favorites, toggleFavorite, isFavorite, clearFavorites]);
};
