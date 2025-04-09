import { Request, Response } from 'express';
import { SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { MongoSocialMediaAccountRepository } from '../repositories/mongodb/MongoSocialMediaAccountRepository';
import { MongoLeadRepository } from '../repositories/mongodb/MongoLeadRepository';
import { InstagramSessionManager } from '../services/InstagramSessionManager';

export class InstagramController {
  private accountRepository = new MongoSocialMediaAccountRepository(); 
  private leadRepository = new MongoLeadRepository();
  private sessionManager = InstagramSessionManager.getInstance();

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.body;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca al usuario
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Verificar que la cuenta sea de Instagram
      if (account.type !== SocialMediaType.INSTAGRAM) {
        res.status(400).json({ message: 'Account is not an Instagram account' });
        return;
      }

      // Iniciar sesión en Instagram usando el gestor de sesiones
      try {
        await this.sessionManager.getService(account);
        
        // Actualizar la fecha de último login
        await this.accountRepository.update(accountId, {
          lastLogin: new Date(),
          isActive: true
        });

        res.status(200).json({
          message: 'Successfully logged in to Instagram'
        });
      } catch (error) {
        res.status(401).json({ message: 'Failed to login to Instagram' });
      }
    } catch (error) {
      console.error('Error logging in to Instagram:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.body;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca al usuario
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Cerrar la sesión
      const success = await this.sessionManager.closeSession(accountId);

      if (success) {
        res.status(200).json({
          message: 'Successfully logged out from Instagram'
        });
      } else {
        res.status(400).json({
          message: 'No active session found or logout failed'
        });
      }
    } catch (error) {
      console.error('Error logging out from Instagram:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.body;
      const { username } = req.params;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca al usuario
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Verificar que la cuenta sea de Instagram
      if (account.type !== SocialMediaType.INSTAGRAM) {
        res.status(400).json({ message: 'Account is not an Instagram account' });
        return;
      }

      // Obtener el servicio de Instagram con la sesión activa
      try {
        const instagramService = await this.sessionManager.getService(account);
        const profile = await instagramService.getUserProfile(username);

        res.status(200).json({
          profile
        });
      } catch (error) {
        res.status(401).json({ message: 'Failed to access Instagram' });
      }
    } catch (error) {
      console.error('Error getting Instagram profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  getUserPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { accountId } = req.body;
      const { username } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca al usuario
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Verificar que la cuenta sea de Instagram
      if (account.type !== SocialMediaType.INSTAGRAM) {
        res.status(400).json({ message: 'Account is not an Instagram account' });
        return;
      }

      // Obtener los posts del usuario
      try {
        const instagramService = await this.sessionManager.getService(account);
        const posts = await instagramService.getUserPosts(username, limit);

        res.status(200).json({
          posts
        });
      } catch (error) {
        res.status(401).json({ message: 'Failed to access Instagram' });
      }
    } catch (error) {
      console.error('Error getting Instagram posts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  extractLeadsFromFollowers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { accountId, username, limit } = req.body;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca al usuario
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Verificar que la cuenta sea de Instagram
      if (account.type !== SocialMediaType.INSTAGRAM) {
        res.status(400).json({ message: 'Account is not an Instagram account' });
        return;
      }

      // Extraer leads de los seguidores
      try {
        const instagramService = await this.sessionManager.getService(account);
        const leads = await instagramService.extractLeadsFromFollowers(username, limit);

        // Guardar los leads en la base de datos
        const savedLeads = await Promise.all(
          leads.map(lead => this.leadRepository.create(lead))
        );

        res.status(200).json({
          message: `Successfully extracted ${savedLeads.length} leads from followers`,
          leads: savedLeads
        });
      } catch (error) {
        res.status(401).json({ message: 'Failed to access Instagram' });
      }
    } catch (error) {
      console.error('Error extracting leads from followers:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  extractLeadsFromLikes = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { accountId, postId, limit } = req.body;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca al usuario
      if (account.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Verificar que la cuenta sea de Instagram
      if (account.type !== SocialMediaType.INSTAGRAM) {
        res.status(400).json({ message: 'Account is not an Instagram account' });
        return;
      }

      // Extraer leads de los likes
      try {
        const instagramService = await this.sessionManager.getService(account);
        const leads = await instagramService.extractLeadsFromLikes(postId, limit);

        // Guardar los leads en la base de datos
        const savedLeads = await Promise.all(
          leads.map(lead => this.leadRepository.create(lead))
        );

        res.status(200).json({
          message: `Successfully extracted ${savedLeads.length} leads from likes`,
          leads: savedLeads
        });
      } catch (error) {
        res.status(401).json({ message: 'Failed to access Instagram' });
      }
    } catch (error) {
      console.error('Error extracting leads from likes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
} 