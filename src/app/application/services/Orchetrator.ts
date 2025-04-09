import { CampainStatus, Intervention, InterventionStatus } from "../../domain/entities/Campain";
import { Lead } from "../../domain/entities/Lead";
import { SocialMediaType } from "../../domain/entities/SocialMediaAccount";
import { CampainRepository } from "../../domain/repositories/CampainRepository";
import { SimulatorSet } from "../../domain/services/SimulatorSet";
import { MongoCampainRepository } from "../../infrastructure/repositories/mongodb/MongoCampainRepository";
import { SimulationService } from "./SimulationService";

export class Orchetrator {
    private static instance: Orchetrator;
    private simulatorSet: SimulatorSet;
    private campaignRepository: CampainRepository;

    private runningStack: Map<Intervention['id'], {
        socialMediaType: SocialMediaType,
        intervention: Intervention,
        simulator: SimulationService | undefined,
        startTime: Date,
        status: InterventionStatus,
        priority: number //del 1 al 10 prioridad de ejecucion
    }>
    private orchestratorState: any
    private nextExecutionTimer: NodeJS.Timeout | undefined;
    private nextInterventionDate: Date | undefined

    private constructor() {
        this.simulatorSet = SimulatorSet.getInstance();
        this.campaignRepository = new MongoCampainRepository();
        this.runningStack = new Map();

        //Escuchar cuando un simulador este disponible
        this.simulatorSet.on('simulatorAvailable', (simulator: SimulationService) => {
            console.log(`${simulator.socialMediaAccount.type} simulator available: ${simulator.socialMediaAccount.username} 🤩🤩🟢`);
            this.handleSimulatorAvailable(simulator);
        });

        this.simulatorSet.on('simulatorAdded', (simulator: SimulationService) => {
            console.log(`${simulator.socialMediaAccount.type} simulator added: ${simulator.socialMediaAccount.username} ⭐️`);
            this.handleSimulatorAvailable(simulator);
        });


        this.simulatorSet.on('interventionError', (interventionId: string) => {
            console.log(`Intervention error: ${interventionId} 🚫`);
            this.handleInterventionError(interventionId);
        });

        this.start();
    }

    public static getInstance(): Orchetrator {
        if (!Orchetrator.instance) {
            Orchetrator.instance = new Orchetrator();
        }
        return Orchetrator.instance;
    }

    private cleanRunningStack = () => {
        //Eliminar todos los elementos del runningStack que:
        //1. Estan completados o fallados
        //2. No estan bloqueados ni en ejecucion

        for (const [id, data] of this.runningStack.entries()) {
            if ((data.status === InterventionStatus.COMPLETED || data.status === InterventionStatus.FAILED) || (data.status !== InterventionStatus.RUNNING && !data.intervention.isBlocked)) {
                this.runningStack.delete(id);
            }
        }

    }


    private refreshRunningStack = async () => {
    // Revisamos cambios en las campañas y actualizamos el runningStack
    // Toma las campañas que estan en running y que tienen una fecha de inicio menor o igual a la fecha actual
    // Y busca intervenciones que estan pendientes y tengan autoStart para agregarlas al runningStack
        console.log('🟠 --- Refreshing the running stack --- 🟠');

        if (this.runningStack.size === 0) {
            console.log('🟠 --- First time. Creating the running stack --- 🟠');
        } else {
            this.cleanRunningStack();
        }

        //@ts-ignore
        const campaigns = await this.campaignRepository.getCampains({ status: CampainStatus.RUNNING, startDate: { $lte: new Date() } });
        for (const campaign of campaigns) {
            for (const intervention of campaign.interventions) {

                if (intervention.status === InterventionStatus.COMPLETED) {
                    //Ya esta completada, no hacemos nada
                    continue;
                }

                if (intervention.isBlocked || intervention.status === InterventionStatus.RUNNING) {
                    //Ya esta bloqueada porque se esta ejecutando, no hacemos nada
                    continue;
                }

                const now = new Date();
                const startDate = new Date(intervention.startDate || '');
                const isInDate = startDate && startDate <= now;
                const isPending = intervention.status === InterventionStatus.PENDING;
                const isAutoStart = intervention.autoStart;
                const isInStack = this.runningStack.has(intervention.id!);



                if (isPending && isAutoStart && isInDate) {

                    if (isInStack) {
                        //Actualizamos la intervention en el runningStack
                        const currentRunningData = this.runningStack.get(intervention.id!)!;
                        currentRunningData.intervention = intervention
                        currentRunningData.startTime = new Date();

                    } else {
                        this.runningStack.set(intervention.id!, {
                            socialMediaType: campaign.platform,
                            intervention,
                            simulator: undefined,
                            startTime: new Date(),
                            status: InterventionStatus.PENDING,
                            priority: 0
                        });
                    }
                }
            }
        }
        console.log('🟠 --- Running stack refreshed --- 🟠');

        //Si el runningStack esta lleno y hay un timeout, lo eliminamos
        if (this.runningStack.size > 0 && this.nextExecutionTimer) {
            clearInterval(this.nextExecutionTimer);
            this.nextExecutionTimer = undefined;
        }
    }

