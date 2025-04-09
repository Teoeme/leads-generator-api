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
  VIEW_USER_FROM_HASHTAG = 'viewUserFromHashtag',
  
  // Acciones de simulación de comportamiento humano
  TAKE_BREAK = 'takeBreak',
  START_TYPING_THEN_DELETE = 'startTypingThenDelete',
  VIEW_WITH_ENGAGEMENT = 'viewWithEngagement'
}

export enum TimeDistribution {
  UNIFORM = 'uniform',
  GAUSSIAN = 'gaussian',
  POISSON = 'poisson'
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
  parameters?: any;
}

export interface Target {
  username?: string;
  hashtag?: string;
  postUrl?: string;
}


export interface Action {
  action: ActionType;
  timePattern: TimePattern;
  parameters?: any;
  followupActions?: FollowupAction[];
  index?: number;
  limit?: number;
  target?: Target;
}

export interface ActionPlan {
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