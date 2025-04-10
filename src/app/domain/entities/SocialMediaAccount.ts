export enum SocialMediaType {
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  TIKTOK = 'TIKTOK'
}

export enum SocialMediaLastLoginStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export enum SocialMediaAccountRole {
  SCRAPPING = 'SCRAPPING',     // Cuenta para recolectar información y leads
  ENGAGEMENT = 'ENGAGEMENT',   // Cuenta para interactuar con usuarios (likes, comentarios, etc)
  MESSAGING = 'MESSAGING'      // Cuenta para enviar mensajes directos
}

export interface ProxyAssignment {
  proxyId: string;    // ID del proxy configurado en la colección de proxies
  enabled: boolean;   // Si el proxy está activado o no para esta cuenta
}

export interface SocialMediaAccount {
  id?: string;
  userId: string;
  instanceId: string;
  type: SocialMediaType;
  username: string;
  password: string;
  isActive?: boolean;
  lastLogin?: Date;
  lastLoginStatus?: SocialMediaLastLoginStatus;
  sessionData?: any;
  proxy?: ProxyAssignment;  // Referencia al proxy asignado (opcional)
  roles?: SocialMediaAccountRole[];  // Roles asignados a la cuenta
  createdAt?: Date;
  updatedAt?: Date;
} 