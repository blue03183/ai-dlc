import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

function CartOnly({ children }: WrapperProps) {
  return (
    <MemoryRouter>
      <CartProvider>
        {children}
      </CartProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export function renderWithCart(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: CartOnly, ...options });
}

export function clearLocalStorage() {
  localStorage.clear();
}
