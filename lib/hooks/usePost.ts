import { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  author: string;
  ups: number;
  downs: number;
  num_comments: number;
  url: string;
  content: string;
  created_utc: number;
}

export const usePost = (subredditId: string, postId: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://www.reddit.com/r/${subredditId}/comments/${postId}.json`
        );
        const postData = response.data[0].data.children[0].data;
        
        setPost({
          id: postData.id,
          title: postData.title,
          author: postData.author,
          ups: postData.ups,
          downs: postData.downs,
          num_comments: postData.num_comments,
          url: postData.url,
          content: postData.selftext,
          created_utc: postData.created_utc,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [subredditId, postId]);

  return { post, loading, error };
};
