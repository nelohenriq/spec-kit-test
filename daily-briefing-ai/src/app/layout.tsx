import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daily Briefing AI',
  description: 'Personalized news briefings with AI-powered satirical tweets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl font-bold">Daily Briefing AI</h1>
                <p className="text-muted-foreground">
                  Personalized news briefings with AI-powered satirical tweets
                </p>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}