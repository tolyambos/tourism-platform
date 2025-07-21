'use client';

import { createContext, useContext, ReactNode } from 'react';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
}

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  theme 
}: { 
  children: ReactNode; 
  theme: any; 
}) {
  // Parse theme from JSON or use defaults
  const parsedTheme: Theme = {
    colors: theme?.colors || {
      primary: '#0070f3',
      secondary: '#ff4785',
      accent: '#00d3ff',
      background: '#ffffff',
      text: '#000000'
    },
    fonts: theme?.fonts || {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif'
    },
    borderRadius: theme?.borderRadius || '0.5rem'
  };
  
  // Apply CSS variables
  if (typeof window !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', parsedTheme.colors.primary);
    root.style.setProperty('--color-secondary', parsedTheme.colors.secondary);
    root.style.setProperty('--color-accent', parsedTheme.colors.accent);
    root.style.setProperty('--color-background', parsedTheme.colors.background);
    root.style.setProperty('--color-text', parsedTheme.colors.text);
    root.style.setProperty('--border-radius', parsedTheme.borderRadius);
  }
  
  return (
    <ThemeContext.Provider value={{ theme: parsedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}