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
  const [actionLoading, setActionLoading] = useState('');
  const [assignModal, setAssignModal] = useState({ open: false, requestId: null, technician: '' });
  const [completeModal, setCompleteModal] = useState({ open: false, requestId: null, resolutionNotes: '', downtimeHours: '' });

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

  const isManagerOrAdmin = ['MANAGER', 'ROLE_MANAGER', 'ADMIN', 'ROLE_ADMIN'].includes(appContextState.role);

  const handleStatusUpdate = async (id, status) => {
    try {
      setActionLoading(`${id}:${status}`);
      await requestAPI.updateStatus(id, status);
      await loadRequests();
    } catch (err) {
      alert(err.response?.data || err.message || 'Failed to update status');
    } finally {
      setActionLoading('');
    }
  };

  const handleAssign = async (id, technician) => {
    if (!technician?.trim()) {
      alert('Technician username is required');
      return;
    }
    try {
      setActionLoading(`${id}:ASSIGN`);
      await requestAPI.assignTechnician(id, technician.trim());
      await loadRequests();
      setAssignModal({ open: false, requestId: null, technician: '' });
    } catch (err) {
      alert(err.response?.data || err.message || 'Failed to assign technician');
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async (id, resolutionNotes, downtimeHoursInput) => {
    const downtimeHours = downtimeHoursInput === '' ? null : Number(downtimeHoursInput);
    if (downtimeHoursInput !== '' && Number.isNaN(downtimeHours)) {
      alert('Downtime hours must be a number');
      return;
    }
    try {
      setActionLoading(`${id}:COMPLETE`);
      await requestAPI.completeRequest(id, { resolutionNotes, downtimeHours });
      await loadRequests();
      setCompleteModal({ open: false, requestId: null, resolutionNotes: '', downtimeHours: '' });
    } catch (err) {
      alert(err.response?.data || err.message || 'Failed to complete request');
    } finally {
      setActionLoading('');
    }
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
                  {isManagerOrAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {req.status === 'OPEN' && (
                        <button className="btn-secondary" disabled={actionLoading === `${req.id}:PENDING_APPROVAL`} onClick={() => handleStatusUpdate(req.id, 'PENDING_APPROVAL')}>
                          Move to Pending Approval
                        </button>
                      )}
                      {req.status === 'PENDING_APPROVAL' && (
                        <>
                          <button className="btn-primary" disabled={actionLoading === `${req.id}:APPROVED`} onClick={() => handleStatusUpdate(req.id, 'APPROVED')}>
                            Approve
                          </button>
                          <button className="btn-secondary" disabled={actionLoading === `${req.id}:REJECTED`} onClick={() => handleStatusUpdate(req.id, 'REJECTED')}>
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === 'APPROVED' && (
                        <button
                          className="btn-primary"
                          disabled={actionLoading === `${req.id}:ASSIGN`}
                          onClick={() => setAssignModal({ open: true, requestId: req.id, technician: req.assignedTechnician || '' })}
                        >
                          Assign Technician
                        </button>
                      )}
                      {req.status === 'ASSIGNED' && (
                        <button className="btn-primary" disabled={actionLoading === `${req.id}:IN_PROGRESS`} onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')}>
                          Start Work
                        </button>
                      )}
                      {req.status === 'IN_PROGRESS' && (
                        <button
                          className="btn-primary"
                          disabled={actionLoading === `${req.id}:COMPLETE`}
                          onClick={() => setCompleteModal({ open: true, requestId: req.id, resolutionNotes: req.resolutionNotes || '', downtimeHours: req.downtimeHours ?? '' })}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assignModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Assign Technician</h3>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Technician Username</label>
            <input
              type="text"
              value={assignModal.technician}
              onChange={(e) => setAssignModal((prev) => ({ ...prev, technician: e.target.value }))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setAssignModal({ open: false, requestId: null, technician: '' })}>Cancel</button>
              <button
                className="btn-primary"
                disabled={actionLoading === `${assignModal.requestId}:ASSIGN`}
                onClick={() => handleAssign(assignModal.requestId, assignModal.technician)}
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {completeModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Complete Request</h3>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Resolution Notes</label>
            <textarea
              rows={4}
              value={completeModal.resolutionNotes}
              onChange={(e) => setCompleteModal((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
              style={{ width: '100%', resize: 'vertical' }}
            />
            <label style={{ display: 'block', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Downtime Hours (optional)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={completeModal.downtimeHours}
              onChange={(e) => setCompleteModal((prev) => ({ ...prev, downtimeHours: e.target.value }))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => setCompleteModal({ open: false, requestId: null, resolutionNotes: '', downtimeHours: '' })}>Cancel</button>
              <button
                className="btn-primary"
                disabled={actionLoading === `${completeModal.requestId}:COMPLETE`}
                onClick={() => handleComplete(completeModal.requestId, completeModal.resolutionNotes, completeModal.downtimeHours)}
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
