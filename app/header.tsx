'use client'

import { useAuth } from '@clerk/nextjs'
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  const navLinks = [
    { href: '/listings', label: 'New Listing' },
    { href: '/history',  label: 'History' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand — matches original Easy List design */}
        <Link href="/" className="app-brand" style={{ textDecoration: 'none' }}>
          <div className="brand-logo-icon">
            <svg width="36" height="36" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF100"/>
                  <stop offset="100%" stopColor="#FABF00"/>
                </linearGradient>
              </defs>
              <circle cx="30" cy="30" r="28" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
              <circle cx="30" cy="30" r="20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
              <circle cx="30" cy="30" r="13" fill="url(#logoGrad)"/>
              <polyline points="24,30 28,34 37,24" fill="none" stroke="#007E8B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-wordmark">
            <div className="brand-wordmark-top">
              <span className="brand-easy">Easy</span>
              <span className="brand-list">LIST</span>
            </div>
            <span className="brand-tagline">snap · list · sell</span>
          </div>
        </Link>

        {/* Nav links — only when signed in */}
        {isSignedIn && (
          <nav className="tab-nav">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`tab-btn${active ? ' active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <SignInButton>
                <button className="tab-btn">Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button style={{
                  background: '#FABF00', color: '#000',
                  border: 'none', borderRadius: 20,
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: 13, fontWeight: 700,
                  padding: '6px 16px', cursor: 'pointer',
                }}>
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
