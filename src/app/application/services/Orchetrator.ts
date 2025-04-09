import { CampainStatus, Intervention, InterventionStatus } from "../../domain/entities/Campain";
import { Lead } from "../../domain/entities/Lead";
import { SocialMediaType } from "../../domain/entities/SocialMediaAccount";
import { CampainRepository } from "../../domain/repositories/CampainRepository";
import { SimulatorSet } from "../../domain/services/SimulatorSet";
import { MongoCampainRepository } from "../../infrastructure/repositories/mongodb/MongoCampainRepository";
import { logger, LogContext } from "../../infrastructure/services/LoggerService";
import { SimulationService } from "./SimulationService";

// Tipo para consultas MongoDB
interface DateQuery {
    $lte: Date;
}

// Ampliar el tipado de Intervention para incluir importanceFactor opcional
declare module "../../domain/entities/Campain" {
    interface Intervention {
        importanceFactor?: number;
    }
}

// Definir tipos específicos para el manejo de errores y métricas
export enum OrchestratorErrorType {
    SIMULATOR_NOT_FOUND = 'SIMULATOR_NOT_FOUND',
    INTERVENTION_FAILED = 'INTERVENTION_FAILED',
    INVALID_STATE = 'INVALID_STATE',
    DATABASE_ERROR = 'DATABASE_ERROR',
    TIMEOUT = 'TIMEOUT'
}

export interface OrchestratorMetrics {
    totalInterventions: number;
    completedInterventions: number;
    failedInterventions: number;
    pendingInterventions: number;
    runningInterventions: number;
    averageExecutionTime: number; // en milisegundos
    lastUpdateTime: Date;
}

export interface QueueItem {
    socialMediaType: SocialMediaType;
    intervention: Intervention;
    simulator: SimulationService | undefined;
    startTime: Date;
    status: InterventionStatus;
    priority: number; // 1-10, siendo 1 la más alta prioridad
    retryCount: number;
    lastRetryTime?: Date;
    error?: {
        type: OrchestratorErrorType;
        message: string;
        timestamp: Date;
    };
    executionStats?: {
        assignedAt?: Date;
        startedAt?: Date;
        completedAt?: Date;
        executionTime?: number; // en milisegundos
    };
}

// Interfaz para el filtro de MongoDB (evitar errores de tipado)
interface CampaignFilter {
    status: CampainStatus;
    startDate: any; // Usamos 'any' para permitir la sintaxis de MongoDB
}

export class Orchetrator {
    private static instance: Orchetrator;
    private simulatorSet: SimulatorSet;
    private campaignRepository: CampainRepository;

    // Mejora: Renombrar por claridad y tipado fuerte con la nueva interfaz
    private interventionQueue: Map<string, QueueItem>;
    
    // Métricas y estado
    private metrics: OrchestratorMetrics;
    private orchestratorState: 'IDLE' | 'REFRESHING' | 'EXECUTING';
    private nextExecutionTimer: NodeJS.Timeout | undefined;
    private nextInterventionDate: Date | undefined;
    
    // Configuración
    private readonly MAX_RETRY_COUNT = 3;
    private readonly RETRY_DELAY_MS = 60000; // 1 minuto

    private constructor() {
        this.simulatorSet = SimulatorSet.getInstance();
        this.campaignRepository = new MongoCampainRepository();
        this.interventionQueue = new Map();
        this.orchestratorState = 'IDLE';

        // Inicializar métricas
        this.metrics = {
            totalInterventions: 0,
            completedInterventions: 0,
            failedInterventions: 0,
            pendingInterventions: 0,
            runningInterventions: 0,
            averageExecutionTime: 0,
            lastUpdateTime: new Date()
        };

        logger.info("Orchestrator initialized", { 
            event: "ORCHESTRATOR_INIT",
            timestamp: new Date().toISOString()
        });

        this.setupEventListeners();
        this.start();
    }

