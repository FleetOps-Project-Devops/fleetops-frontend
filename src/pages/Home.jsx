import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-primary), #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome to FleetOps
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2.5rem' }}>
        The next-generation platform for vehicle maintenance and fleet tracking. Keep your fleet running smoothly.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/vehicles" className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
          View Fleet
        </Link>
        <Link to="/login" className="btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
