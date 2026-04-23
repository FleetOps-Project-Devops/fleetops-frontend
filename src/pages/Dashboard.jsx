import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await vehicleAPI.getDashboard();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const statCards = [
    { title: "Total Fleet", value: stats?.total || 0, icon: "🚛" },
    { title: "Active", value: stats?.active || 0, icon: "✅", color: "var(--accent-success)" },
    { title: "In Service", value: stats?.inService || 0, icon: "🔧", color: "var(--accent-warning)" },
    { title: "Breakdowns", value: stats?.breakdown || 0, icon: "🚨", color: "var(--accent-danger)" },
    { title: "Expiring Insurance", value: stats?.insuranceExpiring || 0, icon: "🛡️", color: "var(--accent-warning)" },
    { title: "Service Due", value: stats?.serviceDue || 0, icon: "📅", color: "var(--accent-warning)" },
  ];

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Fleet Manager Dashboard</h2>
      
      <div className="grid">
        {statCards.map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{card.title}</p>
              <h3 style={{ fontSize: '1.8rem', color: card.color || 'var(--text-primary)' }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
