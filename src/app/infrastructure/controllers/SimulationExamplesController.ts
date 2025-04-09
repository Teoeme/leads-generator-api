/**
 * Controlador para ejemplos de simulación
 */
import { Request, Response } from 'express';
import { MongoSocialMediaAccountRepository } from '../repositories/mongodb/MongoSocialMediaAccountRepository';
import { SimulationController } from './SimulationController';
import { BehaviorProfileType } from '../simulation/behaviors/BehaviorProfile';
import { 
  exploreFollowersPlan, 
  exploreHashtagPlan, 
  interactWithPostPlan, 
  exploreProfilePlan 
} from '../simulation/examples/ActionPlanExamples';

export class SimulationExamplesController {
  private accountRepository = new MongoSocialMediaAccountRepository();
  private simulationController = new SimulationController();

  /**
   * Inicia una simulación de ejemplo para explorar seguidores
   */
  startFollowersExample = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId, username, profileType } = req.body;
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
      
      // Crear plan de acción
      const actionPlan = exploreFollowersPlan(username);
      
      // Iniciar simulación
      await this.simulationController.startSimulation({
        ...req,
        body: {
          accountId,
          profileType: profileType || BehaviorProfileType.CASUAL,
          actionPlan
        }
      } as Request, res);
    } catch (error) {
      console.error('Error starting followers example:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  /**
   * Inicia una simulación de ejemplo para explorar un hashtag
   */
  startHashtagExample = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId, hashtag, profileType } = req.body;
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
      
      // Crear plan de acción
      const actionPlan = exploreHashtagPlan(hashtag);
      
      // Iniciar simulación
      await this.simulationController.startSimulation({
        ...req,
        body: {
          accountId,
          profileType: profileType || BehaviorProfileType.SOCIAL,
          actionPlan
        }
      } as Request, res);
    } catch (error) {
      console.error('Error starting hashtag example:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  /**
   * Inicia una simulación de ejemplo para interactuar con un post
   */
  startPostInteractionExample = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId, postUrl, profileType } = req.body;
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
      
      // Crear plan de acción
      const actionPlan = interactWithPostPlan(postUrl);
      
      // Iniciar simulación
      await this.simulationController.startSimulation({
        ...req,
        body: {
          accountId,
          profileType: profileType || BehaviorProfileType.CASUAL,
          actionPlan
        }
      } as Request, res);
    } catch (error) {
      console.error('Error starting post interaction example:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  /**
   * Inicia una simulación de ejemplo para explorar un perfil
   */
  startProfileExplorationExample = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId, username, profileType } = req.body;
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
      
      // Crear plan de acción
      const actionPlan = exploreProfilePlan(username);
      
      // Iniciar simulación
      await this.simulationController.startSimulation({
        ...req,
        body: {
          accountId,
          profileType: profileType || BehaviorProfileType.PROFESSIONAL,
          actionPlan
        }
      } as Request, res);
    } catch (error) {
      console.error('Error starting profile exploration example:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
} 