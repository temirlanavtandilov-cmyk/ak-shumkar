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
    <header
      className="flex justify-between items-center px-6 h-14 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #009C4D 0%, #007E8B 100%)' }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 no-underline">
        <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <rect x="3"  y="3"  width="12" height="10" rx="2" fill="#FABF00"/>
          <rect x="33" y="3"  width="12" height="10" rx="2" fill="#FABF00"/>
          <rect x="6"  y="4"  width="6"  height="6"  rx="1" fill="#FF9999" opacity="0.85"/>
          <rect x="36" y="4"  width="6"  height="6"  rx="1" fill="#FF9999" opacity="0.85"/>
          <rect x="3"  y="10" width="42" height="28" rx="7" fill="#FABF00"/>
          <rect x="9"  y="19" width="11" height="7"  rx="2" fill="#fff"/>
          <rect x="12" y="20" width="6"  height="6"  rx="1" fill="#2D2D2D"/>
          <rect x="29" y="19" width="11" height="7"  rx="2" fill="#fff"/>
          <rect x="30" y="20" width="6"  height="6"  rx="1" fill="#2D2D2D"/>
          <rect x="20" y="28" width="8"  height="5"  rx="2.5" fill="#FF9999"/>
          <rect x="12" y="38" width="24" height="10" rx="4" fill="#FABF00"/>
        </svg>
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-white text-base tracking-tight">Tigers</span>
          <span className="text-white/60 text-xs font-light tracking-widest uppercase">Body Shop</span>
        </div>
      </Link>

      {/* Nav links — only when signed in */}
      {isSignedIn && (
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.6)' : '1px solid transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      )}

      {/* Auth */}
      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <SignInButton>
              <button className="text-white/80 text-sm font-medium hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-[#FABF00] text-black text-sm font-bold px-4 py-1.5 rounded-full hover:bg-[#F6A910] transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  )
}
