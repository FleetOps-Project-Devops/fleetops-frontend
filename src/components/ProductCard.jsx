import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { state } = useContext(AppContext);

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { product } });
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
         onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
         onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      
      {/* Image Placeholder or Actual Image */}
      <div style={{ height: '200px', width: '100%', backgroundColor: '#2a2a2a', position: 'relative' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No Image
          </div>
        )}
        <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--glass-bg)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
          {product.category}
        </span>
      </div>

      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
        <p style={{ fontSize: '0.9rem', flexGrow: 1, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.description}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            ₹{product.price.toFixed(2)}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-secondary" 
              onClick={(e) => { e.stopPropagation(); onAddToCart(product.id); }}
              disabled={product.stock === 0}
              style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            >
              Add to Cart
            </button>
            <button 
              className="btn-primary" 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
