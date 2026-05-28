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
          <h1>Ananya House of Furniture Pvt Ltd.</h1>
          <p>Bharat Prajapati: +91 9099917211 | Ramesh Prajapati: +91 9321812823 | Dhruvil Patel: +91 9316992909</p>
        </header>
        <TabNav />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
