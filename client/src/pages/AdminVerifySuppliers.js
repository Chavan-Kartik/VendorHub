import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminVerifySuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users?userType=supplier');
      setSuppliers(res.data || []);
    } catch (err) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.post(`/api/suppliers/${id}/verify`);
      toast.success('Supplier verified!');
      fetchSuppliers();
    } catch (err) {
      toast.error('Failed to verify supplier');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">Verify Suppliers</h1>
      {loading ? (
        <div>Loading...</div>
      ) : suppliers.length === 0 ? (
        <div>No suppliers found.</div>
      ) : (
        <table className="w-full mb-6">
          <thead>
            <tr className="text-left text-sm text-gray-700">
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td>{s.verified ? 'Verified' : 'Pending'}</td>
                <td>
                  {!s.verified && (
                    <button className="btn-primary" onClick={() => handleVerify(s._id)}>
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminVerifySuppliers; 