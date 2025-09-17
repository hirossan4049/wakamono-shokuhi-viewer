import React, { useState, useMemo } from 'react';
import { MantineProvider, AppShell, Container, Title, Text, Stack, Group, Badge } from '@mantine/core';
import { ProductData, FilterState, Product } from './types/Product';
import { useFavorites } from './hooks/useFavorites';
import FileUpload from './components/FileUpload';
import FilterControls from './components/FilterControls';
import ProductList from './components/ProductList';
import ProductTable from './components/ProductTable';
import ProductDetailModal from './components/ProductDetailModal';
import { theme } from './theme';
import { IconReceipt2 } from '@tabler/icons-react';
import { Notifications, notifications } from '@mantine/notifications';
import { useDebounce } from 'use-debounce';
import { saveProductDataToDB, getCountsFromDB, loadProductDataFromDB } from './utils/indexedDB';

function App() {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [sortBy, setSortBy] = useState<string>('name_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    category: '',
    priceRange: [0, 1000000],
    searchText: '',
  });
  const [filters] = useDebounce(filterState, 300);

  const { isFavorite, toggleFavorite } = useFavorites();

  // Calculate available categories and price range from data
  const { categories, priceRange } = useMemo(() => {
    if (!productData || !Array.isArray(productData.products) || productData.products.length === 0) {
      return { categories: [], priceRange: [0, 1000000] as [number, number] };
    }

    const cats = Array.from(new Set(productData.products.map(p => p.category))).sort();
    const prices = productData.products
      .map(p => (typeof p.totals === 'number' ? p.totals : Number(p.totals)))
      .filter((n) => Number.isFinite(n));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 1000000;

    return {
      categories: cats,
      priceRange: [minPrice, maxPrice] as [number, number],
    };
  }, [productData]);

  // Update filters when data changes
  React.useEffect(() => {
    if (productData && priceRange) {
      setFilterState(prev => ({
        ...prev,
        priceRange: priceRange,
      }));
    }
  }, [productData, priceRange]);

  // Load from IndexedDB on app start
  React.useEffect(() => {
    (async () => {
      const data = await loadProductDataFromDB();
      if (data) {
        setProductData(data);
        const counts = await getCountsFromDB();
        notifications.show({
          title: 'IndexedDBから読み込み',
          message: counts
            ? `products: ${counts.products}, items: ${counts.items}`
            : `${data.products.length}件を読み込みました`,
          color: 'blue',
        });
      }
    })();
  }, []);

  const handleFileLoad = async (data: ProductData) => {
    setProductData(data);
    try {
      await saveProductDataToDB(data);
      const counts = await getCountsFromDB();
      notifications.show({
        title: 'IndexedDBへ保存しました',
        message: counts
          ? `products: ${counts.products}, items: ${counts.items}`
          : '保存完了',
        color: 'green',
      });
    } catch (e) {
      console.error(e);
      notifications.show({
        title: 'IndexedDB保存エラー',
        message: 'ブラウザの設定またはストレージに問題があります。',
        color: 'red',
      });
    }
  };

  const handleResetFilters = () => {
    setFilterState({
      category: '',
      priceRange: priceRange,
      searchText: '',
    });
    setSortBy('name_asc');
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpened(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpened(false);
    setSelectedProduct(null);
  };

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AppShell
        header={{ height: 80 }}
        padding="md"
      >
        <AppShell.Header>
          <Container size="xl" h="100%">
            <Group h="100%" justify="space-between" align="center">
              <Group>
                <IconReceipt2 size={32} />
                <div>
                  <Title order={1} size="h2">
                    若者食費ビューアー
                  </Title>
                  <Text size="sm" c="dimmed">
                    商品データの表示・検索・フィルタリング
                  </Text>
                </div>
              </Group>
              {productData && (
                <Badge size="lg" variant="light">
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
                    filters={filterState}
                    onFiltersChange={setFilterState}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    categories={categories}
                    priceRange={priceRange}
                    onReset={handleResetFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                  {viewMode === 'grid' ? (
                    <ProductList
                      products={productData.products}
                      filters={filters}
                      sortBy={sortBy}
                      onOpenDetail={handleOpenDetail}
                      isFavorite={isFavorite}
                      onToggleFavorite={toggleFavorite}
                    />
                  ) : (
                    <ProductTable
                      products={productData.products}
                      filters={filters}
                      sortBy={sortBy}
                      onOpenDetail={handleOpenDetail}
                      isFavorite={isFavorite}
                      onToggleFavorite={toggleFavorite}
                    />
                  )}
                </>
              )}
            </Stack>
          </Container>
        </AppShell.Main>

        <ProductDetailModal
          product={selectedProduct}
          opened={detailModalOpened}
          onClose={handleCloseDetail}
          isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
          onToggleFavorite={toggleFavorite}
        />
      </AppShell>
    </MantineProvider>
  );
}

export default App;