    private setupEventListeners(): void {
        // Escuchar cuando un simulador esté disponible
        this.simulatorSet.on('simulatorAvailable', (simulator: SimulationService) => {
            const logContext: LogContext = {
                simulatorId: simulator.socialMediaAccount.id || 'unknown',
                socialMediaType: simulator.socialMediaAccount.type
            };
            
            logger.logSimulatorStatus(
                simulator.socialMediaAccount.id || 'unknown',
                'available',
                logContext
            );
            
            console.log(`${simulator.socialMediaAccount.type} simulator available: ${simulator.socialMediaAccount.username} 🤩🤩🟢`);
            this.handleSimulatorAvailable(simulator);
        });

        this.simulatorSet.on('simulatorAdded', (simulator: SimulationService) => {
            const logContext: LogContext = {
                simulatorId: simulator.socialMediaAccount.id || 'unknown',
                socialMediaType: simulator.socialMediaAccount.type
            };
            
            logger.logSimulatorStatus(
                simulator.socialMediaAccount.id || 'unknown',
                'added',
                logContext
            );
            
            console.log(`${simulator.socialMediaAccount.type} simulator added: ${simulator.socialMediaAccount.username} ⭐️`);
            this.handleSimulatorAvailable(simulator);
        });

        this.simulatorSet.on('interventionError', (interventionId: string) => {
            const queueItem = this.interventionQueue.get(interventionId);
            const logContext: LogContext = {
                interventionId,
                campaignId: queueItem?.intervention.campaignId,
                simulatorId: queueItem?.simulator?.socialMediaAccount.id,
                socialMediaType: queueItem?.socialMediaType
            };
            
            logger.logInterventionError(
                interventionId,
                logContext,
                OrchestratorErrorType.INTERVENTION_FAILED
            );
            
            console.log(`Intervention error: ${interventionId} 🚫`);
            this.handleInterventionError(interventionId, OrchestratorErrorType.INTERVENTION_FAILED);
        });
    }

    public static getInstance(): Orchetrator {
        if (!Orchetrator.instance) {
            Orchetrator.instance = new Orchetrator();
        }
        return Orchetrator.instance;
    }

    public getMetrics(): OrchestratorMetrics {
        // Actualizar métricas antes de devolverlas
        this.updateMetrics();
        return this.metrics;
    }

    private updateMetrics(): void {
        const interventions = Array.from(this.interventionQueue.values());
        
        // Calcular métricas
        this.metrics.totalInterventions = interventions.length;
        this.metrics.pendingInterventions = interventions.filter(i => i.status === InterventionStatus.PENDING).length;
        this.metrics.runningInterventions = interventions.filter(i => i.status === InterventionStatus.RUNNING).length;
        this.metrics.completedInterventions = interventions.filter(i => i.status === InterventionStatus.COMPLETED).length;
        this.metrics.failedInterventions = interventions.filter(i => i.status === InterventionStatus.FAILED).length;
        
        // Calcular tiempo promedio de ejecución
        const completedWithStats = interventions.filter(
            i => i.status === InterventionStatus.COMPLETED && i.executionStats?.executionTime
        );
        
        if (completedWithStats.length > 0) {
            const totalTime = completedWithStats.reduce(
                (sum, item) => sum + (item.executionStats?.executionTime || 0), 
                0
            );
            this.metrics.averageExecutionTime = totalTime / completedWithStats.length;
        }
        
        this.metrics.lastUpdateTime = new Date();
    }

    private cleanInterventionQueue = () => {
        // Mejora: Mantener intervenciones completadas y fallidas por un tiempo
        // para poder recopilar métricas, pero eventualmente limpiarlas
        const MAX_COMPLETED_AGE_MS = 1000 * 60 * 60; // 1 hora
        const now = new Date().getTime();
        
        for (const [id, data] of this.interventionQueue.entries()) {
            // Eliminar intervenciones completadas o fallidas antiguas
            if ((data.status === InterventionStatus.COMPLETED || data.status === InterventionStatus.FAILED) &&
                data.executionStats?.completedAt &&
                (now - data.executionStats.completedAt.getTime() > MAX_COMPLETED_AGE_MS)) {
                this.interventionQueue.delete(id);
                continue;
            }
            
            // Eliminar intervenciones que no están bloqueadas ni en ejecución
            if (data.status !== InterventionStatus.RUNNING && !data.intervention.isBlocked) {
                this.interventionQueue.delete(id);
            }
        }
    }

