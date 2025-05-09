import React, { useState, useEffect } from 'react';
import { LogFilters as FiltersType } from '../../hooks/useLogs';
import { Card, CardHeader, CardBody, Button, Input, Select, SelectItem } from '@heroui/react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface LogFiltersProps {
  filters: FiltersType;
  onUpdateFilters: (filters: Partial<FiltersType>) => void;
  onRefresh: () => void;
  showCampaignFilter?: boolean;
  showInterventionFilter?: boolean;
  showSimulatorFilter?: boolean;
}

const LogFilters: React.FC<LogFiltersProps> = ({
  filters,
  onUpdateFilters,
  onRefresh,
  showCampaignFilter = true,
  showInterventionFilter = true,
  showSimulatorFilter = true
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<FiltersType>>({});
  const [expanded, setExpanded] = useState(false);

  // Inicializar localFilters con los valores actuales de filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (name: string, value: string) => {
    // Manejar campos de fecha
    if (name === 'startDate' || name === 'endDate') {
      if (value) {
        setLocalFilters(prev => ({
          ...prev,
          [name]: new Date(value)
        }));
      } else {
        // Si se borra el campo, eliminar el filtro
        const newFilters = { ...localFilters };
        delete newFilters[name as keyof FiltersType];
        setLocalFilters(newFilters);
      }
    } else {
      // Para otros campos
      setLocalFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleApplyFilters = () => {
    onUpdateFilters(localFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onUpdateFilters({
      level: undefined,
      campaignId: undefined,
      interventionId: undefined,
      simulatorId: undefined,
      socialMediaType: undefined,
      event: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader 
        className="flex justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-medium">Filtros de logs</h3>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </CardHeader>
      
      {expanded && (
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Filtro de nivel */}
            <div>
              <Select
                label="Nivel"
                name="level"
                selectedKeys={localFilters.level ? [localFilters.level] : []}
                onChange={(e) => handleChange("level", e.target.value)}
                className="w-full"
                placeholder="Todos los niveles"
              >
                <SelectItem key="">Todos los niveles</SelectItem>
                <SelectItem key="error">Error</SelectItem>
                <SelectItem key="warn">Advertencia</SelectItem>
                <SelectItem key="info">Información</SelectItem>
                <SelectItem key="debug">Debug</SelectItem>
              </Select>
            </div>
            
            {/* Filtro de evento */}
            <div>
              <Select
                label="Evento"
                name="event"
                selectedKeys={localFilters.event ? [localFilters.event] : []}
                onChange={(e) => handleChange("event", e.target.value)}
                className="w-full"
                placeholder="Todos los eventos"
              >
                <SelectItem key="">Todos los eventos</SelectItem>
                <SelectItem key="INTERVENTION_START">Inicio de intervención</SelectItem>
                <SelectItem key="INTERVENTION_COMPLETE">Intervención completada</SelectItem>
                <SelectItem key="INTERVENTION_ERROR">Error de intervención</SelectItem>
                <SelectItem key="SIMULATOR_STATUS">Estado de simulador</SelectItem>
                <SelectItem key="QUEUE_REFRESH_START">Refresco de cola iniciado</SelectItem>
                <SelectItem key="QUEUE_EXECUTION_START">Ejecución de cola iniciada</SelectItem>
              </Select>
            </div>
            
            {/* Filtro de tipo de red social */}
            <div>
              <Select
                label="Red social"
                name="socialMediaType"
                selectedKeys={localFilters.socialMediaType ? [localFilters.socialMediaType] : []}
                onChange={(e) => handleChange("socialMediaType", e.target.value)}
                className="w-full"
                placeholder="Todas"
              >
                <SelectItem key="">Todas</SelectItem>
                <SelectItem key="INSTAGRAM">Instagram</SelectItem>
                <SelectItem key="FACEBOOK">Facebook</SelectItem>
                <SelectItem key="TWITTER">Twitter</SelectItem>
                <SelectItem key="LINKEDIN">LinkedIn</SelectItem>
              </Select>
            </div>
            
            {/* Filtro de campaña */}
            {showCampaignFilter && (
              <div>
                <Input
                  type="text"
                  label="ID de campaña"
                  name="campaignId"
                  value={localFilters.campaignId || ''}
                  onChange={(e) => handleChange("campaignId", e.target.value)}
                  placeholder="ID de campaña"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Filtro de intervención */}
            {showInterventionFilter && (
              <div>
                <Input
                  type="text"
                  label="ID de intervención"
                  name="interventionId"
                  value={localFilters.interventionId || ''}
                  onChange={(e) => handleChange("interventionId", e.target.value)}
                  placeholder="ID de intervención"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Filtro de simulador */}
            {showSimulatorFilter && (
              <div>
                <Input
                  type="text"
                  label="ID de simulador"
                  name="simulatorId"
                  value={localFilters.simulatorId || ''}
                  onChange={(e) => handleChange("simulatorId", e.target.value)}
                  placeholder="ID de simulador"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Filtro de fecha de inicio */}
            <div>
              <Input
                type="datetime-local"
                label="Desde"
                name="startDate"
                value={localFilters.startDate ? new Date(localFilters.startDate.getTime() - localFilters.startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Filtro de fecha de fin */}
            <div>
              <Input
                type="datetime-local"
                label="Hasta"
                name="endDate"
                value={localFilters.endDate ? new Date(localFilters.endDate.getTime() - localFilters.endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              color="default"
              variant="flat"
              onPress={handleResetFilters}
            >
              Restablecer
            </Button>
            <Button 
              color="primary"
              variant="solid"
              onPress={handleApplyFilters}
            >
              Aplicar filtros
            </Button>
            <Button 
              color="success"
              variant="solid"
              onPress={onRefresh}
            >
              Refrescar
            </Button>
          </div>
        </CardBody>
      )}
    </Card>
  );
};

export default LogFilters; 