import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import App from './App';

test('renders application title', () => {
  render(
    <MantineProvider>
      <App />
    </MantineProvider>
  );
  const titleElement = screen.getByText(/若者食費ビューアー/i);
  expect(titleElement).toBeInTheDocument();
});
