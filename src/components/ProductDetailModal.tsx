import React from 'react';
import { 
  Modal, 
  Text, 
  Group, 
  Stack, 
  Badge, 
  Divider, 
  NumberFormatter, 
  Image, 
  SimpleGrid,
  Anchor,
  ActionIcon,
  ScrollArea
} from '@mantine/core';
import { IconHeart, IconHeartFilled, IconExternalLink } from '@tabler/icons-react';
import { Product } from '../types/Product';

interface ProductDetailModalProps {
  product: Product | null;
  opened: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  opened,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!product) return null;

  const totalItemPrice = product.items.reduce((sum, item) => sum + (item.price * item.amount), 0);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%">
          <Text size="lg" fw={500} lineClamp={1}>
            {product.name}
          </Text>
          <ActionIcon
            variant={isFavorite ? "filled" : "light"}
            color="red"
            onClick={() => onToggleFavorite(product.id)}
          >
            {isFavorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
          </ActionIcon>
        </Group>
      }
      size="lg"
      centered
    >
      <ScrollArea.Autosize mah={600}>
        <Stack gap="md">
          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {product.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  height={200}
                  alt={`${product.name} - 画像${index + 1}`}
                  fit="cover"
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                />
              ))}
            </SimpleGrid>
          )}

          {/* Product Info */}
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="sm" c="dimmed">ID:</Text>
                <Text size="sm">{product.id}</Text>
              </Group>
              <Badge color="blue" variant="light" w="fit-content">
                {product.category}
              </Badge>
            </Stack>
            {product.detail_url && (
              <Anchor href={product.detail_url} target="_blank">
                <Group gap={4}>
                  <Text size="sm">詳細ページ</Text>
                  <IconExternalLink size={16} />
                </Group>
              </Anchor>
            )}
          </Group>

          {/* Product Detail */}
          {product.detail && (
            <>
              <Divider />
              <Stack gap="xs">
                <Text size="sm" fw={500}>商品詳細:</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                  {product.detail}
                </Text>
              </Stack>
            </>
          )}

          <Divider />

          {/* Price Information */}
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              総額: <NumberFormatter value={product.totals} thousandSeparator="," />円
            </Text>
            <Text size="sm" c="dimmed">
              商品点数: {product.items.length}点
            </Text>
          </Group>

          {/* Items List */}
          <Stack gap="xs">
            <Text size="sm" fw={500}>商品内容:</Text>
            {product.items.map((item, index) => (
              <Group key={index} justify="space-between" align="center" p="xs" style={{ 
                backgroundColor: 'var(--mantine-color-gray-0)', 
                borderRadius: 'var(--mantine-radius-sm)' 
              }}>
                <Anchor
                  href={item.url}
                  target="_blank"
                  size="sm"
                  lineClamp={2}
                  style={{ flex: 1 }}
                >
                  {item.name}
                </Anchor>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    {item.amount}個
                  </Text>
                  <Text size="sm" fw={500}>
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
      </ScrollArea.Autosize>
    </Modal>
  );
};

export default ProductDetailModal;