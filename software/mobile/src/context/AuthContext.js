import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { updateApiBaseUrl, DEFAULT_API_HOST } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiHost, setApiHost] = useState(DEFAULT_API_HOST);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedHost = await AsyncStorage.getItem('mobile_api_host');
        if (storedHost) {
          setApiHost(storedHost);
          updateApiBaseUrl(storedHost);
        }

        const storedToken = await AsyncStorage.getItem('mobile_auth_token');
        const storedUser = await AsyncStorage.getItem('mobile_auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify with server
          try {
            const res = await api.get('/auth/me');
            if (res.data?.success && res.data?.user) {
              setUser(res.data.user);
              await AsyncStorage.setItem('mobile_auth_user', JSON.stringify(res.data.user));
            }
          } catch (e) {
            // If offline, preserve cached user
          }
        }
      } catch (e) {
        console.error('Failed to restore mobile session', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.token) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      await AsyncStorage.setItem('mobile_auth_token', newToken);
      await AsyncStorage.setItem('mobile_auth_user', JSON.stringify(newUser));
      return { success: true };
    }
    return { success: false, error: res.data?.error || 'Login failed' };
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('mobile_auth_token');
    await AsyncStorage.removeItem('mobile_auth_user');
  };

  const changeApiHost = async (newHost) => {
    setApiHost(newHost);
    updateApiBaseUrl(newHost);
    await AsyncStorage.setItem('mobile_api_host', newHost);
  };

  const value = {
    user,
    token,
    loading,
    apiHost,
    changeApiHost,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator' || user?.role === 'admin',
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
