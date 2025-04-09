import { Request, Response } from "express";
import { CampainRepository } from "../../domain/repositories/CampainRepository";
import { responseCreator } from "../../application/utils/responseCreator";
import { UpdateCampaignUsecase } from "../../application/use-cases/UpdateCampaign.usecase";
import { Orchetrator } from "../../application/services/Orchetrator";
export class CampainController {
    private readonly updateCampaignUsecase: UpdateCampaignUsecase;
    private readonly orchetrator: Orchetrator;
    constructor(private readonly campainRepository: CampainRepository) {
        this.updateCampaignUsecase = new UpdateCampaignUsecase(campainRepository);
        this.orchetrator = Orchetrator.getInstance();
    }

     createCampain = async (req: Request, res: Response) =>{
        try {
            const campain = await this.campainRepository.createCampain(req.body);
            responseCreator(res,{
                data:campain,
                status:201,
                message:'Campaña creada correctamente'
            });
        } catch (error:any) {
            responseCreator(res,{
                data:null,
                status:500,
                message:'Error al crear la campaña: ' + error.message
            });
        }
    }

    getCampainById = async (req: Request, res: Response) =>{
        try {
            const campain = await this.campainRepository.getCampainById(req.params.id);
                responseCreator(res,{
                data:campain,
                status:200,
                message:'Campaña obtenida correctamente'
            });
        } catch (error:any) {
            responseCreator(res,{
                data:null,
                status:500,
                message:'Error al obtener la campaña: ' + error.message
            });
        }
    }   

    updateCampain = async (req: Request, res: Response) =>{
        try {
            const campain = await this.updateCampaignUsecase.execute(req.body);
            await this.orchetrator.handleCampaignUpdate();
            responseCreator(res,{
                data:campain,
                status:200,
                message:'Campaña actualizada correctamente'
            });
        } catch (error:any) {
            responseCreator(res,{
                data:null,
                status:500,
                message:'Error al actualizar la campaña: ' + error.message
            });
        }
    }

    deleteCampain = async (req: Request, res: Response) =>{
        try {
            const campain = await this.campainRepository.deleteCampain(req.params.id);
            responseCreator(res,{
                data:campain,
                status:200,
                message:'Campaña eliminada correctamente'
            });
        } catch (error:any) {
            responseCreator(res,{
                data:null,
                status:500,
                message:'Error al eliminar la campaña: ' + error.message
            });
        }
    }

    getCampains = async (req: Request, res: Response) =>{
        try {
            const campains = await this.campainRepository.getCampains();
            responseCreator(res,{
                data:campains,
                status:200,
                message:'Campañas obtenidas correctamente'
            });
        } catch (error:any) {
            responseCreator(res,{
                data:null,
                status:500,
                message:'Error al obtener las campañas: ' + error.message
            });
        }
    }
}