import React, { useState, useEffect, useContext } from 'react';
import { productAPI, cartAPI } from '../services/api';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const { state, fetchCartCount } = useContext(AppContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productAPI.getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await cartAPI.addToCart(productId, 1);
      fetchCartCount();
    } catch (err) {
      alert("Failed to add to cart: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>All Products</h2>
      </div>

      <div className="grid">
        {loading ? (
          // Show 8 skeletons while loading
          Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
        ) : products.length > 0 ? (
          products.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3>No products found</h3>
            <p>Check back later or run the database seed script.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
