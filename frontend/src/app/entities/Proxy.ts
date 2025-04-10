export enum ProxyProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  SOCKS4 = 'socks4',
  SOCKS5 = 'socks5'
}

export enum ProxyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING',
  BLOCKED = 'BLOCKED'
}

export interface Proxy {
  _id?: string;
  id?: string;
  name: string;
  server: string;
  username?: string;
  password?: string;
  protocol: ProxyProtocol;
  status: ProxyStatus;
  country?: string;
  lastChecked?: Date;
  ip?: string;
  responseTime?: number;
  successRate?: number;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  usageCount?: number;
}

export interface ProxyFormData {
  id?: string;
  name: string;
  server: string;
  username?: string;
  password?: string;
  protocol: ProxyProtocol;
  country?: string;
  notes?: string;
  tags?: string[];
} 