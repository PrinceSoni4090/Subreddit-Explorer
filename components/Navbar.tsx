'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from './SearchBar';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#121212] border-b border-[#2d2d2d] z-50">
      <div className="container h-full flex items-center px-5">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png"
            alt="Reddit Logo"
            width={32}
            height={32}
            unoptimized={true}
          />
          <span className="text-xl font-bold text-white">Subreddit Explorer</span>
        </Link>
        <div className="ml-[28rem]">
          <SearchBar/>
        </div>
      </div>
    </nav>
  );
}
