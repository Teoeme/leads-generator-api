import React from 'react';
import { Log } from '../../hooks/useLogs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { Card, CardBody, Chip, Button, Divider } from '@heroui/react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

// Configuración de dayjs para tiempo relativo y locale español
dayjs.extend(relativeTime);
dayjs.locale('es');

interface LogRowProps {
  log: Log;
}

const LogRow: React.FC<LogRowProps> = ({ log }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Formatear la fecha para mostrarla hace cuánto tiempo ocurrió
  const formattedTime = React.useMemo(() => {
    try {
      return dayjs(log.metadata?.timestamp).fromNow();
    } catch {
      return log.metadata?.timestamp;
    }
  }, [log.metadata?.timestamp]);

  // Colores según el nivel del log
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'danger';
      case 'warn':
        return 'warning';
      case 'info':
        return 'primary';
      case 'debug':
        return 'default';
      default:
        return 'default';
    }
  };

  // Accediendo a metadata (backend) o context (frontend para compatibilidad)
  const metadata = log.metadata || log.context || {};

  return (
    <Card 
      className="mb-2"
      shadow="sm"
    >
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Chip 
                  color={getLevelColor(log.level) as any} 
                  variant="flat" 
                  size="sm"
                  className="uppercase font-bold"
                >
                  {log.level}
                </Chip>
                <span className="ml-2 text-xs text-gray-500">
                  {formattedTime}
                </span>
              </div>
              
              <div className="flex gap-2">
                {metadata.event && (
                  <Chip 
                    color="secondary"
                    variant="flat"
                    size="sm"
                  >
                    {metadata.event}
                  </Chip>
                )}
                
                {metadata.socialMediaType && (
                  <Chip 
                    color="success"
                    variant="flat"
                    size="sm"
                  >
                    {metadata.socialMediaType}
                  </Chip>
                )}

                <Button 
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <FiChevronUp className="h-4 w-4" />
                  ) : (
                    <FiChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm break-words">
              {log.message}
            </p>
          </div>
        </div>
        
        {isOpen && (
        
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {metadata && Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500">
                      {key}:
                    </span>
                    <span className="text-sm break-words">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                    <Divider className="mt-1" />
                  </div>
                ))}
                
           
            
              </div>
        
        )}
      </CardBody>
    </Card>
  );
};

export default LogRow; 