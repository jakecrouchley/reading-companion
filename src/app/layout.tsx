import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Search, Bookmark } from 'lucide-react';
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
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
              <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex">
                <Link
                  href="/"
                  className="flex-1 flex flex-col items-center py-4 min-h-[56px] text-gray-600 hover:text-primary-500 active:text-primary-600 transition-colors"
                >
                  <Search size={24} />
                  <span className="text-xs mt-1 font-medium">Discover</span>
                </Link>
                <Link
                  href="/saved"
                  className="flex-1 flex flex-col items-center py-4 min-h-[56px] text-gray-600 hover:text-primary-500 active:text-primary-600 transition-colors"
                >
                  <Bookmark size={24} />
                  <span className="text-xs mt-1 font-medium">Saved</span>
                </Link>
              </div>
            </nav>
          </div>
        </Providers>
      </body>
    </html>
  );
}
