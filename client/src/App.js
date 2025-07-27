import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Requirements from './pages/Requirements';
import CreateRequirement from './pages/CreateRequirement';
import RequirementDetail from './pages/RequirementDetail';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';
import BulkOrder from './pages/BulkOrder';
import StallStockKhata from './pages/StallStockKhata';
import Bids from './pages/Bids';
import AdminVerifySuppliers from './pages/AdminVerifySuppliers';

const PrivateRoute = ({ children, allowedUserTypes = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(user?.userType)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/requirements" 
            element={
              <PrivateRoute>
                <Requirements />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/requirements/create" 
            element={
              <PrivateRoute allowedUserTypes={['vendor']}>
                <CreateRequirement />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/requirements/:id" 
            element={
              <PrivateRoute>
                <RequirementDetail />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute allowedUserTypes={['vendor']}>
                <Analytics />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />

          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/khata" element={<StallStockKhata />} />
          <Route path="/bids" element={<Bids />} />

          <Route
            path="/adminverifysuppliers"
            element={
              <PrivateRoute allowedUserTypes={['admin']}>
                <AdminVerifySuppliers />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App; 