import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isVendor, isSupplier } = useAuth();
  const [stats, setStats] = useState({
    totalRequirements: 0,
    activeBids: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [recentRequirements, setRecentRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch requirements
      const requirementsResponse = await axios.get('/api/requirements');
      const requirements = requirementsResponse.data.requirements || [];
      
      // Fetch user's bids if supplier
      let userBids = [];
      if (isSupplier) {
        const bidsResponse = await axios.get('/api/bids/my-bids');
        userBids = bidsResponse.data || [];
      }

      // Calculate stats
      const totalRequirements = requirements.length;
      const activeBids = userBids.filter(bid => bid.status === 'pending').length;
      const completedOrders = userBids.filter(bid => bid.status === 'accepted').length;
      const totalRevenue = userBids
        .filter(bid => bid.status === 'accepted')
        .reduce((sum, bid) => sum + bid.amount, 0);

      setStats({
        totalRequirements,
        activeBids,
        completedOrders,
        totalRevenue
      });

      // Get recent requirements
      const recent = requirements.slice(0, 5);
      setRecentRequirements(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'bidding':
        return 'bg-blue-100 text-blue-800';
      case 'awarded':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your {isVendor ? 'vendor' : 'supplier'} account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requirements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequirements}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBids}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isVendor && (
          <Link
            to="/requirements/create"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <PlusIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Requirement</h3>
                <p className="text-gray-600">List your raw material needs</p>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/requirements"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">View Requirements</h3>
              <p className="text-gray-600">
                {isVendor ? 'Manage your requirements' : 'Browse available requirements'}
              </p>
            </div>
          </div>
        </Link>

        {isVendor && (
          <Link
            to="/analytics"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View business insights</p>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/profile"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-gray-600">Manage your account</p>
            </div>
          </div>
        </Link>

        {isSupplier && !user?.isVerified && (
          <div className="card border-l-4 border-yellow-400 bg-yellow-50">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Verification Required</h3>
                <p className="text-gray-600">Complete verification to start bidding</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Requirements */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Requirements</h2>
          <Link
            to="/requirements"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentRequirements.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No requirements found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRequirements.map((requirement) => (
              <div
                key={requirement._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{requirement.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Budget: ₹{requirement.budget.min} - ₹{requirement.budget.max}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {requirement.deliveryLocation.locality}, {requirement.deliveryLocation.city}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(requirement.status)}`}>
                      {requirement.status}
                    </span>
                    <Link
                      to={`/requirements/${requirement._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 