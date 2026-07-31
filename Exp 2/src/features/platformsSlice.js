import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'],
};

const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    addPlatform: (state, action) => {
      const platform = action.payload.trim();
      if (platform && !state.items.includes(platform)) {
        state.items.push(platform);
      }
    },
    removePlatform: (state, action) => {
      state.items = state.items.filter((item) => item !== action.payload);
    },
  },
});

export const { addPlatform, removePlatform } = platformsSlice.actions;

export default platformsSlice.reducer;
