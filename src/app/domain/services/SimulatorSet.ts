import EventEmitter from "events";
import { SimulationService } from "../../application/services/SimulationService";
import { SocialMediaType, SocialMediaAccountRole } from "../entities/SocialMediaAccount";

export class SimulatorSet {
    private static instance: SimulatorSet;
    private simulators: Map<string, SimulationService> = new Map();
    private eventEmitter: EventEmitter = new EventEmitter();
    
    public static getInstance(): SimulatorSet {
        if (!SimulatorSet.instance) {
            SimulatorSet.instance = new SimulatorSet();
            console.log('Creating new instance of SimulatorSet ✅')
        }
        return SimulatorSet.instance;
    }

    addSimulator(simulator: SimulationService): SimulationService {
        if (!simulator.socialMediaAccount.id) {
            throw new Error("Simulator account id is required");
        }
        if (this.simulators.has(simulator.socialMediaAccount.id)) {
            throw new Error("Simulator already exists");
        }
        this.simulators.set(simulator.socialMediaAccount.id, simulator);
        this.eventEmitter.emit('simulatorAdded', simulator);

        simulator.on('simulatorAvailable', (simulator: SimulationService) => {
            console.log('Escuchando simulador disponible emitido desde el simulation service',simulator.socialMediaAccount.username);
            this.eventEmitter.emit('simulatorAvailable', simulator);
            console.log('Emitiendo simulador disponible desde el simulator set');
        });

        simulator.on('simulatorError', (simulator: SimulationService) => {
            console.log('Escuchando simulador error emitido desde el simulation service',simulator.socialMediaAccount.username);
            this.eventEmitter.emit('simulatorError', simulator);
        });

        simulator.on('interventionError', (interventionId: string) => {
            console.log('Escuchando intervención error emitido desde el simulation service',interventionId);
            this.eventEmitter.emit('interventionError', interventionId);
        });

        return simulator;
    }

    private removeSimulator(simulator: SimulationService) {
        if (!simulator.socialMediaAccount.id) {
            throw new Error("Simulator account id is required");
        }
        if (!this.simulators.has(simulator.socialMediaAccount.id)) {
            throw new Error("Simulator not found");
        }
        const instance = this.simulators.get(simulator.socialMediaAccount.id);
        if (instance) {
            instance.stopSimulation();
        }

        simulator.removeAllListeners();
        this.simulators.delete(simulator.socialMediaAccount.id);
    }

    public getSimulator(accountId: string) {
        if (!this.simulators.has(accountId)) {
            throw new Error("Simulator not found");
        }
        return this.simulators.get(accountId);
    }


    public getAvailableSimulator(accountType: SocialMediaType, role?: SocialMediaAccountRole): SimulationService | null {
        // Filtrar simuladores disponibles por tipo de cuenta y estado
        const baseFiltering = Array.from(this.simulators.values()).filter(simulator => 
            !simulator.isRunning && 
            simulator.socialMediaAccount.type === accountType && 
            !simulator.needAttention
        );
        
        // Si no hay simuladores que cumplan el filtro base, retornar null
        if (baseFiltering.length === 0) return null;
        
        // Si se especifica un rol, filtrar por ese rol
        let filteredSimulators = baseFiltering;
        if (role) {
            filteredSimulators = baseFiltering.filter(simulator => 
                simulator.socialMediaAccount.roles?.includes(role)
            );
        }
        
        // Ordenar por porcentaje de uso (priorizar los menos usados)
        const availableSimulators = filteredSimulators.sort((a, b) => 
            a.currentUsagePercentage - b.currentUsagePercentage
        );
        
        return availableSimulators[0];
    }

    listSimulators(): {id:string,type:SocialMediaType,currentUsagePercentage:number,isRunning:boolean}[] {
        return Array.from(this.simulators.values()).map(simulator => {
            const { sessionData, password, ...accountData } = simulator.socialMediaAccount;

            return({
            id: simulator.socialMediaAccount.id || '',
            type: simulator.socialMediaAccount.type,
            currentUsagePercentage: simulator.currentUsagePercentage,
            isRunning: simulator.isRunning,
            isLoggedIn: simulator.isLoggedIn,
            account: accountData,
            needAttention: simulator.needAttention
        })})
    }

    public async login(accountId: string,withBrowser:boolean = false): Promise<void> {
        const simulator = this.getSimulator(accountId);
        if(!simulator) throw new Error("Simulator not found");
        await simulator.loginIn(withBrowser);
    }

    listenSimulatorAvailable(callback: (simulator: SimulationService) => void) {
        this.simulators.forEach(simulator => {
            simulator.on('available', callback);
        });
    }

    on(event: string, listener: (...args: any[]) => void): this {
        this.eventEmitter.on(event, listener);
        return this;
    }

    /**
     * Prueba la conexión de proxy de un simulador específico o de todos los simuladores
     * @param accountId ID opcional de la cuenta a probar. Si no se proporciona, se prueban todos los simuladores.
     * @returns Resultados de las pruebas de proxy por ID de cuenta
     */
    public async testProxies(accountId?: string): Promise<{[key: string]: {success: boolean, message: string, ip?: string, country?: string}}> {
        const results: {[key: string]: {success: boolean, message: string, ip?: string, country?: string}} = {};
        
        if (accountId) {
            // Probar un simulador específico
            const simulator = this.getSimulator(accountId);
            if (!simulator) {
                throw new Error(`Simulador con ID ${accountId} no encontrado`);
            }
            
            results[accountId] = await simulator.testProxyConnection();
        } else {
            // Probar todos los simuladores
            const simulators = Array.from(this.simulators.values());
            
            for (const simulator of simulators) {
                if (!simulator.socialMediaAccount.id) continue;
                
                results[simulator.socialMediaAccount.id] = await simulator.testProxyConnection();
            }
        }
        
        return results;
    }
}