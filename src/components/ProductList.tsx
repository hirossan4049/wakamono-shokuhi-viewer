import React, { useMemo } from 'react';
import { SimpleGrid, Text, Stack, Center } from '@mantine/core';
import { Product, FilterState } from '../types/Product';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  filters: FilterState;
  sortBy: string;
  onOpenDetail: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, filters, sortBy, onOpenDetail, isFavorite, onToggleFavorite }) => {
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.id.toLowerCase().includes(searchLower) ||
        product.detail.toLowerCase().includes(searchLower) ||
        product.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = product.totals;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'ja');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'ja');
        case 'price_asc':
          return a.totals - b.totals;
        case 'price_desc':
          return b.totals - a.totals;
        case 'category_asc':
          return a.category.localeCompare(b.category, 'ja');
        case 'category_desc':
          return b.category.localeCompare(a.category, 'ja');
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, filters, sortBy]);

  if (filteredAndSortedProducts.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <Text size="lg" c="dimmed">
            該当する商品が見つかりませんでした
          </Text>
          <Text size="sm" c="dimmed">
            フィルタ条件を変更してみてください
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
      spacing="md"
      verticalSpacing="md"
    >
      {filteredAndSortedProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onOpenDetail={onOpenDetail}
          isFavorite={isFavorite(product.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </SimpleGrid>
  );
};

export default ProductList;