import { Request, Response } from 'express';
import { SocialMediaAccount, SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { MongoSocialMediaAccountRepository } from '../repositories/mongodb/MongoSocialMediaAccountRepository';
import { appConfig } from '../config/app-config';
import { InstagramSessionManager } from '../services/InstagramSessionManager';

export class SocialMediaAccountController {
  private accountRepository = new MongoSocialMediaAccountRepository();
  private sessionManager = InstagramSessionManager.getInstance();

  createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, username, password } = req.body;
      const userId = (req.user as any).id;
      const instanceId = process.env.INSTANCE_ID || 'default-instance'; // Identificador de la instancia

      // Validar el tipo de red social
      if (!Object.values(SocialMediaType).includes(type)) {
        res.status(400).json({ message: 'Invalid social media type' });
        return;
      }

      // Verificar si ya existe una cuenta con ese username para esa instancia
      const existingAccount = await this.accountRepository.findByInstanceIdAndUsername(
        instanceId, 
        username, 
        type as SocialMediaType
      );
      
      if (existingAccount) {
        res.status(400).json({ 
          message: `An account with username ${username} already exists for ${type}` 
        });
        return;
      }

      // Verificar límites de cuentas por plataforma para esta instancia
      const instanceAccounts = await this.accountRepository.findByInstanceId(instanceId);
      const accountsOfType = instanceAccounts.filter(account => account.type === type);
      
      if (accountsOfType.length >= appConfig.accountLimits[type as keyof typeof appConfig.accountLimits]) {
        res.status(400).json({ 
          message: `This instance has reached the maximum number of ${type} accounts (${appConfig.accountLimits[type as keyof typeof appConfig.accountLimits]})` 
        });
        return;
      }

      // Crear la cuenta vinculada a la instancia, no al usuario
      const account: SocialMediaAccount = {
        userId,
        instanceId, // Vinculamos a la instancia, no solo al usuario
        type: type as SocialMediaType,
        username,
        password,
        isActive: true,
        createdAt: new Date()
      };

      const createdAccount = await this.accountRepository.create(account);

      // No devolver la contraseña en la respuesta
      const { password: _, ...accountWithoutPassword } = createdAccount;

      res.status(201).json({
        message: 'Social media account created successfully',
        account: accountWithoutPassword
      });
    } catch (error) {
      console.error('Error creating social media account:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const instanceId = process.env.INSTANCE_ID || 'default-instance';
      
      // Obtener cuentas de la instancia actual
      const accounts = await this.accountRepository.findByInstanceId(instanceId);
      
      // Filtrar información sensible
      const safeAccounts = accounts.map(account => {
        const { password, sessionData, ...safeAccount } = account;
        return safeAccount;
      });

      res.status(200).json({
        accounts: safeAccounts
      });
    } catch (error) {
      console.error('Error getting social media accounts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  getAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const instanceId = process.env.INSTANCE_ID || 'default-instance';

      const account = await this.accountRepository.findById(id);

      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca a la instancia actual
      if (account.instanceId !== instanceId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // No devolver información sensible
      const { password, sessionData, ...safeAccount } = account;

      res.status(200).json({
        account: safeAccount
      });
    } catch (error) {
      console.error('Error getting social media account:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  updateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const updateData = req.body;
      const instanceId = process.env.INSTANCE_ID || 'default-instance';

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(id);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca a la instancia actual
      if (account.instanceId !== instanceId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // No permitir cambiar el tipo de cuenta o la instancia
      delete updateData.type;
      delete updateData.instanceId;

      // Actualizar la cuenta
      const updatedAccount = await this.accountRepository.update(id, updateData);

      // No devolver información sensible
      const { password, sessionData, ...safeAccount } = updatedAccount!;

      res.status(200).json({
        message: 'Account updated successfully',
        account: safeAccount
      });
    } catch (error) {
      console.error('Error updating social media account:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const instanceId = process.env.INSTANCE_ID || 'default-instance';

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(id);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca a la instancia actual
      if (account.instanceId !== instanceId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      // Cerrar sesión si es una cuenta de Instagram
      if (account.type === SocialMediaType.INSTAGRAM) {
        await this.sessionManager.closeSession(id);
      }

      // Eliminar la cuenta
      const deleted = await this.accountRepository.delete(id);
      if (!deleted) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      res.status(200).json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting social media account:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  testConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.user as any).id;
      const { id } = req.params;
      const instanceId = process.env.INSTANCE_ID || 'default-instance';

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(id);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // Verificar que la cuenta pertenezca a la instancia actual
      if (account.instanceId !== instanceId) {
        res.status(403).json({ message: 'Unauthorized' });
        return;
      }

      let success = false;
      let message = '';

      // Probar conexión según el tipo de cuenta
      switch (account.type) {
        case SocialMediaType.INSTAGRAM:
          try {
            const instagramService = await this.sessionManager.getService(account);
            const currentUser = await instagramService.getCurrentUser();
            success = true;
            message = `Successfully connected to Instagram as ${currentUser.username}`;
          } catch (error) {
            message = 'Failed to connect to Instagram';
          }
          break;
        
        // Implementar otros tipos de redes sociales cuando estén disponibles
        default:
          message = `Testing connection for ${account.type} is not implemented yet`;
      }

      res.status(200).json({
        success,
        message
      });
    } catch (error) {
      console.error('Error testing social media connection:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
}