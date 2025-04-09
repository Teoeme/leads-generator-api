'use client'
import React from 'react'
import useAuth from '../../hooks/useAuth'
import { Avatar, Card, CardBody } from '@heroui/react'

const CurrentUser = () => {
  const { user } = useAuth();
  return (
        <Card >
            <CardBody className='flex flex-row gap-2 items-center p-2'>
                <Avatar src={user?.avatar ?? undefined} name={user?.username ?? undefined} className=' rounded-lg' size='md' />
        <div>
                <p>{user?.username}</p>
        </div>
            </CardBody>
        </Card>
  )
}

export default CurrentUser