'use client';

import { useEffect } from "react";
import { useSubredditPosts } from "@/lib/hooks/useSubredditPosts";
import { Sidebar } from "@/components/Sidebar";
import { SubredditPosts } from "@/components/SubredditPosts";
import { Navbar } from "@/components/Navbar";

export default function SubredditPageClient({
  params,
}: {
  params: { subredditId: string };
}) {
  const { posts, loading, error, hasMore, fetchPosts, loadMore } = useSubredditPosts();

  useEffect(() => {
    fetchPosts(params.subredditId);
  }, [params.subredditId]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-80"> 
          <div className="p-6">
            {error && <div className="text-red-500">{error}</div>}
            <SubredditPosts
              posts={posts}
              loading={loading}
              hasMore={hasMore}
              loadMore={loadMore}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
