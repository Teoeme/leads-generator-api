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

export interface ProxyConfiguration {
  id?: string;
  name: string;
  server: string;       // Dirección IP o dominio con puerto (formato: ip:puerto o dominio:puerto)
  username?: string;    // Nombre de usuario para autenticación (opcional)
  password?: string;    // Contraseña para autenticación (opcional)
  protocol: ProxyProtocol;  // Protocolo del proxy
  status: ProxyStatus;  // Estado actual del proxy
  country?: string;     // País de origen del proxy
  lastChecked?: Date;   // Última vez que se verificó el funcionamiento del proxy
  ip?: string;          // IP detectada en la última verificación
  responseTime?: number; // Tiempo de respuesta en milisegundos
  successRate?: number; // Tasa de éxito (0-100%)
  notes?: string;       // Notas adicionales
  tags?: string[];      // Etiquetas para categorizar
  createdAt?: Date;     // Fecha de creación
  updatedAt?: Date;     // Fecha de última actualización
  usageCount?: number;  // Contador de uso
} 