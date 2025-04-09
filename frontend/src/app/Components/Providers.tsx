'use client'

import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'
import React, { useEffect, useState } from 'react'
import { store } from '../Redux/store'
import { Provider } from 'react-redux'
const Providers = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)

  // Sólo renderizar el ThemeProvider después de que el componente se haya montado en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])


  return (
      <Provider store={store}>
    <HeroUIProvider>
      {mounted ? (
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          <ToastProvider />
            {children}
        </ThemeProvider>
      ) : (
        <div style={{ visibility: 'hidden' }}>{children}</div>
      )}
    </HeroUIProvider>
      </Provider>
  )
}

export default Providers