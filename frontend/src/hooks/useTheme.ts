import { useState, useEffect } from 'react';

// Initialize theme BEFORE first render to prevent flash
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('theme');
  if (saved === 'light') return false;
  if (saved === 'dark') return true;
  // Default: dark mode
  return true;
};

const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }
};

export function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  // Apply on mount synchronously
  useEffect(() => {
    const initial = getInitialTheme();
    setIsDark(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newDark = !prev;
      applyTheme(newDark);
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      return newDark;
    });
  };

  return { isDark, toggleTheme };
}
