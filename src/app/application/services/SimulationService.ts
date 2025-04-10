import { Browser, LaunchOptions, Page } from 'playwright';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { Lead, LeadStatus } from '../../domain/entities/Lead';
import { SocialMediaAccount, SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { Action, ActionPlan, ActionType, TimeDistribution, TimePattern } from '../../infrastructure/simulation/actions/ActionTypes';
import { BehaviorProfile, BehaviorProfileType, behaviorProfiles, socialMediaLimits } from '../../infrastructure/simulation/behaviors/BehaviorProfile';
// @ts-ignore
import { urlSegmentToInstagramId } from 'instagram-id-to-url-segment';
import { Intervention, LeadCriteria } from '../../domain/entities/Campain';
import { AIAgent } from '../../domain/services/AIAgent';
import { HumanBehaviorService } from '../../infrastructure/services/HumanBehaviorService';
import { SocialMediaService } from './SocialMediaService';
import EventEmitter from 'events';
import { ProxyStatus } from '../../domain/entities/Proxy/ProxyConfiguration';

export class SimulationService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private socialMediaService: SocialMediaService;
  private humanBehaviorService: HumanBehaviorService;
  private behaviorProfile: BehaviorProfile;
  private visitedProfiles: Set<string> = new Set();
  private potentialLeads: Map<string, any> = new Map();
  private _isRunning: boolean = false;
  private actionCount: number = 0;
  private aiAgent: AIAgent;
  private eventEmitter: EventEmitter = new EventEmitter();
  private lastActionTimestamp: number = 0;
  private _needAttention: boolean = false;

  private  ProfileBaseUrl ={
    [SocialMediaType.INSTAGRAM]: 'https://instagram.com/',
    [SocialMediaType.TIKTOK]: 'https://tiktok.com/',
    [SocialMediaType.TWITTER]: 'https://twitter.com/',
    [SocialMediaType.FACEBOOK]: 'https://facebook.com/',
    [SocialMediaType.LINKEDIN]: 'https://linkedin.com/',
  }


  constructor(
    profileType: BehaviorProfileType = BehaviorProfileType.CASUAL,
    socialMediaService: SocialMediaService,
    aiAgent: AIAgent
  ) {
    this.humanBehaviorService = HumanBehaviorService.getInstance();
    this.socialMediaService = socialMediaService;
    this.behaviorProfile = behaviorProfiles[profileType];
    this.aiAgent = aiAgent;

    // Registrar el tipo de cuenta en el servicio de comportamiento humano
    const account = this.socialMediaService.getAccount();
    if (account && account.id) {
      this.humanBehaviorService.registerAccountType(account.id, account.type);
    }
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  get socialMediaAccount(): SocialMediaAccount {
    return this.socialMediaService.getAccount();
  }

  get isLoggedIn(): boolean {
    return this.socialMediaService.loggedIn;
  }

  get actionsCount(): number {
    return this.actionCount;
  }

  get humanBehaviorProfile(): BehaviorProfile {
    return this.behaviorProfile;
  }

  get visitedProfilesList(): Set<string> {
    return this.visitedProfiles;
  }

  get currentUsagePercentage(): number {
    return this.humanBehaviorService.calculateUsagePercentage(this.socialMediaService.getAccount().id!);
  }

  get needAttention(): boolean {
    return this._needAttention;
  }

  set needAttention(value: boolean) {
    this._needAttention = value;
  }


  emit(event: string, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
  }

  on(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  removeAllListeners() {
    this.eventEmitter.removeAllListeners();
  }


  /**
   * Detiene la simulación en curso
   */
  async stopSimulation(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this._isRunning = false;
    console.log('Stopping simulation...');

    // Limpiar recursos
    await this.cleanup();
  }

  public async runIntervention(intervention: Intervention, onFinish?: (leads: Lead[]) => Promise<void>) {
    const actions = intervention.actions;


    console.log('')
    console.log('Running intervention:', intervention.id);
    this._isRunning = true;
    this.actionCount = 0;
    const collectedLeads: Lead[] = [];

    const needsBrowser = this.requiresBrowser(actions);
    console.log(`Intervention needs browser: ${needsBrowser}`);

    const isLoggedIn = this.socialMediaService.loggedIn;
    console.log(`Intervention is logged in: ${isLoggedIn}`);

    if (!isLoggedIn) {
      try {
        await this.loginIn(needsBrowser);
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.emit('log', `Error al iniciar sesión: ${error}`);
        this._isRunning = false;
        this.emit('interventionError', 'Error in login');
        this.emit('simulatorError', this);
        this.needAttention = true;
        return;
      }
    }

    for (const action of actions) {

      if (!this.humanBehaviorService.isActiveHour()) {
        console.log('No es hora activa')
        const delayToNextActiveHour = this.humanBehaviorService.getSecondsToNextActiveHour();
        console.log('No es hora activa. Proxima hora: ', new Date(Date.now() + delayToNextActiveHour * 1000).toLocaleTimeString())
        this.emit('log', `No es hora activa. Proxima hora: ${new Date(Date.now() + delayToNextActiveHour * 1000).toLocaleTimeString()}`)
        await this.delay(delayToNextActiveHour * 1000)
      }

      if (this.shouldTakeBreak()) {
        console.log('Tomando descanso ----- ⏰')
        this.emit('log', `Tomando descanso ----- ⏰`)
        await this.takeBreak();
      }

      // Ejecutar la acción
      const { result, leads, timeToWait } = await this.executeAction(action, intervention.leadCriteria);
      if (result === 'success' && leads && leads.length > 0) {
        console.log('Leads recolectados:', leads)
        collectedLeads.push(...leads);
      } else if (result === 'needToWait' && timeToWait) {
        console.log('Tiempo de espera:', timeToWait)
        await this.delay((timeToWait + 60) * 1000); // 60 segundos de margen
        //Reintentar la acción
        await this.executeAction(action, intervention.leadCriteria);
      } else if (result === 'error') {
        console.log('Error al ejecutar la acción:', action.action)
      }

      // Incrementar contador de acciones
      this.actionCount++;
      //registrar la accion
      this.humanBehaviorService.trackAction(this.socialMediaAccount.id!, action.action);
      await this.delay(this.calculateDelay());


    }


    await onFinish?.(collectedLeads);
    this._isRunning = false;
    this.emit('simulatorAvailable', this);

  }

  /**
   * Ejecuta una acción específica
   */
  private async executeAction(action: Action, leadCriteria?: LeadCriteria): Promise<{ result: 'success' | 'error' | 'needToWait', leads?: Lead[], timeToWait?: number }> {
    // Calcular el tiempo de espera basado en el patrón de tiempo
    console.log('Ejecutando acción:', action.action)
    // const delay = this.calculateDelay(action.timePattern);
    // console.log('Tiempo de espera:', delay)
    // await this.delay(delay);

    const canPerformAction = this.humanBehaviorService.canPerformAction(this.socialMediaService.getAccount().id!, action.action);
    if (!canPerformAction.canPerform) return { result: canPerformAction.status, timeToWait: canPerformAction.secondsToReset };

    const leads: Lead[] = [];

    try {
      switch (action.action) {
        case ActionType.VISIT_PROFILE:
          if (action.target?.username) {
            const userProfile = await this.socialMediaService.getUserProfile(action.target.username);
            if (this.shouldProcessAsLead(userProfile, leadCriteria)) {
              const lead = await this.createLeadFromProfile(userProfile, 'search', '');
              leads.push(lead);
            }
            this.visitedProfiles.add(action.target.username);
          }
          break;

        case ActionType.VIEW_POST:
          if (action.target?.postUrl) {
            if (this.page) {
              // Usar navegador para ver el post
              await this.page.goto(action.target.postUrl, { waitUntil: 'networkidle' });
              await this.simulateViewingContent();
            } else {
              // Extraer ID del post de la URL
              const postId = this.extractPostIdFromUrl(action.target.postUrl);
              if (postId) {
                await this.socialMediaService.getPost(postId);
              }
            }
          }
          break;

        case ActionType.VIEW_LIKES:
          if (action.target?.postUrl) {
            const postId = this.extractPostIdFromUrl(action.target.postUrl);
            if (postId) {
              const limit = action.limit || 10;
              const likers = await this.socialMediaService.getPostLikes(postId, limit);

              for (const liker of likers) {
                console.log('Liker:', liker)
                if (this.shouldProcessAsLead(liker, leadCriteria)) {
                  const lead = await this.createLeadFromProfile(liker, 'likes', action.target.postUrl);
                  leads.push(lead);
                }
                this.visitedProfiles.add(liker.username);
              }
            }
          }
          break;

        case ActionType.VIEW_COMMENTS:
          if (action.target?.postUrl) {
            const postId = this.extractPostIdFromUrl(action.target.postUrl);
            if (postId) {
              const limit = action.limit || 10;
              const comments = await this.socialMediaService.getPostComments(postId, limit);
              for (const comment of comments) {
                console.log(comment.text, 'comment to process')
                if (leadCriteria?.commentAICriteria) {
                  const result = await this.commentMeetCriteriaAccordingToAI(comment.text, leadCriteria.commentAICriteria)
                  if (result) {
                    const userProfile = await this.socialMediaService.getUserProfile(comment.username);
                    const lead = await this.createLeadFromProfile(userProfile, 'comments', action.target.postUrl);
                    leads.push(lead);
                  }
                } else if (leadCriteria?.commentKeywords) {
                  const result = this.commentMeetKeywordsCriteria(comment.text, leadCriteria.commentKeywords)
                  if (result) {
                    const userProfile = await this.socialMediaService.getUserProfile(comment.username);
                    const lead = await this.createLeadFromProfile(userProfile, 'comments', action.target.postUrl);
                    leads.push(lead);
                  }
                } else if (leadCriteria?.keywords) {
                  const userProfile = await this.socialMediaService.getUserProfile(comment.username);
                  if (this.shouldProcessAsLead(userProfile, leadCriteria)) {
                    const lead = await this.createLeadFromProfile(userProfile, 'comments', action.target.postUrl);
                    leads.push(lead);
                  }
                }
                this.visitedProfiles.add(comment.username);
              }
            }
          }
          break;

        case ActionType.SEARCH_HASHTAG:
          {
            if (action.target?.hashtag) {
              try {
                const hashtagPosts = await this.socialMediaService.getHashtagPosts(action.target.hashtag, action.limit || 10);

                for (const post of hashtagPosts) {
                  if (post.owner && post.owner.username) {
                    // Obtener el perfil del usuario que publicó el post
                    const userProfile = await this.socialMediaService.getUserProfile(post.owner.username);

                    if (this.shouldProcessAsLead(userProfile, leadCriteria)) {
                      const lead = await this.createLeadFromProfile(userProfile, 'hashtag', `#${action.target.hashtag}`);
                      leads.push(lead);
                    }

                    this.visitedProfiles.add(post.owner.username);
                  }
                }
              } catch (error) {
                console.error(`Error searching hashtag ${action.target.hashtag}:`, error);
              }
            }
          }
          break;

        case ActionType.GO_TO_HOME:
          if (this.page) {
            await this.socialMediaService.goToHome(this.page);
            await this.simulateViewingContent();
          }
          break;

        case ActionType.SCROLL_DOWN:
          if (this.page) {
            const scrollCount = action.parameters?.count || 3;
            await this.scrollPage(scrollCount);
          }
          break;

        case ActionType.HOVER_ON_ELEMENTS:
          if (this.page) {
            const selector = action.parameters?.selector || 'article';
            const count = action.parameters?.count || 5;
            await this.hoverOnElements(selector, count);
          }
          break;

        case ActionType.START_TYPING_THEN_DELETE:
          if (this.page) {
            const selector = action.parameters?.selector || 'input[type="text"]';
            const text = action.parameters?.text || 'test message';

            await this.page.click(selector);
            await this.typeHumanLike(this.page, selector, text.substring(0, Math.floor(text.length / 2)));
            await this.delay(1000);

            // Borrar lo escrito
            for (let i = 0; i < Math.floor(text.length / 2); i++) {
              await this.page.press(selector, 'Backspace');
              await this.delay(Math.random() * 200 + 50);
            }
          }
          break;

        case ActionType.VIEW_WITH_ENGAGEMENT:
          {
            try {
              // Navegar al perfil o post según el contexto
              if (action.target?.username && this.page) {
                await this.page.goto(`https://www.instagram.com/${action.target.username}/`);
              } else if (action.target?.postUrl && this.page) {
                await this.page.goto(action.target.postUrl);
              }

              // Simular comportamiento de visualización con engagement
              await this.simulateViewWithEngagement(action.parameters?.duration || 10000);

              // Posibilidad de dar like basado en el factor de engagement
              const engagementFactor = action.parameters?.engagementFactor || 0.5;
              if (Math.random() < engagementFactor && this.page) {
                const likeButton = await this.page.$('article button svg[aria-label="Me gusta"]');
                if (likeButton) {
                  console.log('Dando like... 💖')
                  await likeButton.click();
                }
              }
            } catch (error) {
              console.error('Error en acción de visualización con engagement:', error);
            }
          }
          break;

        case ActionType.TAKE_BREAK:
          await this.takeBreak();
          break;

        case ActionType.SCROLL_WITH_VARIABLE_SPEED:
          if (this.page) {
            const minDistance = action.parameters?.minDistance || 300;
            const maxDistance = action.parameters?.maxDistance || 800;
            const iterations = action.parameters?.iterations || 5;

            await this.scrollWithVariableSpeed(minDistance, maxDistance, iterations);
          }
          break;
      }
      this.lastActionTimestamp = Date.now();
      //registrar la accion
      return { result: 'success', leads: leads };
    } catch (error) {
      console.error(`Error executing action ${action.action}:`, error);
      return { result: 'error' };
    }
  }

  /**
   * Crea un objeto Lead a partir de un perfil de usuario
   */
  private createLeadFromProfile(profile: any, source: string, sourceDetail: string): Lead {
    if (!profile) throw new Error('Profile is required');

    // Crear un nuevo lead a partir del perfil
    const lead: Lead = {
      userId: this.socialMediaService.getAccount().id!,
      socialMediaType: this.socialMediaService.getAccount().type,
      socialMediaId: profile.id,
      username: profile.username,
      fullName: profile.fullName,
      profileUrl: `${this.ProfileBaseUrl[this.socialMediaService.getAccount().type]}${profile.username}`,
      profilePicUrl: profile.profilePicUrl,
      bio: profile.bio,
      followersCount: profile.followersCount,
      followingCount: profile.followingCount,
      postsCount: profile.postsCount,
      isPrivate: profile.isPrivate,
      isVerified: profile.isVerified,
      status: LeadStatus.NEW,
      source: source,
      sourceUrl: sourceDetail,
      createdAt: new Date(),
      lastInteractionAt: new Date()
    };

    return lead;
  }

  /**
   * Inicializa el navegador para la simulación
   */
  private async initBrowser(): Promise<void> {
    try {
      console.log('Initializing browser for simulation...');

      // Registrar el plugin stealth
      chromium.use(stealth());

      // Preparar opciones de lanzamiento
      const launchOptions: LaunchOptions = {
        headless: false, // Modo visible para depuración
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--disable-notifications',
          '--disable-extensions',
          '--disable-infobars',
          '--window-size=1366,768'
        ],
        slowMo: 100 // Ralentizar más las operaciones para simular comportamiento humano
      };

      // Verificar si hay configuración de proxy disponible
      const proxyConfig = this.socialMediaService.getProxy();
      if (proxyConfig && proxyConfig.status === ProxyStatus.ACTIVE) {
        console.log(`Configurando proxy para ${this.socialMediaService.getAccount().username}: ${proxyConfig.server}`);

        // Crear string de configuración de proxy
        let proxyUrl = '';
        const protocol = proxyConfig.protocol || 'http';

        if (proxyConfig.username && proxyConfig.password) {
          // Proxy con autenticación
          proxyUrl = `${protocol}://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.server}`;
        } else {
          // Proxy sin autenticación
          proxyUrl = `${protocol}://${proxyConfig.server}`;
        }


        // Añadir configuración de proxy a las opciones de lanzamiento
        launchOptions.proxy = {
          server: proxyConfig.protocol + '://' + proxyConfig.server,
          username: proxyConfig.username,
          password: proxyConfig.password,
        };

        console.log('    -- --- --- proxyConfig --> ', launchOptions.proxy)
        this.emit('log', `Usando proxy: ${proxyConfig.server}`);
      }

      // Iniciar el navegador con Playwright y las opciones configuradas
      this.browser = await chromium.launch(launchOptions);

      // Crear una nueva página
      this.page = await this.browser.newContext().then(context => context.newPage());
      console.log('Browser page created');

      // Configurar viewport
      if (this.page) {
        await this.page.setViewportSize({ width: 1366, height: 768 });

        // Configurar manejo de errores de página
        this.page.on('pageerror', error => {
          // console.error('Page error:', error);
        });

        // Configurar manejo de errores de consola
        this.page.on('console', msg => {
          if (msg.type() === 'error') {
            //   console.error('Console error:', msg.text());
          }
        });

        this.page.on('close', () => {
          console.log('Browser closed');
          this.browser?.close();
          this.browser = null;
          this.page = null;
        });

      }


      console.log('Browser initialized successfully');
    } catch (error) {
      console.error('Error initializing browser:', error);
      throw error;
    }
  }

  /**
   * Cierra el navegador y limpia recursos
   */
  private async cleanup(): Promise<void> {
    try {
      // Cerrar el navegador si está abierto
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }

      // Limpiar colecciones
      this.visitedProfiles.clear();
      this.potentialLeads.clear();

      // Resetear contadores
      this.actionCount = 0;

      console.log('Simulation resources cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Simula la visualización de contenido con comportamiento humano
   */
  private async simulateViewingContent(highEngagement: boolean = false): Promise<void> {
    if (!this.page) return;

    // Determinar tiempo de visualización basado en el perfil y nivel de engagement
    const baseViewTime = highEngagement ?
      this.behaviorProfile.contentViewDuration.max :
      Math.random() * (this.behaviorProfile.contentViewDuration.max - this.behaviorProfile.contentViewDuration.min) + this.behaviorProfile.contentViewDuration.min;

    // Simular scroll ocasional
    const scrollCount = highEngagement ? 5 : Math.floor(Math.random() * 3) + 1;
    await this.scrollPage(scrollCount);

    // Simular hover sobre elementos
    if (highEngagement) {
      await this.hoverOnElements('article img', 3);
    }

    // Esperar el tiempo de visualización
    await this.delay(baseViewTime);
  }

  /**
   * Simula escritura humana con velocidad variable y posibles errores
   */
  private async typeHumanLike(page: Page, selector: string, text: string): Promise<void> {
    // Calcular velocidad de escritura basada en el perfil
    const typingSpeed = Math.random() *
      (this.behaviorProfile.typingSpeed.max - this.behaviorProfile.typingSpeed.min) +
      this.behaviorProfile.typingSpeed.min;

    // Calcular tasa de error basada en el perfil
    const errorRate = this.behaviorProfile.errorRate;

    for (let i = 0; i < text.length; i++) {
      // Posibilidad de cometer un error de escritura
      if (Math.random() < errorRate) {
        // Escribir un carácter incorrecto
        const wrongChar = this.getRandomChar();
        await page.type(selector, wrongChar);
        await this.delay(Math.random() * 500 + 100);

        // Borrar el carácter incorrecto
        await page.press(selector, 'Backspace');
        await this.delay(Math.random() * 300 + 100);
      }

      // Escribir el carácter correcto
      await page.type(selector, text[i]);

      // Pausa variable entre caracteres
      const delay = Math.floor(1000 / typingSpeed) + Math.random() * 100;
      await this.delay(delay);

      // Posibilidad de pausa más larga (como si estuviera pensando)
      if (Math.random() < 0.05) {
        await this.delay(Math.random() * 1000 + 500);
      }
    }
  }

  /**
   * Obtiene un carácter aleatorio para simular errores de escritura
   */
  private getRandomChar(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  /**
   * Realiza scroll en la página
   */
  private async scrollPage(scrollCount: number): Promise<void> {
    if (!this.page) return;

    for (let i = 0; i < scrollCount; i++) {
      // Calcular distancia de scroll basada en el perfil
      const scrollDistance = Math.floor(
        Math.random() *
        (this.behaviorProfile.scrollSpeed.max - this.behaviorProfile.scrollSpeed.min) +
        this.behaviorProfile.scrollSpeed.min);

      // Usar evaluate para ejecutar window.scrollBy en el contexto del navegador
      // TypeScript no puede verificar estos tipos, así que usamos any
      await this.page.evaluate((distance: number) => {
        // @ts-ignore - window existe en el contexto del navegador
        window.scrollBy(0, distance);
      }, scrollDistance);

      // Pausa entre scrolls
      await this.delay(Math.random() * 1000 + 500);
    }
  }

  /**
   * Simula hover sobre elementos en la página
   */
  private async hoverOnElements(selector: string, count: number): Promise<void> {
    if (!this.page) return;

    try {
      // Obtener todos los elementos que coinciden con el selector
      const elements = await this.page.$$(selector);

      // Limitar el número de elementos a los disponibles o al conteo solicitado
      const elementsToHover = elements.slice(0, Math.min(count, elements.length));

      // Realizar hover en cada elemento
      for (const element of elementsToHover) {
        // Verificar si el elemento es visible
        const isVisible = await this.page.evaluate((el: any) => {
          // @ts-ignore - window, document existen en el contexto del navegador
          const rect = el.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
        }, element);

        if (isVisible) {
          // Realizar hover
          await element.hover();

          // Esperar un tiempo aleatorio
          await this.delay(Math.random() * 2000 + 500);
        }
      }
    } catch (error) {
      console.error('Error hovering on elements:', error);
    }
  }

  /**
   * Realiza scroll con velocidad variable
   */
  private async scrollWithVariableSpeed(distance: number, duration: number, steps: number = 20): Promise<void> {
    if (!this.page) return;

    // Usar evaluate para ejecutar código en el contexto del navegador
    // TypeScript no puede verificar estos tipos, así que usamos any
    await this.page.evaluate(
      ({ dist, dur, stps }: { dist: number, dur: number, stps: number }) => {
        // Este código se ejecuta en el contexto del navegador
        return new Promise<boolean>((resolve) => {
          // @ts-ignore - window, document existen en el contexto del navegador
          const startTime = Date.now();
          const startPos = window.pageYOffset || document.documentElement.scrollTop;
          const stepSize = dist / stps;
          let currentStep = 0;

          function step() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / dur, 1);

            const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;

            // @ts-ignore - window existe en el contexto del navegador
            window.scrollTo(0, startPos + dist * easeProgress);

            if (progress < 1) {
              // @ts-ignore - window existe en el contexto del navegador
              window.requestAnimationFrame(step);
            } else {
              resolve(true);
            }
          }

          // @ts-ignore - window existe en el contexto del navegador
          window.requestAnimationFrame(step);
        });
      },
      { dist: distance, dur: duration, stps: steps }
    );
  }

  /**
   * Toma un descanso durante la simulación
   */
  private async takeBreak(): Promise<void> {
    console.log('Taking a break to simulate human behavior...');

    // Calcular duración del descanso basada en el perfil
    const breakDuration = Math.random() *
      (this.behaviorProfile.breakDuration.max - this.behaviorProfile.breakDuration.min) +
      this.behaviorProfile.breakDuration.min;

    // Simular un descanso
    await this.delay(breakDuration);

    console.log(`Break finished after ${Math.round(breakDuration / 1000)} seconds`);
  }

  /**
   * Determina si es momento de tomar un descanso
   */
  private shouldTakeBreak(): boolean {
    // Verificar si es hora de tomar un descanso basado en el número de acciones realizadas y 
    // el tiempo desde la ultima accion

    const timeSinceLastAction = Date.now() - this.lastActionTimestamp;
    console.log('timeSinceLastAction', timeSinceLastAction, this.behaviorProfile.breakDuration.max)
    if (timeSinceLastAction > this.behaviorProfile.breakDuration.max) {
      //Ya tuvo su break maximo
      return false;
    } else {
      const breakFrequency = this.behaviorProfile.breakFrequency;
      return this.actionCount > 0 && this.actionCount % breakFrequency === 0;


    }


  }

  /**
   * Calcula un retraso basado en el perfil de comportamiento y los límites específicos de la plataforma
   */
  private calculateDelay(): number {
    // Obtener el tipo de cuenta de red social
    const accountId = this.socialMediaAccount.id;
    if (!accountId) {
      // Si no hay ID de cuenta, usar los valores del perfil de comportamiento
      const minDelay = this.behaviorProfile.contentViewDuration.min;
      const maxDelay = this.behaviorProfile.contentViewDuration.max;
      return Math.random() * (maxDelay - minDelay) + minDelay;
    }

    // Obtener el tipo de red social y sus límites específicos
    const socialType = this.socialMediaAccount.type;
    if (socialMediaLimits[socialType]) {
      // Usar los intervalos de acción específicos de la plataforma
      const { min, max } = socialMediaLimits[socialType].actionsInterval;

      // Añadir variabilidad basada en el perfil de comportamiento
      const variabilityFactor = this.behaviorProfile.interactionProbability;
      const adjustedMin = min * (1 - variabilityFactor * 0.3);
      const adjustedMax = max * (1 + variabilityFactor * 0.3);

      // Generar retraso aleatorio con distribución gaussiana para comportamiento más natural
      const meanDelay = (adjustedMin + adjustedMax) / 2;
      const stdDev = (adjustedMax - adjustedMin) / 4;

      return Math.max(adjustedMin, Math.min(adjustedMax, this.gaussianRandom(meanDelay, stdDev)));
    } else {
      // Fallback a los valores del perfil de comportamiento
      const minDelay = this.behaviorProfile.contentViewDuration.min;
      const maxDelay = this.behaviorProfile.contentViewDuration.max;
      return Math.random() * (maxDelay - minDelay) + minDelay;
    }
  }

  /**
   * Genera un número aleatorio con distribución gaussiana
   */
  private gaussianRandom(mean: number, stdDev: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdDev + mean;
  }


  /**
   * Verifica si alguna acción requiere el uso del navegador
   */
  private requiresBrowser(actions: Action[]): boolean {
    const browserActions = [
      ActionType.HOVER_ON_ELEMENTS,
      ActionType.SCROLL_WITH_VARIABLE_SPEED,
      ActionType.START_TYPING_THEN_DELETE,
      ActionType.VIEW_WITH_ENGAGEMENT
    ];

    return actions.some(action =>
      browserActions.includes(action.action) ||
      (action.followupActions && action.followupActions.some(fa =>
        browserActions.includes(fa.action)
      ))
    );
  }


  /**
   * Función de utilidad para crear retrasos
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extrae el ID de un post de Instagram a partir de su URL
   */
  private extractPostIdFromUrl(url: string): string | null {
    const regex = /\/p\/([^\/]+)/;
    const urlSegment = url.match(regex)
    if (urlSegment) {
      return urlSegmentToInstagramId(urlSegment[1])
    }
    return null
  }

  /**
   * Verifica si un perfil cumple con los criterios para ser considerado un lead
   */
  private shouldProcessAsLead(profile: any, criteria?: any): boolean {
    if (!criteria) return true;

    // Verificar seguidores
    if (criteria.minFollowers && profile.followersCount < criteria.minFollowers) {
      return false;
    }

    if (criteria.maxFollowers && profile.followersCount > criteria.maxFollowers) {
      return false;
    }

    // Verificar número de posts
    if (criteria.minPosts && profile.postsCount < criteria.minPosts) {
      return false;
    }

    // Verificar palabras clave en la bio
    if (criteria.keywords && criteria.keywords.length > 0 && profile.bio) {
      const bioLower = profile.bio.toLowerCase();
      const hasKeyword = criteria.keywords.some((keyword: string) =>
        bioLower.includes(keyword.toLowerCase())
      );

      if (!hasKeyword) {
        return false;
      }
    }

    // Verificar perfiles de referencia
    if (criteria.referenceProfiles && criteria.referenceProfiles.length > 0) {
      // Aquí se necesitaría verificar si el usuario sigue a alguno de los perfiles de referencia
      // Esta funcionalidad requeriría una llamada adicional a la API
    }

    return true;
  }

  /**
   * Simula visualización con engagement
   */
  private async simulateViewWithEngagement(duration: number = 10000): Promise<void> {
    if (!this.page) return;

    try {
      // Simular scroll lento
      await this.scrollWithVariableSpeed(500, 3000);

      // Simular hover en elementos
      await this.hoverOnElements('img, video, button', 3);

      // Simular lectura de contenido
      await this.delay(duration * 0.6);

      // Simular más scroll
      await this.scrollWithVariableSpeed(300, 2000);

      // Simular pausa final
      await this.delay(duration * 0.4);

      // Simular interacción con botones usando evaluate
      await this.page.evaluate(() => {
        // @ts-ignore - window, document, MouseEvent existen en el contexto del navegador
        // Simular movimiento del cursor
        const moveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          view: window
        });

        // Disparar evento en algunos elementos
        document.querySelectorAll('button, a').forEach((el: any) => {
          el.dispatchEvent(moveEvent);
        });
      });
    } catch (error) {
      console.error('Error simulating view with engagement:', error);
    }
  }


  public async commentMeetCriteriaAccordingToAI(comment: string, criteria: any): Promise<boolean> {
    const result = await this.aiAgent.analizeTextAndDetermineIfMeetCriteria(comment, criteria)
    return result
  }

  public commentMeetKeywordsCriteria(comment: string, keywords: string[]): boolean {
    const commentLower = comment.toLowerCase()
    const hasKeyword = keywords.some((keyword: string) =>
      commentLower.includes(keyword.toLowerCase())
    );
    return hasKeyword
  }


  async loginIn(withBrowser: boolean = false): Promise<void> {
    if (withBrowser) {
      console.log('Login in browser...')
      if (!this.page) {
        await this.initBrowser();
        if (!this.page) throw new Error('No se pudo iniciar el navegador');
      }

      if (!this.socialMediaService.getAccount().sessionData) {
        await this.socialMediaService.loginInBrowser(this.page);
        await this.socialMediaService.syncBrowserSessionWithApi(this.page);
      } else {
        console.log('Syncing session with browser...')
        await this.socialMediaService.syncSessionWithBrowser(this.page);
        await this.socialMediaService.syncBrowserSessionWithApi(this.page);
        const isLoggedIn = await this.socialMediaService.verifyLoginSuccess(this.page);
        if (!isLoggedIn) {
          throw new Error('Login fallido, reinicie la session y vuelva a intentarlo');
        }
      }
    } else {
      await this.socialMediaService.login();
    }
  }

  /**
   * Prueba la conexión del proxy configurado para asegurarse de que funciona correctamente
   * @returns Un objeto con el estado de la conexión y detalles adicionales
   */
  public async testProxyConnection(): Promise<{ success: boolean, message: string, ip?: string, country?: string }> {
    try {
      // Si no hay proxy configurado, no es necesario realizar la prueba
      const proxyConfig = this.socialMediaService.getProxy();
      if (!proxyConfig || proxyConfig.status !== ProxyStatus.ACTIVE) {
        return {
          success: true,
          message: 'No hay proxy configurado, utilizando conexión directa.'
        };
      }

      // Iniciar un navegador temporal para probar
      console.log('Probando conexión del proxy...');

      // Registrar el plugin stealth
      chromium.use(stealth());

      // Preparar opciones de lanzamiento
      const launchOptions: any = {
        headless: true, // Modo headless para pruebas
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      };

      // Configurar proxy
      let proxyUrl = '';
      const protocol = proxyConfig.protocol || 'http';

      if (proxyConfig.username && proxyConfig.password) {
        proxyUrl = `${protocol}://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.server}`;
      } else {
        proxyUrl = `${protocol}://${proxyConfig.server}`;
      }

      launchOptions.proxy = {
        server: proxyUrl
      };

      // Lanzar navegador
      const testBrowser = await chromium.launch(launchOptions);
      const context = await testBrowser.newContext();
      const page = await context.newPage();

      try {
        // Intentar acceder a un servicio que muestre la IP
        await page.goto('https://api.ipify.org?format=json', { timeout: 30000 });
        const content = await page.content();

        // Extraer la IP del contenido
        const ipMatch = content.match(/"ip":\s*"([^"]+)"/);
        const ip = ipMatch ? ipMatch[1] : 'desconocida';

        // Obtener información del país (opcional)
        let country = 'desconocido';
        try {
          await page.goto(`https://ipinfo.io/${ip}/json`, { timeout: 10000 });
          const geoContent = await page.content();
          const countryMatch = geoContent.match(/"country":\s*"([^"]+)"/);
          if (countryMatch) {
            country = countryMatch[1];
          }
        } catch (geoError) {
          console.error('Error al obtener información geográfica:', geoError);
        }

        await testBrowser.close();

        return {
          success: true,
          message: `Proxy conectado correctamente. IP: ${ip}, País: ${country}`,
          ip,
          country
        };
      } catch (pageError) {
        await testBrowser.close();
        return {
          success: false,
          message: `Error al conectarse a través del proxy: ${pageError instanceof Error ? pageError.message : String(pageError)}`
        };
      }
    } catch (error) {
      console.error('Error al probar la conexión del proxy:', error);
      return {
        success: false,
        message: `Error en la prueba de proxy: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }






}