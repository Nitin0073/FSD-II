import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

// Entity adapter keeps the posts in a normalized structure.
const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

const initialState = postsAdapter.getInitialState({
  loading: false,
  error: null,
});

// Simulated mock API response.
const mockPosts = [
  {
    id: '1',
    title: 'Launch Week teaser',
    content: 'Share a sneak peek of our upcoming release across channels.',
    platform: 'Instagram',
    status: 'Published',
  },
  {
    id: '2',
    title: 'Weekly product recap',
    content: 'Summarize major product insights and social engagement.',
    platform: 'LinkedIn',
    status: 'Draft',
  },
  {
    id: '3',
    title: 'Customer success story',
    content: 'Highlight one recent customer milestone with a short case study.',
    platform: 'Facebook',
    status: 'Published',
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock async API call used to demonstrate createAsyncThunk.
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      await wait(750);
      return mockPosts;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch posts.');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: postsAdapter.addOne,
    updatePost: postsAdapter.updateOne,
    deletePost: postsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load posts.';
      });
  },
});

export const { addPost, updatePost, deletePost } = postsSlice.actions;

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts);

export const selectPostStats = (state) => {
  const posts = selectAllPosts(state);

  return {
    totalPosts: posts.length,
    totalDrafts: posts.filter((post) => post.status === 'Draft').length,
    publishedPosts: posts.filter((post) => post.status === 'Published').length,
  };
};

export default postsSlice.reducer;
