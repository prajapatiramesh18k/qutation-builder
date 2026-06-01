import type { Metadata } from 'next'
import './globals.css'
import TabNav from '@/components/TabNav'

export const metadata: Metadata = {
  title: 'Ananya House of Furniture Pvt. Ltd. — Quotation Builder',
  description: 'Create furniture quotations for Ananya House of Furniture Pvt. Ltd.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <h1>Ananya House of Furniture Pvt Ltd .</h1>
          <p>Dhurvil Patel: +91 9316992909 | Ramesh Prajapati: +91 9321812823</p>
        </header>
        <TabNav />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
