import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BottomNav } from '@/components/layout';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reading Companion',
  description: 'Capture books you discover and track your reading journey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-20">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
