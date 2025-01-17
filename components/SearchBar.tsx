'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Loader2 } from 'lucide-react';
import { Toast } from '@radix-ui/react-toast';
import { toast } from '@/hooks/use-toast';

interface Subreddit {
  id: string;
  name: string;
  description?: string;
  subscribers?: number;
  url?: string;
}

interface SearchResponse {
  subreddits: Subreddit[];
  after?: string;
  before?: string;
  error?: string;
  details?: any;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      // Reset results when query changes
      setResults([]);
      setAfter(null);
      setHasMore(true);
      searchSubreddits(true);
    } else {
      setResults([]);
      setShowResults(false);
      setError(null);
      setHasMore(false);
    }
  }, [debouncedQuery]);

  const searchSubreddits = async (reset: boolean = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/reddit/search?q=${encodeURIComponent(debouncedQuery)}${after && !reset ? `&after=${after}` : ''}`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SearchResponse = await response.json();
      
      if (data.error) {
        console.error('Search error:', data.error);
        setError(data.error);
        if (reset) setResults([]);
      } else if (Array.isArray(data.subreddits)) {
        setResults(prev => reset ? data.subreddits : [...prev, ...data.subreddits]);
        setAfter(data.after || null);
        setHasMore(Boolean(data.after));
        setError(null);
      } else {
        console.error('Unexpected response format:', data);
        setError('Unexpected response format');
        if (reset) setResults([]);
      }
    } catch (error) {
      console.error('Error searching subreddits:', error);
      setError(error instanceof Error ? error.message : 'Failed to search subreddits');
      if (reset) setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const lastResultRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          searchSubreddits(false);
        }
      },
      { threshold: 0.5 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [loading, hasMore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
    setError(null);
  };

  const handleSubredditClick = (subreddit: Subreddit) => {
    try {
      if (!subreddit || (!subreddit.url && !subreddit.name && !subreddit.id)) {
        console.error('Invalid subreddit data:', subreddit);
        toast({
          title: "Error",
          description: "Unable to navigate to this subreddit. Please try another one.",
          variant: "destructive",
        });
        return;
      }

      const routePath = `/subreddit/${subreddit.name || subreddit.id}`;
      router.push(routePath);
      setShowResults(false);
      setQuery('');
    } catch (error) {
      console.error('Error navigating to subreddit:', error);
      toast({
        title: "Navigation Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search Reddit..."
          className="w-[30rem] px-4 py-2 bg-[#272729] text-sm font-light rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && !results.length && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      
      {showResults && query.trim() !== '' && (
        <div className="absolute top-full mt-2 w-full bg-[#1A1A1B] border border-[#343536] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {!results.length && loading && (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          )}
          
          {!loading && error && (
            <div className="p-4 text-center text-red-400">{error}</div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-4 text-center text-gray-400">No subreddits found</div>
          )}

          {results.map((subreddit, index) => (
            <div
              key={subreddit.id}
              ref={index === results.length - 1 ? lastResultRef : null}
              onClick={() => handleSubredditClick(subreddit)}
              className="p-3 hover:bg-[#272729] cursor-pointer border-b border-[#343536] last:border-none"
            >
              <div className="text-white font-medium">{subreddit.name}</div>
              {subreddit.description && (
                <div className="text-sm text-gray-400 truncate">{subreddit.description}</div>
              )}
              {subreddit.subscribers !== undefined && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Intl.NumberFormat().format(subreddit.subscribers)} subscribers
                </div>
              )}
            </div>
          ))}
          
       
          {loading && results.length > 0 && (
            <div className="p-3 text-center">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" />
            </div>
          )}

        
          {!loading && !hasMore && results.length > 0 && (
            <div className="p-3 text-center text-gray-400 text-sm">
              No more results
            </div>
          )}
        </div>
      )}
    </div>
  );
}
