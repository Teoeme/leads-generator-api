import { UploadFileResponse } from "@google/generative-ai/dist/server/server"

    export interface AIService {

    generateContent(prompt:string): Promise<string> 

    transcribeAudio(file: File): Promise<string>

    uploadFile(file: File): Promise<UploadFileResponse | null> 

}