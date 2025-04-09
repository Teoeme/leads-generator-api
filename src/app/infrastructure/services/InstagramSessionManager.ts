import { SocialMediaAccount } from '../../domain/entities/SocialMediaAccount';
import { InstagramService } from '../../application/services/InstagramService';

interface SessionInfo {
  service: InstagramService;
  lastActivity: Date;
  isActive: boolean;
}

export class InstagramSessionManager {
  private static instance: InstagramSessionManager;
  private sessions: Map<string, SessionInfo> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos

  private constructor() {
    // Iniciar el limpiador de sesiones inactivas
    setInterval(() => this.cleanInactiveSessions(), 5 * 60 * 1000); // Cada 5 minutos
  }

  public static getInstance(): InstagramSessionManager {
    if (!InstagramSessionManager.instance) {
      InstagramSessionManager.instance = new InstagramSessionManager();
    }
    return InstagramSessionManager.instance;
  }

  public async getService(account: SocialMediaAccount): Promise<InstagramService> {
    const accountId = account.id!;
    
    // Verificar si ya existe una sesión activa
    if (this.sessions.has(accountId)) {
      const sessionInfo = this.sessions.get(accountId)!;
      
      // Actualizar la hora de última actividad
      sessionInfo.lastActivity = new Date();
      
      // Si la sesión está inactiva, intentar reactivarla
      if (!sessionInfo.isActive) {
        try {
          const success = await sessionInfo.service.login();
          sessionInfo.isActive = success;
        } catch (error) {
          console.error('Error reactivating Instagram session:', error);
          sessionInfo.isActive = false;
        }
      }
      
      return sessionInfo.service;
    }
    
    // Crear una nueva sesión
    const service = new InstagramService(account);
    
    try {
      const success = await service.login();
      
      this.sessions.set(accountId, {
        service,
        lastActivity: new Date(),
        isActive: success
      });
      
      return service;
    } catch (error) {
      console.error('Error creating Instagram session:', error);
      
      this.sessions.set(accountId, {
        service,
        lastActivity: new Date(),
        isActive: false
      });
      
      throw new Error('Failed to login to Instagram');
    }
  }

  public async closeSession(accountId: string): Promise<boolean> {
    if (!this.sessions.has(accountId)) {
      return false;
    }
    
    const sessionInfo = this.sessions.get(accountId)!;
    
    try {
      await sessionInfo.service.logout();
      this.sessions.delete(accountId);
      return true;
    } catch (error) {
      console.error('Error closing Instagram session:', error);
      this.sessions.delete(accountId);
      return false;
    }
  }

  private cleanInactiveSessions(): void {
    const now = new Date();
    
    for (const [accountId, sessionInfo] of this.sessions.entries()) {
      const timeDiff = now.getTime() - sessionInfo.lastActivity.getTime();
      
      if (timeDiff > this.SESSION_TIMEOUT) {
        console.log(`Closing inactive session for account ${accountId}`);
        this.closeSession(accountId).catch(error => {
          console.error(`Error closing inactive session for account ${accountId}:`, error);
        });
      }
    }
  }
} 