import { ActionIcon, Badge, Group, Image, NumberFormatter, Stack, Table, Text } from '@mantine/core';
import { IconExternalLink, IconEye, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import React from 'react';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { FilterState, Product } from '../types/Product';
import classes from './ProductTable.module.css';

interface ProductTableProps {
  products: Product[];
  filters: FilterState;
  sortBy: string;
  onOpenDetail: (product: Product) => void;
  categoriesById: Record<string, string[]>;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  filters,
  sortBy,
  onOpenDetail,
  categoriesById,
  isFavorite,
  onToggleFavorite,
}) => {
  if (process.env.NODE_ENV !== 'production') console.count('ProductTable render');
  const baseProducts = React.useMemo(() => {
    if (!filters?.favoritesOnly) return products;
    return products.filter((p) => isFavorite(p.id));
  }, [products, filters?.favoritesOnly, isFavorite]);

  const filteredAndSortedProducts = useFilteredProducts(baseProducts, filters, sortBy);

  const rows = filteredAndSortedProducts.map((product) => (
    <Table.Tr key={product.id} onClick={() => onOpenDetail(product)} className={classes.row}>
      <Table.Td>
        <Group gap="sm">
          <Image
            src={product.thumb}
            w={60}
            h={60}
            fit="cover"
            radius="sm"
            fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzk5OSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
          />
          <Stack gap={2}>
            <Text fw={500} lineClamp={2}>
              {product.name}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {product.id}
            </Text>
          </Stack>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap={6} wrap="wrap">
          {(categoriesById[product.id] || (product.category ? [product.category] : [])).map((cat) => (
            <Badge key={cat} variant="light">
              {cat}
            </Badge>
          ))}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={500}>
          <NumberFormatter value={product.totals} thousandSeparator suffix=" 円" />
        </Text>
      </Table.Td>
      <Table.Td>
        <Text>{product.items.length}点</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="light"
            color="blue"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant={isFavorite(product.id) ? 'filled' : 'light'}
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product.id);
            }}
          >
            {isFavorite(product.id) ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          </ActionIcon>
          {product.detail_url && (
            <ActionIcon
              variant="light"
              color="gray"
              component="a"
              href={product.detail_url}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
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
      <Table striped highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>商品名</Table.Th>
            <Table.Th>カテゴリ</Table.Th>
            <Table.Th>参考価格</Table.Th>
            <Table.Th>商品数</Table.Th>
            <Table.Th>アクション</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default React.memo(ProductTable);