    private refreshInterventionQueue = async () => {
        try {
            this.orchestratorState = 'REFRESHING';
            logger.info('Refreshing intervention queue', { event: 'QUEUE_REFRESH_START' });
            console.log('🟠 --- Refreshing the intervention queue --- 🟠');

            if (this.interventionQueue.size === 0) {
                console.log('🟠 --- First time. Creating the intervention queue --- 🟠');
            } else {
                this.cleanInterventionQueue();
            }

            // Crear filtro para la consulta
            const filter: CampaignFilter = {
                status: CampainStatus.RUNNING,
                startDate: { $lte: new Date() }
            };

            const campaigns = await this.campaignRepository.getCampains(filter);

            for (const campaign of campaigns) {
                for (const intervention of campaign.interventions) {
                    // Ignorar intervenciones ya completadas
                    if (intervention.status === InterventionStatus.COMPLETED) {
                        continue;
                    }

                    // Ignorar intervenciones bloqueadas o en ejecución
                    if (intervention.isBlocked || intervention.status === InterventionStatus.RUNNING) {
                        continue;
                    }

                    const now = new Date();
                    const startDate = new Date(intervention.startDate || '');
                    const isInDate = startDate && startDate <= now;
                    const isPending = intervention.status === InterventionStatus.PENDING;
                    const isAutoStart = intervention.autoStart;
                    const isInQueue = intervention.id && this.interventionQueue.has(intervention.id);

                    if (isPending && isAutoStart && isInDate) {
                        if (isInQueue && intervention.id) {
                            // Actualizar la intervención en la cola
                            const queueItem = this.interventionQueue.get(intervention.id)!;
                            queueItem.intervention = intervention;
                            // No reiniciamos startTime para mantener el orden de llegada
                            this.interventionQueue.set(intervention.id, queueItem);
                        } else if (intervention.id) {
                            // Calcular prioridad basada en criterios
                            const priority = this.calculatePriority(intervention, campaign);
                            
                            // Añadir a la cola con todas las propiedades
                            this.interventionQueue.set(intervention.id, {
                                socialMediaType: campaign.platform,
                                intervention,
                                simulator: undefined,
                                startTime: new Date(),
                                status: InterventionStatus.PENDING,
                                priority,
                                retryCount: 0,
                                executionStats: {
                                    startedAt: undefined,
                                    completedAt: undefined,
                                    executionTime: undefined
                                }
                            });
                        }
                    }
                }
            }
            
            console.log('🟠 --- Intervention queue refreshed --- 🟠');
            this.updateMetrics();

            // Si la cola tiene intervenciones y hay un temporizador, lo eliminamos
            if (this.interventionQueue.size > 0 && this.nextExecutionTimer) {
                clearTimeout(this.nextExecutionTimer);
                this.nextExecutionTimer = undefined;
            }
            
            this.orchestratorState = 'IDLE';

            logger.info('Intervention queue refreshed', { 
                event: 'QUEUE_REFRESH_COMPLETE',
                queueSize: this.interventionQueue.size
            });
        } catch (error) {
            logger.error('Error refreshing intervention queue', { 
                event: 'QUEUE_REFRESH_ERROR' 
            }, error instanceof Error ? error : new Error(String(error)));
            
            console.error('Error refreshing intervention queue:', error);
            this.orchestratorState = 'IDLE';
        }
    }

