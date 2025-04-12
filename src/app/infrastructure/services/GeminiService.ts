import {GoogleAIFileManager,FileState, UploadFileResponse} from '@google/generative-ai/server'
import {GoogleGenerativeAI} from '@google/generative-ai'
import { writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import { unlink } from 'fs/promises';
import 'dotenv/config'
import { AIService } from '../../domain/services/AIService';

export class GeminiApiService implements AIService {
    private static instance: GeminiApiService;
    private cuotaLimits={
        requesPerMinute:10
    }
    private requestsTimestampsHistory:number[]=[]

    public static getInstance(): GeminiApiService {
        if(!GeminiApiService.instance){
            GeminiApiService.instance = new GeminiApiService();
        }
        return GeminiApiService.instance;
    }

    private BASE_URL ='https://generativelanguage.googleapis.com'
    private URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`;
    private fileManager = new GoogleAIFileManager(process.env.GOOGLE_GEMINI_API_KEY!);
    private genAi=new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);


    private checkQuotaLimitPerMinute():{isAllowed:boolean,timeToWait:number}{
        const currentTimestamp = Date.now();
        const oneMinuteAgo = currentTimestamp - 60000; // 60 segundos atrás
        
        // Filtrar las peticiones que ocurrieron en el último minuto
        const requestsInLastMinute = this.requestsTimestampsHistory.filter(
            timestamp => timestamp > oneMinuteAgo
        );
        
        
        // Si el número de solicitudes es menor que el límite, permitir la solicitud
        if (requestsInLastMinute.length < this.cuotaLimits.requesPerMinute) {
            return {isAllowed: true, timeToWait: 0};
        }
        
        // Si hemos alcanzado el límite, calcular cuánto tiempo debemos esperar
        // hasta que la solicitud más antigua salga de la ventana de un minuto
        const oldestRequestInWindow = Math.min(...requestsInLastMinute);
        const timeToWait = (oldestRequestInWindow + 60000) - currentTimestamp;
        
        return {
            isAllowed: false,
            timeToWait: Math.max(0, timeToWait) // Asegurar que nunca sea negativo
        };
    }

    async generateContent(prompt:string):Promise<string>{
        const cuotaCheck=this.checkQuotaLimitPerMinute()
        if(!cuotaCheck.isAllowed){
            console.log('Cuota excedida, esperando...',cuotaCheck.timeToWait, ' milisegundos')
            await new Promise(resolve=>setTimeout(resolve,cuotaCheck.timeToWait))
        }
        try{
        const genAi=new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)
        const model=genAi.getGenerativeModel({model:'gemini-2.0-flash-exp'})
        model.apiKey=process.env.GOOGLE_GEMINI_API_KEY!
        const response = await model.generateContent(prompt);
        this.requestsTimestampsHistory.push(Date.now())
        const data = await response.response.text();
        console.log(data,'respuesta de gemini')
        return data;
    }catch(error){
        console.error('Error en la generación de contenido:', error);
        return '';
    }
    }

    async transcribeAudio(file: File): Promise<string> {
        try {
            // 1. Subir el archivo
            const uploadRes = await this.uploadFile(file);
            if (!uploadRes) {
                console.error('No se pudo subir el archivo de audio');
                return '';
            }

            // 2. Esperar a que el archivo esté procesado
            let fileInStorage = await this.fileManager.getFile(uploadRes.file.name);
            let attempts = 0;
            const maxAttempts = 12; // 2 minutos máximo de espera

            while (fileInStorage.state === FileState.PROCESSING && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10 segundos
                fileInStorage = await this.fileManager.getFile(uploadRes.file.name);
                attempts++;
            }

            if (fileInStorage.state === FileState.FAILED) {
                throw new Error('Error al procesar el archivo de audio');
            }

            if (fileInStorage.state === FileState.PROCESSING) {
                throw new Error('Tiempo de procesamiento excedido');
            }

            // 3. Generar la transcripción
            const model = this.genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = [
                {
                    text: "Transcribe el siguiente audio a texto en español. Incluye solo el contenido transcrito, sin comentarios adicionales."
                },
                {
                    fileData: {
                        fileUri: uploadRes.file.uri,
                        mimeType: uploadRes.file.mimeType
                    }
                }
            ];

            const result = await model.generateContent(prompt);
            const transcription = await result.response.text();

            // 4. Limpiar el archivo después de usarlo
            try {
                await this.fileManager.deleteFile(uploadRes.file.name);
            } catch (error) {
                console.error('Error al eliminar el archivo temporal:', error);
            }

            return transcription || '';

        } catch (error) {
            console.error('Error en la transcripción:', error);
            return '';
        }
    }
    
    public async uploadFile(file: File): Promise<UploadFileResponse | null> {
        try {
            if (!file) {
                console.error('URL del archivo no disponible');
                return null;
            }

          

            // Obtener el buffer del archivo
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Generar un ID corto para el archivo (solo caracteres permitidos)
            const shortId = file.name
                .split('_')[0]
                .substring(0, 8)
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '');
            
            // Crear nombres de archivo válidos
            const tempFileName = `audio-${shortId}`;
            const uploadFileName = `audio-${shortId}`;

            // Crear un archivo temporal
            const tempFilePath = join(os.tmpdir(), tempFileName);
            await writeFile(tempFilePath, buffer);

            // Subir el archivo usando el path temporal
            const uploadResult = await this.fileManager.uploadFile(tempFilePath, {
                mimeType: file.type,
                name: uploadFileName
            });

            // Limpiar el archivo temporal
            try {
                await unlink(tempFilePath);
            } catch (error) {
                console.error('Error al eliminar archivo temporal:', error);
            }

            return uploadResult;

        } catch (error) {
            console.error('Error al subir el archivo:', error);
            return null;
        }
    }


    
}