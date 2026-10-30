import React, { createContext, useContext, useEffect } from 'react';

export const HOSPITALITY_THEMES = [
  {
    id: 'aura',
    name: 'Aura Luxury Pink & White',
    tagline: 'Signature Coral Rose & Crisp Porcelain',
    primary: '#FF385C',
    secondary: '#D90429',
    badge: 'Luxury',
    bg: '#FFF9FA',
  },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Permanently lock to the signature pink and white theme
    document.documentElement.setAttribute('data-theme', 'aura');
    localStorage.setItem('hospitality_active_theme', 'aura');
  }, []);

  const selectTheme = () => {
    // Locked to pink and white theme
  };

  const activeThemeMeta = HOSPITALITY_THEMES[0];

  return (
    <ThemeContext.Provider value={{ currentTheme: 'aura', selectTheme, themes: HOSPITALITY_THEMES, activeThemeMeta }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useHospitalityTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useHospitalityTheme must be used within a ThemeProvider');
  }
  return context;
};
