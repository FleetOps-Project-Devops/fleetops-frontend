import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Login from './pages/Login';
import Requests from './pages/Requests';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          
          <Route path="/requests" element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute requireAdmin={false}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
};

export default App;
