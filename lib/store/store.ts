import { configureStore } from '@reduxjs/toolkit';
import subredditsReducer from './slices/subredditsSlice';

export const store = configureStore({
  reducer: {
    subreddits: subredditsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;