import React, { useState, useEffect, useCallback } from 'react';
import { vehicleAPI } from '../services/api';

const Admin = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({ vehicleNumber: '', brand: '', model: '', type: '', status: 'ACTIVE', currentMileage: 0, assignedDriverId: '' });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.driverId = search; // Naive search mapping to driverId for now
      if (statusFilter.trim()) params.status = statusFilter;
      const res = await vehicleAPI.getVehicles(params);
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 500); 
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchVehicles]);

  const [actionLoading, setActionLoading] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to retire this vehicle?')) return;
    try {
      setActionLoading(`delete-${id}`);
      await vehicleAPI.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (err) {
      alert('Failed to delete vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('save');
      if (editingVehicle) {
        await vehicleAPI.updateVehicle(editingVehicle.id, formData);
      } else {
        await vehicleAPI.createVehicle(formData);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      alert('Failed to save vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({ vehicleNumber: '', brand: '', model: '', type: '', status: 'ACTIVE', currentMileage: 0, assignedDriverId: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Fleet Administration</h2>
        <button className="btn-primary" onClick={openCreateModal}>+ Add Vehicle</button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by Assigned Driver..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '150px' }}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="IN_SERVICE">IN_SERVICE</option>
          <option value="BREAKDOWN">BREAKDOWN</option>
          <option value="RETIRED">RETIRED</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : vehicles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>No Vehicles Found</h3>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem' }}>Plate</th>
                <th style={{ padding: '1rem' }}>Make/Model</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Mileage</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{v.vehicleNumber}</td>
                  <td style={{ padding: '1rem' }}>{v.brand} {v.model}</td>
                  <td style={{ padding: '1rem' }}>{v.type}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{v.currentMileage} km</td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button onClick={() => openEditModal(v)} style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                    <button disabled={actionLoading === `delete-${v.id}`} onClick={() => handleDelete(v.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)', border: '1px solid var(--accent-danger)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem', opacity: actionLoading === `delete-${v.id}` ? 0.5 : 1 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Plate Number</label>
                  <input type="text" required value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%' }}>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Brand</label>
                  <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Model</label>
                  <input type="text" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%' }}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="IN_SERVICE">IN_SERVICE</option>
                    <option value="BREAKDOWN">BREAKDOWN</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Current Mileage</label>
                  <input type="number" required value={formData.currentMileage} onChange={e => setFormData({...formData, currentMileage: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Assigned Driver Username</label>
                <input type="text" value={formData.assignedDriverId || ''} onChange={e => setFormData({...formData, assignedDriverId: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button disabled={actionLoading === 'save'} type="submit" className="btn-primary" style={{ flex: 1, opacity: actionLoading === 'save' ? 0.5 : 1 }}>{editingVehicle ? 'Save Changes' : 'Create'}</button>
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
