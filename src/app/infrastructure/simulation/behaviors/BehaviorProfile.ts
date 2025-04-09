/**
 * Perfiles de comportamiento para simulación de actividad humana
 */

export enum BehaviorProfileType {
  CASUAL = 'casual',
  DETAILED = 'detailed',
  SOCIAL = 'social',
  PROFESSIONAL = 'professional',
  RESEARCHER = 'researcher'
}

export interface BehaviorProfile {
  // Velocidad de escritura (caracteres por minuto)
  typingSpeed: {
    min: number;
    max: number;
  };
  
  // Tasa de error al escribir (0-1)
  errorRate: number;
  
  // Velocidad de scroll (píxeles)
  scrollSpeed: {
    min: number;
    max: number;
  };
  
  // Duración de las pausas (ms)
  breakDuration: {
    min: number;
    max: number;
  };
  
  // Frecuencia de las pausas (cada N acciones)
  breakFrequency: number;
  
  // Tiempo de visualización de contenido (ms)
  contentViewDuration: {
    min: number;
    max: number;
  };
  
  // Probabilidad de interacción con contenido (0-1)
  interactionProbability: number;
  
  // Tiempo máximo de sesión (ms)
  maxSessionDuration: number;
}

// Definición de perfiles de comportamiento
export const behaviorProfiles: Record<BehaviorProfileType, BehaviorProfile> = {
  [BehaviorProfileType.CASUAL]: {
    typingSpeed: { min: 150, max: 250 },
    errorRate: 0.05,
    scrollSpeed: { min: 300, max: 800 },
    breakDuration: { min: 30000, max: 120000 }, // 30 segundos a 2 minutos
    breakFrequency: 15,
    contentViewDuration: { min: 5000, max: 20000 },
    interactionProbability: 0.3,
    maxSessionDuration: 30 * 60 * 1000 // 30 minutos
  },
  
  [BehaviorProfileType.DETAILED]: {
    typingSpeed: { min: 120, max: 200 },
    errorRate: 0.02,
    scrollSpeed: { min: 200, max: 500 },
    breakDuration: { min: 60000, max: 180000 },
    breakFrequency: 20,
    contentViewDuration: { min: 15000, max: 45000 },
    interactionProbability: 0.2,
    maxSessionDuration: 60 * 60 * 1000 // 1 hora
  },
  
  [BehaviorProfileType.SOCIAL]: {
    typingSpeed: { min: 180, max: 300 },
    errorRate: 0.08,
    scrollSpeed: { min: 400, max: 1000 },
    breakDuration: { min: 20000, max: 90000 },
    breakFrequency: 10,
    contentViewDuration: { min: 3000, max: 15000 },
    interactionProbability: 0.6,
    maxSessionDuration: 45 * 60 * 1000 // 45 minutos
  },
  
  [BehaviorProfileType.PROFESSIONAL]: {
    typingSpeed: { min: 200, max: 350 },
    errorRate: 0.01,
    scrollSpeed: { min: 250, max: 600 },
    breakDuration: { min: 45000, max: 150000 },
    breakFrequency: 25,
    contentViewDuration: { min: 10000, max: 30000 },
    interactionProbability: 0.4,
    maxSessionDuration: 90 * 60 * 1000 // 1.5 horas
  },
  
  [BehaviorProfileType.RESEARCHER]: {
    typingSpeed: { min: 170, max: 280 },
    errorRate: 0.03,
    scrollSpeed: { min: 150, max: 400 },
    breakDuration: { min: 60000, max: 240000 },
    breakFrequency: 30,
    contentViewDuration: { min: 20000, max: 60000 },
    interactionProbability: 0.1,
    maxSessionDuration: 120 * 60 * 1000 // 2 horas
  }
}; 