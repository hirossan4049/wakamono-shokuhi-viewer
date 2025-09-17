import React from 'react';
import { Group, Select, TextInput, RangeSlider, Stack, Text, Paper, Button } from '@mantine/core';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';
import { FilterState, SortOption } from '../types/Product';

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: string[];
  priceRange: [number, number];
  onReset: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  categories,
  priceRange,
  onReset,
}) => {
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
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  const handlePriceRangeChange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: value,
    });
  };

  const handleCategoryChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      category: value || '',
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchText: event.target.value,
    });
  };

  return (
    <Paper p="md" shadow="sm" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconFilter size={20} />
            <Text fw={500}>フィルタ・ソート</Text>
          </Group>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconFilterOff size={16} />}
            onClick={onReset}
          >
            リセット
          </Button>
        </Group>

        <Group grow>
          <TextInput
            placeholder="商品名で検索..."
            value={filters.searchText}
            onChange={handleSearchChange}
            leftSection={<IconSearch size={16} />}
          />
          <Select
            placeholder="ソート順"
            data={sortOptions}
            value={sortBy}
            onChange={(value) => onSortChange(value || 'name_asc')}
          />
          <Select
            placeholder="カテゴリ"
            data={categoryOptions}
            value={filters.category}
            onChange={handleCategoryChange}
          />
        </Group>

        <div>
          <Text size="sm" mb="xs">
            価格範囲: {filters.priceRange[0].toLocaleString()}円 - {filters.priceRange[1].toLocaleString()}円
          </Text>
          <RangeSlider
            min={priceRange[0]}
            max={priceRange[1]}
            value={filters.priceRange}
            onChange={handlePriceRangeChange}
            marks={[
              { value: priceRange[0], label: `${priceRange[0].toLocaleString()}円` },
              { value: priceRange[1], label: `${priceRange[1].toLocaleString()}円` },
            ]}
          />
        </div>
      </Stack>
    </Paper>
  );
};

export default FilterControls;