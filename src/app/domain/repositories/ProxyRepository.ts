import { ProxyConfiguration } from "../entities/Proxy/ProxyConfiguration";

export interface ProxyRepository {
  // Métodos básicos CRUD
  getProxies(filter?: Partial<ProxyConfiguration>): Promise<ProxyConfiguration[]>;
  getProxyById(id: string): Promise<ProxyConfiguration | null>;
  createProxy(proxy: ProxyConfiguration): Promise<ProxyConfiguration>;
  updateProxy(id: string, proxy: Partial<ProxyConfiguration>): Promise<ProxyConfiguration | null>;
  deleteProxy(id: string): Promise<boolean>;
  
  // Métodos de utilidad adicionales
  checkProxyStatus(id: string): Promise<{ success: boolean, message: string, ip?: string, country?: string, responseTime?: number }>;
  incrementUsageCount(id: string): Promise<void>;
  getAvailableProxies(): Promise<ProxyConfiguration[]>;
} 