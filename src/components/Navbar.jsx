import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import TaskDrawer from './TaskDrawer';

const Navbar = () => {
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const isManager = state.role === 'MANAGER' || state.role === 'ROLE_MANAGER';
  const isAdmin = state.role === 'ADMIN' || state.role === 'ROLE_ADMIN';
  const isDriver = state.role === 'DRIVER' || state.role === 'ROLE_DRIVER';

  return (
    <>
      <nav className="glass" style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>🚚 FleetOps</Link>
          {state.isAuthenticated && <Link to="/vehicles">Vehicles</Link>}
          {state.isAuthenticated && <Link to="/requests">Requests</Link>}
          {(isManager || isAdmin) && <Link to="/dashboard">Dashboard</Link>}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {state.isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" style={{ color: 'var(--accent-primary)' }}>Admin</Link>
              )}
              {isDriver && (
                  <button className="btn-secondary" onClick={() => setIsTaskOpen(true)} style={{ position: 'relative' }}>
                    Tasks
                    {state.cartItemsCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: 'var(--accent-primary)', color: '#fff',
                        borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem'
                      }}>
                        {state.cartItemsCount}
                      </span>
                    )}
                  </button>
              )}
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span>{state.username} <small style={{color:'gray'}}>({state.role})</small></span>
              <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </nav>
      
      <TaskDrawer isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} />
    </>
  );
};

export default Navbar;
