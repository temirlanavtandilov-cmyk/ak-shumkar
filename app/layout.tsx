import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Header from './header'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
