'use client'

import useAuth from '@/app/hooks/useAuth';
import React from 'react'
import PrivateNavbar from './PrivateNavbar';
import PublicNavbar from './PublicNavbar';

const GeneralNavbar = () => {
    const {isAuthenticated}=useAuth();
    
    return (<>
  {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
    </>
  )
}

export default GeneralNavbar