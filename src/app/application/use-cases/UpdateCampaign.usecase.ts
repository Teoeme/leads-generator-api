import { Campain, CampainStatus, InterventionStatus } from "../../domain/entities/Campain";
import { CampainRepository } from "../../domain/repositories/CampainRepository";

const CampaignStatusChangeMap:Record<CampainStatus,CampainStatus[]> = {
    [CampainStatus.PLANNING]:[CampainStatus.RUNNING],
    [CampainStatus.RUNNING]:[CampainStatus.PAUSED],
    [CampainStatus.COMPLETED]:[],
    [CampainStatus.PAUSED]:[CampainStatus.RUNNING,CampainStatus.PLANNING]
}

const InterventionStatusChangeMap:Record<InterventionStatus,InterventionStatus[]> = {
    [InterventionStatus.PENDING]:[],
    [InterventionStatus.RUNNING]:[],
    [InterventionStatus.COMPLETED]:[InterventionStatus.PLANNING,InterventionStatus.PENDING],
    [InterventionStatus.FAILED]:[InterventionStatus.PLANNING,InterventionStatus.PENDING],
    [InterventionStatus.PLANNING]:[InterventionStatus.PENDING]
}

export class UpdateCampaignUsecase {
    constructor(private readonly campainRepository: CampainRepository) {}


    async execute(campaign: Partial<Campain>): Promise<Campain | null> {

        if (!campaign.id) throw new Error('Campaign id is required');

        const campainDoc = await this.campainRepository.getCampainById(campaign.id);
        if (!campainDoc) throw new Error('Campaign not found');

        let oldInterventions = [...(campainDoc.interventions || [])];

        const newInterventionsData = (campaign.interventions || [])

        const updatedInterventions=newInterventionsData.filter(i=>oldInterventions.find(n=>n.id===i.id));
        const newInterventions=newInterventionsData.filter(i=>!oldInterventions.find(n=>n.id===i.id));
        const deletedInterventions=oldInterventions.filter(i=>!newInterventionsData.find(n=>n.id===i.id));


        for (const intervention of updatedInterventions) {
            const oldId = oldInterventions.findIndex(i => i.id === intervention.id);
            const existentIntervention = oldInterventions?.[oldId];
            if (oldId !== -1) {
                const isBlocked = existentIntervention.isBlocked
                const isRunning = existentIntervention.status === InterventionStatus.RUNNING
                const isCompleted = existentIntervention.status === InterventionStatus.COMPLETED
                
                if(isBlocked || isRunning){
                    //No se puede actualizar una intervention que esta en estado running o completed y/o bloqueada
                    continue;
                }else{
                    //Update intervention
                    oldInterventions[oldId] = intervention;

                    //Validar si el cambio de estado se permite
                    const statusChangeMap = InterventionStatusChangeMap[existentIntervention.status]
                    if(statusChangeMap.includes(intervention.status)){
                        oldInterventions[oldId].status = intervention.status;
                    }
                    
                    //Sanitizar datos no modificables
                    oldInterventions[oldId].isBlocked = existentIntervention.isBlocked; //El estado de bloqueo no se puede modificar de forma manual
                }
            }
        }

        for (const intervention of newInterventions) {
            //Create intervention
            oldInterventions.push({
                ...intervention,
                status: intervention.status===InterventionStatus.PENDING ? InterventionStatus.PENDING: InterventionStatus.PLANNING,
                progress: 0,
                isBlocked:false
            });
        }

        //Deleted interventions
        oldInterventions = oldInterventions.filter(i => !deletedInterventions.find(n => n.id === i.id));


        campaign.interventions = oldInterventions;

        //Validar si el cambio de estado se permite
        const statusChangeMap = CampaignStatusChangeMap[campainDoc.status]
        if(campaign.status && statusChangeMap.includes(campaign.status)){
            campaign.status = campaign.status;
        }


        return this.campainRepository.updateCampain(campaign.id, campaign);
    }
}