    /**
     * First start the orchestrator
     */
    private start = async () => {
       await this.refreshRunningStack();
        this.executeRunningStack();
    }

    private executeRunningStack = async () => {
        console.log('Executing the running stack --- ⏰ ');
        const runningStack = Array.from(this.runningStack.values())?.filter((runningData) => runningData.status === InterventionStatus.PENDING)?.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())?.sort((a, b) => a.priority - b.priority);

        for (const runningData of runningStack) {
            runningData.intervention.isBlocked = true;
            const socialMedia = runningData.socialMediaType;
            const simulator = this.simulatorSet.getAvailableSimulator(socialMedia);
            if (!simulator) {
                runningData.status = InterventionStatus.PENDING;
                runningData.intervention.isBlocked = false;
                this.runningStack.set(runningData.intervention.id!, runningData);
                console.log(`Simulator not found for ${socialMedia}. 😔 Leaving the intervention in pending state`);
                continue;
            }

            runningData.simulator = simulator;
            await this.changeInterventionStatus(runningData.intervention.id!, InterventionStatus.RUNNING);
            this.runningStack.set(runningData.intervention.id!, runningData);

            simulator.runIntervention(runningData.intervention, async (leads: Lead[]) => this.handleInterventionFinish(runningData.intervention.id!, leads));
            console.log('Intervention started', runningData.intervention.id);
        }
        
        console.log('Running stack executed --- ✅');

        // Si el runningStack esta vacio, consultar cuando es el siguiente evento de ejecucion y setear un timeout para ejecutar el proceso de refreshRunningStack
        // Si en el medio el runningStack se llena, se cancela el timeout y se vuelve a ejecutar el proceso completo
        if (this.runningStack.size === 0) {
            this.handleEmptyRunningStack();
        }
    }

    private handleEmptyRunningStack = async () => {
        console.log('Running stack is empty.');
        //@ts-ignore
        const activeCampaigns = await this.campaignRepository.getCampains({ status: CampainStatus.RUNNING, startDate: { $lte: new Date() } });
        if (activeCampaigns.length > 0) {
            const now = new Date();
            for (const campaign of activeCampaigns) {

                const interventions = campaign.interventions?.filter(i => i.status === InterventionStatus.PENDING && i.autoStart).sort((a, b) => new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime());
                for (const intervention of interventions) {
                    const startDate = new Date(intervention.startDate || '');
                    const isInDate = startDate && startDate <= now;
                    const isPending = intervention.status === InterventionStatus.PENDING;
                    const isAutoStart = intervention.autoStart;
                    //Si no esta en fecha puede que sea la mas proxima a empezar
                    if (!isInDate && isPending && isAutoStart) {
                        if (!this.nextInterventionDate || startDate < this.nextInterventionDate) {
                            this.nextInterventionDate = startDate;
                        }
                    }
                }

            }

            if (this.nextInterventionDate) {
                if(this.nextExecutionTimer){
                    clearTimeout(this.nextExecutionTimer);
                    this.nextExecutionTimer = undefined;
                }
                console.log('Next intervention date', this.nextInterventionDate, (this.nextInterventionDate.getTime() - new Date().getTime()+10000)/1000, ' seconds to go');
                this.nextExecutionTimer = setTimeout(async () => {
                    this.nextInterventionDate = undefined;
                    await this.refreshRunningStack()
                    this.executeRunningStack();
                }, this.nextInterventionDate.getTime() - new Date().getTime() + 10000);
            }else{
                console.log(' 🚫 --- No next intervention date --- 🚫 (waiting for changes)');
            }
        }
    }



    private handleInterventionFinish = async (interventionId: string, leads: Lead[]) => {
        console.log('🏆 --- Intervention finished:', interventionId, 'with', leads.length, 'leads --- 🏆 ');

        // Actualizar la campaña en la base de datos
        await this.changeInterventionStatus(interventionId, InterventionStatus.COMPLETED);

        //Eliminar de la runningStack
        this.runningStack.delete(interventionId);

        // Almacenar los leads en la base de datos

    }

    handleSimulatorAvailable = (simulator: SimulationService) => {
        if (this.simulatorSet.listSimulators().length > 0) {
            this.executeRunningStack();
        }
    }

    changeInterventionStatus = async (interventionId: string, status: InterventionStatus) => {
        const runningData = this.runningStack.get(interventionId);
        if (!runningData) throw new Error('Running data not found');
        runningData.status = status;
        runningData.intervention.status = status;
        this.runningStack.set(interventionId, runningData);
        await this.campaignRepository.updateInterventionStatus(interventionId, status);
    }


    handleCampaignUpdate = async () => {
        console.log(' 🟢 --- Campaign updated --- 🟢');
        await this.refreshRunningStack();
        this.executeRunningStack();
    }


    private handleInterventionError = (interventionId: string) => {
        console.log(`Intervention error: ${interventionId} 🚫`);
        this.changeInterventionStatus(interventionId, InterventionStatus.FAILED);

    }

}




