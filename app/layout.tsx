import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Easy List — Auto Parts Listing Agent',
  description: 'Snap, list, and sell auto parts faster with AI.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