    private calculatePriority(intervention: Intervention, campaign: any): number {
        // Implementar lógica de prioridad más sofisticada
        // Valores más bajos = mayor prioridad
        let priority = 5; // Prioridad media por defecto
        
        // Ajustar por antigüedad (más antiguas = mayor prioridad)
        const startDate = new Date(intervention.startDate || new Date());
        const now = new Date();
        const ageInMinutes = (now.getTime() - startDate.getTime()) / (1000 * 60);
        
        if (ageInMinutes > 60) { // Más de 1 hora de antigüedad
            priority -= 2;
        } else if (ageInMinutes > 30) { // Más de 30 minutos
            priority -= 1;
        }
        
        // Ajustar por tipo de intervención (si existe un campo que lo indique)
        if (intervention.importanceFactor) {
            priority -= intervention.importanceFactor;
        }
        
        // Asegurarse que la prioridad esté en el rango 1-10
        return Math.max(1, Math.min(10, priority));
    }

    /**
     * Inicia el orquestador
     */
    private start = async () => {
        await this.refreshInterventionQueue();
        this.executeInterventionQueue();
    }

    private executeInterventionQueue = async () => {
        try {
            if (this.orchestratorState === 'EXECUTING') {
                logger.info('Already executing intervention queue, skipping', { 
                    event: 'QUEUE_EXECUTION_SKIPPED'
                });
                
                console.log('Already executing intervention queue, skipping...');
                return;
            }
            
            this.orchestratorState = 'EXECUTING';
            logger.info('Executing intervention queue', { 
                event: 'QUEUE_EXECUTION_START',
                queueSize: this.interventionQueue.size,
                pendingCount: this.getPendingInterventionCount()
            });
            
            console.log('Executing the intervention queue --- ⏰ ');
            
            // Obtener intervenciones pendientes, ordenadas por hora de inicio y prioridad
            const pendingInterventions = Array.from(this.interventionQueue.values())
                .filter(item => item.status === InterventionStatus.PENDING)
                .sort((a, b) => {
                    // Primero por prioridad (menor número = mayor prioridad)
                    const priorityDiff = a.priority - b.priority;
                    if (priorityDiff !== 0) return priorityDiff;
                    
                    // Luego por tiempo de espera (más antiguo primero)
                    return a.startTime.getTime() - b.startTime.getTime();
                });

            for (const queueItem of pendingInterventions) {
                // Marcar como bloqueada para evitar procesamiento duplicado
                queueItem.intervention.isBlocked = true;
                
                // Obtener un simulador disponible del tipo adecuado
                const socialMedia = queueItem.socialMediaType;
                const simulator = this.simulatorSet.getAvailableSimulator(socialMedia);
                
                if (!simulator) {
                    // No hay simuladores disponibles
                    queueItem.status = InterventionStatus.PENDING;
                    queueItem.intervention.isBlocked = false;
                    
                    // Registrar el error para seguimiento
                    queueItem.error = {
                        type: OrchestratorErrorType.SIMULATOR_NOT_FOUND,
                        message: `No simulator available for ${socialMedia}`,
                        timestamp: new Date()
                    };
                    
                    const logContext: LogContext = {
                        interventionId: queueItem.intervention.id,
                        campaignId: queueItem.intervention.campaignId,
                        socialMediaType: socialMedia
                    };
                    
                    logger.warn(`No simulator available for ${socialMedia}`, {
                        ...logContext,
                        event: 'SIMULATOR_NOT_FOUND'
                    });
                    
                    this.interventionQueue.set(queueItem.intervention.id!, queueItem);
                    console.log(`Simulator not found for ${socialMedia}. 😔 Leaving the intervention in pending state`);
                    continue;
                }

                // Asignar simulador y actualizar estado
                queueItem.simulator = simulator;
                queueItem.executionStats = {
                    ...queueItem.executionStats,
                    assignedAt: new Date()
                };
                
                // Cambiar estado a RUNNING en la BD y en la cola
                await this.changeInterventionStatus(queueItem.intervention.id!, InterventionStatus.RUNNING);
                
                // Actualizar en la cola
                this.interventionQueue.set(queueItem.intervention.id!, queueItem);
                
                // Registrar tiempo de inicio
                queueItem.executionStats!.startedAt = new Date();
                
                // Crear contexto para los logs
                const logContext: LogContext = {
                    interventionId: queueItem.intervention.id,
                    campaignId: queueItem.intervention.campaignId,
                    simulatorId: simulator.socialMediaAccount.id,
                    socialMediaType: socialMedia,
                    priority: queueItem.priority
                };
                
                // Registrar el inicio de la intervención
                logger.logInterventionStart(queueItem.intervention.id!, logContext);

                // Ejecutar la intervención
                simulator.runIntervention(
                    queueItem.intervention, 
                    async (leads: Lead[]) => {
                        // Al finalizar, registrar métricas de ejecución
                        const completionTime = new Date();
                        const executionTime = completionTime.getTime() - 
                            (queueItem.executionStats?.startedAt?.getTime() || completionTime.getTime());
                        
                        // Actualizar estadísticas
                        queueItem.executionStats = {
                            ...queueItem.executionStats,
                            completedAt: completionTime,
                            executionTime: executionTime
                        };
                        
                        // Procesar finalización
                        await this.handleInterventionFinish(queueItem.intervention.id!, leads);
                    }
                );
                
                console.log('Intervention started', queueItem.intervention.id);
            }
            
            logger.info('Intervention queue executed', {
                event: 'QUEUE_EXECUTION_COMPLETE',
                interventionsStarted: pendingInterventions.length
            });
            
            console.log('Intervention queue executed --- ✅');
            this.updateMetrics();

            // Si la cola está vacía, buscar próximas intervenciones
            if (this.getPendingInterventionCount() === 0) {
                this.handleEmptyQueue();
            }
            
            this.orchestratorState = 'IDLE';
        } catch (error) {
            logger.error('Error executing intervention queue', {
                event: 'QUEUE_EXECUTION_ERROR'
            }, error instanceof Error ? error : new Error(String(error)));
            
            console.error('Error executing intervention queue:', error);
            this.orchestratorState = 'IDLE';
        }
    }

