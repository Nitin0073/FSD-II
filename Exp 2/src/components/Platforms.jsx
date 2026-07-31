import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPlatform, removePlatform } from '../features/platformsSlice';

function Platforms() {
  const dispatch = useDispatch();
  const platforms = useSelector((state) => state.platforms.items);
  const [platformInput, setPlatformInput] = useState('');

  const handleAdd = () => {
    if (platformInput.trim()) {
      dispatch(addPlatform(platformInput));
      setPlatformInput('');
    }
  };

  return (
    <section className="platforms-panel">
      <div className="section-heading">
        <h2>Platforms</h2>
      </div>

      <div className="platform-input-row">
        <input
          value={platformInput}
          onChange={(e) => setPlatformInput(e.target.value)}
          placeholder="Add a platform"
        />
        <button className="btn primary" onClick={handleAdd}>
          Add
        </button>
      </div>

      <div className="platform-list">
        {platforms.map((platform) => (
          <div className="platform-pill" key={platform}>
            <span>{platform}</span>
            <button className="icon-btn" onClick={() => dispatch(removePlatform(platform))}>
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Platforms;
