import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, fetchPosts, selectAllPosts } from '../features/postsSlice.js';
import PostForm from './PostForm.jsx';

function Posts() {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const loading = useSelector((state) => state.posts.loading);
  const error = useSelector((state) => state.posts.error);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleDelete = (id) => {
    dispatch(deletePost(id));
  };

  const handleCancel = () => {
    setEditingPost(null);
  };

  return (
    <section className="content-grid">
      <div className="posts-section">
        <div className="section-heading">
          <h2>Posts List</h2>
        </div>

        {loading && <div className="loading">Loading posts...</div>}
        {error && <div className="error-box">{error}</div>}

        <div className="post-list">
          {posts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-header">
                <h3>{post.title}</h3>
                <span className={`status-badge ${post.status.toLowerCase()}`}>{post.status}</span>
              </div>
              <p>{post.content}</p>
              <div className="meta-row">
                <span>Platform: {post.platform}</span>
              </div>
              <div className="card-actions">
                <button className="btn secondary" onClick={() => handleEdit(post)}>
                  Edit
                </button>
                <button className="btn danger" onClick={() => handleDelete(post.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="form-section">
        <PostForm editPost={editingPost} onCancel={handleCancel} />
      </div>
    </section>
  );
}

export default Posts;
