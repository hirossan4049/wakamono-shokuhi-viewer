import React, { useState, useMemo, useTransition, useCallback } from 'react';
import { AppShell, Container, Title, Text, Stack, Group, Badge } from '@mantine/core';
import { ProductData, FilterState, Product } from './types/Product';
import { useFavorites } from './hooks/useFavorites';
import FileUpload from './components/FileUpload';
import FilterControls from './components/FilterControls';
import ProductList from './components/ProductList';
import ProductTable from './components/ProductTable';
import ProductDetailModal from './components/ProductDetailModal';
import MainContent from './components/MainContent';
import { IconReceipt2 } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { saveProductDataToDB, getCountsFromDB, loadProductDataFromDB } from './utils/indexedDB';

function App() {
  if (process.env.NODE_ENV !== 'production') console.count('App render');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [sortBy, setSortBy] = useState<string>('name_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    category: '',
    priceRange: [0, 1000000],
    searchText: '',
    favoritesOnly: false,
  });
  const [, startTransition] = useTransition();

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

  // Map product ID => all categories it appears in
  const categoriesById = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, Set<string>> = {};
    if (!productData?.products) return {};
    for (const p of productData.products) {
      if (!map[p.id]) map[p.id] = new Set<string>();
      if (p.category) map[p.id].add(p.category);
    }
    const out: Record<string, string[]> = {};
    for (const [id, set] of Object.entries(map)) {
      out[id] = Array.from(set).sort();
    }
    return out;
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

  const handleResetFilters = useCallback(() => {
    setFilterState({
      category: '',
      priceRange: priceRange,
      searchText: '',
      favoritesOnly: false,
    });
    setSortBy('name_asc');
  }, [priceRange]);

  const handleOpenDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDetailModalOpened(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpened(false);
    setSelectedProduct(null);
  }, []);

  // Stable callbacks for children to avoid unnecessary re-renders
  const handleFiltersChange = useCallback((next: FilterState) => {
    startTransition(() => setFilterState(next));
  }, [startTransition]);

  const handleSortChange = useCallback((next: string) => {
    startTransition(() => setSortBy(next));
  }, [startTransition]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'table') => {
    startTransition(() => setViewMode(mode));
  }, [startTransition]);

  // Memoize MainContent element to avoid recreation on unrelated state updates (e.g., selectedProduct)
  const mainContent = useMemo(() => {
    if (!productData) return null;
    return (
      <MainContent
        productData={productData}
        filters={filterState}
        sortBy={sortBy}
        categories={categories}
        priceRange={priceRange}
        viewMode={viewMode}
        onFiltersChange={handleFiltersChange}
        onSortChange={handleSortChange}
        onReset={handleResetFilters}
        onViewModeChange={handleViewModeChange}
        onOpenDetail={handleOpenDetail}
        categoriesById={categoriesById}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    );
  }, [productData, filterState, sortBy, categories, priceRange, viewMode, handleFiltersChange, handleSortChange, handleResetFilters, handleViewModeChange, handleOpenDetail, categoriesById, isFavorite, toggleFavorite]);

  return (
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
          {!productData ? (
            <Container size="xl">
              <Stack gap="lg">
                <div>
                  <Title order={2} mb="md">
                    JSONファイルをアップロード
                  </Title>
                  <FileUpload onFileLoad={handleFileLoad} />
                </div>
              </Stack>
            </Container>
          ) : (
            mainContent
          )}
        </AppShell.Main>

        <ProductDetailModal
          product={selectedProduct}
          opened={detailModalOpened}
          onClose={handleCloseDetail}
          isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
          onToggleFavorite={toggleFavorite}
          categories={selectedProduct ? categoriesById[selectedProduct.id] || (selectedProduct.category ? [selectedProduct.category] : []) : []}
        />
      </AppShell>
  );
}

export default App;
