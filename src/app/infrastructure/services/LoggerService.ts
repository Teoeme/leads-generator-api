import winston from 'winston';
import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Definir directorio para los logs
const LOG_DIR = process.env.LOG_DIR || 'logs';

// Asegurar que el directorio de logs existe
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Definir los niveles de log personalizados
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};

// Definir los colores para cada nivel
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray'
};

// Aplicar colores
winston.addColors(logColors);

// Crear formato personalizado para logs estructurados
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.errors({ stack: true }),
    format.metadata(),
    format.json()
);

// Formato para consola con colores
const consoleFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(
        (info) => {
            const { timestamp, level, message, metadata } = info;
            // Verificar que metadata sea un objeto y tenga propiedades
            const metaString = metadata && typeof metadata === 'object' && Object.keys(metadata).length 
                ? `${JSON.stringify(metadata, null, 2)}` 
                : '';
                
            return `${timestamp} [${level}]: ${message} ${metaString}`;
        }
    )
);

// Definir interfaces para categorías de logs
export interface LogContext {
    campaignId?: string;
    interventionId?: string;
    simulatorId?: string;
    socialMediaType?: string;
    userId?: string;
    [key: string]: any; // Para cualquier otro metadato
}

export class LoggerService {
    private static instance: LoggerService;
    private logger: winston.Logger;
    
