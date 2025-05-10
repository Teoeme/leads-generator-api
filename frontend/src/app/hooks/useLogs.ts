import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getCookie } from './useCookies';

export interface Log {
  id: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: {
    event?: string;
    interventionId?: string;
    campaignId?: string;
    simulatorId?: string;
    socialMediaType?: string;
    executionTimeMs?: number;
    leadsCount?: number;
    errorType?: string;
    [key: string]: any;
  };
  metadata?: {
    event?: string;
    interventionId?: string;
    campaignId?: string;
    simulatorId?: string;
    socialMediaType?: string;
    executionTimeMs?: number;
    leadsCount?: number;
    errorType?: string;
  timestamp: string;

    [key: string]: any;
  };
}

export interface LogsResponse {
  success: boolean;
  data: Log[];
  metadata: {
    filters: {
      level?: string;
      campaignId?: string;
      interventionId?: string;
      simulatorId?: string;
      socialMediaType?: string;
      event?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

export interface LogFilters {
  level?: string;
  campaignId?: string;
  interventionId?: string;
  simulatorId?: string;
  socialMediaType?: string;
  event?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LogsPagination {
  page: number;
  limit: number;
}

const useLogs = (initialFilters: LogFilters = {}, initialPagination: LogsPagination = { page: 1, limit: 50 }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [filters, setFilters] = useState<LogFilters>(initialFilters);
  const [pagination, setPagination] = useState<LogsPagination>(initialPagination);
  const [pollingInterval, setPollingInterval] = useState<number>(5000); // 5 segundos por defecto
  const [isPolling, setIsPolling] = useState<boolean>(false);

  const token=getCookie('token');

  const buildQueryParams = useCallback(() => {
    const params: Record<string, string> = {
      page: pagination.page.toString(),
      limit: pagination.limit.toString(),
    };

    if (filters.level) params.level = filters.level;
    if (filters.campaignId) params.campaignId = filters.campaignId;
    if (filters.interventionId) params.interventionId = filters.interventionId;
    if (filters.simulatorId) params.simulatorId = filters.simulatorId;
    if (filters.socialMediaType) params.socialMediaType = filters.socialMediaType;
    if (filters.event) params.event = filters.event;
    if (filters.search) params.search = filters.search;
    
    if (filters.startDate) {
      params.startDate = filters.startDate.toISOString();
    }
    
    if (filters.endDate) {
      params.endDate = filters.endDate.toISOString();
    }

    return params;
  }, [filters, pagination]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = buildQueryParams();
      const response = await axios.get<LogsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/api/logs`, { params, headers: { 'Authorization': `Bearer ${token}` } });
      
      setLogs(response.data.data);
      setTotalCount(response.data.metadata.pagination.total);
      
      const currentPage = response.data.metadata.pagination.page;
      const totalPages = response.data.metadata.pagination.totalPages;
      setHasMore(currentPage < totalPages);
      
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Error al obtener los logs. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);


  const deleteLogs = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/logs`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchLogs();
    } catch (err) {
      console.error('Error deleting logs:', err);
      setError('Error al eliminar los logs. Por favor, inténtalo de nuevo.');
    }
  };
  
  // Fetch logs when filters or pagination change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Set up polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isPolling && pollingInterval > 0) {
      intervalId = setInterval(() => {
        fetchLogs();
      }, pollingInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, pollingInterval, fetchLogs]);

  const togglePolling = useCallback(() => {
    setIsPolling(prev => !prev);
  }, []);

  const updatePollingInterval = useCallback((interval: number) => {
    setPollingInterval(interval);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const updatePagination = useCallback((newPagination: Partial<LogsPagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [hasMore]);

  const previousPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.page]);

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    totalCount,
    hasMore,
    filters,
    pagination,
    isPolling,
    pollingInterval,
    updateFilters,
    updatePagination,
    nextPage,
    previousPage,
    togglePolling,
    updatePollingInterval,
    refresh,
    deleteLogs
  };
};

export default useLogs; 