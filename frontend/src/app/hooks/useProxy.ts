'use client'
import { useEffect } from 'react';
import { Proxy, ProxyFormData, ProxyStatus } from '../entities/Proxy';
import { getCookie } from './useCookies';
import useSWR, { mutate } from 'swr';
import { useDispatch, useSelector } from '../Redux/hooks';
import { setProxies, setProxyError, setProxyLoading, selectProxies, selectProxyLoading, selectProxyError } from '../Redux/Slices/proxySlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const PROXY_KEY = '/api/proxies';

// Fetcher genérico para SWR
const fetcher = async (url: string) => {
  const token = getCookie('token');
  if (!token) {
    throw new Error('No token available');
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
};

export const useProxy = () => {
  const dispatch = useDispatch();
  const proxies = useSelector(selectProxies);
  const loading = useSelector(selectProxyLoading);
  const error = useSelector(selectProxyError);
  
  // Usar SWR para obtener los datos y mantenerlos actualizados
  const { error: swrError, isLoading } = useSWR<Proxy[]>(
    PROXY_KEY,
    fetcher,
    {
      onSuccess: (data) => {
        dispatch(setProxies(data));
      },
      onError: (err) => {
        dispatch(setProxyError(err.message));
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );
  
  // Mantener sincronizado el estado de carga y error con Redux
  useEffect(() => {
    dispatch(setProxyLoading(isLoading));
    if (swrError) {
      dispatch(setProxyError(swrError.message));
    }
  }, [isLoading, swrError, dispatch]);

  // Función para refrescar los datos
  const fetchProxies = () => {
    mutate(PROXY_KEY);
  };

  const fetchAvailableProxies = async () => {
    dispatch(setProxyLoading(true));
    try {
      const token = getCookie('token');
      const response = await fetch(`${API_URL}/api/proxies/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available proxies');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      dispatch(setProxyError(err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error al cargar los proxies disponibles', err);
      return [];
    } finally {
      dispatch(setProxyLoading(false));
    }
  };

  const fetchProxyById = async (id: string) => {
    dispatch(setProxyLoading(true));
    try {
      const token = getCookie('token');
      const response = await fetch(`${API_URL}/api/proxies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proxy');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      dispatch(setProxyError(err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error al cargar el proxy', err);
      return null;
    } finally {
      dispatch(setProxyLoading(false));
    }
  };

  const createProxy = async (proxyData: ProxyFormData) => {
    dispatch(setProxyLoading(true));
    try {
      const token = getCookie('token');
      const response = await fetch(`${API_URL}/api/proxies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...proxyData,
          status: ProxyStatus.INACTIVE
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create proxy');
      }

      const newProxy = await response.json();
      // Actualizar el estado global y revalidar la caché de SWR
      mutate(PROXY_KEY);
      console.log('Proxy creado exitosamente');
      return newProxy;
    } catch (err) {
      dispatch(setProxyError(err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error al crear el proxy', err);
      return null;
    } finally {
      dispatch(setProxyLoading(false));
    }
  };

  const updateProxy = async (id: string, proxyData: ProxyFormData) => {
    dispatch(setProxyLoading(true));
    try {
      const token = getCookie('token');
      const response = await fetch(`${API_URL}/api/proxies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(proxyData),
      });

      if (!response.ok) {
        throw new Error('Failed to update proxy');
      }

      const updatedProxy = await response.json();
      // Revalidar la caché de SWR para obtener los datos actualizados
      mutate(PROXY_KEY);
      console.log('Proxy actualizado exitosamente');
      return updatedProxy;
    } catch (err) {
      dispatch(setProxyError(err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error al actualizar el proxy', err);
      return null;
    } finally {
      dispatch(setProxyLoading(false));
    }
  };

  const deleteProxy = async (id: string) => {
    dispatch(setProxyLoading(true));
    try {
      const token = getCookie('token');
      const response = await fetch(`${API_URL}/api/proxies/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete proxy');
      }

      // Revalidar la caché de SWR para obtener los datos actualizados
      mutate(PROXY_KEY);
      console.log('Proxy eliminado exitosamente');
      return true;
    } catch (err) {
      dispatch(setProxyError(err instanceof Error ? err.message : 'Unknown error'));
      console.error('Error al eliminar el proxy', err);
      return false;
    } finally {
      dispatch(setProxyLoading(false));
    }
  };

  const checkProxyStatus = async (id: string) => {
    dispatch(setProxyLoading(true));
    try {
      const token = getCookie('token');
      const response = await fetch(`${API_URL}/api/proxies/${id}/check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check proxy status');
      }

      const result = await response.json();
      
      // Revalidar la caché de SWR para obtener los datos actualizados
      mutate(PROXY_KEY);
      
      console.log('Estado del proxy verificado');
      return result;
    } catch (err) {
      console.log('Error al verificar el estado del proxy', err);
      dispatch(setProxyError(err instanceof Error ? err.message : 'Unknown error'));
      return null;
    } finally {
      dispatch(setProxyLoading(false));
    }
  };

  return {
    proxies,
    loading,
    error,
    fetchProxies,
    fetchProxyById,
    fetchAvailableProxies,
    createProxy,
    updateProxy,
    deleteProxy,
    checkProxyStatus,
  };
}; 