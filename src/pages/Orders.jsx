import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await orderAPI.getOrders();
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Order History</h2>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                  <p style={{ fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    ₹{order.totalAmount != null ? order.totalAmount.toFixed(2) : '0.00'}
                  </p>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '4px', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {order.status || 'COMPLETED'}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Items</h4>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', padding: '0.5rem 0' }}>
                    <div>
                      <span>Product #{item.productId} <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>x{item.quantity}</span></span>
                      <div style={{ marginTop: '0.25rem' }}>
                        <button 
                          onClick={() => navigate('/checkout', { state: { product: { id: item.productId, price: item.priceAtTime, name: `Product #${item.productId}`, imageUrl: '' } } })}
                          style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Reorder
                        </button>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>₹{item.priceAtTime ? item.priceAtTime.toFixed(2) : '0.00'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
