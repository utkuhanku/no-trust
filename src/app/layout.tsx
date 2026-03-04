import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import '@coinbase/onchainkit/styles.css';
import { Providers } from '@/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'No-Trust | Base',
  description: 'Zero-integration programmable rewards on the Base network.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#030303',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${newsreader.variable} antialiased bg-[#030303] text-[#F3F3F3] min-h-screen font-sans selection:bg-white selection:text-black`}
        suppressHydrationWarning
      >
        <div className={inter.className}>
          <Providers>
            {children}
            <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#0A0A0B', border: '1px solid rgba(255,255,255,0.1)', color: 'white' } }} />
          </Providers>
        </div>
      </body>
    </html>
  );
}
