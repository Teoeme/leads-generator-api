import React from 'react'
import ThemeSwitcher from '../ThemeSwitcher'
import { Button, Link } from '@heroui/react'
import CurrentUser from './CurrentUser'
import useAuth from '@/app/hooks/useAuth'

const PrivateNavbar = () => {
const {logout}=useAuth()
  return (
    <div className='flex justify-between items-center p-2'>
      <ThemeSwitcher />
      <div className='flex items-center gap-2'>
        <CurrentUser />
        <Button variant='light' onPress={logout}>
          <Link href="/login">Logout</Link>
        </Button>
      </div>
    </div>
  )
}

export default PrivateNavbar