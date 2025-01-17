"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2 } from "lucide-react";
import Image from "next/image";

interface Post {
  title: string;
  author: string;
  ups: number;
  downs: number;
  num_comments: number;
  url: string;
  selftext: string;
  created_utc: number;
  post_hint?: string;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
      resolutions: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    }>;
  };
  media?: {
    reddit_video?: {
      fallback_url: string;
      height: number;
      width: number;
    };
  };
}

export default function PostPageClient({
  params,
}: {
  params: { subredditId: string; postId: string };
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        console.log('Fetching post with ID:', params.postId);
        
     // authenticated API endpoint with just the postId
        const response = await axios.get(
          `/api/reddit/post?postId=${encodeURIComponent(params.postId)}`
        );

        console.log('API Response:', response.data);

        if (response.data) {
          setPost(response.data);
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        if (axios.isAxiosError(err)) {
          const errorDetails = err.response?.data?.details || err.response?.data?.error || err.message;
          setError(errorDetails);
          console.error('Full error response:', err.response?.data);
        } else {
          setError("Failed to load post. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (params.postId) {
      fetchPost();
    }
  }, [params.postId]);

  const isImageUrl = (url: string) => {
    if (!url) return false;
    // Check for common image extensions
    if (url.match(/\.(jpeg|jpg|gif|png)$/i)) return true;
    // Check for Reddit and Imgur URLs that are images
    if (url.match(/^https?:\/\/(i\.(redd\.it|imgur\.com)|preview\.redd\.it)/)) return true;
    return false;
  };

  const getImageUrl = (post: Post) => {
    // Debug logs
    console.log("Post URL:", post.url);
    console.log("Post hint:", post.post_hint);
    console.log("Preview:", post.preview);

    // If it's a direct image URL
    if (isImageUrl(post.url)) {
      return post.url;
    }

    // If we have preview images
    if (post.preview?.images?.[0]?.source?.url) {
      // Reddit encodes HTML entities in URLs, we need to decode them
      return decodeURIComponent(post.preview.images[0].source.url).replace(/&amp;/g, '&');
    }

    return null;
  };

  const renderMedia = (post: Post) => {
    
    console.log("Rendering media for post:", post);

    // Handle video content
    if (post.media?.reddit_video) {
      return (
        <div className="relative w-full pt-[56.25%] mb-6">
          <video
            className="absolute top-0 left-0 w-full h-full"
            controls
            src={post.media.reddit_video.fallback_url}
          />
        </div>
      );
    }

    const imageUrl = getImageUrl(post);
    console.log("Image URL:", imageUrl);

    if (imageUrl && !imageError) {
      return (
        <div className="relative w-full mb-6">
          <img
            src={imageUrl}
            alt={post.title}
            className="max-w-full h-auto mx-auto rounded-lg"
            onError={(e) => {
              setImageError(true);
            }}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <main className="container mx-auto px-4 pt-6">
      {loading && (
        <div className="max-w-3xl mx-auto bg-[#121212] rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-400">Loading post...</div>
        </div>
      )}
      {error && (
        <div className="max-w-3xl mx-auto bg-[#121212] rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-2">Error loading post</div>
          <div className="text-gray-400">{error}</div>
        </div>
      )}
      {post && (
        <div className="max-w-3xl mx-auto bg-[#121212] rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-100">{post.title}</h1>
          <div className="text-gray-400 mb-4">
            Posted by u/{post.author} {formatDistanceToNow(post.created_utc * 1000)} ago
          </div>
          
          {renderMedia(post)}
          
          {post.selftext && (
            <div className="prose prose-invert max-w-none mb-6 whitespace-pre-wrap text-gray-300">
              {post.selftext}
            </div>
          )}
          
          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <ArrowBigUp className="w-6 h-6" />
              <span>{post.ups - post.downs}</span>
              <ArrowBigDown className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              <span>{post.num_comments} Comments</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              <span>Share</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
