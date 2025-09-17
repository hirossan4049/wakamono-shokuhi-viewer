import React from 'react';
import { Dropzone } from '@mantine/dropzone';
import { IconUpload, IconX, IconFile } from '@tabler/icons-react';
import { Text, Group, rem, Title, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ProductData } from '../types/Product';

interface FileUploadProps {
  onFileLoad: (data: ProductData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad }) => {
  const handleFileDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result) as ProductData;
        
        // Validate the data structure
        if (!data.products || !Array.isArray(data.products)) {
          throw new Error('Invalid JSON structure: missing products array');
        }

        // Basic validation for each product
        data.products.forEach((product, index) => {
          if (!product.name || !product.id || !product.category) {
            throw new Error(`Invalid product at index ${index}: missing required fields`);
          }
          if (!product.items || !Array.isArray(product.items)) {
            throw new Error(`Invalid product at index ${index}: missing items array`);
          }
        });

        onFileLoad(data);
        notifications.show({
          title: 'ファイルが読み込まれました',
          message: `${data.products.length}件の商品データを読み込みました`,
          color: 'green',
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        notifications.show({
          title: 'エラー',
          message: 'JSONファイルの解析に失敗しました。ファイル形式を確認してください。',
          color: 'red',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Paper withBorder p="xl" radius="md">
      <Title order={2} size="h3" mb="lg" ta="center">
        データをアップロード
      </Title>
      <Dropzone
        onDrop={handleFileDrop}
        accept={{ 'application/json': ['.json'] }}
        maxFiles={1}
        multiple={false}
      >
        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <IconUpload
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-myColor-6)' }}
              stroke={1.5}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
              stroke={1.5}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile
              style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
              stroke={1.5}
            />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              ここにJSONファイルをドラッグ
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              またはクリックしてファイルを選択
            </Text>
          </div>
        </Group>
      </Dropzone>
    </Paper>
  );
};

export default FileUpload;
