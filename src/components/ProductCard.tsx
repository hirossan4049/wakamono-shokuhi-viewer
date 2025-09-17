import React from 'react';
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  NumberFormatter,
  Image,
  ActionIcon,
  AspectRatio,
} from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { Product } from '../types/Product';
import classes from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail, isFavorite, onToggleFavorite }) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className={classes.card}
      onClick={() => onOpenDetail(product)}
    >
      <Card.Section className={classes.imageSection}>
        <AspectRatio ratio={16 / 9}>
          <Image
            src={product.thumb}
            alt={product.name}
            fit="cover"
            fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
          />
        </AspectRatio>
        <ActionIcon
          className={classes.favoriteButton}
          variant={isFavorite ? 'filled' : 'light'}
          color={isFavorite ? 'red' : 'gray'}
          size="lg"
          radius="xl"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
        >
          {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
        </ActionIcon>
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Text fw={700} size="lg" lineClamp={1}>
          {product.name}
        </Text>
        <Badge color="blue" variant="light">
          {product.category}
        </Badge>
        <Text size="sm" c="dimmed" lineClamp={2} h={40}>
          {product.detail}
        </Text>
      </Stack>

      <Group justify="space-between" mt="md">
        <Stack gap={0}>
          <Text size="xs" c="dimmed">
            総額
          </Text>
          <Text size="xl" fw={700}>
            <NumberFormatter value={product.totals} thousandSeparator suffix=" 円" />
          </Text>
        </Stack>
        <Stack gap={0} align="flex-end">
          <Text size="xs" c="dimmed">
            商品点数
          </Text>
          <Text size="xl" fw={700}>
            {product.items.length} 点
          </Text>
        </Stack>
      </Group>
    </Card>
  );
};

export default ProductCard;
