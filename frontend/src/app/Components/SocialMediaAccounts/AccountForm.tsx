import { AccountsTypeList } from '@/app/entities/Account'
import { Button, Form, Input, Select, SelectItem } from '@heroui/react'
import React from 'react'

export type AccountFormData = {
    id?:string
    type:string
    username:string
    password:string
}

export interface AccountFormProps{
    formState:AccountFormData,
    handleChange: (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    onSubmit: (data:AccountFormData)=>void,
    onCancel?: ()=>void
}

const AccountForm = ({formState,handleChange,onSubmit,onCancel}:AccountFormProps) => {
    const accountsTypeList = AccountsTypeList


    const handleSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        onSubmit(formState)
    }


  return (
    <Form onSubmit={handleSubmit}>

        <Select items={Object.values(accountsTypeList)} label='Social Media' name='type' onChange={handleChange} selectedKeys={[formState.type as string]}>
            {Object.values(accountsTypeList).map((accountType)=>(
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

        <Input 
            label='Password'
            name='password'
            placeholder='password'
            value={formState.password as string}
            onChange={handleChange}
        />
        
        <div className='flex justify-end gap-2 w-full'>
            <Button color='danger' variant='light' onPress={onCancel}>Cancel</Button>
            <Button type='submit' color='success' variant='flat'>Save</Button>
        </div>
       
    </Form>
  )
}

export default AccountForm