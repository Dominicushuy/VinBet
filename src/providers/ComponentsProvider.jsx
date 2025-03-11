'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster as HotToaster } from 'react-hot-toast'
import { QueryProvider } from './QueryProvider'
import { Toaster } from '@/components/ui/toaster'

export function ComponentsProvider({ children }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      <QueryProvider>
        <HotToaster
          position='top-center'
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff'
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff'
              }
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff'
              }
            }
          }}
        />
        {/* Thêm Toaster mới */}
        <Toaster />
        {children}
      </QueryProvider>
    </ThemeProvider>
  )
}