    private getPendingInterventionCount(): number {
        return Array.from(this.interventionQueue.values())
            .filter(item => item.status === InterventionStatus.PENDING)
            .length;
    }

    private handleEmptyQueue = async () => {
        console.log('Intervention queue is empty or has no pending interventions.');
        
        try {
            // Crear filtro para la consulta
            const filter: CampaignFilter = {
                status: CampainStatus.RUNNING,
                startDate: { $lte: new Date() }
            };
            
            const activeCampaigns = await this.campaignRepository.getCampains(filter);
            
            if (activeCampaigns.length > 0) {
                const now = new Date();
                this.nextInterventionDate = undefined;
                
                // Buscar la próxima intervención a ejecutar
                for (const campaign of activeCampaigns) {
                    // Usar tipado explícito para evitar errores en la función filter
                    const pendingInterventions = campaign.interventions
                        ?.filter((i: Intervention) => i.status === InterventionStatus.PENDING && i.autoStart)
                        .sort((a: Intervention, b: Intervention) => 
                            new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime()
                        );
                    
                    for (const intervention of pendingInterventions) {
                        const startDate = new Date(intervention.startDate || '');
                        const isInDate = startDate && startDate <= now;
                        
                        // Si no está en fecha, podría ser la próxima a comenzar
                        if (!isInDate && startDate) {
                            if (!this.nextInterventionDate || startDate < this.nextInterventionDate) {
                                this.nextInterventionDate = startDate;
                            }
                        }
                    }
                }

                if (this.nextInterventionDate) {
                    // Limpiar temporizador existente si lo hay
                    if (this.nextExecutionTimer) {
                        clearTimeout(this.nextExecutionTimer);
                        this.nextExecutionTimer = undefined;
                    }
                    
                    // Calcular tiempo hasta la próxima intervención
                    const timeToNextMs = this.nextInterventionDate.getTime() - now.getTime() + 10000; // +10s de margen
                    console.log(
                        'Next intervention date', 
                        this.nextInterventionDate, 
                        timeToNextMs / 1000, 
                        'seconds to go'
                    );
                    
                    // Programar próxima ejecución
                    this.nextExecutionTimer = setTimeout(async () => {
                        this.nextInterventionDate = undefined;
                        await this.refreshInterventionQueue();
                        this.executeInterventionQueue();
                    }, timeToNextMs);
                } else {
                    console.log(' 🚫 --- No next intervention date --- 🚫 (waiting for changes)');
                }
            }
        } catch (error) {
            console.error('Error handling empty queue:', error);
        }
    }

