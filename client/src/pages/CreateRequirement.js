import React, { useState } from 'react';
import axios from 'axios';

const initialMaterial = { name: '', quantity: '', unit: '' };

const CreateRequirement = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deliveryLocation: { locality: '', city: '' },
    deliveryDate: '',
    budget: { min: '', max: '' },
    materials: [ { ...initialMaterial } ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('deliveryLocation.')) {
      const key = name.split('.')[1];
      setForm({ ...form, deliveryLocation: { ...form.deliveryLocation, [key]: value } });
    } else if (name.startsWith('budget.')) {
      const key = name.split('.')[1];
      setForm({ ...form, budget: { ...form.budget, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleMaterialChange = (idx, e) => {
    const { name, value } = e.target;
    const newMaterials = [...form.materials];
    newMaterials[idx][name] = value;
    setForm({ ...form, materials: newMaterials });
  };

  const addMaterial = () => {
    setForm({ ...form, materials: [...form.materials, { ...initialMaterial }] });
  };

  const removeMaterial = (idx) => {
    setForm({ ...form, materials: form.materials.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple validation
    if (!form.title || !form.deliveryLocation.locality || !form.deliveryLocation.city || !form.deliveryDate || !form.budget.min || !form.budget.max || form.materials.some(m => !m.name || !m.quantity || !m.unit)) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      // Use deliveryDate as biddingEndDate for now (or customize as needed)
      const res = await axios.post('/api/requirements', {
        ...form,
        biddingEndDate: form.deliveryDate
      });
      alert('Requirement submitted successfully!');
      setForm({
        title: '',
        description: '',
        deliveryLocation: { locality: '', city: '' },
        deliveryDate: '',
        budget: { min: '', max: '' },
        materials: [ { ...initialMaterial } ],
      });
    } catch (err) {
      alert('Failed to submit requirement: ' + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Requirement</h1>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="title"
              placeholder="Requirement Title"
              value={form.title}
              onChange={handleChange}
              className="input-field flex-1"
              required
            />
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              className="input-field flex-1"
              required
            />
          </div>
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            className="input-field w-full"
            rows={2}
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="deliveryLocation.locality"
              placeholder="Locality"
              value={form.deliveryLocation.locality}
              onChange={handleChange}
              className="input-field flex-1"
              required
            />
            <input
              type="text"
              name="deliveryLocation.city"
              placeholder="City"
              value={form.deliveryLocation.city}
              onChange={handleChange}
              className="input-field flex-1"
              required
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              name="budget.min"
              placeholder="Min Budget (₹)"
              value={form.budget.min}
              onChange={handleChange}
              className="input-field flex-1"
              required
            />
            <input
              type="number"
              name="budget.max"
              placeholder="Max Budget (₹)"
              value={form.budget.max}
              onChange={handleChange}
              className="input-field flex-1"
              required
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Required Materials</h3>
            {form.materials.map((m, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Material Name"
                  value={m.name}
                  onChange={e => handleMaterialChange(idx, e)}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={m.quantity}
                  onChange={e => handleMaterialChange(idx, e)}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  name="unit"
                  placeholder="Unit (e.g., kg, bunches)"
                  value={m.unit}
                  onChange={e => handleMaterialChange(idx, e)}
                  className="input-field"
                  required
                />
                {form.materials.length > 1 && (
                  <button type="button" onClick={() => removeMaterial(idx)} className="text-red-500">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addMaterial} className="btn-outline mt-2">Add Material</button>
          </div>
          <button type="submit" className="btn-primary">Submit Requirement</button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequirement; 