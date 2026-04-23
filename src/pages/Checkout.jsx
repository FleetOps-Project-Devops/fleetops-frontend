import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { cartAPI, orderAPI, productAPI } from '../services/api';
import { AppContext } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchCartCount } = useContext(AppContext);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Determine mode
  const productFromState = location.state?.product;
  const isBuyNow = !!productFromState;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        if (isBuyNow) {
          // Mock cart item format for the single product
          setItems([{
            id: 'mock',
            productId: productFromState.id,
            quantity: 1,
            product: productFromState
          }]);
        } else {
          // Fetch cart
          const res = await cartAPI.getCart();
          const rawItems = res.data.items || [];
          if (rawItems.length === 0) {
            navigate('/products');
            return;
          }
          // Fetch product details for each cart item
          const populatedItems = await Promise.all(
            rawItems.map(async (item) => {
              try {
                const productRes = await productAPI.getProduct(item.productId);
                return { ...item, product: productRes.data };
              } catch (e) {
                return { ...item, product: { name: 'Unknown Product', price: 0, imageUrl: '' } };
              }
            })
          );
          setItems(populatedItems);
        }
      } catch (err) {
        setError('Failed to load items for checkout.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, [isBuyNow, productFromState, navigate]);

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      setError('');

      let payload;
      if (isBuyNow) {
        payload = {
          type: "BUY_NOW",
          items: [{
            productId: productFromState.id,
            quantity: 1
          }]
        };
      } else {
        payload = { type: "CART" };
      }

      const res = await orderAPI.placeOrder(payload);
      
      // Update global cart count if it was a cart checkout
      if (!isBuyNow) {
        fetchCartCount();
      }

      setSuccessOrder(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Insufficient stock for one or more items.');
      } else if (err.response?.status === 401) {
        // App.js interceptor will handle redirect
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data || 'Failed to place order. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (successOrder) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="glass-panel" style={{ display: 'inline-block', padding: '4rem', maxWidth: '600px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--accent-success)' }}>✓</div>
          <h2 style={{ marginBottom: '1rem' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Thank you for your purchase. Your order number is <strong>#{successOrder.id}</strong>.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
              <span>Total Paid:</span>
              <span style={{ fontWeight: 'bold' }}>₹{successOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/products" className="btn-secondary" style={{ textDecoration: 'none' }}>Continue Shopping</Link>
            <Link to="/orders" className="btn-primary" style={{ textDecoration: 'none' }}>View Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>
      
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--accent-danger)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Left Section - Items */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Order Items</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Img'; }}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', background: 'var(--bg-secondary)' }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.product.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>₹{item.product.price.toFixed(2)} x {item.quantity}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Summary */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ color: 'var(--accent-success)' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tax</span>
                <span>₹0.00</span>
              </div>
              <div style={{ borderTop: '1px dashed var(--glass-border)', margin: '0.5rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-primary)' }}>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Payment Method</h4>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                <input type="radio" checked readOnly style={{ marginRight: '0.5rem' }} />
                <span>Cash on Delivery</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: submitting ? 0.7 : 1 }}
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
