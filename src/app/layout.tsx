import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { Navbar, Footer } from '@/components/layout'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aryan Blendz | Premium Barber Booking',
  description:
    'Book your premium grooming experience at Aryan Blendz. Expert barbers, luxury cuts, and an unmatched experience tailored just for you.',
  keywords: [
    'barber',
    'haircut',
    'fade',
    'Aryan Blendz',
    'Piscataway barber',
    'Rutgers barber',
    'grooming',
    'booking',
  ],
  authors: [{ name: 'Aryan Blendz' }],
  creator: 'Aryan Blendz',
  openGraph: {
    title: 'Aryan Blendz | Premium Barber Booking',
    description:
      'Book your premium grooming experience at Aryan Blendz. Expert barbers, luxury cuts, and an unmatched experience tailored just for you.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aryan Blendz | Premium Barber Booking',
    description:
      'Book your premium grooming experience at Aryan Blendz.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfairDisplay.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Footer />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid rgba(201, 168, 76, 0.2)',
                color: '#ffffff',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
