import { Request, Response } from 'express';
import { LoggerService } from '../../infrastructure/services/LoggerService';

export class LogController {
    private loggerService: LoggerService;

    constructor() {
        this.loggerService = LoggerService.getInstance();
    }

    /**
     * Consulta logs con filtros y paginación
     */
    async getLogs(req: Request, res: Response): Promise<void> {
        try {
            const { 
                level,
                campaignId, 
                interventionId, 
                simulatorId,
                socialMediaType, 
                event,
                startDate, 
                endDate,
                limit = 100,
                page = 1
            } = req.query;

            // Preparar filtros
            const filters: any = {};
            
            if (level) filters.level = level as string;
            if (campaignId) filters.campaignId = campaignId as string;
            if (interventionId) filters.interventionId = interventionId as string;
            if (simulatorId) filters.simulatorId = simulatorId as string;
            if (socialMediaType) filters.socialMediaType = socialMediaType as string;
            if (event) filters.event = event as string;
            
            // Convertir fechas si se proporcionan
            if (startDate) {
                filters.startDate = new Date(startDate as string);
            }
            
            if (endDate) {
                filters.endDate = new Date(endDate as string);
            }
            
            // Paginación
            filters.limit = parseInt(limit as string, 10);
            filters.page = parseInt(page as string, 10);

            // Consultar logs
            const logs = await this.loggerService.queryLogs(filters);
            
            // Obtener el total de registros (propiedad definida en el LoggerService)
            const totalLogs = (logs as any).totalCount || logs.length;

            // Responder con información adicional
            res.status(200).json({
                success: true,
                data: logs,
                metadata: {
                    filters: {
                        level,
                        campaignId,
                        interventionId,
                        simulatorId,
                        socialMediaType,
                        event,
                        startDate: startDate ? new Date(startDate as string).toISOString() : null,
                        endDate: endDate ? new Date(endDate as string).toISOString() : null
                    },
                    pagination: {
                        page: filters.page,
                        limit: filters.limit,
                        total: totalLogs,
                        totalPages: Math.ceil(totalLogs / filters.limit)
                    },
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error querying logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error querying logs',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Obtiene un resumen de los logs de intervenciones para una campaña
     */
    async getInterventionLogsSummary(req: Request, res: Response): Promise<void> {
        try {
            const { campaignId } = req.params;
            
            // Obtener todos los logs relacionados con esta campaña
            const logs = await this.loggerService.queryLogs({
                campaignId: campaignId as string,
                limit: 1000 // Límite alto para capturar suficientes datos para estadísticas
            });

            // Generar estadísticas reales basadas en los logs
            const stats = this.generateCampaignStats(logs, campaignId as string);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error getting intervention logs summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting intervention logs summary',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Genera estadísticas para una campaña basadas en sus logs
     */
    private generateCampaignStats(logs: any[], campaignId: string): any {
        // Extraer intervenciones únicas
        const interventionIds = new Set<string>();
        logs.forEach(log => {
            if (log.metadata?.interventionId) {
                interventionIds.add(log.metadata.interventionId);
            }
        });

        // Contar eventos de inicio y finalización de intervenciones
        let startedInterventions = 0;
        let completedInterventions = 0;
        let failedInterventions = 0;
        let totalLeadsGenerated = 0;
        let totalExecutionTime = 0;
        let executionTimeCount = 0;

        // Registrar errores para identificar los más comunes
        const errorTypes: Record<string, number> = {};
        
        // Analizar cada log para extraer estadísticas
        logs.forEach(log => {
            const event = log.metadata?.event;
            
            if (event === 'INTERVENTION_START') {
                startedInterventions++;
            } 
            else if (event === 'INTERVENTION_COMPLETE') {
                completedInterventions++;
                
                // Sumar leads generados
                if (log.metadata?.leadsCount) {
                    totalLeadsGenerated += parseInt(log.metadata.leadsCount, 10) || 0;
                }
                
                // Sumar tiempo de ejecución para calcular promedio
                if (log.metadata?.executionTime) {
                    totalExecutionTime += parseInt(log.metadata.executionTime, 10) || 0;
                    executionTimeCount++;
                }
            } 
            else if (event === 'INTERVENTION_FAILED_FINAL') {
                failedInterventions++;
            } 
            else if (event === 'INTERVENTION_ERROR' || log.level === 'error') {
                // Registrar tipo de error
                const errorType = log.metadata?.errorType || 'UNKNOWN_ERROR';
                errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
            }
        });

        // Calcular tiempo promedio de ejecución
        const averageExecutionTime = executionTimeCount > 0 ? 
            Math.round(totalExecutionTime / executionTimeCount) : 0;
        
        // Convertir recuento de errores a un array ordenado
        const mostCommonErrors = Object.entries(errorTypes)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);

        // Encontrar timestamps del primer y último log
        const timestamps = logs
            .map(log => new Date(log.timestamp || log.metadata?.timestamp || '').getTime())
            .filter(ts => !isNaN(ts));
        
        const firstLogDate = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null;
        const lastLogDate = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null;

        return {
            campaignId,
            totalInterventions: interventionIds.size,
            startedInterventions,
            completedInterventions,
            failedInterventions,
            pendingInterventions: interventionIds.size - startedInterventions,
            successRate: startedInterventions > 0 ? 
                Math.round((completedInterventions / startedInterventions) * 100) : 0,
            averageExecutionTime, // ms
            totalLeadsGenerated,
            leadsPerIntervention: completedInterventions > 0 ? 
                Math.round(totalLeadsGenerated / completedInterventions * 10) / 10 : 0,
            mostCommonErrors: mostCommonErrors.slice(0, 5), // Top 5 errores
            firstLogDate,
            lastLogDate,
            totalLogs: logs.length,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Obtiene los logs de una intervención específica
     */
    async getInterventionLogs(req: Request, res: Response): Promise<void> {
        try {
            const { interventionId } = req.params;
            
            // Consultar logs para esta intervención
            const logs = await this.loggerService.queryLogs({
                interventionId: interventionId as string,
                // Ordenar del más reciente al más antiguo
                limit: 500 // Permitir un límite mayor para intervenciones específicas
            });

            // Extraer información de contexto de los logs (si está disponible)
            const contextInfo = this.extractInterventionContext(logs);
            
            res.status(200).json({
                success: true,
                data: logs,
                context: contextInfo,
                metadata: {
                    interventionId,
                    logsCount: logs.length,
                    firstLogDate: logs.length > 0 ? 
                        new Date(logs[logs.length - 1].timestamp || logs[logs.length - 1].metadata?.timestamp || '').toISOString() : null,
                    lastLogDate: logs.length > 0 ? 
                        new Date(logs[0].timestamp || logs[0].metadata?.timestamp || '').toISOString() : null,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error getting intervention logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting intervention logs',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Extrae información contextual de una intervención a partir de sus logs
     */
    private extractInterventionContext(logs: any[]): any {
        // Si no hay logs, devolver objeto vacío
        if (!logs || logs.length === 0) {
            return {};
        }

        // Buscar los logs más relevantes para extraer contexto
        const startLog = logs.find(log => 
            log.metadata?.event === 'INTERVENTION_START' ||
            log.message?.includes('Intervention started')
        );
        
        const completeLog = logs.find(log => 
            log.metadata?.event === 'INTERVENTION_COMPLETE' ||
            log.message?.includes('Intervention completed')
        );
        
        const errorLogs = logs.filter(log => 
            log.metadata?.event === 'INTERVENTION_ERROR' ||
            log.level === 'error'
        );

        // Construir el objeto de contexto
        const context: any = {
            campaignId: startLog?.metadata?.campaignId,
            simulatorId: startLog?.metadata?.simulatorId,
            socialMediaType: startLog?.metadata?.socialMediaType,
            started: !!startLog,
            completed: !!completeLog,
            hasErrors: errorLogs.length > 0,
            errorsCount: errorLogs.length,
            executionTime: completeLog?.metadata?.executionTime,
            priority: startLog?.metadata?.priority
        };
        
        // Si hay logs de error, extraer información de los errores
        if (errorLogs.length > 0) {
            context.errors = errorLogs.map(log => ({
                type: log.metadata?.errorType || 'UNKNOWN_ERROR',
                message: log.metadata?.error?.message || log.message || 'Unknown error',
                timestamp: log.timestamp || log.metadata?.timestamp
            }));
        }
        
        return context;
    }

    /**
     * Obtiene los logs de un simulador específico
     */
    async getSimulatorLogs(req: Request, res: Response): Promise<void> {
        try {
            const { simulatorId } = req.params;
            
            // Consultar logs para este simulador
            const logs = await this.loggerService.queryLogs({
                simulatorId: simulatorId as string
            });

            res.status(200).json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error getting simulator logs:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting simulator logs',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
} 