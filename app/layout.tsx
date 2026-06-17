import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'เบอร์ฉุกเฉินไทย',
  description: 'รวมเบอร์ฉุกเฉินไทย พร้อมค้นหาโรงพยาบาลใกล้บ้าน',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ฉุกเฉิน',
  },
}

export const viewport: Viewport = {
  themeColor: '#6B50D8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
