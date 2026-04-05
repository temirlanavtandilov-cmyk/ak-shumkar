'use client'

import { useUser } from '@clerk/nextjs'

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#009C4D] border-t-transparent animate-spin" />
      </div>
    )
  }

  const firstName = user?.firstName || user?.username || 'there'
  const isNew = user && !user.lastSignInAt
  const heading = isSignedIn
    ? isNew
      ? `Welcome to Tigers Body Shop, ${firstName}!`
      : `Welcome back, ${firstName}!`
    : 'Tigers Body Shop'

  const sub = isSignedIn
    ? isNew
      ? "Your account is all set. Start listing your parts and selling faster with AI-powered tools."
      : "Good to see you again. Your listings and history are ready to go."
    : "Sign in to start listing auto parts faster with AI."

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 bg-[#F5F5F2]">

      {/* Logo mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <svg width="64" height="64" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <rect x="3"  y="3"  width="12" height="10" rx="2" fill="#FABF00"/>
          <rect x="33" y="3"  width="12" height="10" rx="2" fill="#FABF00"/>
          <rect x="6"  y="4"  width="6"  height="6"  rx="1" fill="#FF9999" opacity="0.85"/>
          <rect x="36" y="4"  width="6"  height="6"  rx="1" fill="#FF9999" opacity="0.85"/>
          <rect x="3"  y="10" width="42" height="28" rx="7" fill="#FABF00"/>
          <rect x="21" y="10" width="6"  height="5"  fill="#2D2D2D" opacity="0.5"/>
          <rect x="9"  y="19" width="11" height="7"  rx="2" fill="#fff"/>
          <rect x="12" y="20" width="6"  height="6"  rx="1" fill="#2D2D2D"/>
          <rect x="16" y="20" width="2"  height="2"  rx="0.5" fill="#fff" opacity="0.7"/>
          <rect x="29" y="19" width="11" height="7"  rx="2" fill="#fff"/>
          <rect x="30" y="20" width="6"  height="6"  rx="1" fill="#2D2D2D"/>
          <rect x="34" y="20" width="2"  height="2"  rx="0.5" fill="#fff" opacity="0.7"/>
          <rect x="3"  y="25" width="8"  height="3"  rx="1" fill="#2D2D2D" opacity="0.35"/>
          <rect x="37" y="25" width="8"  height="3"  rx="1" fill="#2D2D2D" opacity="0.35"/>
          <rect x="20" y="28" width="8"  height="5"  rx="2.5" fill="#FF9999"/>
          <rect x="15" y="33" width="4"  height="2"  rx="1" fill="#2D2D2D" opacity="0.45"/>
          <rect x="29" y="33" width="4"  height="2"  rx="1" fill="#2D2D2D" opacity="0.45"/>
          <rect x="12" y="38" width="24" height="10" rx="4" fill="#FABF00"/>
          <rect x="40" y="32" width="5"  height="16" rx="2.5" fill="#FABF00"/>
          <rect x="40" y="45" width="5"  height="3"  rx="1.5" fill="#2D2D2D"/>
        </svg>

        {/* Brand name */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#009C4D' }}>Tigers</span>
          <span className="text-2xl font-light tracking-widest text-gray-500 uppercase text-sm">Body Shop</span>
        </div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Green gradient top bar */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #009C4D, #FFF100, #007E8B, #FABF00)' }} />

        <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
          {isSignedIn && isNew && (
            <span className="inline-block bg-[#FABF00] text-black text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
              New Account
            </span>
          )}

          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{heading}</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{sub}</p>

          {isSignedIn ? (
            <div className="mt-4 flex flex-col gap-3 w-full">
              <a
                href="/listings"
                className="w-full h-11 flex items-center justify-center rounded-xl text-white font-semibold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #009C4D, #007E8B)' }}
              >
                Go to Listings
              </a>
              <a
                href="/history"
                className="w-full h-11 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:border-[#009C4D] hover:text-[#009C4D] transition-all"
              >
                View History
              </a>
            </div>
          ) : (
            <p className="mt-2 text-xs text-gray-400">Use the Sign In button above to get started.</p>
          )}
        </div>

        {/* Stats bar — only for signed-in users */}
        {isSignedIn && (
          <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
            {[
              { label: 'Listings', value: '—' },
              { label: 'Published', value: '—' },
              { label: 'Saved', value: '—' },
            ].map(({ label, value }) => (
              <div key={label} className="py-4 flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-gray-800">{value}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tagline */}
      <p className="mt-8 text-xs text-gray-400 tracking-widest uppercase">snap · list · sell</p>
    </div>
  )
}
