'use client';

import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, User, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Post {
  id: string;
  title: string;
  author: string;
  ups: number;
  downs: number;
  num_comments: number;
  url: string;
  created_utc: number;
  thumbnail: string;
  post_hint?: string;
  is_video: boolean;
  media?: any;
  selftext: string;
  subreddit: string;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
    }>;
  };
}

interface SubredditPostsProps {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

export function SubredditPosts({ 
  posts,
  loading,
  hasMore,
  loadMore
}: SubredditPostsProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const observer = useRef<IntersectionObserver>();
  const lastPostRef = useRef<HTMLDivElement>(null);

  const lastPostCallback = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, loadMore]);

  const isImageUrl = (url: string) => {
    if (!url) return false;
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return true;
    if (url.match(/^https?:\/\/(i\.(redd\.it|imgur\.com)|preview\.redd\.it)/)) return true;
    return false;
  };

  const getImageUrl = (post: Post) => {
    if (post.preview?.images?.[0]?.source?.url) {
      return decodeURIComponent(post.preview.images[0].source.url).replace(/&amp;/g, '&');
    }
    
    if (isImageUrl(post.url)) {
      return post.url;
    }

    if (post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default') {
      return post.thumbnail;
    }

    return null;
  };

  if (!posts.length && loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="mt-2 text-gray-400">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-52">
      {/* Posts */}
      {posts.map((post, index) => {
        const imageUrl = getImageUrl(post);
        const hasImageError = imageErrors[post.id];
        const voteCount = post.ups - post.downs;
        const isLastPost = index === posts.length - 1;

        return (
          <div
            key={post.id}
            ref={isLastPost ? lastPostCallback : null}
            className="mb-4"
          >
            <Link 
              href={`/subreddit/${post.subreddit}/post/${post.id}`}
              className="block"
            >
              <Card className="p-4 bg-[#121212] hover:bg-[#1a1a1a] transition-colors cursor-pointer border-[#2d2d2d]">
                <div className="flex flex-col gap-4">
                  {/* Author and Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.author}`} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <span>Posted by u/{post.author}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(post.created_utc * 1000)} ago</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-100">{post.title}</h2>

                  {/* Content */}
                  <div className="flex-1">
                    {post.selftext && (
                      <div className="text-sm text-gray-400 mb-4 line-clamp-3">
                        {post.selftext}
                      </div>
                    )}
                    {imageUrl && !hasImageError && (
                      <div className="relative w-full h-96 mb-4">
                        <Image
                          src={imageUrl}
                          alt={post.title}
                          fill
                          className="object-contain"
                          onError={() => {
                            setImageErrors(prev => ({
                              ...prev,
                              [post.id]: true
                            }));
                          }}
                          unoptimized={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 text-gray-400">
                    <Button variant="ghost" size="sm" className="space-x-2 hover:text-gray-200">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.num_comments} Comments</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="space-x-2 hover:text-gray-200">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </Button>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-500">
                        <ArrowBigUp className="w-4 h-4" />
                      </Button>
                      <span className={`font-medium ${voteCount > 0 ? 'text-orange-500' : voteCount < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                        {voteCount}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500">
                        <ArrowBigDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        );
      })}

      {/* Loading indicator at bottom */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* End of content message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          No more posts to load
        </div>
      )}
    </div>
  );
}