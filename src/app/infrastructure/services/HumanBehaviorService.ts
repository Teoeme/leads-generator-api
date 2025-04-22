import { appConfig } from '../config/app-config';
import randomUseragent from 'random-useragent';
import { ActionType } from '../simulation/actions/ActionTypes';
import { SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { SocialMediaLimits, socialMediaLimits } from '../simulation/behaviors/BehaviorProfile';
import { logger } from './LoggerService';

/**
 * Servicio para simular comportamiento humano en interacciones con redes sociales
 */
export class HumanBehaviorService {
  private static instance: HumanBehaviorService;
  private activityCounts: Map<string, Map<string, number>> = new Map();
  private lastResetDate: Date = new Date();
  private lastActionTime: number = 0;
  private nextResetTimeStamp: number = 0;
  
  // Mapa para almacenar el tipo de red social por cuenta
  private accountTypes: Map<string, SocialMediaType> = new Map();

  private constructor() {
    // Resetear contadores diariamente
    setInterval(() => this.resetDailyCounts(), 24 * 60 * 60 * 1000);
  }

  public static getInstance(): HumanBehaviorService {
    if (!HumanBehaviorService.instance) {
      HumanBehaviorService.instance = new HumanBehaviorService();
    }
    return HumanBehaviorService.instance;
  }

  /**
   * Registra el tipo de red social de una cuenta
   * @param accountId ID de la cuenta
   * @param type Tipo de red social
   */
  public registerAccountType(accountId: string, type: SocialMediaType): void {
    this.accountTypes.set(accountId, type);
  }

  /**
   * Obtiene el tipo de red social registrado para una cuenta
   * @param accountId ID de la cuenta
   * @returns Tipo de red social o undefined si no está registrado
   */
  public getAccountType(accountId: string): SocialMediaType | undefined {
    return this.accountTypes.get(accountId);
  }

  /**
   * Genera un retraso aleatorio dentro del rango especificado
   */
  public async randomDelay(type: keyof typeof appConfig.humanBehavior.delays, accountId?: string): Promise<void> {
    let min = appConfig.humanBehavior.delays[type].min;
    let max = appConfig.humanBehavior.delays[type].max;
    
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Verifica si una acción está dentro de los límites diarios
   * @param accountId ID de la cuenta que realiza la acción
   * @param actionType Tipo de acción a verificar
   */
  public canPerformAction(accountId: string, actionType: ActionType): {canPerform:boolean, secondsToReset:number, status:'success' | 'error' | 'needToWait'} {
    // Si no tenemos límites configurados para esta acción, permitir
    this.initializeCountersIfNeeded(accountId);
    
    const accountCounts = this.activityCounts.get(accountId)!;
    const currentCount = accountCounts.get(actionType) || 0;
    
    // Obtener el límite base de la configuración
    const baseLimit = appConfig.humanBehavior.dailyLimits[actionType as keyof typeof appConfig.humanBehavior.dailyLimits];
    
    // Obtener el tipo de red social y sus límites específicos
    const socialType = this.accountTypes.get(accountId);
    let maxActions = baseLimit?.max||null;
    
    if (socialType && socialMediaLimits[socialType]) {
      // Ajustar el límite según el tipo de red social
      const socialLimits = socialMediaLimits[socialType];
      maxActions = socialLimits[actionType as keyof SocialMediaLimits]?.max || null;
    }
    const canPerform = maxActions ? currentCount <= maxActions : true;
    logger.debug(`Can perform action: [${actionType}] for account: [${accountId}] -> ${canPerform}`, {canPerform, maxActions, currentCount})
    return {
      canPerform,
      secondsToReset: this.getSecondsToReset(),
      status: maxActions ? currentCount <= maxActions ? 'success' : 'needToWait' : 'success'
    };
  }

  /**
   * Registra una acción realizada por una cuenta específica
   */
  public trackAction(accountId: string, actionType: ActionType): void {
    // if (!Object.keys(appConfig.humanBehavior.dailyLimits).includes(actionType)) return;
    logger.debug(`Tracking action: [${actionType}] for account: [${accountId}]`)
    this.initializeCountersIfNeeded(accountId);
    
    const accountCounts = this.activityCounts.get(accountId)!;
    const currentCount = accountCounts.get(actionType) || 0;
    
    accountCounts.set(actionType, currentCount + 1);
    this.activityCounts.set(accountId, accountCounts);
  }

  // Calcula un porcentaje de uso de la cuenta en base a las acciones realizadas
  public calculateUsagePercentage(accountId: string): number {
    const accountCounts = this.activityCounts.get(accountId);
    if (!accountCounts || accountCounts.size === 0) return 0;
    
    // Obtener el tipo de red social
    const socialType = this.accountTypes.get(accountId);
    if (!socialType || !socialMediaLimits[socialType]) {
      // Si no hay tipo específico, usar la lógica original
      const totalActions = Object.values(appConfig.humanBehavior.dailyLimits)
        .reduce((acc, limit) => acc + (limit.max * limit.scoring), 0);
      
      const currentActions = Array.from(accountCounts.entries())
        .reduce((acc, [action, count]) => {
          const actionKey = action as keyof typeof appConfig.humanBehavior.dailyLimits;
          if (appConfig.humanBehavior.dailyLimits[actionKey]) {
            return acc + (count * appConfig.humanBehavior.dailyLimits[actionKey].scoring);
          }
          return acc;
        }, 0);
      
      return (currentActions / totalActions) * 100;
    }
    
    // Usar límites específicos de la red social
    const socialLimits = socialMediaLimits[socialType];
    let totalPossibleActions = Object.values(socialLimits).reduce((acc, limit) => acc + (limit.max * limit.scoring), 0);
    let currentActionCount = 0;
    
    // Sumar todas las acciones realizadas
    accountCounts.forEach((count, action) => {
      const actionKey = action as keyof typeof socialLimits;
      if (socialLimits[actionKey]) {
        currentActionCount += count * socialLimits[actionKey].scoring;
      }
    });
    
    return Math.min(100, (currentActionCount / totalPossibleActions) * 100);
  }
  
  /**
   * Verifica si es una hora activa para realizar acciones
   */
  public isActiveHour(): boolean {
    const currentHour = new Date().getHours();
    return appConfig.humanBehavior.activityPatterns.activeHours.includes(currentHour);
  }

  /**
   * Verifica si es una hora pico (para acciones más intensivas)
   */
  public isPeakHour(): boolean {
    const currentHour = new Date().getHours();
    return appConfig.humanBehavior.activityPatterns.peakHours.includes(currentHour);
  }

  public getSecondsToNextActiveHour(): number {
    const currentHour = new Date();
    let nextDay = false;

    const activeHours = appConfig.humanBehavior.activityPatterns.activeHours.sort((a,b)=>a-b); // ordenar las horas activas
    let nextActiveHour = activeHours.find(hour => hour > currentHour.getHours());
    if(!nextActiveHour) {
      nextDay = true;
      nextActiveHour = activeHours[0];
    }
    const virtualDate = new Date(currentHour.getFullYear(), currentHour.getMonth(), currentHour.getDate(), nextActiveHour, 0, 0);
    if(nextDay) virtualDate.setDate(virtualDate.getDate() + 1);
    
    // Convertir milisegundos a segundos antes de devolver
    return Math.floor((virtualDate.getTime() - currentHour.getTime()) / 1000);
  }
  /**
   * Inicializa contadores para una cuenta si no existen
   */
  private initializeCountersIfNeeded(accountId: string): void {
    if (!this.activityCounts.has(accountId)) {
      this.activityCounts.set(accountId, new Map());
    }
  }

  /**
   * Resetea los contadores diarios
   */
  private resetDailyCounts(): void {
    this.activityCounts.clear();
    this.lastResetDate = new Date();
    logger.debug(`Daily counts reset at ${this.lastResetDate}`)
  }

  public getSecondsToReset(): number {
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(0, 0, 0, 0);
    resetTime.setDate(resetTime.getDate() + 1);
    
    return Math.floor((resetTime.getTime() - now.getTime()) / 1000);
  }

  /**
   * Genera un retraso aleatorio para simular comportamiento humano
   * @param min Tiempo mínimo en milisegundos
   * @param max Tiempo máximo en milisegundos
   * @returns Tiempo de retraso en milisegundos
   */
  public getRandomDelay(min: number = 1000, max: number = 5000): number {
    // Asegurar que haya al menos 1 segundo desde la última acción
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime;
    
    if (timeSinceLastAction < 1000) {
      min = Math.max(min, 1000 - timeSinceLastAction);
    }
    
    // Generar retraso aleatorio
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Actualizar tiempo de última acción
    this.lastActionTime = now + delay;
    
    return delay;
  }


  /**
   * Genera un User-Agent aleatorio para simular diferentes navegadores
   * @returns String con el User-Agent
   */
  public getRandomUserAgent(): string {
    return randomUseragent.getRandom();
  }

  /**
   * Genera un patrón de escritura humana (con errores ocasionales y velocidad variable)
   * @param text Texto a escribir
   * @param errorRate Tasa de error (0-1)
   * @returns Array de objetos con el carácter y el tiempo de espera
   */
  public generateTypingPattern(text: string, errorRate: number = 0.05): Array<{char: string, delay: number}> {
    const result: Array<{char: string, delay: number}> = [];
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
      // Velocidad de escritura variable (entre 100ms y 300ms por carácter)
      const baseDelay = Math.floor(Math.random() * 200) + 100;
      
      // Posibilidad de error de escritura
      if (Math.random() < errorRate) {
        // Añadir un carácter incorrecto
        const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        result.push({ char: wrongChar, delay: baseDelay });
        
        // Añadir una pausa antes de corregir (entre 200ms y 500ms)
        const pauseDelay = Math.floor(Math.random() * 300) + 200;
        
        // Añadir retroceso para borrar el error
        result.push({ char: 'BACKSPACE', delay: pauseDelay });
        
        // Añadir el carácter correcto con un delay ligeramente mayor
        result.push({ char: chars[i], delay: baseDelay * 1.2 });
      } else {
        // Añadir el carácter normal
        result.push({ char: chars[i], delay: baseDelay });
      }
      
      // Posibilidad de pausa más larga (como si estuviera pensando)
      if (Math.random() < 0.1) {
        const thinkingDelay = Math.floor(Math.random() * 1000) + 500;
        result[result.length - 1].delay += thinkingDelay;
      }
    }
    
    return result;
  }


  /**
   * Establece límites personalizados para las acciones diarias
   * @param limits Objeto con los límites para cada tipo de acción
   */
  public setDailyLimits(limits: Record<string, number>): void {
    Object.keys(limits).forEach(key => {
      if (key in appConfig.humanBehavior.dailyLimits) {
        appConfig.humanBehavior.dailyLimits[key as keyof typeof appConfig.humanBehavior.dailyLimits].max = limits[key];
      }
    });
  }

  /**
   * Obtiene los límites diarios actuales
   * @returns Objeto con los límites para cada tipo de acción
   */
  public getDailyLimits(): Record<string, {max:number,scoring:number}> {
    return { ...appConfig.humanBehavior.dailyLimits };
  }

}

