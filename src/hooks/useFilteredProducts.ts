import { useMemo } from 'react';
import { Product, FilterState } from '../types/Product';

// Create a Japanese collator for stable, locale-aware sorting
const jaCollator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });

export const useFilteredProducts = (products: Product[] = [], filters: FilterState, sortBy: string) => {
  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return [];

    const search = (filters?.searchText || '').trim().toLowerCase();
    const category = (filters?.category || '').trim();
    const [minPrice, maxPrice] = filters?.priceRange || [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];

    // Apply filters
    let filtered = products.filter((product) => {
      // Price guard and range check
      const price = typeof product.totals === 'number' ? product.totals : Number(product.totals);
      if (!Number.isFinite(price) || price < minPrice || price > maxPrice) return false;

      // Category filter
      if (category && product.category !== category) return false;

      // Search filter
      if (search) {
        const inName = product.name?.toLowerCase().includes(search);
        const inId = product.id?.toLowerCase().includes(search);
        const inDetail = (product.detail || '').toLowerCase().includes(search);
        const inItems = Array.isArray(product.items) && product.items.some((item) => item.name?.toLowerCase().includes(search));
        if (!(inName || inId || inDetail || inItems)) return false;
      }

      return true;
    });

    // Apply sorting
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return jaCollator.compare(a.name || '', b.name || '');
        case 'name_desc':
          return jaCollator.compare(b.name || '', a.name || '');
        case 'price_asc':
          return (a.totals || 0) - (b.totals || 0);
        case 'price_desc':
          return (b.totals || 0) - (a.totals || 0);
        case 'category_asc':
          return jaCollator.compare(a.category || '', b.category || '');
        case 'category_desc':
          return jaCollator.compare(b.category || '', a.category || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, filters, sortBy]);

  return filteredAndSortedProducts;
};
