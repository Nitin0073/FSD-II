import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, updatePost } from '../features/postsSlice.js';

function PostForm({ editPost, onCancel }) {
  const platforms = useSelector((state) => state.platforms.items);
  const dispatch = useDispatch();

  const defaultForm = {
    title: '',
    content: '',
    platform: platforms[0] || '',
    status: 'Draft',
  };

  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editPost) {
      setFormData(editPost);
    } else {
      setFormData(defaultForm);
    }
  }, [editPost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    if (editPost) {
      dispatch(updatePost({ id: editPost.id, changes: formData }));
    } else {
      dispatch(addPost({ id: crypto.randomUUID(), ...formData }));
    }

    setFormData(defaultForm);
    setError('');
    if (onCancel) onCancel();
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h3>{editPost ? 'Edit Post' : 'Add New Post'}</h3>

      {error && <p className="error-text">{error}</p>}

      <label>
        Title
        <input name="title" value={formData.title} onChange={handleChange} />
      </label>

      <label>
        Content
        <textarea name="content" value={formData.content} onChange={handleChange} rows="4" />
      </label>

      <label>
        Platform
        <select name="platform" value={formData.platform} onChange={handleChange}>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
      </label>

      <label>
        Status
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn primary">
          {editPost ? 'Update Post' : 'Add Post'}
        </button>
        {editPost && (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default PostForm;