    private handleInterventionFinish = async (interventionId: string, leads: Lead[]) => {
        console.log('🏆 --- Intervention finished:', interventionId, 'with', leads.length, 'leads --- 🏆 ');

        try {
            const queueItem = this.interventionQueue.get(interventionId);
            const logContext: LogContext = {
                interventionId,
                campaignId: queueItem?.intervention.campaignId,
                simulatorId: queueItem?.simulator?.socialMediaAccount.id,
                socialMediaType: queueItem?.socialMediaType,
                executionTime: queueItem?.executionStats?.executionTime,
                leadsCount: leads.length
            };
            
            // Actualizar la campaña en la base de datos
            await this.changeInterventionStatus(interventionId, InterventionStatus.COMPLETED);
            
            // Almacenar los leads en la base de datos
            // TODO: Implementar almacenamiento de leads
            
            // Registrar finalización exitosa
            logger.logInterventionComplete(
                interventionId, 
                logContext, 
                queueItem?.executionStats?.executionTime
            );
            
            // Actualizar métricas
            this.updateMetrics();
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            logger.error(`Error handling intervention finish for ${interventionId}`, {
                event: 'INTERVENTION_FINISH_ERROR',
                interventionId
            }, errorObj);
            
            console.error(`Error handling intervention finish for ${interventionId}:`, error);
            // Marcar como fallida en caso de error en finalización
            await this.handleInterventionError(
                interventionId, 
                OrchestratorErrorType.DATABASE_ERROR, 
                `Error completing intervention: ${error}`
            );
        }
    }

    handleSimulatorAvailable = (simulator: SimulationService) => {
        if (this.simulatorSet.listSimulators().length > 0 && 
            this.getPendingInterventionCount() > 0 && 
            this.orchestratorState === 'IDLE') {
            this.executeInterventionQueue();
        }
    }

    changeInterventionStatus = async (interventionId: string, status: InterventionStatus) => {
        try {
            const queueItem = this.interventionQueue.get(interventionId);
            if (!queueItem) {
                throw new Error('Queue item not found');
            }
            
            // Actualizar estado en la cola
            queueItem.status = status;
            queueItem.intervention.status = status;
            
            // Si se completa o falla, registrar tiempo de finalización
            if (status === InterventionStatus.COMPLETED || status === InterventionStatus.FAILED) {
                queueItem.executionStats = {
                    ...queueItem.executionStats,
                    completedAt: new Date()
                };
                
                // Calcular tiempo de ejecución si tenemos tiempo de inicio
                if (queueItem.executionStats?.startedAt) {
                    queueItem.executionStats.executionTime = 
                        new Date().getTime() - queueItem.executionStats.startedAt.getTime();
                }
            }
            
            // Actualizar en la cola
            this.interventionQueue.set(interventionId, queueItem);
            
            // Actualizar en la base de datos
            await this.campaignRepository.updateInterventionStatus(interventionId, status);
        } catch (error) {
            console.error(`Error changing intervention status for ${interventionId}:`, error);
            throw error;
        }
    }

    handleCampaignUpdate = async () => {
        console.log(' 🟢 --- Campaign updated --- 🟢');
        await this.refreshInterventionQueue();
        
        // Solo ejecutar si no hay ejecución en curso
        if (this.orchestratorState === 'IDLE') {
            this.executeInterventionQueue();
        }
    }

