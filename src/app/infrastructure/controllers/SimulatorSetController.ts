import { Request, Response } from "express";
import { InstagramService } from "../../application/services/InstagramService";
import { SimulationService } from "../../application/services/SimulationService";
import { SocialMediaService } from "../../application/services/SocialMediaService";
import { SocialMediaType } from "../../domain/entities/SocialMediaAccount";
import { AIAgent } from "../../domain/services/AIAgent";
import { MongoSocialMediaAccountRepository } from "../repositories/mongodb/MongoSocialMediaAccountRepository";
import { GeminiApiService } from "../services/GeminiService";
import { BehaviorProfileType } from "../simulation/behaviors/BehaviorProfile";
import { MongoProxyRepository } from "../repositories/mongodb/MongoProxyRepository";
import { SimulatorSet } from "../../application/services/SimulatorSet";
import { responseCreator } from "../../application/utils/responseCreator";
import crypto from 'crypto'
import fs from 'fs'

export class SimulatorSetController {
    private static instance: SimulatorSetController;
    private simulatorSet: SimulatorSet;
    private accountRepository: MongoSocialMediaAccountRepository;
    private proxyRepository: MongoProxyRepository;
    private constructor() {
        this.accountRepository = new MongoSocialMediaAccountRepository();
        this.proxyRepository = new MongoProxyRepository();
        this.simulatorSet = SimulatorSet.getInstance();
    }

    public static getInstance(): SimulatorSetController {
        if (!SimulatorSetController.instance) {
            SimulatorSetController.instance = new SimulatorSetController();
        }
        return SimulatorSetController.instance;
    }

    getSimulators = async (req: Request, res: Response): Promise<void> => {
        try {
            const simulators = this.simulatorSet.listSimulators();
        res.status(200).json(simulators);
        return 
        } catch (error) {
            console.error(error,'error in getSimulators');
            res.status(500).json({ error: (error as Error).message });
        }
    }


    private async decryptPassword(encryptedPassword:string):Promise<string>{
        try{
          const decryptedPassword=crypto.publicDecrypt(fs.readFileSync('publickey.txt'),Buffer.from(encryptedPassword,'base64'))
          return decryptedPassword.toString('utf8')
        }catch(err){
          console.log(err,'err')
          return ''
        }
      }

    addSimulator = async (req: Request, res: Response): Promise<void> => {
        try {
            const {accountId,profileType}=req.body;
            console.log(accountId,profileType,'accountId and profileType');
        const account = await this.accountRepository.findById(accountId);
        const proxy = await this.proxyRepository.getProxyById(account?.proxy?.proxyId || '');
        if(!account) throw new Error("Account not found");

        //Desencriptar contraseña
        const decryptedPassword = await this.decryptPassword(account.password);
        console.log(decryptedPassword,'decryptedPassword');

        let socialMediaService: SocialMediaService;
        switch(account.type){
          case SocialMediaType.INSTAGRAM:
            socialMediaService = new InstagramService({...account,password:decryptedPassword},proxy ?? null);
            break;
          default:
            throw new Error('Invalid account type');
        }
  
        const geminiService = GeminiApiService.getInstance();
  
        const aiAgent = new AIAgent({
          aiService: geminiService
        });
        // Crear e iniciar el servicio de simulación
        const simulationService = new SimulationService(
          profileType || BehaviorProfileType.CASUAL, 
          socialMediaService,
          aiAgent,
          this.accountRepository
        );

       const newSimulator = this.simulatorSet.addSimulator(simulationService);

        res.status(200).json({
            simulatorId: newSimulator.socialMediaAccount.id,
            isRunning: newSimulator.isRunning
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const {simulatorId}=req.body;
            console.log(simulatorId,'simulatorId');
            const simulator = this.simulatorSet.getSimulator(simulatorId);
            if(!simulator) throw new Error("Simulator not found");
            await simulator.loginIn(true);
            res.status(200).json({message: "Simulator logged in"});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: (error as Error).message });
        }
    }

    removeSimulator = async (req: Request, res: Response): Promise<void> => {
        try {
            const {simulatorId}=req.body;
            const simulator = this.simulatorSet.getSimulator(simulatorId);
            if(!simulator) throw new Error("Simulator not found");
            this.simulatorSet.removeSimulator(simulator);
            responseCreator(res,{status:200,message:"Simulador eliminado correctamente"});
        } catch (error:any) {
            responseCreator(res,{status:500,message:"Error al eliminar el simulador:"+error.message});
        }
    }
}