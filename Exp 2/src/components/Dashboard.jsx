import React from 'react';
import { useSelector } from 'react-redux';
import { selectPostStats } from '../features/postsSlice.js';

function Dashboard() {
  const { totalPosts, totalDrafts, publishedPosts } = useSelector(selectPostStats);
  const platformCount = useSelector((state) => state.platforms.items.length);

  const statCards = [
    { label: 'Total Posts', value: totalPosts },
    { label: 'Drafts', value: totalDrafts },
    { label: 'Published Posts', value: publishedPosts },
    { label: 'Platforms', value: platformCount },
  ];

  return (
    <section className="dashboard-grid">
      {statCards.map((card) => (
        <div className="stat-card" key={card.label}>
          <p>{card.label}</p>
          <h2>{card.value}</h2>
        </div>
      ))}
    </section>
  );
}

export default Dashboard;
