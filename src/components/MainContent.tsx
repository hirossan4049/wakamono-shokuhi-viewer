import React from 'react';
import { Container, Stack } from '@mantine/core';
import { ProductData, FilterState, Product } from '../types/Product';
import FilterControls from './FilterControls';
import ProductList from './ProductList';
import ProductTable from './ProductTable';

interface MainContentProps {
  productData: ProductData;
  filters: FilterState;
  sortBy: string;
  categories: string[];
  priceRange: [number, number];
  viewMode: 'grid' | 'table';
  onFiltersChange: (next: FilterState) => void;
  onSortChange: (next: string) => void;
  onReset: () => void;
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onOpenDetail: (product: Product) => void;
  categoriesById: Record<string, string[]>;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  productData,
  filters,
  sortBy,
  categories,
  priceRange,
  viewMode,
  onFiltersChange,
  onSortChange,
  onReset,
  onViewModeChange,
  onOpenDetail,
  categoriesById,
  isFavorite,
  onToggleFavorite,
}) => {
  if (process.env.NODE_ENV !== 'production') console.count('MainContent render');
  return (
    <Container size="xl">
      <Stack gap="lg">
        <FilterControls
          filters={filters}
          onFiltersChange={onFiltersChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
          categories={categories}
          priceRange={priceRange}
          onReset={onReset}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          disabled={!productData}
        />
        {viewMode === 'grid' ? (
          <ProductList
            products={productData.products}
            filters={filters}
            sortBy={sortBy}
            onOpenDetail={onOpenDetail}
            categoriesById={categoriesById}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <ProductTable
            products={productData.products}
            filters={filters}
            sortBy={sortBy}
            onOpenDetail={onOpenDetail}
            categoriesById={categoriesById}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </Stack>
    </Container>
  );
};

function areEqual(prev: MainContentProps, next: MainContentProps) {
  const keys: (keyof MainContentProps)[] = [
    'productData', 'filters', 'sortBy', 'categories', 'priceRange', 'viewMode',
    'onFiltersChange', 'onSortChange', 'onReset', 'onViewModeChange', 'onOpenDetail',
    'categoriesById', 'isFavorite', 'onToggleFavorite'
  ];
  for (const k of keys) {
    if (prev[k] !== next[k]) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[MainContent props changed]', k);
      }
      return false;
    }
  }
  return true;
}

export default React.memo(MainContent, areEqual);
