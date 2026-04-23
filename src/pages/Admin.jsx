import React, { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../services/api';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '', price: '', stock: '', imageUrl: '' });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search;
      if (category.trim()) params.category = category;
      const res = await productAPI.getProducts(params);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [search, category, fetchProducts]);

  const getStockColor = (stock) => {
    if (stock === 0) return 'var(--accent-danger)'; // Red
    if (stock <= 5) return 'orange'; // Orange
    return 'var(--accent-success)'; // Green
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = (new Date(dateString) - new Date()) / 1000;
    
    if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  };

  const [actionLoading, setActionLoading] = useState(null);

  const handleRestock = async (id, quantity) => {
    try {
      setActionLoading(`restock-${id}`);
      // Optimistic update
      setProducts(products.map(p => p.id === id ? { ...p, stock: p.stock + quantity } : p));
      const res = await productAPI.updateStock(id, quantity);
      // Final update
      setProducts(products.map(p => p.id === id ? res.data : p));
    } catch (err) {
      alert(err.response?.data || 'Failed to restock');
      // Revert on failure (fetch all)
      fetchProducts();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setActionLoading(`delete-${id}`);
      await productAPI.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('save');
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, formData);
      } else {
        await productAPI.createProduct(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', category: '', price: '', stock: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/40x40?text=No+Img';
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Product Management</h2>
        <button className="btn-primary" onClick={openCreateModal}>+ Add Product</button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ minWidth: '150px' }}>
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Shoes">Shoes</option>
          <option value="Watches">Watches</option>
          <option value="Home">Home</option>
          <option value="Books">Books</option>
        </select>
      </div>

      {/* Product List */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>No Products Found</h3>
            <p>Try adjusting your search or add a new product.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem' }}>Image</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Updated</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      onError={handleImageError}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>₹{p.price}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      color: getStockColor(p.stock),
                      fontWeight: 'bold'
                    }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {getRelativeTime(p.updatedAt)}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button disabled={actionLoading === `restock-${p.id}`} onClick={() => handleRestock(p.id, 10)} style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', border: '1px solid var(--accent-success)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem', opacity: actionLoading === `restock-${p.id}` ? 0.5 : 1 }}>+10</button>
                    <button disabled={actionLoading === `restock-${p.id}`} onClick={() => handleRestock(p.id, 50)} style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', border: '1px solid var(--accent-success)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem', opacity: actionLoading === `restock-${p.id}` ? 0.5 : 1 }}>+50</button>
                    <button onClick={() => openEditModal(p)} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                    <button disabled={actionLoading === `delete-${p.id}`} onClick={() => handleDelete(p.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem', opacity: actionLoading === `delete-${p.id}` ? 0.5 : 1 }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Price (₹)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Stock</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Image URL</label>
                <input type="url" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button disabled={actionLoading === 'save'} type="submit" className="btn-primary" style={{ flex: 1, opacity: actionLoading === 'save' ? 0.5 : 1 }}>{editingProduct ? 'Save Changes' : 'Create'}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
