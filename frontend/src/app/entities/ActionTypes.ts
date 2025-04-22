/**
 * Tipos de acciones para simulación de comportamiento humano
 */




export enum ActionType {
  // Acciones de navegación
  GO_TO_HOME = 'goToHome',
  VISIT_PROFILE = 'visitProfile',
  VIEW_POST = 'viewPost',
  SCROLL_DOWN = 'scrollDown',
  SCROLL_UP = 'scrollUp',
  HOVER_ON_ELEMENTS = 'hoverOnElements',
  SCROLL_WITH_VARIABLE_SPEED = 'scrollWithVariableSpeed',
  
  // Acciones de interacción
  LIKE_POST = 'likePost',
  COMMENT_ON_POST = 'commentOnPost',
  FOLLOW_USER = 'followUser',
  UNFOLLOW_USER = 'unfollowUser',
  SEND_MESSAGE = 'sendMessage',
  
  // Acciones de recolección de datos
  SEARCH_HASHTAG = 'searchHashtag',
  VIEW_LIKES = 'viewLikes',
  VIEW_COMMENTS = 'viewComments',
  VIEW_FOLLOWERS = 'viewFollowers',
  VIEW_FOLLOWING = 'viewFollowing',
  
  // Acciones de simulación de comportamiento humano
  TAKE_BREAK = 'takeBreak',
  START_TYPING_THEN_DELETE = 'startTypingThenDelete',
  VIEW_WITH_ENGAGEMENT = 'viewWithEngagement',

  MOCKED_ACTION = 'mockedAction'

}
export const ActionTypesProps: Record<ActionType, {label: string, description: string, needBrowser: boolean, target?: string, parameters?: Record<string, string | number>, limit?: boolean}> = {
  [ActionType.GO_TO_HOME]: {
    label: 'Ir a la página principal',
    description: 'Navega a la página principal de la plataforma',
    needBrowser: true,
  },
  [ActionType.VISIT_PROFILE]: {
    label: 'Visitar perfil',
    description: 'Visita el perfil de un usuario y lo analiza para ver si es un lead',
    needBrowser: false,
    target:'username'
  },
  [ActionType.VIEW_POST]: {
    label: 'Ver publicación',
    description: 'Ve un post para generar interacción',
    needBrowser: true,
    target:'postUrl'
  },
  [ActionType.SCROLL_DOWN]: {
    label: 'Desplazarse hacia abajo',
    description: 'Desplaza la página hacia abajo',
    needBrowser: true,
    parameters:{count:0}
  },
  [ActionType.SCROLL_UP]: {
    label: 'Desplazarse hacia arriba',
    description: 'Desplaza la página hacia arriba',
    needBrowser: true
  },
  [ActionType.HOVER_ON_ELEMENTS]: {
    label: 'Poner el cursor sobre elementos',
    description: 'Pone el cursor sobre elementos de la página',
    needBrowser: true,
    parameters:{count:0}
  },  
  [ActionType.SCROLL_WITH_VARIABLE_SPEED]: {
    label: 'Desplazarse con velocidad variable',
    description: 'Desplaza la página con una velocidad variable',
    parameters:{minDistance:0,maxDistance:0,iterations:0},
    needBrowser: true
  },  
  [ActionType.LIKE_POST]: {
    label: 'Dar like a una publicación',
    description: 'Da like a una publicación de un usuario',
    needBrowser: true
  },  
  [ActionType.COMMENT_ON_POST]: {
    label: 'Comentar en una publicación',
    description: 'Comenta en una publicación de un usuario',
    needBrowser: true
  },    
  [ActionType.FOLLOW_USER]: {
    label: 'Seguir a un usuario',
    description: 'Sigue a un usuario',
    needBrowser: true
  },  
  [ActionType.UNFOLLOW_USER]: {
    label: 'Dejar de seguir a un usuario',
    description: 'Deja de seguir a un usuario',
    needBrowser: true
  },  
  [ActionType.SEND_MESSAGE]: { 
    label: 'Enviar un mensaje', 
    description: 'Envía un mensaje a un usuario',
    needBrowser: true
  },  
  [ActionType.SEARCH_HASHTAG]: {
    label: 'Buscar un hashtag',
    description: 'Busca un hashtag en la plataforma y busca leads entre los usuarios que publican posts con ese hashtag. El limit por defecto es 10',
    needBrowser: false,
    target:'hashtag',
    limit:true
  },  
  [ActionType.VIEW_LIKES]: { 
    label: 'Ver likes de una publicación',
    description: 'Ve los likes de una publicación y busca leads entre ellos. El limit por defecto es 10',
    needBrowser: false,
    target:'postUrl'
  },  
  [ActionType.VIEW_COMMENTS]: {
    label: 'Ver comentarios de una publicación',  
    description: `Ve los comentarios de una publicación y busca leads entre ellos. El limit por defecto es 10.
    A su vez si se configuró un critero de comentario, la IA evaluará si el comentario cumple con el criterio y en caso de que lo haga, se creará un lead.
    En caso contrario se usara la lista de comments keywords primero, o la de keywords general en su defecto, para determinar si el comentario es un lead.`,
    needBrowser: false,
    target:'postUrl',
    limit:true
  },  
  [ActionType.VIEW_FOLLOWERS]: {
    label: 'Ver seguidores de un usuario',
    description: 'Ve los seguidores de un usuario',
    needBrowser: true
  },  
  [ActionType.VIEW_FOLLOWING]: {
    label: 'Ver usuarios seguidos por un usuario',
    description: 'Ve los usuarios seguidos por un usuario',
    needBrowser: true
  },  

  [ActionType.TAKE_BREAK]: {
    label: 'Tomar un descanso',
    description: 'Toma un descanso',
    needBrowser: false
  },  
  [ActionType.START_TYPING_THEN_DELETE]: {
    label: 'Escribir y borrar',
    description: 'Escribe y borra el texto definido, sobre el campo configurado.',
    needBrowser: true,
    parameters:{selector:'string',text:'string'}
  },  
  [ActionType.VIEW_WITH_ENGAGEMENT]: {
    label: 'Ver perfil con engagement',
    description: 'Ve un perfil con engagement. El factor de engagement por defecto es 0.5 y determina la probabilidad de dar likes.',
    needBrowser: true,
    target:'username',
    parameters:{engagementFactor:0.5,duration:1000}
  },
  [ActionType.MOCKED_ACTION]: {
    label: 'Acción mock',
    description: 'Acción mock',
    needBrowser: false,
    parameters:{actionError:''}
  }
}

export enum TimeDistribution {
  UNIFORM = 'uniform',
  GAUSSIAN = 'gaussian',
  POISSON = 'poisson'
}

export interface Target {
  username?: string;
  hashtag?: string;
  postUrl?: string;
}


export interface TimePattern {
  distribution: TimeDistribution;
  parameters: {
    min?: number;
    max?: number;
    mean?: number;
    standardDeviation?: number;
    lambda?: number;
  };
}

export interface FollowupAction {
  action: ActionType;
  probability: number;
  parameters?: unknown;
}

export interface Action {
  id: string;
  action: ActionType;
  timePattern: TimePattern;
  parameters?: unknown;
  followupActions?: FollowupAction[];
  index?: number;
  limit?: number;
  target?: Target
}

export interface ActionPlan {
  targetUsername?: string;
  targetPostUrl?: string;
  targetHashtag?: string;
  actions: Action[];
  leadCriteria?: {
    minFollowers?: number;
    maxFollowers?: number;
    minPosts?: number;
    keywords?: string[];
    referenceProfiles?: string[];
    commentAICriteria?: string;
    commentKeywords?: string[];
  };
} 