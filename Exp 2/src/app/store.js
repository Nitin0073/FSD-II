import { configureStore } from '@reduxjs/toolkit';
import postsReducer from '../features/postsSlice';
import platformsReducer from '../features/platformsSlice';

// Central Redux store for the whole application.
export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
  },
});

export default store;
