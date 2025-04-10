'use client'
import { Proxy, ProxyStatus } from '@/app/entities/Proxy'
import { useProxy } from '@/app/hooks/useProxy'
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Chip } from '@heroui/react'
import React, { useCallback } from 'react'
import { FiEdit, FiPlusCircle, FiTrash, FiRefreshCw } from 'react-icons/fi'
import { useModal } from '@/app/hooks/useModal'
import { useStateForm } from '@/app/hooks/useStateForm'

const ProxyList = () => {
  const { proxies, checkProxyStatus, deleteProxy } = useProxy()
  const { open } = useModal({ uid: 'proxy-modal' })
  const { setForm } = useStateForm({ formId: 'proxyForm' })

  const columns = [
    {
      key: 'id',
      label: 'ID'
    },
    {
      key: 'name',
      label: 'Nombre'
    },
    {
      key: 'server',
      label: 'Servidor'
    },
    {
      key: 'protocol',
      label: 'Protocolo'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (proxy: Proxy) => getStatusChip(proxy.status)
    },
    {
      key: 'country',
      label: 'País'
    },
    {
      key: 'lastChecked',
      label: 'Última revisión',
      render: (proxy: Proxy) => proxy.lastChecked ? new Date(proxy.lastChecked).toLocaleString() : 'Nunca'
    },
    {
      key: 'actions',
      label: 'Acciones',
    }
  ]

  const getStatusChip = (status: ProxyStatus) => {
    switch (status) {
      case ProxyStatus.ACTIVE:
        return <Chip color="success">Activo</Chip>
      case ProxyStatus.INACTIVE:
        return <Chip color="danger">Inactivo</Chip>
      case ProxyStatus.TESTING:
        return <Chip color="warning">Probando</Chip>
      case ProxyStatus.BLOCKED:
        return <Chip color="danger">Bloqueado</Chip>
      default:
        return <Chip color="default">Desconocido</Chip>
    }
  }

  const renderCell = useCallback((proxy: Proxy, columnKey: string) => {
    const cellValue = proxy[columnKey as keyof Proxy]

    switch (columnKey) {
      case 'status':
        return getStatusChip(cellValue as ProxyStatus)
      case 'lastChecked':
        if (!cellValue) return 'Nunca';
        if (cellValue instanceof Date) {
          return cellValue.toLocaleString();
        }
        return typeof cellValue === 'string' ? new Date(cellValue).toLocaleString() : 'Fecha inválida';
      case 'actions':
        return <span className='flex items-center gap-2'>
          <Button color='warning' variant='light' isIconOnly startContent={<FiEdit size={18} />} onPress={() => { handleEdit(proxy) }}></Button>
          <Button color='danger' variant='light' isIconOnly startContent={<FiTrash size={18} />} onPress={() => { handleDelete(proxy) }}></Button>
          <Button color='primary' variant='light' isIconOnly startContent={<FiRefreshCw size={18} />} onPress={() => { handleCheckStatus(proxy) }}></Button>
        </span>
      default:
        if (cellValue === null || cellValue === undefined) return '';
        if (typeof cellValue === 'object') return JSON.stringify(cellValue);
        return String(cellValue);
    }
  }, [])

  const handleEdit = (proxy: Proxy) => {
    open({
      title: 'Editar proxy',
      type: 'edit',
    })
    setForm({
      name: proxy.name,
      server: proxy.server,
      username: proxy.username || '',
      password: proxy.password || '',
      protocol: proxy.protocol,
      country: proxy.country || '',
      notes: proxy.notes || '',
      id: proxy._id || proxy.id
    })
  }

  const handleDelete = (proxy: Proxy) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el proxy ${proxy.name}?`)) {
      deleteProxy(proxy.id as string)
    }
  }

  const handleCheckStatus = (proxy: Proxy) => {
    checkProxyStatus(proxy.id as string)
  }

  return (
    <Table topContent={<ProxyTableHeader />}>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={proxies ?? []}>
        {(proxy) => <TableRow>
          {(columnKey) => <TableCell>{renderCell(proxy, columnKey as string)}</TableCell>}
        </TableRow>}
      </TableBody>
    </Table>
  )
}

const ProxyTableHeader = () => {
  const { open } = useModal({ uid: 'proxy-modal' })
  const { setForm } = useStateForm({ formId: 'proxyForm' })

  const handleAdd = () => {
    open({
      title: 'Agregar proxy',
      type: 'add',
    })
    setForm({
      name: '',
      server: '',
      username: '',
      password: '',
      protocol: 'http',
      country: '',
      notes: ''
    })
  }
  return (
    <div className='flex justify-between items-center'>
      <h2>Proxies</h2>
      <Button color='success' variant='faded' startContent={<FiPlusCircle size={18} />} onPress={handleAdd}>Agregar proxy</Button>
    </div>
  )
}

export default ProxyList 