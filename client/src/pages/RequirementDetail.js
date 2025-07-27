import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, XIcon } from '@heroicons/react/solid';

const RequirementDetail = () => {
  const { id } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [bid, setBid] = useState({
    amount: '',
    deliveryTime: '',
    description: '',
    materials: [{ name: '', quantity: '', unit: '', price: '', quality: 'standard' }],
    photos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequirement();
    // eslint-disable-next-line
  }, [id]);

  const fetchRequirement = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/requirements/${id}`);
      setRequirement(res.data);
    } catch (err) {
      setError('Failed to load requirement');
      toast.error('Failed to load requirement details.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('material')) {
      const materials = [...bid.materials];
      const key = name.split('-')[2];
      materials[index][key] = value;
      setBid({ ...bid, materials });
    } else {
      setBid({ ...bid, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setBid(prevBid => ({ ...prevBid, photos: [...prevBid.photos, ...newFiles] }));
  };

  const removePhoto = (index) => {
    setBid(prevBid => ({
      ...prevBid,
      photos: prevBid.photos.filter((_, i) => i !== index)
    }));
  };

  const addMaterial = () => {
    setBid({ ...bid, materials: [...bid.materials, { name: '', quantity: '', unit: '', price: '', quality: 'standard' }] });
  };
  
  const removeMaterial = (index) => {
    const materials = [...bid.materials];
    materials.splice(index, 1);
    setBid({ ...bid, materials });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bid.materials.some(m => !m.name || !m.quantity || !m.unit || !m.price)) {
      toast.error('Please fill in all material details.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('requirement', id);
    formData.append('amount', bid.amount);
    formData.append('deliveryTime', bid.deliveryTime);
    formData.append('description', bid.description);
    
    // Correctly format materials for backend
    formData.append('materials', JSON.stringify(bid.materials));
    
    bid.photos.forEach(photo => {
      formData.append('photos', photo);
    });
    
    try {
      await axios.post('/api/bids', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Bid submitted successfully!');
      // Optionally reset form or redirect
      setBid({
        amount: '',
        deliveryTime: '',
        description: '',
        materials: [{ name: '', quantity: '', unit: '', price: '', quality: 'standard' }],
        photos: []
      });
      // Consider redirecting: history.push('/my-bids');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bid.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading requirement details...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {requirement && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{requirement.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{requirement.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg shadow">
              <h3 className="font-bold text-gray-500 text-sm">BUDGET</h3>
              <p className="text-2xl font-bold text-primary-600">₹{requirement.budget.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow">
              <h3 className="font-bold text-gray-500 text-sm">CATEGORY</h3>
              <p className="text-lg font-semibold text-gray-800">{requirement.category}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow">
              <h3 className="font-bold text-gray-500 text-sm">BIDDING ENDS</h3>
              <p className="text-lg font-semibold text-gray-800">{new Date(requirement.biddingEndDate).toLocaleDateString()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Place Your Bid</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="label">Your Bid Amount (₹)</label>
                <input type="number" id="amount" name="amount" value={bid.amount} onChange={handleInputChange} className="input-field" required placeholder="e.g., 45000" />
              </div>
              <div>
                <label htmlFor="deliveryTime" className="label">Estimated Delivery (days)</label>
                <input type="number" id="deliveryTime" name="deliveryTime" value={bid.deliveryTime} onChange={handleInputChange} className="input-field" required placeholder="e.g., 14" />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="label">Bid Description</label>
              <textarea id="description" name="description" value={bid.description} onChange={handleInputChange} className="input-field" rows="4" required placeholder="Describe your offer, quality of materials, and any other relevant details..."></textarea>
            </div>

            <div>
              <label className="label">Upload Material Photos</label>
              <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"><span>Upload files</span><input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} /></label><p className="pl-1">or drag and drop</p></div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {bid.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {bid.photos.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="h-24 w-24 object-cover rounded-md shadow-md" />
                      <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-75 group-hover:opacity-100 transition-opacity">
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800">Materials Breakdown</h3>
              <div className="space-y-4 mt-4">
                {bid.materials.map((material, index) => (
                  <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-2 p-3 bg-gray-50 rounded-lg border items-end">
                    <div className="col-span-12 md:col-span-3">
                      <label className="label-sm">Material Name</label>
                      <input type="text" name={`material-${index}-name`} value={material.name} onChange={(e) => handleInputChange(e, index)} className="input-field-sm" required />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="label-sm">Quantity</label>
                      <input type="number" name={`material-${index}-quantity`} value={material.quantity} onChange={(e) => handleInputChange(e, index)} className="input-field-sm" required />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="label-sm">Unit</label>
                      <input type="text" name={`material-${index}-unit`} value={material.unit} onChange={(e) => handleInputChange(e, index)} className="input-field-sm" placeholder="e.g., kg, pcs" required />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="label-sm">Price (₹)</label>
                      <input type="number" name={`material-${index}-price`} value={material.price} onChange={(e) => handleInputChange(e, index)} className="input-field-sm" required />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="label-sm">Quality</label>
                      <select name={`material-${index}-quality`} value={material.quality} onChange={(e) => handleInputChange(e, index)} className="input-field-sm">
                        <option>standard</option>
                        <option>premium</option>
                        <option>economy</option>
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      {bid.materials.length > 1 && (
                        <button type="button" onClick={() => removeMaterial(index)} className="btn-danger-sm">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addMaterial} className="btn-outline flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" /> Add Another Material
                </button>
              </div>
            </div>
            
            <div className="pt-5 border-t">
              <button type="submit" className="btn-primary w-full py-3 text-lg font-bold" disabled={submitting}>
                {submitting ? 'Submitting Bid...' : 'Confirm and Submit Bid'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RequirementDetail;