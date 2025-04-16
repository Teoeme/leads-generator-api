import { AccountRole, AccountsTypeList, ProxyAssignment } from '@/app/entities/Account'
import { Proxy } from '@/app/entities/Proxy'
import { useProxy } from '@/app/hooks/useProxy'
import { Button, Form, Input, Select, SelectItem, Switch } from '@heroui/react'
import React, { useEffect, useState } from 'react'

export type AccountFormData = {
    id?: string
    type: string
    username: string
    password: string
    proxy?: ProxyAssignment | null
    roles?: AccountRole[]
    currentPassword?: string,
    newPassword?: string,
}

export interface AccountFormProps {
    type: 'add' | 'edit' | 'view',
    formState: AccountFormData,
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | {target:{name:string,value:any}}) => void,
    onSubmit: (data: AccountFormData) => void,
    onCancel?: () => void
}

const AccountForm = ({ type, formState, handleChange, onSubmit, onCancel }: AccountFormProps) => {
    const accountsTypeList = AccountsTypeList
    const { fetchAvailableProxies } = useProxy()
    const [availableProxies, setAvailableProxies] = useState<Proxy[]>([])
    const [selectedProxy, setSelectedProxy] = useState<string>("")
    const [proxyEnabled, setProxyEnabled] = useState<boolean>(true)
    const [changePassword, setChangePassword] = useState<boolean>(false)
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
                    <SelectItem key={accountType.value} textValue={accountType.label} >
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

            {type==='add' && <Input 
            label='Password'
            name='password'
            placeholder='password'
            value={formState.password as string}
            onChange={handleChange}
            />}
{type==='edit' && (
    <>

    <Switch name='changePassword' isSelected={changePassword} onChange={()=>{setChangePassword(pv=>!pv)

        if(changePassword){
            handleChange({target:{name:'newPassword',value:undefined}})
        }
    }}>
        Cambiar contraseña
    </Switch>
    {changePassword && <>
       
        <Input
            label='New Password'
            name='newPassword'
            placeholder='newPassword'
            value={formState.newPassword as string}
            onChange={handleChange}
        />
        </>}
        </>
)}

            {/* Select para proxies */}
                <Select  
                    label='Proxy (opcional)'
                    name="proxy-select"
                    selectedKeys={[selectedProxy]}
                    onChange={handleProxyChange}
                    
                >
                    {[
                        <SelectItem key="">Sin proxy</SelectItem>,
                        ...availableProxies.map((proxy) => (
                            <SelectItem key={proxy._id || proxy.id} textValue={`${proxy.name || ""} (${proxy.server})`}>
                                {`${proxy.name || ""} (${proxy.server})`}
                            </SelectItem>
                        ))
                    ]}
                </Select>
                
                {selectedProxy && (
                            <Switch
                                checked={proxyEnabled}
                                onChange={handleProxyEnabledChange}
                            >
                            Habilitar proxy para esta cuenta
                            </Switch>
                )}

            <div className='flex justify-end gap-2 w-full'>
                <Button color='danger' variant='light' onPress={onCancel}>Cancel</Button>
                <Button type='submit' color='success' variant='flat'>{type==='add'?'Save':'Update'}</Button>
            </div>
        </Form>
    )
}

export default AccountForm