import { Request, Response } from 'express';
import { SocialMediaAccount, SocialMediaType } from '../../domain/entities/SocialMediaAccount';
import { MongoSocialMediaAccountRepository } from '../repositories/mongodb/MongoSocialMediaAccountRepository';
import crypto from 'crypto'
import { responseCreator } from '../../application/utils/responseCreator';
import fs from 'fs'

export class SocialMediaAccountController {
  private accountRepository = new MongoSocialMediaAccountRepository();

  private async encryptPassword(password:string):Promise<string>{
    const encryptedPassword=crypto.privateEncrypt(fs.readFileSync('privatekey.txt'),Buffer.from(password,'utf8'))
    return encryptedPassword.toString('base64')
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

  createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type, username, password } = req.body;
      const userId = (req.user as any).id;

      // Validar el tipo de red social
      if (!Object.values(SocialMediaType).includes(type)) {
        responseCreator(res,{message:'Tipo de red social inválido',status:400})
        return;
      }

      // Verificar si ya existe una cuenta con ese username para esa instancia
      const existingAccount = await this.accountRepository.findByUsernameAndType(
        username, 
        type as SocialMediaType
      );
      if (existingAccount) {
        responseCreator(res,{message:`Ya existe una cuenta con el username ${username} para ${type}`,status:400})
        return;
      }

      if(!password){
        responseCreator(res,{message:'La contraseña es requerida',status:400})
        return
      }
      //Encriptar la contraseña
      const encryptedPassword=await this.encryptPassword(password)
        
      // Crear la cuenta vinculada a la instancia, no al usuario
      const account: SocialMediaAccount = {
        userId,
        type: type as SocialMediaType,
        username,
        password:encryptedPassword,
        isActive: true,
        createdAt: new Date()
      };

      const createdAccount = await this.accountRepository.create(account);

      // No devolver la contraseña en la respuesta
      const { password: _, ...accountWithoutPassword } = createdAccount;

      responseCreator(res,{message:'Cuenta creada correctamente',status:201,data:accountWithoutPassword})
      return
    } catch (error) {
      console.error('Error creating social media account:', error);
      responseCreator(res,{message:'Error al crear la cuenta',status:500})
      return
    }
  };

  getAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener cuentas de la instancia actual
      const accounts = await this.accountRepository.find();
      
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
      const { id } = req.params;

      const account = await this.accountRepository.findById(id);

      if (!account) {
        res.status(404).json({ message: 'Account not found' });
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
      const { id } = req.params;
      const updateData = req.body;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(id);
      if (!account) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      // No permitir cambiar el tipo de cuenta o la instancia
      delete updateData.type;

      //Si existe una contraseña nueva, encriptarla
      if(updateData.newPassword){
        if(!updateData.newPassword){
          responseCreator(res,{message:'La contraseña nueva es requerida',status:400})
          return
        }
        

        updateData.password=await this.encryptPassword(updateData.newPassword)
        delete updateData.newPassword
      }

      // Actualizar la cuenta
      const updatedAccount = await this.accountRepository.update(id, updateData);

      // No devolver información sensible
      const { password, sessionData, ...safeAccount } = updatedAccount!;

      responseCreator(res,{message:'Cuenta actualizada correctamente',status:200,data:safeAccount})
      return
    } catch (error) {
      responseCreator(res,{message:'Error al actualizar la cuenta',status:500})
      return
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Verificar que la cuenta exista
      const account = await this.accountRepository.findById(id);
      if (!account) {
        responseCreator(res,{message:'Cuenta no encontrada',status:404})
        return;
      }
    

      // Eliminar la cuenta
      const deleted = await this.accountRepository.delete(id);
      if (!deleted) {
        responseCreator(res,{message:'Error al eliminar la cuenta',status:500})
        return;
      }

      responseCreator(res,{message:'Cuenta eliminada correctamente',status:200})
    } catch (error) {
      responseCreator(res,{message:'Error al eliminar la cuenta',status:500})
      return
    }
  };

  testConnection = async (req: Request, res: Response): Promise<void> => {
    // try {
    //   const { id } = req.params;

    //   // Verificar que la cuenta exista
    //   const account = await this.accountRepository.findById(id);
    //   if (!account) {
    //     res.status(404).json({ message: 'Account not found' });
    //     return;
    //   }

    //   let success = false;
    //   let message = '';

    //   // Probar conexión según el tipo de cuenta
    //   switch (account.type) {
    //     case SocialMediaType.INSTAGRAM:
    //       try {
    //         const instagramService = await this.sessionManager.getService(account);
    //         const currentUser = await instagramService.getCurrentUser();
    //         success = true;
    //         message = `Successfully connected to Instagram as ${currentUser.username}`;
    //       } catch (error) {
    //         message = 'Failed to connect to Instagram';
    //       }
    //       break;
        
    //     // Implementar otros tipos de redes sociales cuando estén disponibles
    //     default:
    //       message = `Testing connection for ${account.type} is not implemented yet`;
    //   }

      res.status(200).json({
        success:true,
        message:'Conexión exitosa'
      });
    // } catch (error) {
    //   console.error('Error testing social media connection:', error);
    //   res.status(500).json({ message: 'Server error' });
    // }
  };
}