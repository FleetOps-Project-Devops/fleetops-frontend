import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const VehicleCard = ({ vehicle, onRequestService }) => {
  const { state } = useContext(AppContext);
  const isDriver = state.role === 'DRIVER' || state.role === 'ROLE_DRIVER';

  const statusColors = {
    ACTIVE: 'var(--accent-success)',
    IN_SERVICE: 'var(--accent-warning)',
    BREAKDOWN: 'var(--accent-danger)',
    RETIRED: 'var(--text-muted)'
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', transition: 'transform 0.2s' }}>
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{vehicle.brand} {vehicle.model}</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {vehicle.vehicleNumber}
            </span>
          </div>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            color: statusColors[vehicle.status] || 'white',
            background: `${statusColors[vehicle.status]}22`,
            padding: '4px 8px',
            borderRadius: '12px',
            border: `1px solid ${statusColors[vehicle.status]}55`
          }}>
            {vehicle.status}
          </span>
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Type:</span>
            <span style={{ color: 'var(--text-primary)' }}>{vehicle.type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mileage:</span>
            <span style={{ color: 'var(--text-primary)' }}>{vehicle.currentMileage} km</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Assigned To:</span>
            <span style={{ color: 'var(--text-primary)' }}>{vehicle.assignedDriverId || 'Unassigned'}</span>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
          {isDriver && vehicle.status === 'ACTIVE' && vehicle.assignedDriverId === state.username && (
            <button 
              className="btn-primary" 
              onClick={onRequestService}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
            >
              Request Service
            </button>
          )}
          {isDriver && vehicle.status !== 'ACTIVE' && vehicle.assignedDriverId === state.username && (
            <div style={{ textAlign: 'center', color: 'var(--accent-warning)', fontSize: '0.9rem' }}>
              Currently {vehicle.status.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
