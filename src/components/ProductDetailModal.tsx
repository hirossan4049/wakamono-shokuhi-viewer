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
  Anchor,
  ActionIcon,
  ScrollArea,
  Title,
  Paper,
  Button
} from '@mantine/core';
import { IconHeart, IconHeartFilled, IconExternalLink } from '@tabler/icons-react';
import { Product } from '../types/Product';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';

interface ProductDetailModalProps {
  product: Product | null;
  opened: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  categories: string[];
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  opened,
  onClose,
  isFavorite,
  onToggleFavorite,
  categories,
}) => {
  if (process.env.NODE_ENV !== 'production') console.count('ProductDetailModal render');
  if (!product) return null;

  const totalItemPrice = product.items.reduce((sum, item) => sum + (item.price * item.amount), 0);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={3} size="h2">{product.name}</Title>
      }
      size="xl"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="lg">
        {/* Product Images Carousel */}
        {product.images && product.images.length > 0 && (
          <Carousel withIndicators>
            {product.images.map((image, index) => (
              <Carousel.Slide key={index}>
                <Image
                  src={image}
                  height={300}
                  alt={`${product.name} - 画像${index + 1}`}
                  fit="contain"
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        )}

        {/* Product Info */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group gap={6} wrap="wrap">
              {(categories && categories.length > 0 ? categories : [product.category]).map((cat) => (
                <Badge key={cat} size="lg" variant="light">
                  {cat}
                </Badge>
              ))}
            </Group>
            <Text c="dimmed">ID: {product.id}</Text>
          </Stack>
          <Group>
            {product.detail_url && (
              <Button 
                component="a" 
                href={product.detail_url} 
                target="_blank" 
                variant="outline" 
                leftSection={<IconExternalLink size={16} />}
              >
                詳細ページ
              </Button>
            )}
            <ActionIcon
              variant={isFavorite ? 'filled' : 'outline'}
              color="red"
              size="lg"
              onClick={() => onToggleFavorite(product.id)}
            >
              {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
            </ActionIcon>
          </Group>
        </Group>

        {/* Product Detail */}
        {product.detail && (
          <Paper withBorder p="md" radius="md">
            <Stack gap="xs">
              <Title order={4} size="h4">商品詳細</Title>
              <Text style={{ whiteSpace: 'pre-line' }}>
                {product.detail}
              </Text>
            </Stack>
          </Paper>
        )}

        <Divider />

        {/* Price Information */}
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between">
            <Title order={4} size="h4">価格情報</Title>
            <Stack gap={0} align="flex-end">
              <Text size="sm" c="dimmed">総額</Text>
              <Text size="xl" fw={700}>
                <NumberFormatter value={product.totals} thousandSeparator suffix=" 円" />
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* Items List */}
        <Stack gap="xs">
          <Title order={4} size="h4">商品内容 ({product.items.length}点)</Title>
          {product.items.map((item, index) => (
            <Paper key={index} withBorder p="sm" radius="md">
              <Group justify="space-between" align="center">
                <Anchor
                  href={item.url}
                  target="_blank"
                  lineClamp={2}
                  style={{ flex: 1 }}
                >
                  {item.name}
                </Anchor>
                <Stack gap={0} align="flex-end">
                  <Text fw={500}>
                    <NumberFormatter value={item.price} thousandSeparator suffix=" 円" />
                  </Text>
                  <Text size="sm" c="dimmed">
                    {item.amount}個
                  </Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Divider />
        
        <Group justify="space-between">
          <Text c="dimmed">
            計算合計:
          </Text>
          <Text fw={500}>
            <NumberFormatter value={totalItemPrice} thousandSeparator suffix=" 円" />
          </Text>
        </Group>
      </Stack>
    </Modal>
  );
};

export default React.memo(ProductDetailModal);
