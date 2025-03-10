// fonts.ts
import { Inter, Montserrat } from 'next/font/google'

export const fontSans = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontHeading = Montserrat({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-heading',
  display: 'swap',
})
