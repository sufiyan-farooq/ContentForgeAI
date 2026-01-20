import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'ContentForgeAI - AI-Powered Content Generation',
  description: 'Transform content briefs into premium, SEO-optimized articles',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}