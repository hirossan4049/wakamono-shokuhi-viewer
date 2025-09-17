import React, { useState, useMemo } from 'react';
import { AppShell, Container, Title, Text, Stack, Group, Badge } from '@mantine/core';
import { ProductData, FilterState } from './types/Product';
import FileUpload from './components/FileUpload';
import FilterControls from './components/FilterControls';
import ProductList from './components/ProductList';

function App() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [sortBy, setSortBy] = useState<string>('name_asc');
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 1000000],
    searchText: '',
  });

  // Calculate available categories and price range from data
  const { categories, priceRange } = useMemo(() => {
    if (!productData) {
      return { categories: [], priceRange: [0, 1000000] as [number, number] };
    }

    const cats = Array.from(new Set(productData.products.map(p => p.category))).sort();
    const prices = productData.products.map(p => p.totals);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      categories: cats,
      priceRange: [minPrice, maxPrice] as [number, number],
    };
  }, [productData]);

  // Update filters when data changes
  React.useEffect(() => {
    if (productData && priceRange) {
      setFilters(prev => ({
        ...prev,
        priceRange: priceRange,
      }));
    }
  }, [productData, priceRange]);

  const handleFileLoad = (data: ProductData) => {
    setProductData(data);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      priceRange: priceRange,
      searchText: '',
    });
    setSortBy('name_asc');
  };

  return (
    <AppShell
      header={{ height: 80 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" align="center">
            <div>
              <Title order={1} size="h2">
                若者食費ビューアー
              </Title>
              <Text size="sm" c="dimmed">
                商品データの表示・検索・フィルタリング
              </Text>
            </div>
            {productData && (
              <Badge size="lg" variant="light" color="blue">
                {productData.products.length}件の商品
              </Badge>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Stack gap="lg">
            {!productData ? (
              <div>
                <Title order={2} mb="md">
                  JSONファイルをアップロード
                </Title>
                <FileUpload onFileLoad={handleFileLoad} />
              </div>
            ) : (
              <>
                <FilterControls
                  filters={filters}
                  onFiltersChange={setFilters}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  categories={categories}
                  priceRange={priceRange}
                  onReset={handleResetFilters}
                />
                <ProductList
                  products={productData.products}
                  filters={filters}
                  sortBy={sortBy}
                />
              </>
            )}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
