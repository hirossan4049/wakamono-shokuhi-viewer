import React, { useMemo } from 'react';
import { Table, Text, Badge, Group, ActionIcon, Anchor, Image, Stack, NumberFormatter } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconExternalLink, IconEye } from '@tabler/icons-react';
import { Product, FilterState } from '../types/Product';

interface ProductTableProps {
  products: Product[];
  filters: FilterState;
  sortBy: string;
  onOpenDetail: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  filters,
  sortBy,
  onOpenDetail,
  isFavorite,
  onToggleFavorite,
}) => {
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

  const rows = filteredAndSortedProducts.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td>
        <Group gap="sm">
          {product.thumb && (
            <Image
              src={product.thumb}
              w={50}
              h={50}
              fit="cover"
              radius="sm"
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzk5OSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
            />
          )}
          <Stack gap={2}>
            <Text size="sm" fw={500} lineClamp={2}>
              {product.name}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {product.id}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="light" size="sm">
          {product.category}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          <NumberFormatter value={product.totals} thousandSeparator="," />円
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {product.items.length}点
        </Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          {product.items.slice(0, 2).map((item, index) => (
            <Anchor
              key={index}
              href={item.url}
              target="_blank"
              size="xs"
              lineClamp={1}
            >
              {item.name}
            </Anchor>
          ))}
          {product.items.length > 2 && (
            <Text size="xs" c="dimmed">
              他{product.items.length - 2}件...
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={() => onOpenDetail(product)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant={isFavorite(product.id) ? "filled" : "light"}
            color="red"
            size="sm"
            onClick={() => onToggleFavorite(product.id)}
          >
            {isFavorite(product.id) ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          </ActionIcon>
          {product.detail_url && (
            <ActionIcon
              variant="light"
              color="gray"
              size="sm"
              component="a"
              href={product.detail_url}
              target="_blank"
            >
              <IconExternalLink size={16} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>商品名</Table.Th>
            <Table.Th>カテゴリ</Table.Th>
            <Table.Th>価格</Table.Th>
            <Table.Th>商品数</Table.Th>
            <Table.Th>商品内容</Table.Th>
            <Table.Th>アクション</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default ProductTable;