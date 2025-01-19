import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Subreddit {
  id: string;
  name: string;
  icon: string;
  subscribers?: number;
  description?: string;
}

interface SubredditsState {
  popularSubreddits: Subreddit[];
  favorites: Subreddit[];
  defaultSubreddit: string;
}

const loadFavorites = (): Subreddit[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('favoriteSubreddits');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return [];
};

const initialState: SubredditsState = {
  popularSubreddits: [
    { id: '1', name: 'Gaming', icon: 'GamepadIcon', description: 'A community for gaming news and discussions' },
    { id: '2', name: 'Valorant', icon: 'SwordIcon', description: 'VALORANT community for news & discussions' },
    { id: '3', name: 'Streaming', icon: 'VideoIcon', description: 'Everything about game streaming' },
    { id: '4', name: 'Twitch', icon: 'TwitchIcon', description: 'Twitch community and updates' },
    { id: '5', name: 'Gta', icon: 'CarIcon', description: 'Grand Theft Auto VI discussions and news' },
    { id: '6', name: 'Minecraft', icon: 'CubeIcon', description: 'The official Minecraft subreddit' },
    { id: '7', name: 'Lol', icon: 'SwordIcon', description: 'League of Legends community' },
    { id: '8', name: 'Fortnite', icon: 'CrosshairIcon', description: 'The developer supported Fortnite subreddit' },
    { id: '9', name: 'CallOfDuty', icon: 'TargetIcon', description: 'Call of Duty news and discussions' },
    { id: '10', name: 'Dota', icon: 'SwordIcon', description: 'Dota 2 community and updates' },
    { id: '11', name: 'RocketLeague', icon: 'CarIcon', description: 'Rocket League community' },
    { id: '12', name: 'ApexLegends', icon: 'CrosshairIcon', description: 'Apex Legends news and discussions' },
    { id: '13', name: 'Rainbow6', icon: 'ShieldIcon', description: 'Rainbow Six Siege community' },
    { id: '14', name: 'Fifa', icon: 'FootballIcon', description: 'EA Sports FC/FIFA community' },
    { id: '15', name: 'Overwatch', icon: 'CrosshairIcon', description: 'Overwatch 2 discussions' },
    { id: '16', name: 'WorldOfWarcraft', icon: 'SwordIcon', description: 'World of Warcraft community' },
    { id: '17', name: 'CSGO', icon: 'CrosshairIcon', description: 'Counter-Strike discussions' },
    { id: '18', name: 'EldenRing', icon: 'SwordIcon', description: 'Elden Ring community' },
    { id: '19', name: 'Cyberpunk2077', icon: 'ChipIcon', description: 'Cyberpunk 2077 discussions' },
    { id: '20', name: 'GenshinImpact', icon: 'SparklesIcon', description: 'Genshin Impact community' }
  ],
  favorites: loadFavorites(),
  defaultSubreddit: 'valorant'
};

const subredditsSlice = createSlice({
  name: 'subreddits',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Subreddit>) => {
      if (!state.favorites.some(fav => fav.id === action.payload.id)) {
        state.favorites.push(action.payload);
        if (typeof window !== 'undefined') {
          localStorage.setItem('favoriteSubreddits', JSON.stringify(state.favorites));
        }
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(fav => fav.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('favoriteSubreddits', JSON.stringify(state.favorites));
      }
    },
  },
});

export const { addToFavorites, removeFromFavorites } = subredditsSlice.actions;
export default subredditsSlice.reducer;