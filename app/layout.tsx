import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './header'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tigers Body Shop — Easy List Agent',
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
        <body className="min-h-full flex flex-col">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
