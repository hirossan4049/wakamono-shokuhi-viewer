import {
  Button, Grid, Group, Loader, Paper, RangeSlider, SegmentedControl, Select, Stack,
  Text, TextInput, Title
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconCategory, IconFilter,
  IconFilterOff, IconHeart, IconLayoutGrid, IconSearch, IconSortAscending, IconTable
} from '@tabler/icons-react';
import React from 'react';
import { FilterState, SortOption } from '../types/Product';
import classes from './SliderLabel.module.css';

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void | Promise<void>;
  sortBy: string;
  onSortChange: (sort: string) => void | Promise<void>;
  categories: string[];
  priceRange: [number, number];
  onReset: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  loading?: boolean;
  disabled?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  categories,
  priceRange,
  onReset,
  viewMode,
  onViewModeChange,
  loading,
  disabled,
}) => {
  if (process.env.NODE_ENV !== 'production') console.count('FilterControls render');
  const [applying, setApplying] = React.useState(false);
  const [searchDraft, setSearchDraft] = React.useState(filters.searchText);
  const [priceDraft, setPriceDraft] = React.useState<[number, number]>(filters.priceRange);
  const [debouncedSearch] = useDebouncedValue(searchDraft, 300);

  // keep local drafts in sync when outer filters change
  React.useEffect(() => {
    setSearchDraft(filters.searchText);
  }, [filters.searchText]);
  React.useEffect(() => {
    setPriceDraft(filters.priceRange);
  }, [filters.priceRange]);

  const sortOptions: SortOption[] = [
    { value: 'name_asc', label: '名前 (昇順)' },
    { value: 'name_desc', label: '名前 (降順)' },
    { value: 'price_asc', label: '価格 (安い順)' },
    { value: 'price_desc', label: '価格 (高い順)' },
    { value: 'category_asc', label: 'カテゴリ (昇順)' },
    { value: 'category_desc', label: 'カテゴリ (降順)' },
  ];

  const categoryOptions = [
    { value: '', label: 'すべてのカテゴリ' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  const withApply = async (fn: () => void | Promise<void>) => {
    const ret = fn();
    const isPromise = ret && typeof (ret as any).then === 'function';
    if (!isPromise) return;
    try {
      setApplying(true);
      await (ret as Promise<void>);
    } finally {
      setApplying(false);
    }
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceDraft(value);
  };
  const handlePriceRangeChangeEnd = (value: [number, number]) => {
    withApply(() =>
      onFiltersChange({
        ...filters,
        priceRange: value,
      })
    );
  };

  const handleCategoryChange = (value: string | null) => {
    withApply(() =>
      onFiltersChange({
        ...filters,
        category: value || '',
      })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchDraft(value);
  };

  // Debounced apply for search text (non-blocking)
  React.useEffect(() => {
    if (debouncedSearch === filters.searchText) return;
    withApply(() =>
      onFiltersChange({
        ...filters,
        searchText: debouncedSearch,
      })
    );
  }, [debouncedSearch, filters, onFiltersChange]);

  const isBusy = applying;

  return (
    <Paper p="lg" shadow="sm" radius="md" withBorder>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconFilter size={24} />
            <Title order={2} size="h3">
              フィルタ & ソート
            </Title>
          </Group>
          <Group gap="sm">
            {isBusy && <Loader size="xs" />}
            <Button
              variant={filters.favoritesOnly ? 'filled' : 'light'}
              color="red"
              onClick={() =>
                withApply(() =>
                  onFiltersChange({
                    ...filters,
                    favoritesOnly: !filters.favoritesOnly,
                  })
                )
              }
              leftSection={<IconHeart size={16} />}
            >
              {filters.favoritesOnly ? 'お気に入りのみ: ON' : 'お気に入りのみ'}
            </Button>
            <SegmentedControl
              value={viewMode}
              onChange={(value) => onViewModeChange(value as 'grid' | 'table')}
              w={200}
              data={[
                {
                  value: 'grid',
                  label: (
                    <Group gap={4}>
                      <IconLayoutGrid size={16} />
                      <Text size="sm">グリッド</Text>
                    </Group>
                  ),
                },
                {
                  value: 'table',
                  label: (
                    <Group gap={4}>
                      <IconTable size={16} />
                      <Text size="sm">テーブル</Text>
                    </Group>
                  ),
                },
              ]}
              size="sm"
              disabled={disabled}
            />
            <Button
              variant="light"
              leftSection={<IconFilterOff size={16} />}
              onClick={onReset}
              disabled={disabled}
            >
              リセット
            </Button>
          </Group>
        </Group>

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
            <TextInput
              label="検索"
              placeholder="商品名、IDなどで検索..."
              value={searchDraft}
              onChange={handleSearchChange}
              leftSection={<IconSearch size={16} />}
              size="sm"
              disabled={disabled}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Select
              label="ソート順"
              data={sortOptions}
              value={sortBy}
              onChange={(value) => withApply(() => onSortChange(value || 'name_asc'))}
              leftSection={<IconSortAscending size={16} />}
              size="sm"
              clearable={false}
              disabled={disabled}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
            <Select
              label="カテゴリ"
              data={categoryOptions}
              value={filters.category}
              onChange={handleCategoryChange}
              leftSection={<IconCategory size={16} />}
              size="sm"
              clearable
              disabled={disabled}
            />
          </Grid.Col>
        </Grid>

        <div>
          <Text size="sm" mb="xs">
            価格範囲: {priceDraft[0].toLocaleString()}円 - {priceDraft[1].toLocaleString()}円
          </Text>
          <RangeSlider
            min={priceRange[0]}
            max={priceRange[1]}
            value={priceDraft}
            onChange={handlePriceRangeChange}
            onChangeEnd={handlePriceRangeChangeEnd}
            step={100}
            size="sm"
            mx={16}
            disabled={disabled}
            labelAlwaysOn
            label={(value) => `${value.toLocaleString()}円`}
            classNames={classes}
          />
        </div>
      </Stack>
    </Paper>
  );
};

function areEqual(prev: FilterControlsProps, next: FilterControlsProps) {
  const keys: (keyof FilterControlsProps)[] = [
    'filters', 'onFiltersChange', 'sortBy', 'onSortChange', 'categories', 'priceRange', 'onReset', 'viewMode', 'onViewModeChange', 'loading', 'disabled'
  ];
  for (const k of keys) {
    if (prev[k] !== next[k]) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[FilterControls props changed]', k);
      }
      return false;
    }
  }
  return true;
}

export default React.memo(FilterControls, areEqual);
