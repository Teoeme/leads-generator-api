import axios from 'axios';
import { ProxyConfiguration, ProxyStatus } from '../../../domain/entities/Proxy/ProxyConfiguration';
import { ProxyRepository } from '../../../domain/repositories/ProxyRepository';
import { ProxyConfigurationModel } from './schemas/ProxyConfigurationSchema';

// Definición básica para configuración de Axios (ya que los tipos exactos no están disponibles)
interface AxiosProxyConfig {
  host: string;
  port: number;
  protocol: string;
  auth?: {
    username: string;
    password: string;
  };
}

interface AxiosConfig {
  timeout?: number;
  proxy?: AxiosProxyConfig;
}

export class MongoProxyRepository implements ProxyRepository {
  async getProxies(filter?: Partial<ProxyConfiguration>): Promise<ProxyConfiguration[]> {
    try {
      const mongooseFilter = filter ? { ...filter } : {};
      const proxies = await ProxyConfigurationModel.find(mongooseFilter);
      
      return proxies.map(proxy => this.mapToEntity(proxy));
    } catch (error) {
      console.error('Error fetching proxies:', error);
      throw error;
    }
  }

  async getProxyById(id: string): Promise<ProxyConfiguration | null> {
    try {
      if(!id) return null;
      const proxy = await ProxyConfigurationModel.findById(id);
      if(!proxy) return null;
      return this.mapToEntity(proxy);
    } catch (error) {
      console.error(`Error fetching proxy with ID ${id}:`, error);
      throw error;
    }
  }

  async createProxy(proxy: ProxyConfiguration): Promise<ProxyConfiguration> {
    try {
      const newProxy = new ProxyConfigurationModel(proxy);
      await newProxy.save();
      return this.mapToEntity(newProxy);
    } catch (error) {
      console.error('Error creating proxy:', error);
      throw error;
    }
  }

  async updateProxy(id: string, proxy: Partial<ProxyConfiguration>): Promise<ProxyConfiguration | null> {
    try {
      const updatedProxy = await ProxyConfigurationModel.findByIdAndUpdate(
        id,
        { $set: proxy },
        { new: true }
      );
      
      return updatedProxy ? this.mapToEntity(updatedProxy) : null;
    } catch (error) {
      console.error(`Error updating proxy with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteProxy(id: string): Promise<boolean> {
    try {
      const result = await ProxyConfigurationModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error(`Error deleting proxy with ID ${id}:`, error);
      throw error;
    }
  }

  async checkProxyStatus(id: string): Promise<{ 
    success: boolean;
    message: string;
    ip?: string;
    country?: string;
    responseTime?: number;
  }> {
    try {
      // Buscar el proxy en la base de datos
      const proxy = await ProxyConfigurationModel.findById(id);
      if (!proxy) {
        throw new Error(`Proxy with ID ${id} not found`);
      }

      // Construir la URL del proxy
      let proxyUrl = '';
      if (proxy.username && proxy.password) {
        proxyUrl = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.server}`;
      } else {
        proxyUrl = `${proxy.protocol}://${proxy.server}`;
      }
      console.log(proxyUrl,'proxyUrl')
      // Variables para la respuesta
      const statusResponse = {
        success: false,
        message: '',
        ip: '',
        country: '',
        responseTime: 0
      };

      // Registro del tiempo de inicio
      const startTime = Date.now();

      try {
        // Configuración para Axios con proxy
        const axiosConfig: AxiosConfig = {
          timeout: 10000  // 10 segundos de timeout
        };
        
        // Configurar proxy manualmente para hacer la solicitud a través de Http-Proxy-Agent
        const [host, portStr] = proxy.server.split(':');
        const port = parseInt(portStr, 10);
        
        if (proxy.protocol === 'http' || proxy.protocol === 'https') {
          // @ts-ignore - Axios tiene soporte para proxy pero TypeScript no lo reconoce correctamente
          axiosConfig.proxy = {
            host,
            port,
            protocol: proxy.protocol,
            auth: proxy.username && proxy.password ? {
              username: proxy.username,
              password: proxy.password
            } : undefined
          };
        }
        
        // Intentar conexión a través del servicio de verificación de IP
        const response = await axios.get('https://api.ipify.org?format=json', axiosConfig);

        // Calcular tiempo de respuesta
        const responseTime = Date.now() - startTime;
        statusResponse.responseTime = responseTime;
        
        // Obtener la IP detectada
        if (response.data && typeof response.data === 'object' && 'ip' in response.data) {
          statusResponse.ip = response.data.ip as string;
          
          // Intentar obtener información del país
          try {
            const geoResponse = await axios.get(`https://ipinfo.io/${statusResponse.ip}/json`, {
              timeout: 5000
            });
            
            if (geoResponse.data && typeof geoResponse.data === 'object' && 'country' in geoResponse.data) {
              statusResponse.country = geoResponse.data.country as string;
            }
          } catch (geoError) {
            console.error('Error fetching geolocation info:', geoError);
          }
        }

        statusResponse.success = true;
        statusResponse.message = `Proxy OK. Response time: ${responseTime}ms`;

        // Actualizar el proxy con la información recopilada
        await ProxyConfigurationModel.findByIdAndUpdate(id, {
          status: ProxyStatus.ACTIVE,
          lastChecked: new Date(),
          ip: statusResponse.ip,
          country: statusResponse.country || proxy.country,
          responseTime: statusResponse.responseTime,
          successRate: proxy.successRate ? ((proxy.successRate * 9 + 100) / 10) : 100 // Media ponderada (90% valor anterior + 10% nuevo valor)
        });

      } catch (error: unknown) {
        console.error('Error checking proxy status:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        statusResponse.success = false;
        statusResponse.message = `Proxy check failed: ${errorMessage}`;
        statusResponse.responseTime = Date.now() - startTime;
        
        // Actualizar el proxy como inactivo
        await ProxyConfigurationModel.findByIdAndUpdate(id, {
          status: ProxyStatus.BLOCKED,
          lastChecked: new Date(),
          responseTime: statusResponse.responseTime,
          successRate: proxy.successRate ? ((proxy.successRate * 9) / 10) : 0 // Reducir tasa de éxito
        });
      }

      return statusResponse;
    } catch (error) {
      console.error(`Error checking proxy status for ID ${id}:`, error);
      throw error;
    }
  }

  async incrementUsageCount(id: string): Promise<void> {
    try {
      await ProxyConfigurationModel.findByIdAndUpdate(
        id,
        { $inc: { usageCount: 1 } }
      );
    } catch (error) {
      console.error(`Error incrementing usage count for proxy ID ${id}:`, error);
      throw error;
    }
  }

  async getAvailableProxies(): Promise<ProxyConfiguration[]> {
    try {
      const proxies = await ProxyConfigurationModel.find({
        status: ProxyStatus.ACTIVE
      }).sort({ usageCount: 1, responseTime: 1 });
      
      return proxies.map(proxy => this.mapToEntity(proxy));
    } catch (error) {
      console.error('Error fetching available proxies:', error);
      throw error;
    }
  }

  // Método para mapear documentos MongoDB a entidades de dominio
  private mapToEntity(document: any): ProxyConfiguration {
    return {
      id: document._id.toString(),
      name: document.name,
      server: document.server,
      username: document.username,
      password: document.password,
      protocol: document.protocol,
      status: document.status,
      country: document.country,
      lastChecked: document.lastChecked,
      ip: document.ip,
      responseTime: document.responseTime,
      successRate: document.successRate,
      notes: document.notes,
      tags: document.tags,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      usageCount: document.usageCount
    };
  }
} 