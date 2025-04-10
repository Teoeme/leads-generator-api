import { Request, Response } from 'express';
import { ProxyRepository } from '../../domain/repositories/ProxyRepository';
import { MongoProxyRepository } from '../../infrastructure/repositories/mongodb/MongoProxyRepository';
import { ProxyProtocol, ProxyStatus } from '../../domain/entities/Proxy/ProxyConfiguration';
import { responseCreator } from '../utils/responseCreator';

export class ProxyController {
  private proxyRepository: ProxyRepository;

  constructor() {
    this.proxyRepository = new MongoProxyRepository();
  }

  /**
   * Obtener todos los proxies
   */
  public getProxies = async (req: Request, res: Response): Promise<void> => {
    try {
      // Filtros opcionales de la consulta
      const filters: any = {};
      
      if (req.query.status) {
        filters.status = req.query.status;
      }
      
      if (req.query.country) {
        filters.country = req.query.country;
      }
      
      if (req.query.protocol) {
        filters.protocol = req.query.protocol;
      }
      
      const proxies = await this.proxyRepository.getProxies(filters);
      res.status(200).json(proxies);
    } catch (error) {
      console.error('Error fetching proxies:', error);
      res.status(500).json({ message: 'Error al obtener proxies', error });
    }
  };

  /**
   * Obtener proxy por ID
   */
  public getProxyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const proxy = await this.proxyRepository.getProxyById(id);
      
      if (!proxy) {
        res.status(404).json({ message: `Proxy con ID ${id} no encontrado` });
        return;
      }
      
      res.status(200).json(proxy);
    } catch (error) {
      console.error(`Error fetching proxy ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error al obtener proxy', error });
    }
  };

  /**
   * Crear nuevo proxy
   */
  public createProxy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, server, username, password, protocol, status, country, notes, tags } = req.body;
      
      // Validar campos requeridos
      if (!name || !server) {
        res.status(400).json({ message: 'El nombre y servidor son requeridos' });
        return;
      }
      
      // Crear proxy con valores predeterminados
      const newProxy = {
        name,
        server,
        username,
        password,
        protocol: protocol || ProxyProtocol.HTTP,
        status: status || ProxyStatus.INACTIVE,
        country,
        notes,
        tags,
        usageCount: 0,
        createdAt: new Date()
      };
      
      const createdProxy = await this.proxyRepository.createProxy(newProxy);
      res.status(201).json(createdProxy);
    } catch (error) {
      console.error('Error creating proxy:', error);
      res.status(500).json({ message: 'Error al crear proxy', error });
    }
  };

  /**
   * Actualizar proxy existente
   */
  public updateProxy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, server, username, password, protocol, status, country, notes, tags } = req.body;
      
      // Validar que al menos un campo esté presente
      if (!Object.keys(req.body).length) {
        res.status(400).json({ message: 'No se han proporcionado datos para actualizar' });
        return;
      }
      
      // Crear objeto de actualización
      const updates = {
        ...(name && { name }),
        ...(server && { server }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
        ...(protocol && { protocol }),
        ...(status && { status }),
        ...(country !== undefined && { country }),
        ...(notes !== undefined && { notes }),
        ...(tags && { tags }),
        updatedAt: new Date()
      };
      
      const updatedProxy = await this.proxyRepository.updateProxy(id, updates);
      
      if (!updatedProxy) {
        res.status(404).json({ message: `Proxy con ID ${id} no encontrado` });
        return;
      }
      
      res.status(200).json(updatedProxy);
    } catch (error) {
      console.error(`Error updating proxy ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error al actualizar proxy', error });
    }
  };

  /**
   * Eliminar proxy
   */
  public deleteProxy = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.proxyRepository.deleteProxy(id);
      
      if (!success) {
        res.status(404).json({ message: `Proxy con ID ${id} no encontrado` });
        return;
      }
      
      res.status(200).json({ message: 'Proxy eliminado correctamente' });
    } catch (error) {
      console.error(`Error deleting proxy ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error al eliminar proxy', error });
    }
  };

  /**
   * Verificar el estado de un proxy
   */
  public checkProxyStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(id)
      if(!id){
        throw new Error('El ID del proxy es requerido');
    }
      const result = await this.proxyRepository.checkProxyStatus(id);
      const proxyDocument=await this.proxyRepository.getProxyById(id);
      if(result.success){
  if(proxyDocument){
    proxyDocument.status=result.success ? ProxyStatus.ACTIVE : ProxyStatus.INACTIVE;
    proxyDocument.country=result.country;
    proxyDocument.ip=result.ip;
    proxyDocument.responseTime=result.responseTime;
    proxyDocument.lastChecked=new Date();

    await this.proxyRepository.updateProxy(id,proxyDocument);
  }

}

      responseCreator(res, {status:200, message : `Estado del proxy verificado`,data:proxyDocument});
    } catch (error) {
      console.error(`Error checking proxy status ${req.params.id}:`, error);
        responseCreator(res, {status:500, message : `Error al verificar el estado del proxy`,data:error});
    }
  };

  /**
   * Obtener proxies disponibles
   */
  public getAvailableProxies = async (req: Request, res: Response): Promise<void> => {
    try {
      const proxies = await this.proxyRepository.getAvailableProxies();
      res.status(200).json(proxies);
    } catch (error) {
      console.error('Error fetching available proxies:', error);
      res.status(500).json({ message: 'Error al obtener proxies disponibles', error });
    }
  };
} 