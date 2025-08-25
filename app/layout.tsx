import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { WebsiteProvider } from '@/contexts/WebsiteContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Website Manual Tester',
  description: 'A platform for manual testing and review of websites',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <WebsiteProvider>
            {children}
          </WebsiteProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}