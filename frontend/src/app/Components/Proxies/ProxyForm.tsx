import { ProxyFormData, ProxyProtocol } from '@/app/entities/Proxy'
import { Button, Form, Input, Select, SelectItem, Textarea } from '@heroui/react'
import React from 'react'

const PROTOCOL_OPTIONS = [
  { value: ProxyProtocol.HTTP, label: 'HTTP' },
  { value: ProxyProtocol.HTTPS, label: 'HTTPS' },
  { value: ProxyProtocol.SOCKS4, label: 'SOCKS4' },
  { value: ProxyProtocol.SOCKS5, label: 'SOCKS5' },
]

export interface ProxyFormProps {
  formState: ProxyFormData,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
  onSubmit: (data: ProxyFormData) => void,
  onCancel?: () => void
}

const ProxyForm = ({ formState, handleChange, onSubmit, onCancel }: ProxyFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formState)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label='Nombre'
        name='name'
        placeholder='Mi proxy'
        type='text'
        value={formState.name}
        onChange={handleChange}
        required
      />

      <Input
        label='Servidor (formato: IP:Puerto o Dominio:Puerto)'
        name='server'
        placeholder='123.45.67.89:8080'
        type='text'
        value={formState.server}
        onChange={handleChange}
        required
      />

      <Select 
        items={PROTOCOL_OPTIONS} 
        label='Protocolo' 
        name='protocol' 
        onChange={handleChange} 
        selectedKeys={formState.protocol ? [formState.protocol] : []}
      >
        {PROTOCOL_OPTIONS.map((type) => (
          <SelectItem key={type.value} textValue={type.label}>
            {type.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        label='Nombre de usuario (opcional)'
        name='username'
        placeholder='usuario'
        type='text'
        value={formState.username || ''}
        onChange={handleChange}
      />

      <Input
        label='Contraseña (opcional)'
        name='password'
        placeholder='contraseña'
        type='password'
        value={formState.password || ''}
        onChange={handleChange}
      />

      <Input
        label='País (opcional)'
        name='country'
        placeholder='US, España, etc.'
        type='text'
        value={formState.country || ''}
        onChange={handleChange}
      />

      <Textarea
        label='Notas (opcional)'
        name='notes'
        placeholder='Información adicional sobre este proxy'
        value={formState.notes || ''}
        onChange={handleChange}
      />

      <div className='flex justify-end gap-2 w-full'>
        <Button color='danger' variant='light' onPress={onCancel}>Cancelar</Button>
        <Button type='submit' color='success' variant='flat'>Guardar</Button>
      </div>
    </Form>
  )
}

export default ProxyForm 