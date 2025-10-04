import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/contexts/cart-context'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agri-SHE',
  description: 'Created with Team Agri-SHE',
  generator: 'Agri-SHE',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/placeholder-logo.svg', type: 'image/svg+xml' },
    ],
    apple: '/placeholder-logo.png',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>
          {children}
          <Toaster richColors />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
