import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const { state, dispatch } = useContext(AppContext);
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <>
      <nav className="glass" style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>🛒 CloudCart</Link>
          <Link to="/products">Products</Link>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {state.isAuthenticated ? (
            <>
              {(state.role === 'ROLE_ADMIN' || state.role === 'ADMIN') && <Link to="/admin" style={{ color: 'var(--accent-primary)' }}>Admin</Link>}
              <Link to="/orders">Orders</Link>
              <button className="btn-secondary" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
                Cart
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
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span>{state.username}</span>
              <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </nav>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
