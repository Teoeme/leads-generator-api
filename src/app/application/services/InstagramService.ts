import { IgApiClient } from 'instagram-private-api';
import { Page } from 'playwright';
import { Lead, LeadStatus } from '../../domain/entities/Lead';
import { ProxyConfiguration, ProxyStatus } from '../../domain/entities/Proxy/ProxyConfiguration';
import { SocialMediaAccount, SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { Comment, Post, UserProfile } from '../../domain/services/SocialMediaService';
import { SocialMediaService } from './SocialMediaService';

export class InstagramService extends SocialMediaService {
  private ig: IgApiClient;
  private _loggedIn: boolean = false;

  constructor(account: SocialMediaAccount,proxy: ProxyConfiguration | null) {
    super(account,proxy);
    if (account.type !== SocialMediaType.INSTAGRAM) {
      throw new Error('Invalid account type for Instagram service');
    }
    this.ig = new IgApiClient();
    
    // if (account.sessionData) {
    //   this._loggedIn = true;
    // }

  }

  get loggedIn(): boolean {
    return this._loggedIn;
  }

  async login(): Promise<boolean> {
    try {
      // Simular retraso para comportamiento humano
      // await this.delay(this.humanBehavior.getRandomDelay(1000, 3000));
      
      // Configurar el dispositivo antes de cualquier operación - CRUCIAL para el login directo
      this.ig.state.generateDevice(this.getAccount().username);
      console.log('Device ID generated:', this.ig.state.deviceId);
      
      // Configurar proxy si está disponible
      const proxyConfig = this.getProxy();
      if (proxyConfig && proxyConfig.status === ProxyStatus.ACTIVE) {
        console.log(`Configurando proxy para API: ${proxyConfig.server}`);
        
        let proxyUrl = '';
        const protocol = proxyConfig.protocol || 'http';
        
        // Formato: protocol://username:password@server
        if (proxyConfig.username && proxyConfig.password) {
          proxyUrl = `${protocol}://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.server}`;
        } else {
          proxyUrl = `${protocol}://${proxyConfig.server}`;
        }
        
        // Establecer proxy en la instancia de IgApiClient
        this.ig.state.proxyUrl = proxyUrl;
        console.log('Proxy configurado para API de Instagram');
      }
      
      // Usar datos de sesión guardados si existen
      if (this.getAccount().sessionData) {
        try {
          await this.ig.state.deserialize(this.getAccount().sessionData);
          // Verificar si la sesión sigue siendo válida
          await this.ig.account.currentUser();
          this._loggedIn = true;
          return true;
        } catch (error) {
          console.log('Session expired, logging in again');
        }
      }
      
      console.log('Logging in with username:', this.getAccount().username);
      
      // Login normal
      const loggedInUser = await this.ig.account.login(this.getAccount().username, this.getAccount().password);
      
      console.log('Logged in with username:', loggedInUser.username);

      // Guardar datos de sesión
      const serialized = await this.ig.state.serialize();
      this.setAccountSessionData(serialized);
      
      this._loggedIn = true;
      return true;
    } catch (error) {
      console.error('Instagram login error:', error);
      this._loggedIn = false;
      return false;
    }
  }

      /**
   * Inicia sesión en Instagram usando el navegador
   */
      async loginInBrowser(page: Page): Promise<boolean> {

        if (!page) return false;
        
    
        try {
          console.log('Navigating to Instagram login page...');
          
          // Ir directamente a la página de login de Instagram
          await page.goto('https://www.instagram.com/', { 
            // waitUntil: 'domcontentloaded',
            timeout: 60000 
          });
          
          console.log('Waiting for login form...');
          
          // Esperar a que aparezca el formulario de login
          await page.waitForSelector('input[name="username"]', { 
            state: 'visible',
            timeout: 30000 
          });
          
          // Simular comportamiento humano con retrasos
          await this.delay(Math.random() * 1000 + 1000);
          
          // Ingresar credenciales
          console.log('Entering username...');
          await page.fill('input[name="username"]', this.getAccount().username);
          await this.delay(Math.random() * 1000 + 1000);
          
          console.log('Entering password...');
          await page.fill('input[name="password"]', this.getAccount().password);
          await this.delay(Math.random() * 1000 + 1000);
          
          console.log('Clicking login button...');
          
          // Hacer clic en el botón de login
          await Promise.all([
            // Esperar a que la navegación comience
            page.waitForURL('https://www.instagram.com/**', { timeout: 60000 }).catch(e => {
              console.log('Navigation timeout or not triggered, continuing anyway');
            }),
            // Hacer clic en el botón
            page.click('button[type="submit"]')
          ]);
          
          console.log('Login button clicked, waiting for home page...');
          
          // Esperar a que se cargue la página principal
          await page.waitForURL('https://www.instagram.com/**', { 
            timeout: 60000,
            waitUntil: 'domcontentloaded'
          });
          
          console.log('Reached Instagram page after login');
          
          // Verificar si el login fue exitoso
          const isLoggedIn = await this.verifyLoginSuccess(page);
          
          if (isLoggedIn) {
            console.log('Successfully logged in to Instagram');
            
            // Manejar diálogos post-login
            await this.handlePostLoginDialogs(page);
          } else {
            console.error('Failed to log in to Instagram');
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error('Error during Instagram login:', error);
          
          // Capturar screenshot para depuración
          // if (page) {
          //   try {
          //     const screenshot = await page.screenshot({ path: `login-error-${Date.now()}.png` });
          //     console.log('Error screenshot saved');
          //   } catch (screenshotError) {
          //     console.error('Failed to capture error screenshot:', screenshotError);
          //   }
          // }
          
          throw error;
        }
      
      return true;
    }

  async logout(): Promise<boolean> {
    try {
      // Instagram API doesn't have a direct logout method
      // We'll just clear the session
      this._loggedIn = false;
      this.setAccountSessionData(null);
      return true;
    } catch (error) {
      console.error('Instagram logout error:', error);
      return false;
    }
  }

  private checkLogin(): void {
    if (!this.loggedIn) {
      throw new Error('Not logged in to Instagram');
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    this.checkLogin();
    const userInfo = await this.ig.account.currentUser();
    return this.mapToUserProfile(userInfo);
  }

  async getUserProfile(username: string): Promise<UserProfile> {
    this.checkLogin();
    

    try {
      const user = await this.ig.user.searchExact(username);
      
      // Obtener información completa del perfil
      const userInfo = await this.ig.user.info(user.pk);
      
      return {
        id: user.pk.toString(),
        username: user.username,
        fullName: userInfo.full_name,
        bio: userInfo.biography,
        profilePicUrl: userInfo.profile_pic_url,
        followersCount: userInfo.follower_count,
        followingCount: userInfo.following_count,
        postsCount: userInfo.media_count,
        isPrivate: userInfo.is_private,
        isVerified: userInfo.is_verified
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Obtiene un post específico por su ID
   */
  async getPost(postId: string): Promise<Post> {
    this.checkLogin();
    
    try {
      const media = await this.ig.media.info(postId);
      const post = media.items[0];
      
      return this.mapToPost(post);
    } catch (error) {
      console.error(`Error getting post ${postId}:`, error);
      throw error;
    }
  }

  async getUserPosts(username: string, limit: number = 10): Promise<Post[]> {
    this.checkLogin();
    const user = await this.ig.user.searchExact(username);
    const userFeed = this.ig.feed.user(user.pk);
    const posts = await userFeed.items();
    return posts.slice(0, limit).map(this.mapToPost);
  }

  async getUserFollowers(username: string, limit: number = 20): Promise<UserProfile[]> {
    this.checkLogin();
    const user = await this.ig.user.searchExact(username);
    const followersFeed = this.ig.feed.accountFollowers(user.pk);
    const followers = await followersFeed.items();
    return followers.slice(0, limit).map(this.mapToUserProfile);
  }

  async getUserFollowing(username: string, limit: number = 20): Promise<UserProfile[]> {
    this.checkLogin();
    const user = await this.ig.user.searchExact(username);
    const followingFeed = this.ig.feed.accountFollowing(user.pk);
    const following = await followingFeed.items();
    return following.slice(0, limit).map(this.mapToUserProfile);
  }

  async getPostComments(postId: string, limit: number = 20): Promise<Comment[]> {
    this.checkLogin();
    const commentsFeed = this.ig.feed.mediaComments(postId);
    const comments = await commentsFeed.items();
    return comments.slice(0, limit).map(this.mapToComment);
  }

async goToHome(page:Page): Promise<void>{
 if(!page) return;
 if(page.url() === 'https://www.instagram.com/'){
  return;
 }
 
  await page.goto('https://www.instagram.com/', { 
    // waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
}

  /**
   * Obtiene los usuarios que dieron like a un post
   */
  async getPostLikes(postId: string, limit: number = 20): Promise<UserProfile[]> {
    this.checkLogin();
    
    try {
      // Obtener información del post
      const mediaInfo = await this.ig.media.info(postId);
      
      // Obtener los IDs de usuarios que dieron like
      const likers = await this.ig.media.likers(postId);
      
      // Mapear a perfiles de usuario
      return likers.users.slice(0, limit).map(user => ({
        id: user.pk.toString(),
        username: user.username,
        fullName: user.full_name,
        profilePicUrl: user.profile_pic_url,
        isPrivate: user.is_private,
        isVerified: user.is_verified
      }));
    } catch (error) {
      console.error(`Error getting likes for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene posts por hashtag
   */
  async getHashtagPosts(hashtag: string, limit: number = 20): Promise<Post[]> {
    this.checkLogin();
    
    try {
      const hashtagFeed = this.ig.feed.tag(hashtag);
      const posts = await hashtagFeed.items();
      
      return posts.slice(0, limit).map(this.mapToPost);
    } catch (error) {
      console.error(`Error getting hashtag posts for #${hashtag}:`, error);
      throw error;
    }
  }

  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    this.checkLogin();
    const result = await this.ig.user.search(query);
    return result.users.slice(0, limit).map(this.mapToUserProfile);
  }

  async extractLeadsFromFollowers(username: string, limit: number = 50): Promise<Omit<Lead, 'campaignId'>[]> {
    if (!this.loggedIn) {
      throw new Error('Not logged in');
    }
    
    try {
      const user = await this.ig.user.searchExact(username);
      const followersFeed = this.ig.feed.accountFollowers(user.pk);
      
      const leads: Omit<Lead, 'campaignId'>[] = [];
      let items = [];
      let count = 0;
      
      do {
        
        items = await followersFeed.items();
        
        for (const follower of items) {
    
          // Simular comportamiento humano entre visitas a perfiles
          // await this.humanBehavior.randomDelay('betweenProfileVisits');
          
          try {
            // Obtener información detallada del perfil
            const userInfo = await this.ig.user.info(follower.pk);
            
            // Registrar la acción
            // this.humanBehavior.trackAction(this.getAccount().id!, ActionType.VISIT_PROFILE);
            
            // Crear lead
            const lead: Omit<Lead, 'campaignId'> = {
              userId: this.getAccount().userId,
              socialMediaType: SocialMediaType.INSTAGRAM,
              socialMediaId: follower.pk.toString(),
              username: follower.username,
              fullName: userInfo.full_name,
              profileUrl: `https://instagram.com/${follower.username}`,
              bio: userInfo.biography,
              followersCount: userInfo.follower_count,
              followingCount: userInfo.following_count,
              postsCount: userInfo.media_count,
              isPrivate: userInfo.is_private,
              isVerified: userInfo.is_verified,
              status: LeadStatus.NEW,
              source: 'followers',
              sourceUrl: `https://instagram.com/${username}`,


            };
            
            leads.push(lead);
            count++;
            
            if (count >= limit) {
              break;
            }
          } catch (error) {
            console.error(`Error getting info for user ${follower.username}:`, error);
            // Continuar con el siguiente seguidor
            continue;
          }
        }
      } while (items.length > 0 && count < limit && followersFeed.isMoreAvailable());
      
      return leads;
    } catch (error) {
      console.error('Error extracting leads from followers:', error);
      throw error;
    }
  }

  async extractLeadsFromLikes(postId: string, limit: number = 50): Promise<Omit<Lead, 'campaignId'>[]> {
    const likers = await this.getPostLikes(postId, limit);
    return likers.map(liker => this.mapToLead(liker));
  }

  private mapToUserProfile(user: any): UserProfile {
    return {
      id: user.pk.toString(),
      username: user.username,
      fullName: user.full_name,
      bio: user.biography,
      profilePicUrl: user.profile_pic_url,
      followersCount: user.follower_count,
      followingCount: user.following_count,
      postsCount: user.media_count,
      isPrivate: user.is_private,
      isVerified: user.is_verified
    };
  }

  /**
   * Mapea un objeto de post de Instagram a nuestra interfaz Post
   */
  private mapToPost(post: any): Post {
    return {
      id: post.id,
      caption: post.caption?.text,
      mediaUrl: post.image_versions2?.candidates[0]?.url,
      likesCount: post.like_count,
      commentsCount: post.comment_count,
      timestamp: new Date(post.taken_at * 1000),
      owner: {
        id: post.user.pk,
        username: post.user.username,
        fullName: post.user.full_name,
        profilePicUrl: post.user.profile_pic_url
      }
    };
  }

  private mapToComment(comment: any): Comment {
    return {
      id: comment.pk,
      text: comment.text,
      username: comment.user.username,
      timestamp: new Date(comment.created_at * 1000)
    };
  }

  private mapToLead(profile: UserProfile): Omit<Lead, 'campaignId'> {
    return {
      userId: this.getAccount().userId,
      socialMediaType: SocialMediaType.INSTAGRAM,
      socialMediaId: profile.id,
      username: profile.username,
      fullName: profile.fullName,
      profileUrl: `https://instagram.com/${profile.username}`,
      status: LeadStatus.NEW,
      createdAt: new Date()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Envía un mensaje directo a un usuario
   */
  async sendMessage(username: string, message: string): Promise<boolean> {
    this.checkLogin();
    
    // Verificar si se puede realizar la acción según límites diarios
   
    try {
      // Buscar el usuario
      const user = await this.ig.user.searchExact(username);
      
      // Crear o acceder al hilo de mensajes
      const thread = this.ig.entity.directThread([user.pk.toString()]);
      
      // Enviar el mensaje
      await thread.broadcastText(message);
      
      return true;
    } catch (error) {
      console.error(`Error al enviar mensaje a ${username}:`, error);
      return false;
    }
  }

  /**
   * Sigue a un usuario
   */
  async followUser(username: string): Promise<boolean> {
    this.checkLogin();
    
    
    try {
      // Buscar el usuario
      const user = await this.ig.user.searchExact(username);
      
      // Seguir al usuario
      await this.ig.friendship.create(user.pk);
      
      return true;
    } catch (error) {
      console.error(`Error al seguir a ${username}:`, error);
      return false;
    }
  }

  /**
   * Da like a un post
   */
  async likePost(postId: string): Promise<boolean> {
    this.checkLogin();
    try {
      await this.ig.media.like({
        mediaId: postId,
        moduleInfo: {
          module_name: 'profile',
          user_id: this.ig.state.cookieUserId,
          username: this.getAccount().username,
        },
        d: 1
      });
      return true;
    } catch (error) {
      console.error(`Error al dar like al post ${postId}:`, error);
      return false;
    }
  }

  /**
   * Comenta en un post
   */
  async commentOnPost(postId: string, comment: string): Promise<boolean> {
    this.checkLogin();
    try {
      await this.ig.media.comment({
        mediaId: postId,
        text: comment
      });

      return true;
    } catch (error) {
      console.error(`Error al comentar en el post ${postId}:`, error);
      return false;
    }
  }

  /**
   * Establece el estado de login
   */
  public setLoggedIn(status: boolean): void {
    this._loggedIn = status;
  }

  /**
   * Configura el estado de la API a partir de los datos del navegador
   */
  public async setStateFromBrowser(sessionData: any): Promise<void> {
    try {
      // Configurar el estado de la API con los datos de sesión del navegador
      this.ig.state.deviceString = sessionData.build || 'Instagram 85.0.0.21.100 Android';
      this.ig.state.deviceId = sessionData.deviceId;
      this.ig.state.uuid = sessionData.uuid;
      this.ig.state.phoneId = sessionData.phoneId;
      this.ig.state.adid = sessionData.adid;
      this.ig.state.build = sessionData.build;
      
      // Configurar cookies críticas
      if (sessionData.sessionid) {
        this.ig.state.cookieJar.setCookie(
          `sessionid=${sessionData.sessionid}; Domain=.instagram.com; Path=/; HttpOnly`,
          'https://www.instagram.com'
        );
      }
      
      if (sessionData.ds_user_id) {
        this.ig.state.cookieJar.setCookie(
          `ds_user_id=${sessionData.ds_user_id}; Domain=.instagram.com; Path=/`,
          'https://www.instagram.com'
        );
      }
      
      if (sessionData.csrftoken) {
        this.ig.state.cookieJar.setCookie(
          `csrftoken=${sessionData.csrftoken}; Domain=.instagram.com; Path=/`,
          'https://www.instagram.com'
        );
      }
      
      // Configurar todas las cookies adicionales
      if (sessionData.cookies && Array.isArray(sessionData.cookies)) {
        for (const cookie of sessionData.cookies) {
          const cookieString = `${cookie.name}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}`;
          this.ig.state.cookieJar.setCookie(
            cookieString,
            'https://www.instagram.com'
          );
        }
      }
      
      // Marcar como logueado
      this._loggedIn = true;
      
      // Verificar que la sesión funciona
      try {
        const currentUser = await this.ig.account.currentUser();
        console.log('Successfully verified browser session with API:', currentUser.username);
      } catch (verifyError) {
        console.error('Failed to verify browser session with API:', verifyError);
        throw verifyError;
      }
    } catch (error) {
      console.error('Error setting state from browser:', error);
      throw error;
    }
  }




  /**
   * Verifica si el login fue exitoso
   */
  public async verifyLoginSuccess(page: Page): Promise<boolean> {
    console.log('Verificando si el usuario esta logueado')
    let attempts = 0;
    const maxAttempts = 5;
    const timeout = 10000;
    
    let isLoggedIn = false;
    while (attempts < maxAttempts) {
      if (!page) return false;
      
      try {
      //     // Método 1: Verificar URL
          await this.delay(timeout);
      const currentUrl = page.url();
      if(!currentUrl.includes('https://www.instagram.com/')){
        await page.goto('https://www.instagram.com/')
      }
      
      // Método 2: Buscar elementos que solo aparecen cuando estamos logueados
      const homeIcon = await page.$('svg[aria-label="Inicio"], svg[aria-label="Home"]');
      const profileIcon = await page.$('svg[aria-label="Perfil"], svg[aria-label="Profile"]');
      const exploreIcon = await page.$('svg[aria-label="Explorar"], svg[aria-label="Explore"]');
      const searchBox = await page.$('input[placeholder="Buscar"], input[placeholder="Search"]');
      
      // Si encontramos alguno de estos elementos, estamos logueados
        isLoggedIn = !!(homeIcon || profileIcon || exploreIcon || searchBox);
      
      console.log(`Login verification: ${isLoggedIn ? 'Successful' : 'Failed'}`);
      attempts++;
      if(isLoggedIn){
        break;
      }
      continue;
    } catch (error) {
        console.error('Error verifying login success:', error);
        return false;
    }
}
    return isLoggedIn;
}

  /**
   * Maneja los diálogos que aparecen después del login
   */
  public async handlePostLoginDialogs(page: Page): Promise<void> {
    if (!page) return;
    
    try {
      console.log('Handling post-login dialogs...');
      
      // Esperar un momento para que aparezcan los diálogos
      await this.delay(5000);
      
      // Capturar screenshot para depuración
      // try {
      //   const screenshot = await page.screenshot({ path: `post-login-${Date.now()}.png` });
      //   console.log('Post-login screenshot saved');
      // } catch (screenshotError) {
      //   console.error('Failed to capture post-login screenshot:', screenshotError);
      // }
      
      // Método 1: Usar JavaScript para encontrar y hacer clic en los botones "Ahora no"
      const clickedWithJS = await page.evaluate(() => {
        // Textos comunes para botones de "No ahora"
        const buttonTexts = [
          'Ahora no', 'Not Now', 'Cancel', 'Cancelar', 
          'No, gracias', 'No, thanks', 'Omitir', 'Skip'
        ];
        
        let clicked = false;
        
        // Buscar todos los elementos visibles que contienen estos textos
        for (const text of buttonTexts) {
          // Usar XPath para encontrar elementos con texto exacto
          const xpath = `//*[text()="${text}"]`;
          const elements = document.evaluate(
            xpath, 
            document, 
            null, 
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
            null
          );
          
          // Intentar hacer clic en cada elemento encontrado
          for (let i = 0; i < elements.snapshotLength; i++) {
            const element = elements.snapshotItem(i);
            if (element && element instanceof HTMLElement) {
              // Verificar si el elemento es visible
              const rect = element.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                try {
                  // Crear y disparar un evento de clic
                  element.click();
                  console.log(`Clicked on element with text "${text}" using JS`);
                  clicked = true;
                  
                  // Esperar un momento antes de continuar
                  return true;
                } catch (e) {
                  console.error(`Error clicking element with text "${text}":`, e);
                }
              }
            }
          }
        }
        
        return clicked;
      });
      
      if (clickedWithJS) {
        console.log('Successfully clicked dialog button using JS');
        await this.delay(3000);
      } else {
        console.log('No dialog button clicked with JS, trying alternative methods');
        
        // Método 2: Usar selectores específicos de Playwright
        const buttonSelectors = [
          'button:has-text("Ahora no")',
          'button:has-text("Not Now")',
          'button:has-text("Cancel")',
          'button:has-text("Cancelar")',
          'div:has-text("No, gracias")',
          'div:has-text("Ahora no")',
          'div:has-text("Not Now")',
          'div:has-text("No, thanks")',
          '[role="button"]:has-text("Ahora no")',
          '[role="button"]:has-text("Not Now")'
        ];
        
        for (const buttonSelector of buttonSelectors) {
          try {
            // Buscar el botón y verificar si es visible
            const button = await page.$(buttonSelector);
            if (button && await button.isVisible()) {
              console.log(`Found button: ${buttonSelector}, clicking it...`);
              
              // Usar force: true para asegurar que el clic se realice
              await button.click({ force: true });
              await this.delay(3000);
              
              // Verificar si el diálogo desapareció
              const dialogStillExists = await page.$('div[role="dialog"]');
              if (!dialogStillExists) {
                console.log('Dialog disappeared after clicking button');
                break;
              }
            }
          } catch (e) {
            console.log(`No button found or error clicking: ${buttonSelector}`);
          }
        }
        
        // Método 3: Usar coordenadas específicas para diálogos comunes
        try {
          const dialog = await page.$('div[role="dialog"]');
          if (dialog) {
            console.log('Dialog still exists, trying to click at specific coordinates');
            
            // Obtener las dimensiones del diálogo
            const box = await dialog.boundingBox();
            if (box) {
              // Calcular posiciones comunes para botones "No ahora" (generalmente en la parte inferior)
              const positions = [
                { x: box.x + box.width * 0.25, y: box.y + box.height * 0.8 }, // Abajo izquierda
                { x: box.x + box.width * 0.75, y: box.y + box.height * 0.8 }, // Abajo derecha
                { x: box.x + box.width * 0.5, y: box.y + box.height * 0.8 }   // Centro abajo
              ];
              
              for (const pos of positions) {
                console.log(`Clicking at position: x=${pos.x}, y=${pos.y}`);
                await page.mouse.click(pos.x, pos.y);
                await this.delay(2000);
                
                // Verificar si el diálogo desapareció
                const dialogStillExists = await page.$('div[role="dialog"]');
                if (!dialogStillExists) {
                  console.log('Dialog disappeared after clicking at position');
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.log('Error trying to click at specific coordinates:', e);
        }
      }
      
      console.log('Post-login dialogs handled');
    } catch (error) {
      console.error('Error handling post-login dialogs:', error);
      // No lanzamos el error para que el flujo pueda continuar
    }
  }

    /**
   * Sincroniza la sesión del navegador con la API de Instagram. Es decir utiliza las cookies del navegador para loguearse en la API
   */
    public async syncBrowserSessionWithApi(page: Page): Promise<void> {
      if (!page) return;
      
      try {
        console.log('Synchronizing browser session with API...');
        
        // Obtener todas las cookies del navegador
        const cookies = await page.context().cookies();
        
        // Extraer las cookies relevantes para Instagram
        const instagramCookies = cookies.filter(cookie => 
          cookie.domain.includes('instagram.com')
        );
        
        console.log(`Found ${instagramCookies.length} Instagram cookies`);
        
        // Extraer información de usuario y sesión de las cookies
        const sessionId = instagramCookies.find(c => c.name === 'sessionid')?.value;
        const userId = instagramCookies.find(c => c.name === 'ds_user_id')?.value;
        const csrftoken = instagramCookies.find(c => c.name === 'csrftoken')?.value;
        
        if (!sessionId || !userId) {
          console.error('Missing critical cookies for Instagram API');
          return;
        }
        
        // Crear un objeto de sesión compatible con instagram-private-api
        const sessionData = {
          cookies: instagramCookies.map(c => ({
            name: c.name,
            value: c.value,
            domain: c.domain,
            path: c.path,
            expires: c.expires,
            httpOnly: c.httpOnly,
            secure: c.secure
          })),
          // Datos específicos que necesita instagram-private-api
          uuid: this.generateUUID(),
          phoneId: this.generateUUID(),
          deviceId: this.generateAndroidDeviceId(),
          adid: this.generateUUID(),
          build: 'Instagram 85.0.0.21.100 Android',
          // Datos de la sesión
          sessionid: sessionId,
          ds_user_id: userId,
          csrftoken: csrftoken,
          accountId:this.getAccount().id
        };
        
        console.log('Created session data for API:', {
          sessionid: sessionId,
          userId: userId,
          csrftoken: csrftoken,
          cookiesCount: sessionData.cookies.length
        });
        
        // Actualizar la sesión en la cuenta
        this.setAccountSessionData(sessionData);
        
        // Marcar la API como logueada y configurar el estado
        this.setLoggedIn(true);
        
        // Configurar el estado de la API directamente
        await this.setStateFromBrowser(sessionData);
  
        
        console.log('Browser session synchronized with API');
      } catch (error) {
        console.error('Error synchronizing browser session with API:', error);
      }
    }
  
    //**Sincronizar la session de la API con el navegador. Es decir utiliza las cookies de la API para loguearse en el navegador */
    public async syncSessionWithBrowser(page: Page): Promise<void> {
      if(!page) return
      if(!this.getAccount().sessionData) return
  
      try {
        console.log('Sincronizando session con el navegador')
        const sessionData = this.getAccount().sessionData
        const cookies = sessionData.cookies
        const uuid = sessionData.uuid
        const phoneId = sessionData.phoneId
        const deviceId = sessionData.deviceId
        const adid = sessionData.adid
        const build = sessionData.build
        const sessionid = sessionData.sessionid
        const ds_user_id = sessionData.ds_user_id
        const csrftoken = sessionData.csrftoken
        const accountId = sessionData.accountId
        
        cookies?.forEach(async (cookie: any) => {
          if(cookie){
            await page?.context().addCookies([{name:cookie.name,value:cookie.value,domain:cookie.domain,path:cookie.path,expires:cookie.expires,httpOnly:cookie.httpOnly,secure:cookie.secure}])
          }
        })
  
        console.log('Session sincronizada con el navegador')
      } catch (error) {
        console.error('Error sincronizando session con el navegador:', error)
      }
    }
  

} 