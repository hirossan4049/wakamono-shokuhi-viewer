import { createTheme, MantineColorsTuple } from '@mantine/core';

const myColor: MantineColorsTuple = [
  '#eef9ff',
  '#dceeff',
  '#b4dbff',
  '#89c7ff',
  '#63b5ff',
  '#4da9ff',
  '#3fA2ff',
  '#338ef1',
  '#267ddb',
  '#0069c4',
];

export const theme = createTheme({
  primaryColor: 'myColor',
  colors: {
    myColor,
  },
  fontFamily: 'Noto Sans JP, sans-serif',
  headings: {
    fontFamily: 'Noto Sans JP, sans-serif',
    fontWeight: '700',
  },
  components: {
    Button: {
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    ActionIcon: {
      styles: {
        root: {
          borderWidth: '1px',
        },
      },
    },
  },
});
