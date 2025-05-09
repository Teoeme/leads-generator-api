
'use client'
import { Account, AccountRole, AccountsTypeList } from '@/app/entities/Account'
import { Simulator } from '@/app/entities/Simulator'
import useAccount from '@/app/hooks/useAccount'
import { useModal } from '@/app/hooks/useModal'
import { useSimulatorSet } from '@/app/hooks/useSimulatorSet'
import { confirm } from '@/app/services/confirmService'
import { Button, Card, Chip, Tooltip } from '@heroui/react'
import React from 'react'
import { FiEdit, FiPlusCircle, FiTrash } from 'react-icons/fi'
import { MdAddToQueue } from 'react-icons/md'

const AccountsList = () => {

    const {accounts,deleteAccount}=useAccount()
    const {addSimulator,simulators}=useSimulatorSet()
    const {open}=useModal({uid:'accounts-modal'})

  const handleEdit=(account:Account)=>{
    open({
        title:'Editar cuenta',
        type:'edit',
        formState:{
            type:account.type,
            username:account.username,
            password:account?.password,
            proxy:account?.proxy,
            id:account.id,
            roles:account.roles
        }
        
    })
  }

  const handleDelete=(account:Account)=>{
    console.log('delete',account)
    confirm({
        title:"Eliminar cuenta",
        content:"¿Estás seguro de querer eliminar esta cuenta?",
        confirmationText:'Eliminar'
    }).then(async ()=>{
        console.log('accepted')
        await deleteAccount(account.id!)
    }).catch(()=>{
        console.log('rejected')
    })
  }

  const handleAdd=()=>{
    open({
        title:'Agregar cuenta',
        type:'add',
        formState:{
            roles:[AccountRole.SCRAPPING],
            type:'INSTAGRAM'
        }
        
    })
}

    return (
<div className='flex flex-col gap-2 max-h-[45vh]  pb-4 overflow-auto relative'>
    <div className='flex justify-between items-center pb-4'>
    <h2 className='text-xl font-bold'>Cuentas de Social Media</h2>
    <Button color='success' variant='faded' startContent={<FiPlusCircle size={18}/>} onPress={handleAdd}>Agregar cuenta</Button>
    </div>

        <Card className='flex items-center gap-2 flex-row p-4 text-xs py-5 shadow sticky top-0 left-0 right-0 z-10'>
            <p className=' w-48'>ID</p>
            <p className='w-72'>Username</p>
            <p className='w-32'>Type</p>
            <p className='w-60'>Roles</p>
            <p className='flex-1 text-right'>Actions</p>
        </Card>
        <div className='flex flex-col gap-2'>
            {
                accounts?.map((account)=>{
                    const isSimulator=simulators.some((simulator:Simulator)=> simulator.id===account.id)

                    return(
                        <div key={account.id} className='flex items-center gap-2 flex-row px-4 py-2'>
                            <p className=' w-48 text-[10px]'>{account.id}</p>
                            <p className=' w-72 text-sm'>{account.username}</p>
                            <span className='flex items-center gap-2 w-32'>{React.createElement(AccountsTypeList[account.type as keyof typeof AccountsTypeList].icon)} {AccountsTypeList[account.type as keyof typeof AccountsTypeList]?.label}</span>
                            <div className='w-60 flex flex-row flex-wrap gap-2'>{account.roles?.map((role:AccountRole)=> <Chip  key={role}>{role}</Chip>)}</div>
                            <span className='flex items-center gap-0 justify-end flex-1'>
                                <Button color='warning' variant='light' isIconOnly startContent={<FiEdit size={18}/>} onPress={()=>{handleEdit(account)}}></Button>
                                <Button color='danger' variant='light' isIconOnly startContent={<FiTrash size={18}/>} onPress={()=>{handleDelete(account)}}></Button>
                                <Tooltip content={isSimulator ? 'Cuenta ya agregada a un simulador' : 'Agregar cuenta al simulador'}>
                         <Button color='success' variant='light' isIconOnly startContent={<MdAddToQueue size={18}/>} onPress={()=>{addSimulator({accountId:account.id!})}} isDisabled={isSimulator}></Button>
                                </Tooltip>

                            </span>
                        </div>
                    )
                })
            }

        </div>
</div>
)
}

export default AccountsList