import { Request, Response } from 'express';
import { Lead, LeadStatus } from '../../domain/entities/Lead';
import { MongoLeadRepository } from '../repositories/mongodb/MongoLeadRepository';
import { MongoSocialMediaAccountRepository } from '../repositories/mongodb/MongoSocialMediaAccountRepository';
import { InstagramSessionManager } from '../services/InstagramSessionManager';
import { responseCreator } from '../../application/utils/responseCreator';

export class LeadController {
  private leadRepository = new MongoLeadRepository();
  private accountRepository = new MongoSocialMediaAccountRepository();
  private sessionManager = InstagramSessionManager.getInstance();

  getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { status } = req.query;

      let leads: Lead[];

      if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
        leads = await this.leadRepository.findByStatus(status as LeadStatus);
      } else {
        leads = await this.leadRepository.find();
      }

      responseCreator(res,{message:'Leads obtenidos',status:200,data:leads})
      return
    } catch (error) {
      console.error('Error getting leads:', error);
      responseCreator(res,{message:'Error al obtener leads',status:500,data:error})
      return
    }
  };

  getLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;

      const lead = await this.leadRepository.findById(id);

      if (!lead) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      // Verificar que el lead pertenezca al usuario
      if (lead.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      res.status(200).json({
        lead
      });
    } catch (error) {
      console.error('Error getting lead:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  getLeadsByCampaignId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const leads = await this.leadRepository.findByCampaignId(id);
responseCreator(res,{message:'Leads obtenidos',status:200,data:leads})
return
    } catch (error) {
      console.error('Error getting leads by campaign id:', error);
      responseCreator(res,{message:'Error al obtener leads',status:500,data:error})
      return
    }
  }

  updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const updateData = req.body;

      // Verificar que el lead exista
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      // Verificar que el lead pertenezca al usuario
      if (lead.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // No permitir cambiar el userId o socialMediaId
      delete updateData.userId;
      delete updateData.socialMediaId;
      delete updateData.socialMediaType;

      const updatedLead = await this.leadRepository.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      res.status(200).json({
        message: 'Lead updated successfully',
        lead: updatedLead
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const { status } = req.body;

      // Verificar que el estado sea válido
      if (!Object.values(LeadStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      // Verificar que el lead exista
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      // Verificar que el lead pertenezca al usuario
      if (lead.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      const updatedLead = await this.leadRepository.updateStatus(id, status);

      res.status(200).json({
        message: 'Lead status updated successfully',
        lead: updatedLead
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;

      // Verificar que el lead exista
      const lead = await this.leadRepository.findById(id);
      if (!lead) {
        res.status(404).json({ message: 'Lead not found' });
        return;
      }

      // Verificar que el lead pertenezca al usuario
      if (lead.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      const deleted = await this.leadRepository.delete(id);

      if (deleted) {
        res.status(200).json({
          message: 'Lead deleted successfully'
        });
      } else {
        res.status(500).json({
          message: 'Failed to delete lead'
        });
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  searchLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { query } = req.params;

      const leads = await this.leadRepository.search(userId, query);

      res.status(200).json({
        leads
      });
    } catch (error) {
      console.error('Error searching leads:', error);
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