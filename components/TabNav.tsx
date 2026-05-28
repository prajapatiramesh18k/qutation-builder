'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TabNav() {
  const pathname = usePathname()

  return (
    <nav className="tab-nav">
      <Link href="/" className={`tab-link ${pathname === '/' ? 'active' : ''}`}>
        Quotation Builder
      </Link>
      <Link href="/admin" className={`tab-link ${pathname === '/admin' ? 'active' : ''}`}>
        Admin — Products
      </Link>
    </nav>
  )
}
