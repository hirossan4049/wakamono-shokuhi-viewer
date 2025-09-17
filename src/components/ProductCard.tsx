import React from 'react';
import { Card, Text, Badge, Group, Stack, Divider, NumberFormatter } from '@mantine/core';
import { Product } from '../types/Product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const totalItemPrice = product.items.reduce((sum, item) => sum + (item.price * item.amount), 0);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Text size="lg" fw={500} lineClamp={2}>
            {product.name}
          </Text>
          <Badge color="blue" variant="light">
            {product.category}
          </Badge>
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
          <Text size="sm" fw={500}>商品内容:</Text>
          {product.items.map((item, index) => (
            <Group key={index} justify="space-between" align="center">
              <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
                {item.name}
              </Text>
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