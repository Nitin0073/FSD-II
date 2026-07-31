import React from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Posts from './components/Posts.jsx';
import Platforms from './components/Platforms.jsx';
import './styles.css';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-layout">
        <section className="overview-area">
          <Dashboard />
        </section>

        <section className="workspace-area">
          <Posts />
          <Platforms />
        </section>
      </main>
    </div>
  );
}

export default App;
