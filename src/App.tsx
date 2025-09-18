import { AppShell, Badge, Button, Container, FileButton, Group, Text, Title, Affix, Popover, ActionIcon, Anchor, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconReceipt2 } from '@tabler/icons-react';
import React, { useCallback, useMemo, useState, useTransition } from 'react';
// Upload UI moved to header FileButton; legacy upload component removed from main screen
import MainContent from './components/MainContent';
import ProductDetailModal from './components/ProductDetailModal';
import { useFavorites } from './hooks/useFavorites';
import { FilterState, Product, ProductData } from './types/Product';
import { getCountsFromDB, getDataSourceFromDB, loadProductDataFromDB, saveProductDataToDB } from './utils/indexedDB';

function App() {
  if (process.env.NODE_ENV !== 'production') console.count('App render');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isSampleData, setIsSampleData] = useState<boolean>(false);
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
        const source = await getDataSourceFromDB();
        setIsSampleData(source === 'sample');
        const counts = await getCountsFromDB();
        notifications.show({
          title: 'IndexedDBから読み込み',
          message: counts
            ? `products: ${counts.products}, items: ${counts.items}`
            : `${data.products.length}件を読み込みました`,
          color: 'blue',
        });
      } else {
        // Fallback: load sample data from public when DB is empty
        try {
          const url = `${process.env.PUBLIC_URL || ''}/sample-data.json`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch sample: ${res.status}`);
          const sample = (await res.json()) as ProductData;
          if (!sample || !Array.isArray(sample.products)) throw new Error('Invalid sample data');
          setProductData(sample);
          // Persist sample to IndexedDB for consistent UX and counts
          await saveProductDataToDB(sample, 'sample');
          setIsSampleData(true);
          const counts = await getCountsFromDB();
          notifications.show({
            title: 'サンプルデータを読み込みました',
            message: counts
              ? `products: ${counts.products}, items: ${counts.items}`
              : `${sample.products.length}件を読み込みました`,
            color: 'teal',
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to load sample data', e);
          notifications.show({
            title: 'サンプル読み込み失敗',
            message: 'ネットワークまたはファイルの問題が発生しました。',
            color: 'red',
          });
        }
      }
    })();
  }, []);

  const handleFileLoad = async (data: ProductData) => {
    setProductData(data);
    try {
      await saveProductDataToDB(data, 'user');
      setIsSampleData(false);
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

  // Header file select handler (JSON upload)
  const handleFileSelect = React.useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result) as ProductData;
        if (!data.products || !Array.isArray(data.products)) {
          throw new Error('Invalid JSON structure: missing products array');
        }
        data.products.forEach((product, index) => {
          if (!product.name || !product.id || !product.category) {
            throw new Error(`Invalid product at index ${index}: missing required fields`);
          }
          if (!product.items || !Array.isArray(product.items)) {
            throw new Error(`Invalid product at index ${index}: missing items array`);
          }
        });
        await handleFileLoad(data);
        notifications.show({
          title: 'ファイルが読み込まれました',
          message: `${data.products.length}件の商品データを読み込みました`,
          color: 'green',
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing JSON:', error);
        notifications.show({
          title: 'エラー',
          message: 'JSONファイルの解析に失敗しました。ファイル形式を確認してください。',
          color: 'red',
        });
      }
    };
    reader.readAsText(file);
  }, [handleFileLoad]);

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
                  大阪府若者食費支援検索
                </Title>
                <Text size="sm" c="dimmed">
                  商品データの表示・検索・フィルタリング
                </Text>
              </div>
            </Group>
            <Group gap="sm">
              {productData && (
                <Badge size="lg" variant="light">
                  {productData.products.length}件の商品
                </Badge>
              )}
              <FileButton onChange={handleFileSelect} accept="application/json,.json">
                {(props) => (
                  <Button variant="light" {...props}>
                    JSONをアップロード
                  </Button>
                )}
              </FileButton>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        {mainContent}
      </AppShell.Main>

      {isSampleData && (
        <Affix position={{ top: 16, right: 16 }}>
          <Popover position="bottom-end" shadow="md" radius="md" defaultOpened>
            <Popover.Target>
              <ActionIcon size="lg" variant="filled" color="teal" aria-label="サンプルデータ情報">
                <IconReceipt2 size={18} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Paper>
                <Title order={6} mb={4}>サンプルデータ表示中</Title>
                <Text size="sm" mb={8}>
                  現在はサンプルデータを表示しています。boothで全データをご購入いただけます。
                </Text>
                <Anchor href="https://www.google.com" target="_blank" rel="noopener noreferrer">
                  購入ページを開く
                </Anchor>
              </Paper>
            </Popover.Dropdown>
          </Popover>
        </Affix>
      )}

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
