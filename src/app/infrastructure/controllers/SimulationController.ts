import { Request, Response } from 'express';
import { SocialMediaAccount, SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { MongoSocialMediaAccountRepository } from '../repositories/mongodb/MongoSocialMediaAccountRepository';
import { SimulationService } from '../../application/services/SimulationService';
import { BehaviorProfileType } from '../../infrastructure/simulation/behaviors/BehaviorProfile';
import { ActionPlan } from '../../infrastructure/simulation/actions/ActionTypes';
import { SocialMediaService } from '../../application/services/SocialMediaService';
import { InstagramService } from '../../application/services/InstagramService';
import { AIAgent } from '../../domain/services/AIAgent';
import { GeminiApiService } from '../services/GeminiService';

export class SimulationController {
  private accountRepository = new MongoSocialMediaAccountRepository();
  private activeSimulations: Map<string, SimulationService> = new Map();

  /**
   * Inicia una simulación con un plan de acciones
   */
  startSimulation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId, profileType, actionPlan } = req.body;
      const userId = (req.user as any).id;
      
      // Verificar que la cuenta exista y pertenezca al usuario
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }
      
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }
      
      // Verificar que no haya una simulación activa para esta cuenta
      if (this.activeSimulations.has(accountId)) {
        res.status(400).json({ message: 'A simulation is already running for this account' });
        return;
      }
      
      // Validar el plan de acciones
      if (!this.validateActionPlan(actionPlan)) {
        res.status(400).json({ message: 'Invalid action plan' });
        return;
      }
      
      let socialMediaService: SocialMediaService;
      switch(account.type){
        case SocialMediaType.INSTAGRAM:
          socialMediaService = new InstagramService(account);
          break;
        default:
          throw new Error('Invalid account type');
      }

      const geminiService = new GeminiApiService();

      const aiAgent = new AIAgent({
        aiService: geminiService
      });
      // Crear e iniciar el servicio de simulación
      const simulationService = new SimulationService(
        profileType || BehaviorProfileType.CASUAL,
        socialMediaService,
        aiAgent
      );
      
      this.activeSimulations.set(accountId, simulationService);
      
      // Iniciar la simulación en segundo plano
      simulationService.startSimulation(actionPlan)
        .then(async (leads) => {
          console.log(`Simulation completed for account ${accountId}. Collected ${leads.length} leads.`);
          await this.accountRepository.update(accountId, { sessionData: account.sessionData });
          this.activeSimulations.delete(accountId);
        })
        .catch(error => {
          console.error(`Simulation error for account ${accountId}:`, error);
          this.activeSimulations.delete(accountId);
        });
      
      res.status(200).json({ 
        message: 'Simulation started successfully',
        simulationId: accountId
      });
    } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  /**
   * Detiene una simulación en curso
   */
  stopSimulation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { simulationId } = req.params;
      const userId = (req.user as any).id;
      
      // Verificar que la cuenta exista y pertenezca al usuario
      const account = await this.accountRepository.findById(simulationId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }
      
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }
      
      // Verificar que haya una simulación activa para esta cuenta
      const simulation = this.activeSimulations.get(simulationId);
      if (!simulation) {
        res.status(404).json({ message: 'No active simulation found for this account' });
        return;
      }
      
      // Detener la simulación
      simulation.stopSimulation();
      this.activeSimulations.delete(simulationId);
      
      res.status(200).json({ message: 'Simulation stopped successfully' });
    } catch (error) {
      console.error('Error stopping simulation:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  /**
   * Obtiene el estado de las simulaciones activas
   */
  getActiveSimulations = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      
      // Obtener todas las cuentas del usuario
      const accounts = await this.accountRepository.findByUserId(userId);
      
      // Filtrar las cuentas con simulaciones activas
      const activeSimulations = accounts
        .filter(account => this.activeSimulations.has(account.id!))
        .map(account => ({
          accountId: account.id,
          username: account.username,
          type: account.type,
          startedAt: new Date() // Idealmente, guardaríamos la hora de inicio
        }));
      
      res.status(200).json({ 
        activeSimulations,
        count: activeSimulations.length
      });
    } catch (error) {
      console.error('Error getting active simulations:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  /**
   * Valida un plan de acciones
   */
  private validateActionPlan(actionPlan: ActionPlan): boolean {
    if (!actionPlan || !actionPlan.actions || !Array.isArray(actionPlan.actions) || actionPlan.actions.length === 0) {
      return false;
    }
    
    // Verificar que al menos una acción tenga un objetivo válido
    if (!actionPlan.targetUsername && !actionPlan.targetPostUrl && !actionPlan.targetHashtag) {
      return false;
    }
    
    return true;
  }
} 