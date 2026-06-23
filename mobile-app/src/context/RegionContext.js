import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegionContext = createContext(null);

export const RegionProvider = ({ children }) => {
  const [region, setRegionState] = useState('global');

  useEffect(() => {
    AsyncStorage.getItem('selectedRegion').then(r => { if (r) setRegionState(r); });
  }, []);

  const setRegion = async (r) => {
    await AsyncStorage.setItem('selectedRegion', r);
    setRegionState(r);
  };

  const getBaseUrl = React.useCallback(() => {
    if (region === 'ireland')
    return process.env.EXPO_PUBLIC_IRISH_API_URL || 'https://api.sozodigicare.com';
  return process.env.EXPO_PUBLIC_GLOBAL_API_URL || 'https://api.sozodigicare.com';
  }, [region]);

  return <RegionContext.Provider value={{ region, setRegion, getBaseUrl }}>{children}</RegionContext.Provider>;
};

export const useRegion = () => useContext(RegionContext);
