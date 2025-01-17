import { useState, useCallback } from 'react';
import axios from 'axios';

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
  subscribers?: number;
}

export const useSubredditPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentSubreddit, setCurrentSubreddit] = useState<string | null>(null);

  const fetchPosts = useCallback(async (subreddit: string, reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching posts for subreddit:', subreddit);

      
      if (currentSubreddit !== subreddit || reset) {
        setPosts([]);
        setAfter(null);
        setHasMore(true);
        setCurrentSubreddit(subreddit);
      }

     
      if (!hasMore && !reset) {
        setLoading(false);
        return;
      }

      const url = subreddit.toLowerCase() === 'popular' 
        ? `https://www.reddit.com/subreddits/popular.json?limit=10${after ? `&after=${after}` : ''}`
        : `https://www.reddit.com/r/${subreddit}/hot.json?limit=10${after ? `&after=${after}` : ''}`;
      
      console.log('Fetching from URL:', url);
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const newPosts = response.data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title || child.data.display_name,
        author: child.data.author || '',
        ups: child.data.subscribers || child.data.ups || 0,
        downs: child.data.downs || 0,
        num_comments: child.data.num_comments || 0,
        url: child.data.url || `https://reddit.com${child.data.url}`,
        created_utc: child.data.created_utc,
        thumbnail: child.data.icon_img || child.data.thumbnail,
        post_hint: child.data.post_hint,
        is_video: child.data.is_video || false,
        media: child.data.media,
        selftext: child.data.public_description || child.data.selftext || '',
        subreddit: child.data.display_name || child.data.subreddit,
        preview: child.data.preview,
        subscribers: child.data.subscribers
      }));

     
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      
   
      setAfter(response.data.data.after);
      setHasMore(!!response.data.data.after);
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [after, currentSubreddit, hasMore]);

  const loadMore = useCallback(() => {
    if (currentSubreddit && hasMore && !loading) {
      fetchPosts(currentSubreddit, false);
    }
  }, [currentSubreddit, hasMore, loading, fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchPosts,
    loadMore
  };
};