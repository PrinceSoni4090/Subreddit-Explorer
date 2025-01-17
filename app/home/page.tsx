'use client';

import { Sidebar } from '@/components/Sidebar';
import { SubredditGrid } from '@/components/SubredditGrid';

export default function HomePage() {;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-80 p-6">
        <SubredditGrid />
      </main>
    </div>
  );
}