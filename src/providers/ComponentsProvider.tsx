'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'

export function ComponentsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      <QueryProvider>
        <AuthProvider>
          <Toaster position='top-right' />
          {children}
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
