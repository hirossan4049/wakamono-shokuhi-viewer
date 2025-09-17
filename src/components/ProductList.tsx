import React from 'react';
import { SimpleGrid, Text, Stack, Center } from '@mantine/core';
import { Product, FilterState } from '../types/Product';
import ProductCard from './ProductCard';
import { useFilteredProducts } from '../hooks/useFilteredProducts';

interface ProductListProps {
  products: Product[];
  filters: FilterState;
  sortBy: string;
  onOpenDetail: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, filters, sortBy, onOpenDetail, isFavorite, onToggleFavorite }) => {
  const filteredAndSortedProducts = useFilteredProducts(products, filters, sortBy);

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
      spacing="lg"
      verticalSpacing="lg"
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
