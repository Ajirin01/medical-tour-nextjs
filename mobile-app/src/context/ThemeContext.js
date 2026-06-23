import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  colors: {}
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(value => {
      if (value === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem('themeMode', newValue ? 'dark' : 'light');
  };

  const colors = {
    background: isDark ? '#0f172a' : '#f8fafc',
    card: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#f8fafc' : '#1e293b',
    subtext: isDark ? '#94a3b8' : '#64748b',
    primary: '#1e40af',
    border: isDark ? '#334155' : '#e2e8f0',
    input: isDark ? '#334155' : '#f1f5f9',
    iconBackground: isDark ? '#1e40af33' : '#eff6ff',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
