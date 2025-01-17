'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { addToFavorites, removeFromFavorites } from '@/lib/store/slices/subredditsSlice';
import { Card } from './ui/card';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function SubredditGrid() {
  const dispatch = useDispatch();
  const { popularSubreddits, favorites } = useSelector((state: RootState) => state.subreddits);

  const toggleFavorite = (e: React.MouseEvent, subreddit: any) => {
    e.preventDefault(); 
    e.stopPropagation();
    const isFavorite = favorites.some((fav) => fav.id === subreddit.id);
    if (isFavorite) {
      dispatch(removeFromFavorites(subreddit.id));
    } else {
      dispatch(addToFavorites(subreddit));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {popularSubreddits.map((subreddit) => {
        const isFavorite = favorites.some((fav) => fav.id === subreddit.id);

        return (
          <Link 
            key={subreddit.id} 
            href={`/subreddit/${subreddit.name}`}
            className="block"
          >
            <Card className="p-4 bg-[#121212] hover:bg-[#1a1a1a] transition-colors cursor-pointer">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-100">{subreddit.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => toggleFavorite(e, subreddit)}
                  className={isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}
                >
                  <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </Button>
              </div>
              {subreddit.description && (
                <p className="text-gray-400 text-sm line-clamp-2">{subreddit.description}</p>
              )}
              {subreddit.subscribers && (
                <p className="text-gray-500 text-sm mt-2">
                  {subreddit.subscribers.toLocaleString()} subscribers
                </p>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}