import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { cartAPI, productAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const CartDrawer = ({ isOpen, onClose }) => {
  const { state, fetchCartCount } = useContext(AppContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (isOpen && state.isAuthenticated) {
      loadCart();
    }
  }, [isOpen, state.isAuthenticated]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await cartAPI.getCart();
      const rawCart = res.data;
      // Enrich cart items with product details
      if (rawCart.items && rawCart.items.length > 0) {
        const enriched = await Promise.all(
          rawCart.items.map(async (item) => {
            try {
              const pRes = await productAPI.getProduct(item.productId);
              return { ...item, product: pRes.data };
            } catch {
              return { ...item, product: { name: `Product #${item.productId}`, price: 0, imageUrl: '' } };
            }
          })
        );
        setCart({ ...rawCart, items: enriched });
      } else {
        setCart(rawCart);
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, transition: 'opacity 0.3s' }}
        />
      )}
      
      {/* Drawer */}
      <div className="glass" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out', zIndex: 1001,
        display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Your Cart</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>&times;</button>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading ? (
            <LoadingSpinner />
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <h3>Your cart is empty</h3>
              <p className="mt-1">Looks like you haven't added anything yet.</p>
              <button className="btn-secondary mt-4" onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.items.map(item => (
                <div key={item.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '0.25rem', fontSize: '0.95rem' }}>{item.product?.name || `Product #${item.productId}`}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                      ₹{item.product?.price ? (item.product.price * item.quantity).toFixed(2) : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items && cart.items.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({cart.items.reduce((a, i) => a + i.quantity, 0)} items)</span>
              <span style={{ fontWeight: 'bold' }}>
                ₹{cart.items.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0).toFixed(2)}
              </span>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              onClick={handleCheckout}
              disabled={ordering}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
