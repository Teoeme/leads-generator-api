'use client'
import React from 'react'
import ThemeSwitcher from '../ThemeSwitcher'
import { Button, Link } from '@heroui/react'
import CurrentUser from './CurrentUser'
import useAuth from '@/app/hooks/useAuth'
import { useModal } from '@/app/hooks/useModal'
import LogsModal from '../Logs/LogsModal'

const PrivateNavbar = () => {
const {logout}=useAuth()
const {open}=useModal({uid:'logs-modal',title:'Logs'})
  return (
    <div className='flex justify-between items-center p-2'>
      <ThemeSwitcher />
      <div className='flex items-center gap-2'>
        <Button variant='flat' color='warning' size='sm' onPress={()=>{
          open({title:'Logs',type:'view'})
        }}>
          Logs
        </Button>
        <CurrentUser />
        <Button variant='light' onPress={logout}>
          <Link href="/login">Salir</Link>
        </Button>
      </div>
      <LogsModal />
    </div>
  )
}

export default PrivateNavbar