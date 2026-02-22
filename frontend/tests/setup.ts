/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest';
import { vi, beforeAll, afterAll } from 'vitest';

// Mock maplibre-gl for unit tests
vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      remove: vi.fn(),
      getCanvas: vi.fn(() => ({ width: 800, height: 600 })),
    })),
    NavigationControl: vi.fn(),
    Marker: vi.fn(),
  },
  Map: vi.fn(),
}));

// Mock deck.gl for unit tests
vi.mock('@deck.gl/react', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => children),
  DeckGL: vi.fn(({ children }: { children: React.ReactNode }) => children),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