    private handleInterventionError = async (
        interventionId: string, 
        errorType: OrchestratorErrorType = OrchestratorErrorType.INTERVENTION_FAILED,
        message: string = 'Error during intervention execution'
    ) => {
        console.log(`Intervention error: ${interventionId} 🚫 - ${errorType}: ${message}`);
        
        try {
            const queueItem = this.interventionQueue.get(interventionId);
            if (!queueItem) {
                logger.error(`Cannot handle error for non-existent intervention ${interventionId}`, {
                    event: 'INTERVENTION_ERROR_INVALID',
                    interventionId,
                    errorType
                });
                
                console.error(`Cannot handle error for non-existent intervention ${interventionId}`);
                return;
            }
            
            // Registrar error
            queueItem.error = {
                type: errorType,
                message,
                timestamp: new Date()
            };
            
            // Crear contexto para los logs
            const logContext: LogContext = {
                interventionId,
                campaignId: queueItem.intervention.campaignId,
                simulatorId: queueItem.simulator?.socialMediaAccount.id,
                socialMediaType: queueItem.socialMediaType,
                retryCount: queueItem.retryCount,
                errorType
            };
            
            // Incrementar contador de reintentos
            queueItem.retryCount = (queueItem.retryCount || 0) + 1;
            queueItem.lastRetryTime = new Date();
            
            // Determinar si se puede reintentar
            if (queueItem.retryCount < this.MAX_RETRY_COUNT) {
                logger.info(`Will retry intervention ${interventionId} (attempt ${queueItem.retryCount} of ${this.MAX_RETRY_COUNT})`, {
                    ...logContext,
                    event: 'INTERVENTION_RETRY'
                });
                
                console.log(`Will retry intervention ${interventionId} (attempt ${queueItem.retryCount} of ${this.MAX_RETRY_COUNT})`);
                
                // Volver a estado PENDING para reintentar
                queueItem.status = InterventionStatus.PENDING;
                queueItem.intervention.status = InterventionStatus.PENDING;
                queueItem.intervention.isBlocked = false;
                
                // Actualizar en la cola
                this.interventionQueue.set(interventionId, queueItem);
                
                // Actualizar en base de datos
                await this.campaignRepository.updateInterventionStatus(interventionId, InterventionStatus.PENDING);
            } else {
                logger.error(`Intervention ${interventionId} failed after ${queueItem.retryCount} attempts`, {
                    ...logContext,
                    event: 'INTERVENTION_FAILED_FINAL'
                });
                
                console.log(`Intervention ${interventionId} failed after ${queueItem.retryCount} attempts`);
                await this.changeInterventionStatus(interventionId, InterventionStatus.FAILED);
            }
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            logger.error(`Error handling intervention error for ${interventionId}`, {
                event: 'ERROR_HANDLER_FAILED',
                interventionId,
                errorType
            }, errorObj);
            
            console.error(`Error handling intervention error for ${interventionId}:`, error);
            // En este punto, intentar marcar como fallida de todas formas
            try {
                await this.changeInterventionStatus(interventionId, InterventionStatus.FAILED);
            } catch (finalError) {
                logger.error(`Critical: Failed to mark intervention ${interventionId} as failed`, {
                    event: 'CRITICAL_ERROR',
                    interventionId
                }, finalError instanceof Error ? finalError : new Error(String(finalError)));
                
                console.error(`Critical: Failed to mark intervention ${interventionId} as failed:`, finalError);
            }
        }
    }

    // Métodos para pruebas y diagnóstico
    
    getQueueStatus(): { id: string, status: InterventionStatus, priority: number }[] {
        return Array.from(this.interventionQueue.entries())
            .map(([id, item]) => ({
                id, // id ya es string por el tipado de interventionQueue
                status: item.status,
                priority: item.priority
            }));
    }
    
    getDetailedQueueStatus(): Map<string, QueueItem> {
        return new Map(this.interventionQueue);
    }
}