    private constructor() {
        this.logger = createLogger({
            levels: logLevels,
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: { service: 'orchestrator-service' },
            transports: [
                // Log de errores y advertencias en archivo separado
                new transports.File({ 
                    filename: path.join(LOG_DIR, 'error.log'), 
                    level: 'error' 
                }),
                
                // Log general con todos los niveles
                new transports.File({ 
                    filename: path.join(LOG_DIR, 'combined.log') 
                }),
                
                // Log específico para intervenciones (permite filtrado)
                new transports.File({
                    filename: path.join(LOG_DIR, 'interventions.log'),
                    format: format.combine(
                        format.timestamp(),
                        format.json()
                    )
                }),
                
                // Log para salida en consola durante desarrollo
                new transports.Console({
                    format: consoleFormat
                })
            ],
            exitOnError: false
        });
        
        // Rotar archivos de log cuando superan cierto tamaño
        // Nota: Para una implementación completa se recomienda usar winston-daily-rotate-file
    }
    
    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }
    
    // Métodos para logging con contexto estructurado
    public error(message: string, context?: LogContext, error?: Error): void {
        const meta = this.prepareMetadata(context, error);
        this.logger.error(message, meta);
    }
    
    public warn(message: string, context?: LogContext): void {
        this.logger.warn(message, this.prepareMetadata(context));
    }
    
    public info(message: string, context?: LogContext): void {
        this.logger.info(message, this.prepareMetadata(context));
    }
    
    public debug(message: string, context?: LogContext): void {
        this.logger.debug(message, this.prepareMetadata(context));
    }
    
    public verbose(message: string, context?: LogContext): void {
        this.logger.verbose(message, this.prepareMetadata(context));
    }
    
    // Logs específicos para eventos del orquestador
    public logInterventionStart(interventionId: string, context: LogContext): void {
        this.info(`Intervention started: ${interventionId}`, {
            ...context,
            event: 'INTERVENTION_START'
        });
    }
    
    public logInterventionComplete(interventionId: string, context: LogContext, executionTime?: number): void {
        this.info(`Intervention completed: ${interventionId}`, {
            ...context,
            event: 'INTERVENTION_COMPLETE',
            executionTime
        });
    }
    
    public logInterventionError(interventionId: string, context: LogContext, errorType: string, error?: Error): void {
        this.error(`Intervention error: ${interventionId}`, {
            ...context,
            event: 'INTERVENTION_ERROR',
            errorType
        }, error);
    }
    
    public logSimulatorStatus(simulatorId: string, status: string, context: LogContext): void {
        this.info(`Simulator ${simulatorId} ${status}`, {
            ...context,
            event: 'SIMULATOR_STATUS',
            simulatorStatus: status
        });
    }
    
    // Preparar los metadatos para los logs
    private prepareMetadata(context?: LogContext, error?: Error): any {
        const metadata = context || {};
        
        if (error) {
            metadata.error = {
                message: error.message,
                stack: error.stack
            };
        }
        
        // Añadir timestamp para facilitar consultas
        metadata.timestamp = new Date().toISOString();
        
        return metadata;
    }
    
    // Métodos para consultar logs (para API)
    public async queryLogs(filters: {
        level?: string,
        campaignId?: string,
        interventionId?: string,
        simulatorId?: string,
        socialMediaType?: string,
        event?: string,
        startDate?: Date,
        endDate?: Date,
        limit?: number,
        page?: number
    }): Promise<any[]> {
        try {
            const allLogs: any[] = [];
            
            // Lista de archivos de log a consultar
            const logFiles = [
                // path.join(LOG_DIR, 'interventions.log'),
                path.join(LOG_DIR, 'combined.log')
            ];
            
            // Leer cada archivo y acumular los logs
            for (const logFile of logFiles) {
                // Verificar si el archivo existe
                if (!fs.existsSync(logFile)) {
                    continue; // Pasar al siguiente archivo
                }
                
                try {
                    // Leer el archivo de logs
                    const fileContent = fs.readFileSync(logFile, 'utf-8');
                    
                    // Procesar las líneas (cada línea es un objeto JSON)
                    const logsFromFile = fileContent
                        .split('\n')
                        .filter(line => line.trim() !== '') // Eliminar líneas vacías
                        .map(line => {
                            try {
                                return JSON.parse(line);
                            } catch (e) {
                                // Ignorar silenciosamente las líneas que no son JSON válido
                                return null;
                            }
                        })
                        .filter(log => log !== null); // Eliminar líneas que no pudieron ser parseadas
                    
                    // Añadir los logs de este archivo al conjunto total
                    allLogs.push(...logsFromFile);
                } catch (fileError) {
                    console.error(`Error reading log file ${logFile}:`, fileError);
                }
            }
            
            // Aplicar filtros
            let filteredLogs = allLogs.filter(log => {
                // Aplicar filtro por nivel
                if (filters.level && log.level !== filters.level) {
                    return false;
                }
                
                // Filtrar por metadatos (puede estar en diferentes lugares según el formato del log)
                const metadata = log.metadata || log.meta || {};
                
                // Filtrar por ID de campaña
                if (filters.campaignId && metadata.campaignId !== filters.campaignId) {
                    return false;
                }
                
                // Filtrar por ID de intervención
                if (filters.interventionId && metadata.interventionId !== filters.interventionId) {
                    return false;
                }
                
                // Filtrar por ID de simulador
                if (filters.simulatorId && metadata.simulatorId !== filters.simulatorId) {
                    return false;
                }
                
                // Filtrar por tipo de red social
                if (filters.socialMediaType && metadata.socialMediaType !== filters.socialMediaType) {
                    return false;
                }
                
                // Filtrar por tipo de evento
                if (filters.event && metadata.event !== filters.event) {
                    return false;
                }
                
                // Determinar la fecha del log
                let logDate: Date | null = null;
                
                // Intentar obtener la fecha del log de diferentes campos
                if (log.timestamp) {
                    logDate = new Date(log.timestamp);
                } else if (metadata.timestamp) {
                    logDate = new Date(metadata.timestamp);
                } else if (log.time || log.date) {
                    logDate = new Date(log.time || log.date);
                }
                
                // Si no se pudo determinar la fecha, asumir que el log es relevante
                if (!logDate) {
                    return true;
                }
                
                // Filtrar por fecha de inicio
                if (filters.startDate && logDate < filters.startDate) {
                    return false;
                }
                
                // Filtrar por fecha de fin
                if (filters.endDate) {
                    const endOfDay = new Date(filters.endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (logDate > endOfDay) {
                        return false;
                    }
                }
                
                // Si pasó todos los filtros, incluir este log
                return true;
            });
            
            // Eliminar duplicados (puede haber logs que aparezcan en ambos archivos)
            const uniqueLogsMap = new Map();
            for (const log of filteredLogs) {
                // Crear una clave única basada en el timestamp y el mensaje
                const key = `${log.timestamp || log.metadata?.timestamp || ''}_${log.message}`;
                log.id=randomUUID()
                uniqueLogsMap.set(key, log);
            }
            
            filteredLogs = Array.from(uniqueLogsMap.values());
            
            // Ordenar por fecha (más reciente primero)
            filteredLogs.sort((a, b) => {
                const getTimestamp = (log: any) => {
                    if (log.timestamp) return new Date(log.timestamp).getTime();
                    if (log.metadata?.timestamp) return new Date(log.metadata.timestamp).getTime();
                    if (log.time || log.date) return new Date(log.time || log.date).getTime();
                    return 0;
                };
                
                return getTimestamp(b) - getTimestamp(a);
            });
            
            // Aplicar paginación
            const page = filters.page || 1;
            const limit = filters.limit || 100;
            const startIndex = (page - 1) * limit;
            const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
            
            // Añadir información de total para la API
            const result = paginatedLogs.map(log => ({
                ...log,
                // Transformar campos adicionales si es necesario
                formattedDate: new Date(log.timestamp || log.metadata?.timestamp || log.time || '').toLocaleString(),
            }));
            
            // Añadir una propiedad totalCount para que el controlador pueda usarla
            Object.defineProperty(result, 'totalCount', {
                value: filteredLogs.length,
                enumerable: false
            });
            
            return result;
        } catch (error) {
            console.error('Error processing logs:', error);
            return [];
        }
    }
}

// Para usar en toda la aplicación
export const logger = LoggerService.getInstance(); 