'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bookmark } from 'lucide-react';
import { useUserStore } from '@/stores';

export function BottomNav() {
  const pathname = usePathname();
  const setLastSearchQuery = useUserStore((s) => s.setLastSearchQuery);

  const handleDiscoverClick = () => {
    // Clear the search query when explicitly navigating to Discover
    setLastSearchQuery(null);
  };

  const isDiscover = pathname === '/' || pathname.startsWith('/search');
  const isSaved = pathname === '/saved';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex">
        <Link
          href="/"
          onClick={handleDiscoverClick}
          className={`flex-1 flex flex-col items-center py-4 min-h-[56px] transition-colors ${
            isDiscover
              ? 'text-primary-500'
              : 'text-gray-600 hover:text-primary-500 active:text-primary-600'
          }`}
        >
          <Search size={24} />
          <span className="text-xs mt-1 font-medium">Discover</span>
        </Link>
        <Link
          href="/saved"
          className={`flex-1 flex flex-col items-center py-4 min-h-[56px] transition-colors ${
            isSaved
              ? 'text-primary-500'
              : 'text-gray-600 hover:text-primary-500 active:text-primary-600'
          }`}
        >
          <Bookmark size={24} />
          <span className="text-xs mt-1 font-medium">Saved</span>
        </Link>
      </div>
    </nav>
  );
}
