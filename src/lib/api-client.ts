/**
 * API Client
 * Handles API requests with authentication
 */

import { useState, useCallback } from 'react';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base API URL — uses zigma-platform backend (port 3002)
const API_BASE_URL = import.meta.env.VITE_PLATFORM_API_URL || "http://localhost:3002";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('magic_token');
};

// Generic API request function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = getAuthToken();
    
    // Set default headers
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    
    // Add authorization header if token exists
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    // Prepare request options
    const requestOptions: RequestInit = {
      ...options,
      headers,
    };
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.status}`);
    }
    
    return data as T;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Helper function to handle file uploads
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<any> {
  try {
    const token = getAuthToken();
    
    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    
    // Add additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }
    
    // Set headers
    const headers: HeadersInit = {};
    
    // Add authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`File upload failed: ${endpoint}`, error);
    throw error;
  }
}

// API client hook for React components
export function useApiClient() {
  const [instance] = useState<AxiosInstance>(() => {
    const axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for authentication
    axiosInstance.interceptors.request.use((config) => {
      const token = getAuthToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });
    
    return axiosInstance;
  });
  
  // GET request
  const get = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig) => {
      return instance.get<T>(url, config);
    },
    [instance]
  );
  
  // POST request
  const post = useCallback(
    async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
      return instance.post<T>(url, data, config);
    },
    [instance]
  );
  
  // PUT request
  const put = useCallback(
    async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
      return instance.put<T>(url, data, config);
    },
    [instance]
  );
  
  // DELETE request
  const del = useCallback(
    async <T = any>(url: string, config?: AxiosRequestConfig) => {
      return instance.delete<T>(url, config);
    },
    [instance]
  );
  
  // Upload file
  const upload = useCallback(
    async (url: string, file: File, additionalData?: Record<string, any>) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, JSON.stringify(value));
        });
      }
      
      return instance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    [instance]
  );
  
  return { get, post, put, delete: del, upload, instance };
}
