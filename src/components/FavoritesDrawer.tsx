import { ActionIcon, Avatar, Badge, Drawer, Group, NumberFormatter, ScrollArea, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconExternalLink, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import React from 'react';
import { Product } from '../types/Product';

interface FavoritesDrawerProps {
  opened: boolean;
  onClose: () => void;
  products: Product[];
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (productId: string) => void;
  onOpenDetail: (product: Product) => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  opened,
  onClose,
  products,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
}) => {
  const count = products.length;
  return (
    <Drawer opened={opened} onClose={onClose} position="right" title={<Title order={4}>お気に入り ({count})</Title>} size={"lg"}>
      {count === 0 ? (
        <Text c="dimmed">お気に入りはまだありません。カードのハートをタップすると追加できます。</Text>
      ) : (
        <ScrollArea h="80vh" pr="sm">
          <Stack gap="sm">
            {products.map((p) => (
              <Group key={p.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ cursor: 'pointer' }} onClick={() => onOpenDetail(p)}>
                  <Avatar src={p.thumb} alt={p.name} radius="sm" size={48} />
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm" lineClamp={1}>
                      {p.name}
                    </Text>
                    <Group gap={6} wrap="wrap">
                      <Badge size="xs" variant="light" color="blue">{p.category}</Badge>
                      <Badge size="xs" variant="light" color="green">
                        <NumberFormatter value={p.totals} thousandSeparator suffix=" 円" />
                      </Badge>
                      <Badge size="xs" variant="light" color="gray">{p.items.length} 点</Badge>
                    </Group>
                  </Stack>
                </Group>
                <Group gap={6} wrap="nowrap">
                  {p.detail_url && (
                    <Tooltip label="詳細ページを開く">
                      <ActionIcon component="a" href={p.detail_url} target="_blank" rel="noopener noreferrer" variant="subtle" color="blue" aria-label="外部リンク">
                        <IconExternalLink size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label={isFavorite(p.id) ? 'お気に入り解除' : 'お気に入りに追加'}>
                    <ActionIcon
                      variant={isFavorite(p.id) ? 'filled' : 'light'}
                      color="red"
                      aria-label="お気に入りトグル"
                      onClick={() => onToggleFavorite(p.id)}
                    >
                      {isFavorite(p.id) ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Drawer>
  );
};

export default React.memo(FavoritesDrawer);
