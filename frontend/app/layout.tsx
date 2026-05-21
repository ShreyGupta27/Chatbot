import type { Metadata } from 'next'
import { Inter, Poppins, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap'
})

const robotoMono = Roboto_Mono({ 
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Unified Legal Technology Platform',
  description: 'Enterprise-grade legal RAG chatbot with comprehensive case management',
  keywords: ['legal', 'chatbot', 'case management', 'AI', 'law firm', 'legal tech'],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Unified Legal Technology Platform',
    description: 'Enterprise-grade legal RAG chatbot with comprehensive case management',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unified Legal Technology Platform',
    description: 'Enterprise-grade legal RAG chatbot with comprehensive case management',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${robotoMono.variable} font-inter antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}