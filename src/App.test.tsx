import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders application title', () => {
  render(
    <MantineProvider>
      <App />
    </MantineProvider>
  );
  const titleElement = screen.getByText(/大阪府若者食費支援検索/i);
  expect(titleElement).toBeInTheDocument();
});
