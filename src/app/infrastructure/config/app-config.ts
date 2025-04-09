// Configuración de la aplicación
export const appConfig = {
  // Límites de cuentas por plataforma
  accountLimits: {
    INSTAGRAM: 3,
    FACEBOOK: 2,
    TWITTER: 2,
    LINKEDIN: 2,
    TIKTOK: 1
  },
  
  // Configuración de comportamiento humano
  humanBehavior: {
    // Límites diarios de acciones por cuenta
    dailyLimits: {
      likePost: {max:50,scoring:1},
    commentOnPost: {max:20,scoring:1.5},
    followUser: {max:5,scoring:3},
    unfollowUser: {max:5,scoring:1},
    sendMessage: {max:15,scoring:5},
    viewPost: {max:50,scoring:2},
    viewUserFromHashtag: {max:5,scoring:1},
    profileVisit: {max:25,scoring:1.5}
    },
    
    // Patrones de actividad
    activityPatterns: {
      // Horas activas (0-23)
      activeHours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      
      // Horas pico (mayor actividad)
      peakHours: [12, 13, 17, 18, 19, 20],
      
      // Días de la semana activos (0-6, donde 0 es domingo)
      activeDays: [0,1, 2, 3, 4, 5,6] // Lunes a domingo
    },
    
    // Retrasos entre acciones (en milisegundos)
    delays: {
      betweenActions: { min: 2000, max: 5000 },
      betweenLikes: { min: 1000, max: 3000 },
      betweenComments: { min: 15000, max: 30000 },
      betweenFollows: { min: 30000, max: 60000 },
      betweenUnfollows: { min: 30000, max: 60000 },
      betweenMessages: { min: 60000, max: 120000 },
      betweenProfileVisits: { min: 10000, max: 20000 },
      betweenPageScrolls: { min: 5000, max: 15000 },
      betweenSessions: { min: 3600000, max: 7200000 } // 1-2 horas
    },
    
    // Configuración de navegación
    navigation: {
      // Probabilidad de visitar perfiles relacionados (0-1)
      relatedProfileProbability: 0.3,
      
      // Probabilidad de interactuar con contenido (0-1)
      interactionProbability: 0.4,
      
      // Número máximo de acciones por sesión
      maxActionsPerSession: 100,
      
      // Tiempo máximo de sesión (en milisegundos)
      maxSessionDuration: 3600000 // 1 hora
    }
  },
  
  // Configuración de seguridad
  security: {
    // Tiempo de expiración del token JWT (en segundos)
    jwtExpiration: 86400, // 24 horas
    
    // Número máximo de intentos de login fallidos
    maxLoginAttempts: 5,
    
    // Tiempo de bloqueo después de alcanzar el máximo de intentos (en segundos)
    loginLockTime: 900 // 15 minutos
  },
  
  // Configuración de la base de datos
  database: {
    // Tiempo de vida de las sesiones guardadas (en días)
    sessionTTL: 30
  }
}; 