import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

const inter = Inter({
  subsets: ['latin'],
})

import StoreInitializer from '@/components/store-initializer'

export const metadata = {
  title: 'Content Type Builder',
  description: 'A simple content management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <StoreInitializer />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
