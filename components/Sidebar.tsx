'use client';

import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Star, GamepadIcon, SwordIcon, VideoIcon, TwitchIcon, CarIcon,CrosshairIcon, 
  TargetIcon, ShieldIcon, SparklesIcon, ArrowUpIcon, 
  TrendingUp,
  ArrowUpRight} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { addToFavorites, removeFromFavorites } from '@/lib/store/slices/subredditsSlice';
import { Button } from './ui/button';

const iconMap: { [key: string]: any } = {
  GamepadIcon,
  SwordIcon,
  VideoIcon,
  TwitchIcon,
  CarIcon,
  CrosshairIcon,
  TargetIcon,
  ShieldIcon,
  SparklesIcon,
};

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { favorites, popularSubreddits } = useSelector((state: RootState) => state.subreddits);

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || GamepadIcon;
    return <Icon className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-red-500" />;
  };

  const toggleFavorite = (e: React.MouseEvent, subreddit: any) => {
    e.preventDefault();
    const isFavorite = favorites.some((fav) => fav.id === subreddit.id);
    if (isFavorite) {
      dispatch(removeFromFavorites(subreddit.id));
    } else {
      dispatch(addToFavorites(subreddit));
    }
  };

  return (
    <div className="fixed w-72 h-screen border-r pt-3 bg-background">
      <ScrollArea className="h-[calc(100vh-90px)]">
        <div className="px-4">
          {/* Popular Tab */}
          <Link
            href="/home"
            className={`flex items-center gap-2 p-2 mb-4 rounded-md group transition-colors ${
              pathname === '/home' ? 'bg-accent' : 'hover:bg-accent'
            }`}
          >
            <ArrowUpRight className="w-5 h-5 flex-shrink-0 text-red-500 group-hover:text-red-500" />
            <span className="font-normal text-gray-200">Popular Topics</span>
          </Link>

          <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-normal text-sm text-gray-400 py-4">
                Favorite Topics
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {favorites.map((subreddit) => {
                    const isActive = pathname === `/subreddit/${subreddit.name}`; 

                    return (
                      <Link
                        key={subreddit.id}
                        href={`/subreddit/${subreddit.name}`}
                        className={`flex items-center gap-2 p-2 rounded-md group relative transition-colors 
                          ${isActive ? 'bg-accent' : 'hover:bg-accent'}`}
                      >
                        {getIcon(subreddit.icon)}
                        <span>{subreddit.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto p-0 h-8 w-8"
                          onClick={(e) => toggleFavorite(e, subreddit)}
                        >
                          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                        </Button>
                      </Link>
                    );
                  })}
                  {favorites.length === 0 && (
                    <div className="text-sm text-gray-400 p-2">
                      Star your favorite subreddits to see them here!
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-t-0">
              <AccordionTrigger className="font-normal text-sm text-gray-400 py-4">
                Popular Gaming Topics
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {popularSubreddits.map((subreddit) => {
                    const isActive = pathname === `/subreddit/${subreddit.name}`;
                    const isFavorite = favorites.some((fav) => fav.id === subreddit.id);

                    return (
                      <Link
                        key={subreddit.id}
                        href={`/subreddit/${subreddit.name}`}
                        className={`flex items-center gap-2 p-2 rounded-md group relative transition-colors 
                          ${isActive ? 'bg-accent' : 'hover:bg-accent'}`}
                      >
                        {getIcon(subreddit.icon)}
                        <span>{subreddit.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto p-0 h-8 w-8"
                          onClick={(e) => toggleFavorite(e, subreddit)}
                        >
                          <Star 
                            className={`w-4 h-4 transition-colors ${isFavorite ? 'text-yellow-500' : 'text-gray-400 group-hover:text-gray-300'}`} 
                            fill={isFavorite ? 'currentColor' : 'none'}
                          />
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
