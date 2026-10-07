import React, { createContext, useContext, useState, useEffect } from 'react';

export const HOSPITALITY_THEMES = [
  {
    id: 'aura',
    name: 'aura Modern',
    tagline: 'Iconic Coral & Teal',
    primary: '#FF385C',
    secondary: '#008489',
    badge: 'aura',
    bg: '#F7F7F7',
  },
  {
    id: 'sonder',
    name: 'Sonder Boutique',
    tagline: 'Terracotta & Sage',
    primary: '#D96B43',
    secondary: '#4A7C59',
    badge: 'Sonder',
    bg: '#F9F6F0',
  },
  {
    id: 'coastal',
    name: 'Azure Coastal',
    tagline: 'Aegean Teal & Apricot',
    primary: '#028090',
    secondary: '#F4A261',
    badge: 'Coastal',
    bg: '#F4F8F8',
  },
  {
    id: 'heritage',
    name: 'Heritage Gold',
    tagline: 'Alabaster & Bronze',
    primary: '#946E3A',
    secondary: '#B28B53',
    badge: 'Palace',
    bg: '#F8F6F2',
  },
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('hospitality_active_theme') || 'aura';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('hospitality_active_theme', currentTheme);
  }, [currentTheme]);

  const selectTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  const activeThemeMeta = HOSPITALITY_THEMES.find((t) => t.id === currentTheme) || HOSPITALITY_THEMES[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, selectTheme, themes: HOSPITALITY_THEMES, activeThemeMeta }}>
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
