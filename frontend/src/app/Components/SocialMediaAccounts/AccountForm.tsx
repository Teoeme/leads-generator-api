import { AccountRole, AccountsTypeList, ProxyAssignment } from '@/app/entities/Account'
import { Proxy } from '@/app/entities/Proxy'
import { useProxy } from '@/app/hooks/useProxy'
import { Button, Form, Input, Select, SelectItem } from '@heroui/react'
import React, { useEffect, useState } from 'react'

export type AccountFormData = {
    id?: string
    type: string
    username: string
    password: string
    proxy?: ProxyAssignment | null
    roles?: AccountRole[]
}

export interface AccountFormProps {
    formState: AccountFormData,
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | {target:{name:string,value:any}}) => void,
    onSubmit: (data: AccountFormData) => void,
    onCancel?: () => void
}

const AccountForm = ({ formState, handleChange, onSubmit, onCancel }: AccountFormProps) => {
    const accountsTypeList = AccountsTypeList
    const { fetchAvailableProxies } = useProxy()
    const [availableProxies, setAvailableProxies] = useState<Proxy[]>([])
    const [selectedProxy, setSelectedProxy] = useState<string>("")
    const [proxyEnabled, setProxyEnabled] = useState<boolean>(true)
    
    useEffect(() => {
        const loadProxies = async () => {
            const proxies = await fetchAvailableProxies()
            setAvailableProxies(proxies || [])
        }
        loadProxies()
    }, [])

    // Inicializar el estado del proxy a partir de formState
    useEffect(() => {
        if (formState.proxy) {
            setSelectedProxy(formState.proxy.proxyId)
            setProxyEnabled(formState.proxy.enabled)
        } else {
            setSelectedProxy("")
            setProxyEnabled(true)
        }
    }, [formState.proxy])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        // Preparar los datos del formulario con la estructura correcta de proxy
        const formData = { ...formState }
        if (selectedProxy) {
            formData.proxy = {
                proxyId: selectedProxy,
                enabled: proxyEnabled
            }
        } else {
            formData.proxy = null
        }
        
        onSubmit(formData)
    }

    const handleProxyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const proxyId = e.target.value
        setSelectedProxy(proxyId)
        
        if (proxyId) {
          
            handleChange({target:{name:'proxy',value:{
                proxyId:proxyId,
                enabled:proxyEnabled
            }}})
        } else {
            handleChange({target:{name:'proxy',value:null}})
        }
    }

    const handleProxyEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = e.target.checked
        setProxyEnabled(enabled)
        
        if (selectedProxy) {
            handleChange({target:{name:'proxy',value:{
                proxyId: selectedProxy,
                enabled: enabled
            }}})
        } else {
            handleChange({target:{name:'proxy',value:null}})
        }
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Select items={Object.values(accountsTypeList)} label='Social Media' name='type' onChange={handleChange} selectedKeys={[formState.type as string]}>
                {Object.values(accountsTypeList).map((accountType) => (
                    <SelectItem key={accountType.value} textValue={accountType.label}>
                        <div className='flex items-center gap-2'>
                            {React.createElement(accountType.icon)}
                            {accountType.label}
                        </div>
                    </SelectItem>
                ))}
            </Select>
            <Input
                label='Username'
                name='username'
                placeholder='username'
                type='text'
                value={formState.username as string}
                onChange={handleChange}
            />

            <Input
                label='Password'
                name='password'
                placeholder='password'
                value={formState.password as string}
                onChange={handleChange}
            />

            {/* Select para proxies */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Proxy (opcional)</label>
                <select 
                    name="proxy-select"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedProxy}
                    onChange={handleProxyChange}
                >
                    <option value="">Sin proxy</option>
                    {availableProxies.map((proxy) => (
                        <option key={proxy._id || proxy.id} value={proxy._id || proxy.id}>
                            {`${proxy.name || ""} (${proxy.server})`}
                        </option>
                    ))}
                </select>
                
                {selectedProxy && (
                    <div className="mt-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={proxyEnabled}
                                onChange={handleProxyEnabledChange}
                                className="w-4 h-4 rounded"
                            />
                            <span>Habilitar proxy para esta cuenta</span>
                        </label>
                    </div>
                )}
            </div>

            <div className='flex justify-end gap-2 w-full'>
                <Button color='danger' variant='light' onPress={onCancel}>Cancel</Button>
                <Button type='submit' color='success' variant='flat'>Save</Button>
            </div>
        </Form>
    )
}

export default AccountForm