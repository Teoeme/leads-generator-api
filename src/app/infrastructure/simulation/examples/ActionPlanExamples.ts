/**
 * Ejemplos de planes de acción para simulación
 */
import { ActionPlan, ActionType, TimeDistribution } from '../actions/ActionTypes';

/**
 * Plan de acción para explorar seguidores de un usuario
 */
export const exploreFollowersPlan = (username: string): ActionPlan => ({
  targetUsername: username,
  actions: [
    {
      action: ActionType.VISIT_PROFILE,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 3000, standardDeviation: 1000 }
      }
    },
    {
      action: ActionType.VIEW_FOLLOWERS,
      timePattern: {
        distribution: TimeDistribution.UNIFORM,
        parameters: { min: 2000, max: 5000 }
      },
      limit: 20,
      followupActions: [
        {
          action: ActionType.SCROLL_DOWN,
          probability: 0.8,
          parameters: { count: 3 }
        },
        {
          action: ActionType.TAKE_BREAK,
          probability: 0.3
        }
      ]
    }
  ],
  leadCriteria: {
    minFollowers: 500,
    maxFollowers: 10000,
    minPosts: 10,
    keywords: ['marketing', 'business', 'entrepreneur', 'startup']
  }
});

/**
 * Plan de acción para explorar un hashtag
 */
export const exploreHashtagPlan = (hashtag: string): ActionPlan => ({
  targetHashtag: hashtag,
  actions: [
    {
      action: ActionType.SEARCH_HASHTAG,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 3000, standardDeviation: 1000 }
      },
      limit: 15
    },
    {
      action: ActionType.SCROLL_DOWN,
      timePattern: {
        distribution: TimeDistribution.UNIFORM,
        parameters: { min: 1000, max: 3000 }
      },
      parameters: { count: 5 }
    },
    {
      action: ActionType.VIEW_USER_FROM_HASHTAG,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 5000, standardDeviation: 2000 }
      },
      index: 2,
      followupActions: [
        {
          action: ActionType.FOLLOW_USER,
          probability: 0.4
        },
        {
          action: ActionType.LIKE_POST,
          probability: 0.6
        }
      ]
    }
  ],
  leadCriteria: {
    minFollowers: 1000,
    keywords: ['design', 'creative', 'art', 'illustration']
  }
});

/**
 * Plan de acción para interactuar con un post
 */
export const interactWithPostPlan = (postUrl: string): ActionPlan => ({
  targetPostUrl: postUrl,
  actions: [
    // {
    //   action:ActionType.VIEW_WITH_ENGAGEMENT,
    //   timePattern:{
    //     distribution:TimeDistribution.UNIFORM,
    //     parameters:{min:600,max:4500}
    //   }
    // },
    // {
    //   action: ActionType.LIKE_POST,
    //   timePattern: {
    //     distribution: TimeDistribution.UNIFORM,
    //     parameters: { min: 3000, max: 8000 }
    //   }
    // },
    // {
    //   action: ActionType.VIEW_LIKES,
    //   timePattern: {
    //     distribution: TimeDistribution.GAUSSIAN,
    //     parameters: { mean: 5000, standardDeviation: 2000 }
    //   },
    //   limit: 10
    // },
    {
      action: ActionType.VIEW_COMMENTS,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 5000, standardDeviation: 2000 }
      },
      limit: 10,
      followupActions: [
        {
          action: ActionType.COMMENT_ON_POST,
          probability: 0.5,
          parameters: { 
            comment: "¡Gran contenido! Me encanta tu trabajo 👏" 
          }
        }
      ]
    }
  ],
  leadCriteria: {
    minFollowers: 200,
    // keywords:['trekking','montain','camping','hiking','adventure','campo','camping','naturaleza','paisaje','info','información'],
    commentAICriteria:'Determinar si el comentario denota interes por este objeto de decoracion y si muestra alguna intencion de compra de articulos relacionados con este objeto de decoracion. Tambien puede ser de interes si el usuario denota alguna intencion de compra de articulos relacionados con este objeto de decoracion.'
  }
});

/**
 * Plan de acción para explorar e interactuar con un perfil
 */
export const exploreProfilePlan = (username: string): ActionPlan => ({
  targetUsername: username,
  actions: [
    {
      action: ActionType.VISIT_PROFILE,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 3000, standardDeviation: 1000 }
      }
    },
    {
      action: ActionType.SCROLL_DOWN,
      timePattern: {
        distribution: TimeDistribution.UNIFORM,
        parameters: { min: 1000, max: 3000 }
      },
      parameters: { count: 3 }
    },
    {
      action: ActionType.HOVER_ON_ELEMENTS,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 2000, standardDeviation: 500 }
      },
      parameters: { 
        selector: 'article', 
        count: 5 
      }
    },
    {
      action: ActionType.SCROLL_WITH_VARIABLE_SPEED,
      timePattern: {
        distribution: TimeDistribution.UNIFORM,
        parameters: { min: 1000, max: 2000 }
      },
      parameters: { 
        minDistance: 300, 
        maxDistance: 800, 
        iterations: 3 
      }
    },
    {
      action: ActionType.FOLLOW_USER,
      timePattern: {
        distribution: TimeDistribution.GAUSSIAN,
        parameters: { mean: 5000, standardDeviation: 2000 }
      },
      followupActions: [
        {
          action: ActionType.SEND_MESSAGE,
          probability: 0.3,
          parameters: { 
            message: "Hola! Me encanta tu contenido. ¿Podríamos hablar sobre una posible colaboración?" 
          }
        }
      ]
    }
  ]
}); 
