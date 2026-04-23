import React, { useEffect, useState, useContext } from 'react';
import { requestAPI, vehicleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Requests = () => {
  const { state: appContextState } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesMap, setVehiclesMap] = useState({});

  useEffect(() => {
    const handleInitialState = async () => {
      // If we navigated here to create a request
      if (location.state?.createForVehicle) {
        try {
          const v = location.state.createForVehicle;
          await requestAPI.createRequest({
            vehicleId: v.id,
            vehicleNumber: v.vehicleNumber,
            requestType: v.status === 'BREAKDOWN' ? 'BREAKDOWN' : 'ROUTINE_SERVICE',
            priority: v.status === 'BREAKDOWN' ? 'CRITICAL' : 'MEDIUM',
            description: 'Automated service request'
          });
          // Clear history state so refresh doesn't trigger it again
          window.history.replaceState({}, document.title);
        } catch (e) {
          alert('Failed to create request: ' + (e.response?.data || e.message));
        }
      }
      loadRequests();
    };

    handleInitialState();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [reqsRes, vRes] = await Promise.all([
        requestAPI.getRequests(),
        vehicleAPI.getVehicles() // In real app, only fetch needed
      ]);
      
      const vMap = {};
      vRes.data.forEach(v => vMap[v.id] = v);
      setVehiclesMap(vMap);
      setRequests(reqsRes.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    OPEN: 'var(--text-primary)',
    PENDING_APPROVAL: 'var(--accent-warning)',
    APPROVED: 'var(--accent-success)',
    ASSIGNED: 'var(--accent-info)',
    IN_PROGRESS: 'var(--accent-warning)',
    COMPLETED: 'var(--accent-success)',
    REJECTED: 'var(--accent-danger)',
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Service Requests</h2>

      {requests.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
          <h3>No requests found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {requests.map(req => {
            const v = vehiclesMap[req.vehicleId];
            return (
              <div key={req.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Request #{req.id} — {req.requestType}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Created: {new Date(req.createdAt).toLocaleString()}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Priority: <span style={{color: req.priority === 'CRITICAL' ? 'var(--accent-danger)' : 'inherit'}}>{req.priority}</span></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', color: statusColors[req.status] || 'white', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {req.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <strong>Vehicle:</strong> 
                    <span>{v ? `${v.brand} ${v.model} (${v.vehicleNumber})` : req.vehicleNumber}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <strong>Requested By:</strong> 
                    <span>{req.requestedBy}</span>
                  </div>
                  {req.assignedTechnician && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <strong>Technician:</strong> 
                      <span>{req.assignedTechnician}</span>
                    </div>
                  )}
                  {req.description && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                      <em>"{req.description}"</em>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;
