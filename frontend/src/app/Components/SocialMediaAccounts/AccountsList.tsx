
'use client'
import { Account, AccountsTypeList } from '@/app/entities/Account'
import useAccount from '@/app/hooks/useAccount'
import {  Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'
import React, { useCallback } from 'react'
import { FiEdit, FiPlusCircle, FiTrash} from 'react-icons/fi'
import { useModal } from '@/app/hooks/useModal'
import { useStateForm } from '@/app/hooks/useStateForm'

const AccountsList = () => {

    const {accounts}=useAccount()
    const {open}=useModal({uid:'accounts-modal'})
    const {setForm}=useStateForm({formId:'accountForm'})

    const columns=[
    {
        key:'id',
        label:'ID'
    },
    {
        key:'username',
        label:'Username'
    },
    {
        key:'type',
        label:'Type',
        render: (account:Account)=> <span>{AccountsTypeList[account.type as keyof typeof AccountsTypeList].label}</span>
    },
    {
        key:'actions',
        label:'Actions',
    }
  ]

  const renderCell= useCallback((account:Account,columnKey:string)=>{
const cellValue=account[columnKey as keyof Account];

switch(columnKey){
    case 'type':
        return <span className='flex items-center gap-2'>{React.createElement(AccountsTypeList[cellValue as keyof typeof AccountsTypeList].icon)} {AccountsTypeList[cellValue as keyof typeof AccountsTypeList]?.label}</span>
    
    case 'actions':
        return <span className='flex items-center gap-2'>
            <Button color='warning' variant='light' isIconOnly startContent={<FiEdit size={18}/>} onPress={()=>{handleEdit(account)}}></Button>
            <Button color='danger' variant='light' isIconOnly startContent={<FiTrash size={18}/>} onPress={()=>{handleDelete(account)}}></Button>
        </span>

        default:
        return cellValue
}

  },[])



  const handleEdit=(account:Account)=>{
    open({
        title:'Editar cuenta',
        type:'edit',
        
    })
    setForm({
        type:account.type,
        username:account.username,
        password:account?.password,
        proxy:account?.proxy,
        id:account.id
  })
  }

  const handleDelete=(account:Account)=>{
    console.log('delete',account)
  }

    return (
    <Table topContent={<AccountsTableHeader/>}>        
        <TableHeader columns={columns}>
{(column)=> <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody items={accounts ?? []}>
            {(account)=> <TableRow>
                {(columnKey)=> <TableCell>{renderCell(account,columnKey as string) as React.ReactNode}</TableCell>}

                </TableRow>}

        </TableBody>    
    </Table>
)
}

const AccountsTableHeader=()=>{
    const {open}=useModal({uid:'accounts-modal'})

    const handleAdd=()=>{
        open({
            title:'Agregar cuenta',
            type:'add',
            
        })
    }
    return (
        <div className='flex justify-between items-center'>
            <h2>Cuentas de Social Media</h2>
            <Button color='success' variant='faded' startContent={<FiPlusCircle size={18}/>} onPress={handleAdd}>Agregar cuenta</Button>
        </div>
    )
}

export default AccountsList