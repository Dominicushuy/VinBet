// providers/ComponentsProvider.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

export function ComponentsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      <Toaster position='top-right' />
      {children}
    </ThemeProvider>
  )
}
