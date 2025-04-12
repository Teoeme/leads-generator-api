/**
 * Perfiles de comportamiento para simulación de actividad humana
 */

export enum BehaviorProfileType {
  CASUAL = 'CASUAL',
  DETAILED = 'detailed',
  SOCIAL = 'social',
  PROFESSIONAL = 'PROFESSIONAL',
  RESEARCHER = 'researcher',
  INFLUENCER = 'INFLUENCER',
  ENTHUSIAST = 'ENTHUSIAST'
}

// Interfaz para definir los límites por tipo de red social
export interface SocialMediaLimits {
  likePost: {max:number,scoring:number};          // Número máximo de "me gusta" por día
  commentOnPost: {max:number,scoring:number};       // Número máximo de comentarios por día
  followUser: {max:number,scoring:number};        // Número máximo de seguimientos por día
  unfollowUser: {max:number,scoring:number};      // Número máximo de dejar de seguir por día
  sendMessage: {max:number,scoring:number}; // Número máximo de mensajes directos por día
  visitProfile: {max:number,scoring:number};          // Número máximo de visitas a perfiles por día
  searchHashtag: {max:number,scoring:number};          // Número máximo de búsquedas de hashtags por día
  viewPost: {max:number,scoring:number};          // Número máximo de visitas a posts por día
  viewLikes: {max:number,scoring:number};          // Número máximo de visitas a likes por día
  viewComments: {max:number,scoring:number};          // Número máximo de visitas a comentarios por día
  viewFollowers: {max:number,scoring:number};          // Número máximo de visitas a seguidores por día
  viewFollowing: {max:number,scoring:number};          // Número máximo de visitas a seguidos por día
  viewUserFromHashtag: {max:number,scoring:number};          // Número máximo de visitas a usuarios por día
}

// Límites predeterminados por tipo de red social
export const socialMediaLimits: {[key: string]: SocialMediaLimits} = {
  INSTAGRAM: {
    likePost: {max:30,scoring:1},
    commentOnPost: {max:15,scoring:2},
    followUser: {max:5,scoring:4},
    unfollowUser: {max:5,scoring:4},
    visitProfile: {max:35,scoring:1},
    sendMessage: {max:20,scoring:4},
    searchHashtag: {max:5,scoring:1},
    viewPost: {max:50,scoring:1},
    viewLikes: {max:50,scoring:1},
    viewComments: {max:50,scoring:1},
    viewFollowers: {max:50,scoring:1},
    viewFollowing: {max:35,scoring:1},
    viewUserFromHashtag: {max:35,scoring:1},
  },
  LINKEDIN: {
    likePost: {max:100,scoring:1},
    commentOnPost: {max:30,scoring:1},
    followUser: {max:50,scoring:1},
    unfollowUser: {max:50,scoring:1},
    visitProfile: {max:20,scoring:1},
    sendMessage: {max:40,scoring:1},  
    searchHashtag: {max:10,scoring:1},
    viewPost: {max:100,scoring:1},
    viewLikes: {max:100,scoring:1},
    viewComments: {max:100,scoring:1},
    viewFollowers: {max:100,scoring:1},
    viewFollowing: {max:100,scoring:1},
    viewUserFromHashtag: {max:100,scoring:1},
  },
  FACEBOOK: {
    likePost: {max:150,scoring:1},
    commentOnPost: {max:40,scoring:1},
    followUser: {max:100,scoring:1},
    unfollowUser: {max:100,scoring:1},
    sendMessage: {max:50,scoring:1},
    visitProfile: {max:20,scoring:1},
    searchHashtag: {max:10,scoring:1},
    viewPost: {max:100,scoring:1},
    viewLikes: {max:100,scoring:1},
    viewComments: {max:100,scoring:1},
    viewFollowers: {max:100,scoring:1},
    viewFollowing: {max:100,scoring:1},
    viewUserFromHashtag: {max:100,scoring:1},
  },
  TWITTER: {
    likePost: {max:300,scoring:1},
    commentOnPost: {max:100,scoring:1},
    followUser: {max:200,scoring:1},
    unfollowUser: {max:200,scoring:1},
    sendMessage: {max:50,scoring:1},
    visitProfile: {max:20,scoring:1},
    searchHashtag: {max:10,scoring:1},
    viewPost: {max:100,scoring:1},
    viewLikes: {max:100,scoring:1},
    viewComments: {max:100,scoring:1},
    viewFollowers: {max:100,scoring:1},
    viewFollowing: {max:100,scoring:1},
    viewUserFromHashtag: {max:100,scoring:1},
  },
  TIKTOK: {
    likePost: {max:200,scoring:1},
    commentOnPost: {max:50,scoring:1},
    followUser: {max:100,scoring:1},
    unfollowUser: {max:100,scoring:1},
    sendMessage: {max:30,scoring:1},
    visitProfile: {max:20,scoring:1},
    searchHashtag: {max:10,scoring:1},
    viewPost: {max:100,scoring:1},
    viewLikes: {max:100,scoring:1},
    viewComments: {max:100,scoring:1},
    viewFollowers: {max:100,scoring:1},
    viewFollowing: {max:100,scoring:1},
    viewUserFromHashtag: {max:100,scoring:1},
  }
};

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
  },
  
  [BehaviorProfileType.INFLUENCER]: {
    typingSpeed: { min: 220, max: 380 },
    errorRate: 0.04,
    scrollSpeed: { min: 350, max: 900 },
    breakDuration: { min: 25000, max: 100000 }, // 25 segundos a 1.7 minutos
    breakFrequency: 12,
    contentViewDuration: { min: 4000, max: 18000 },
    interactionProbability: 0.7,
    maxSessionDuration: 60 * 60 * 1000 // 1 hora
  },
  
  [BehaviorProfileType.ENTHUSIAST]: {
    typingSpeed: { min: 190, max: 320 },
    errorRate: 0.06,
    scrollSpeed: { min: 320, max: 850 },
    breakDuration: { min: 35000, max: 130000 }, // 35 segundos a 2.2 minutos
    breakFrequency: 18,
    contentViewDuration: { min: 6000, max: 25000 },
    interactionProbability: 0.5,
    maxSessionDuration: 40 * 60 * 1000 // 40 minutos
  }
}; 