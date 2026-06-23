import AsyncStorage from '@react-native-async-storage/async-storage';
import { fixUrl } from '../utils/fixUrl';

const getBaseUrl = async () => {
  const region = await AsyncStorage.getItem('selectedRegion');
  if (region === 'ireland') return process.env.EXPO_PUBLIC_IRISH_API_URL || 'https://api.sozodigicare.com';
  return process.env.EXPO_PUBLIC_GLOBAL_API_URL || 'https://api.sozodigicare.com';
};

/**
 * Recursively walks a JSON response and rewrites any insecure URLs to HTTPS.
 * This handles profile images and other assets stored in the DB as absolute http:// URLs.
 */
const sanitizeResponse = (data) => {
  if (Array.isArray(data)) return data.map(sanitizeResponse);
  if (data && typeof data === 'object') {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = sanitizeResponse(data[key]);
    }
    return result;
  }
  if (typeof data === 'string') return fixUrl(data);
  return data;
};

export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = await getBaseUrl();
  const token = await AsyncStorage.getItem('userToken');
  const region = await AsyncStorage.getItem('selectedRegion');
  
  const headers = { 
    'Content-Type': 'application/json', 
    'x-platform': region === 'ireland' ? 'irish' : 'global',
    ...(token ? { Authorization: `Bearer ${token}` } : {}), 
    ...options.headers 
  };
  
  const res = await fetch(`${baseUrl}/${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  const json = await res.json();
  return sanitizeResponse(json);
};

export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' });
export const apiPost = (endpoint, body) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

export const apiUpload = async (endpoint, formData) => {
  const baseUrl = await getBaseUrl();
  const token = await AsyncStorage.getItem('userToken');
  const region = await AsyncStorage.getItem('selectedRegion');
  
  const headers = { 
    'x-platform': region === 'ireland' ? 'irish' : 'global',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  const res = await fetch(`${baseUrl}/${endpoint}`, { 
    method: 'POST', 
    body: formData,
    headers 
  });
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  const json = await res.json();
  return sanitizeResponse(json);
};

