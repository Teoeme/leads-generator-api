import React, { useState } from 'react';
import ModalTamplate from '../Templates/ModalTamplate';
import useLogs, { LogFilters as LogFiltersType } from '../../hooks/useLogs';
import LogRow from './LogRow';
import LogFiltersComponent from './LogFilters';
import { Button, Spinner, Card, CardBody, Badge, Pagination } from '@heroui/react';
import { confirm } from '@/app/services/confirmService';

const LogsModal = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const {
    logs,
    loading,
    error,
    totalCount,
    hasMore,
    filters,
    pagination,
    updateFilters,
    nextPage,
    previousPage,
    refresh,
    isPolling,
    togglePolling,
    deleteLogs
  } = useLogs();

  const handleRefresh = () => {
    refresh();
    setRefreshKey(prev => prev + 1);
  };

  const handleUpdateFilters = (newFilters: Partial<LogFiltersType>) => {
    updateFilters(newFilters);
  };

  const handleDeleteLogs = () => {
    confirm({
      title: 'Eliminar logs',
      content: '¿Estás seguro de querer eliminar los logs?',
    }).then(async () => {
await deleteLogs()
    })
    .catch(() => {
      console.log('Cancelado');
    });
  };

  return (
    <ModalTamplate uid="logs-modal" size="5xl">
      {() => (
        <div className="flex flex-col h-full">
          {/* Filtros */}
          <div className="mb-4">
            <LogFiltersComponent 
              filters={filters} 
              onUpdateFilters={handleUpdateFilters} 
              onRefresh={handleRefresh}
              showCampaignFilter={true}
              showInterventionFilter={true}
              showSimulatorFilter={true}
            />
          </div>
          
          {/* Estado de actualización automática */}
          <div className="mb-4 flex items-center">
            <Button
              size="sm"
              variant={isPolling ? "solid" : "light"}
              color={isPolling ? "success" : "default"}
              onPress={togglePolling}
              className="mr-2"
            >
              {isPolling ? 'Auto-actualización activada' : 'Auto-actualización desactivada'}
            </Button>
            
            <Button
              size="sm"
              variant="solid"
              color="primary"
              onPress={handleRefresh}
            >
              Actualizar
            </Button>
            
            {totalCount > 0 && (
              <Badge content={totalCount} color="primary" variant="flat" className="">
                <span className="ml-2 ">logs encontrados</span>
              </Badge>
            )}
            <div className='flex-1 flex justify-end'>

             <Button size="sm" variant="solid" color="danger" onPress={handleDeleteLogs}>Eliminar logs</Button>
            </div>
          </div>
          
          {/* Mensaje de carga o error */}
          {(logs.length === 0 && loading) && (
            <div className="flex justify-center my-4">
              <Spinner color="primary" />
            </div>
          )}
          
          {error && (
            <Card className="mb-4">
              <CardBody className="text-danger">
                {error}
              </CardBody>
            </Card>
          )}
          
          {/* Lista de logs */}
          <div className="flex-1 overflow-y-auto">
            {logs.length === 0 && !loading ? (
              <Card>
                <CardBody className="text-center text-gray-500">
                  No se encontraron logs con los filtros aplicados
                </CardBody>
              </Card>
            ) : (
              logs.map(log => (
                <LogRow key={`${log.id}-${refreshKey}`} log={log} />
              ))
            )}
          </div>
          
          {/* Paginación */}
          {logs.length > 0 && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <Pagination
                total={Math.max(pagination.page, 2)}
                initialPage={pagination.page}
                showControls
                variant="light"
                onChange={(page) => {
                  if (page < pagination.page) {
                    previousPage();
                  } else if (page > pagination.page && hasMore) {
                    nextPage();
                  }
                }}
                isDisabled={pagination.page <= 1 && !hasMore}
              />
            </div>
          )}
        </div>
      )}
    </ModalTamplate>
  );
};

export default LogsModal;