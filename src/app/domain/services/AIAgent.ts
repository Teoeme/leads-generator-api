import { ActionPlan } from "../../infrastructure/simulation/actions/ActionTypes";
import { AIService } from "./AIService";

export class AIAgent {
    private aiService: AIService;
    constructor({
        aiService,
    }: {
        aiService: AIService,
    }) {
        this.aiService = aiService;
    }

    public async generateActionPlan(profile: any): Promise<ActionPlan> {

        
    }

    public async analizeTextAndDetermineIfMeetCriteria(text: string, criteria: any): Promise<boolean> {
        const prompt = `Eres un experto en redes sociales.
Se te proporciona un texto y un criterio.
Debes determinar si el texto cumple con el siguiente criterio:
${JSON.stringify(criteria)}

El texto es: ${text}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido que contenga:
- "result": boolean
- "reason": string (en español)

Ejemplo del formato esperado:
{"result":true,"reason":"El texto cumple con el criterio"}`;

        try {
            const response = await this.aiService.generateContent(prompt);
            // Limpiamos la respuesta de posibles caracteres especiales
            const cleanResponse = response.trim().replace(/[\r\n\t]/g, '');
            
            // Intentamos extraer solo el JSON si hay texto adicional
            const jsonMatch = cleanResponse.match(/\{.*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : cleanResponse;
            
            const jsonResponse = JSON.parse(jsonString);
            console.log('JSON parseado:', jsonResponse);
            
            return Boolean(jsonResponse?.result);
        } catch(error) {
            console.error('Error en analizeTextAndDetermineIfMeetCriteria:', error);
            return false;
        }
    }


}