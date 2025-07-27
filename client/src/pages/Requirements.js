import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import RequirementBids from '../components/RequirementBids';

const Requirements = () => {
  const { currentUser } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidForm, setBidForm] = useState({ amount: '', deliveryTime: '', description: '', materials: [{ name: '', quantity: '', unit: '' }], photos: [] });
  const [bidPhotos, setBidPhotos] = useState([]);
  const [bidReqId, setBidReqId] = useState(null);

  const isSupplier = currentUser?.userType === 'supplier';
  const isVendor = currentUser?.userType === 'vendor';

  useEffect(() => {
    fetchRequirements();
    // eslint-disable-next-line
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/requirements');
      const allRequirements = response.data.requirements || [];
      if (isVendor) {
        const vendorRequirements = currentUser
          ? allRequirements.filter(req => req.vendor && req.vendor._id === currentUser._id)
          : allRequirements;
        setRequirements(vendorRequirements);
      } else if (isSupplier) {
        // Show only open requirements
        setRequirements(allRequirements.filter(req => req.status === 'open'));
      } else {
        setRequirements([]);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast.error('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const openBidModal = (reqId) => {
    setBidReqId(reqId);
    setBidForm({ amount: '', deliveryTime: '', description: '', materials: [{ name: '', quantity: '', unit: '' }], photos: [] });
    setBidPhotos([]);
    setShowBidModal(true);
  };

  const handleBidChange = (e, idx, field) => {
    if (typeof idx === 'number') {
      const newMaterials = [...bidForm.materials];
      newMaterials[idx][field] = e.target.value;
      setBidForm({ ...bidForm, materials: newMaterials });
    } else {
      setBidForm({ ...bidForm, [e.target.name]: e.target.value });
    }
  };

  const handleBidPhotoChange = (e) => {
    setBidPhotos(Array.from(e.target.files));
  };

  const addBidMaterial = () => {
    setBidForm({ ...bidForm, materials: [...bidForm.materials, { name: '', quantity: '', unit: '' }] });
  };

  const removeBidMaterial = (idx) => {
    setBidForm({ ...bidForm, materials: bidForm.materials.filter((_, i) => i !== idx) });
  };

  const submitBid = async (e) => {
    e.preventDefault();
    if (!bidForm.amount || !bidForm.deliveryTime || !bidForm.description || bidForm.materials.some(m => !m.name || !m.quantity || !m.unit)) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('requirement', bidReqId);
      formData.append('amount', bidForm.amount);
      formData.append('deliveryTime', bidForm.deliveryTime);
      formData.append('description', bidForm.description);
      bidForm.materials.forEach((m, idx) => {
        formData.append(`materials[${idx}][name]`, m.name);
        formData.append(`materials[${idx}][quantity]`, m.quantity);
        formData.append(`materials[${idx}][unit]`, m.unit);
      });
      bidPhotos.forEach(photo => {
        formData.append('photos', photo);
      });
      await axios.post('/api/bids', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
    } catch (err) {
      alert('Failed to place bid: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Supplier view
  if (isSupplier) {
  return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Open Requirements</h1>
        {requirements.length === 0 ? (
          <div className="text-center text-gray-500">No open requirements found.</div>
        ) : (
          <ul className="space-y-4">
            {requirements.map((req) => (
              <li key={req._id} className="p-4 border rounded flex flex-col gap-2">
                <span className="font-medium text-gray-900">{req.title}</span>
                <span className="text-gray-700 text-sm">Budget: ₹{req.budget.min} - ₹{req.budget.max}</span>
                <span className="text-gray-700 text-sm">Delivery: {new Date(req.deliveryDate).toLocaleDateString()}</span>
                <span className="text-gray-700 text-sm">Location: {req.deliveryLocation?.locality}, {req.deliveryLocation?.city}</span>
                <button className="btn-primary w-max" onClick={() => openBidModal(req._id)}>
                  Place Bid
                </button>
              </li>
            ))}
          </ul>
        )}
        {showBidModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowBidModal(false)}>✕</button>
              <h2 className="text-xl font-bold mb-4">Place Bid</h2>
              <form onSubmit={submitBid} className="space-y-4">
                <input
                  type="number"
                  name="amount"
                  placeholder="Bid Amount (₹)"
                  value={bidForm.amount}
                  onChange={handleBidChange}
                  className="input-field w-full"
                  required
                />
                <input
                  type="number"
                  name="deliveryTime"
                  placeholder="Delivery Time (days)"
                  value={bidForm.deliveryTime}
                  onChange={handleBidChange}
                  className="input-field w-full"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Bid Description"
                  value={bidForm.description}
                  onChange={handleBidChange}
                  className="input-field w-full"
                  required
                />
                <div>
                  <h3 className="font-medium mb-2">Materials</h3>
                  {bidForm.materials.map((m, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Material Name"
                        value={m.name}
                        onChange={e => handleBidChange(e, idx, 'name')}
                        className="input-field"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={m.quantity}
                        onChange={e => handleBidChange(e, idx, 'quantity')}
                        className="input-field"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Unit (e.g., kg, boxes)"
                        value={m.unit}
                        onChange={e => handleBidChange(e, idx, 'unit')}
                        className="input-field"
                        required
                      />
                      {bidForm.materials.length > 1 && (
                        <button type="button" onClick={() => removeBidMaterial(idx)} className="text-red-500">Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addBidMaterial} className="btn-outline mt-2">Add Material</button>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Upload Photos</h3>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBidPhotoChange}
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {bidPhotos.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary">Submit Bid</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vendor view (default)
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Requirements</h1>
      {requirements.length === 0 ? (
        <div className="text-center text-gray-500">No requirements found.</div>
      ) : (
        <ul className="space-y-4">
          {requirements.map((req) => (
            <li key={req._id} className="p-4 border rounded flex justify-between items-center gap-2">
              <span className="font-medium text-gray-900">{req.title}</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">{req.status}</span>
              <button className="btn-outline ml-2" onClick={() => setSelectedReqId(req._id)}>
                View Bids
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedReqId && (
        <RequirementBids
          requirementId={selectedReqId}
          onClose={() => setSelectedReqId(null)}
          onAwarded={fetchRequirements}
        />
      )}
    </div>
  );
};

export default Requirements; 