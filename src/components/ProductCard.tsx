import React from 'react';
import { Card, Text, Badge, Group, Stack, Divider, NumberFormatter, Image, ActionIcon, Anchor } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconExternalLink } from '@tabler/icons-react';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail, isFavorite, onToggleFavorite }) => {
  const totalItemPrice = product.items.reduce((sum, item) => sum + (item.price * item.amount), 0);

  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md" 
      withBorder
      style={{ cursor: 'pointer' }}
      onClick={() => onOpenDetail(product)}
    >
      <Stack gap="sm">
        {/* Product Image */}
        {product.thumb && (
          <Card.Section>
            <Image
              src={product.thumb}
              height={200}
              alt={product.name}
              fit="cover"
              fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
            />
          </Card.Section>
        )}

        <Group justify="space-between" align="flex-start">
          <Text size="lg" fw={500} lineClamp={2} style={{ flex: 1 }}>
            {product.name}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant={isFavorite ? "filled" : "light"}
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product.id);
              }}
            >
              {isFavorite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
            </ActionIcon>
            <Badge color="blue" variant="light">
              {product.category}
            </Badge>
          </Group>
        </Group>
        
        <Group gap="xs">
          <Text size="sm" c="dimmed">ID:</Text>
          <Text size="sm">{product.id}</Text>
        </Group>

        {product.detail && (
          <Text size="sm" c="dimmed" lineClamp={3}>
            {product.detail}
          </Text>
        )}

        <Divider />

        <Group justify="space-between">
          <Text size="sm" fw={500}>
            総額: <NumberFormatter value={product.totals} thousandSeparator="," />円
          </Text>
          <Text size="sm" c="dimmed">
            商品点数: {product.items.length}点
          </Text>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>商品内容:</Text>
            {product.detail_url && (
              <Anchor
                href={product.detail_url}
                target="_blank"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Group gap={4}>
                  <Text size="sm">詳細を見る</Text>
                  <IconExternalLink size={14} />
                </Group>
              </Anchor>
            )}
          </Group>
          {product.items.map((item, index) => (
            <Group key={index} justify="space-between" align="center">
              <Anchor
                href={item.url}
                target="_blank"
                size="xs"
                lineClamp={1}
                style={{ flex: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                {item.name}
              </Anchor>
              <Group gap="xs">
                <Text size="xs" c="dimmed">
                  {item.amount}個
                </Text>
                <Text size="xs">
                  <NumberFormatter value={item.price} thousandSeparator="," />円
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>

        <Divider />
        
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            計算合計:
          </Text>
          <Text size="sm" fw={500}>
            <NumberFormatter value={totalItemPrice} thousandSeparator="," />円
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default ProductCard;