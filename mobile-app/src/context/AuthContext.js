import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['userToken','userData']).then(([t, u]) => {
      if (t[1]) setToken(t[1]);
      if (u[1]) setUser(JSON.parse(u[1]));
      setLoading(false);
    });
  }, []);

  const login = async (userData, userToken) => {
    await AsyncStorage.setItem('userToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setToken(userToken);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken','userData']);
    setUser(null);
    setToken(null);
  };

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
