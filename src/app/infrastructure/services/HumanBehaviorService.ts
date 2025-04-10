import { appConfig } from '../config/app-config';
import randomUseragent from 'random-useragent';
import { ActionType } from '../simulation/actions/ActionTypes';

/**
 * Servicio para simular comportamiento humano en interacciones con redes sociales
 */
export class HumanBehaviorService {
  private static instance: HumanBehaviorService;
  private activityCounts: Map<string, Map<string, number>> = new Map();
  private lastResetDate: Date = new Date();
  private lastActionTime: number = 0;

  private resetDate: Date = new Date();
  private nextResetTimeStamp: number = 0;
  

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
   * Genera un retraso aleatorio dentro del rango especificado
   */
  public async randomDelay(type: keyof typeof appConfig.humanBehavior.delays): Promise<void> {
    const { min, max } = appConfig.humanBehavior.delays[type];
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Verifica si una acción está dentro de los límites diarios
   * @param accountId ID de la cuenta que realiza la acción
   * @param actionType Tipo de acción a verificar
   */
  public canPerformAction(accountId: string, actionType: ActionType): {canPerform:boolean,secondsToReset:number,status:'success' | 'error' | 'needToWait'}   {
    
    if(!Object.keys(appConfig.humanBehavior.dailyLimits).includes(actionType)) return {canPerform:true,secondsToReset:0,status:'success'}

    this.initializeCountersIfNeeded(accountId);
    
    const accountCounts = this.activityCounts.get(accountId)!;
    const currentCount = accountCounts.get(actionType) || 0;
    
    const limit = appConfig.humanBehavior.dailyLimits[actionType as keyof typeof appConfig.humanBehavior.dailyLimits];
    
    return {canPerform:currentCount < limit.max,secondsToReset:this.getSecondsToReset(),status:currentCount < limit.max ? 'success' : 'needToWait'};
  }

 
  public getSecondsToReset(): number {
    return Math.floor((this.nextResetTimeStamp - Date.now()) / 1000);
  }
  /**
   * Registra una acción realizada por una cuenta específica
   */
  public trackAction(accountId: string, actionType: ActionType): void {
    if(!Object.keys(appConfig.humanBehavior.dailyLimits).includes(actionType)) return;
    this.initializeCountersIfNeeded(accountId);
    
    const accountCounts = this.activityCounts.get(accountId)!;
    const currentCount = accountCounts.get(actionType) || 0;
    
    accountCounts.set(actionType, currentCount + 1);
    this.activityCounts.set(accountId, accountCounts);
  }

//Calcula un porcentaje de uso de la cuenta en base a las acciones realizadas
public calculateUsagePercentage(accountId: string): number {
  const accountCounts = this.activityCounts.get(accountId)!;
  if(!accountCounts) return 0;
  console.log(accountCounts,'accountCounts');
  const totalActions = Object.values(appConfig.humanBehavior.dailyLimits).reduce((acc, limit) => acc + (limit.max * limit.scoring), 0);
  console.log(totalActions,'totalActions');
  const currentActions = Object.values(accountCounts).reduce((acc, count) => acc + (count * appConfig.humanBehavior.dailyLimits[count as keyof typeof appConfig.humanBehavior.dailyLimits].scoring), 0);
  console.log(currentActions,'currentActions');
  return (currentActions||0 / totalActions) * 100;
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
    let nextDay=false;

    const activeHours = appConfig.humanBehavior.activityPatterns.activeHours.sort((a,b)=>a-b); // ordenar las horas activas
    let nextActiveHour = activeHours.find(hour => hour > currentHour.getHours());
    if(!nextActiveHour) {
      nextDay=true;
      nextActiveHour=activeHours[0];
    }
    const virtualDate=new Date(currentHour.getFullYear(),currentHour.getMonth(),currentHour.getDate(),nextActiveHour,0,0);
    if(nextDay) virtualDate.setDate(virtualDate.getDate() + 1);
    return virtualDate.getTime() - currentHour.getTime();
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
    this.nextResetTimeStamp = Date.now() + 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (this.lastResetDate < today) {
      this.activityCounts = new Map();
      this.lastResetDate = today;
      console.log('Daily activity counts reset');
    }
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

