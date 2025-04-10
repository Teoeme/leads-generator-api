'use client'
import React from 'react'
import ProxyMain from '@/app/Components/Proxies/ProxyMain'

const ProxiesPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Proxies</h1>
      <ProxyMain />
    </div>
  )
}

export default ProxiesPage 