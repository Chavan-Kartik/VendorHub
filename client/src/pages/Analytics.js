import React, { useState } from 'react';

// Initial mock sales data for the logged-in vendor
const initialSalesData = [
  { date: '2024-06-01', products: [
    { name: 'Vada Pav', quantity: 40, revenue: 600 },
    { name: 'Samosa', quantity: 30, revenue: 400 },
    { name: 'Tea', quantity: 50, revenue: 200 },
  ], total: 1200 },
  { date: '2024-06-02', products: [
    { name: 'Vada Pav', quantity: 35, revenue: 525 },
    { name: 'Samosa', quantity: 25, revenue: 350 },
    { name: 'Tea', quantity: 60, revenue: 240 },
  ], total: 1115 },
  { date: '2024-06-03', products: [
    { name: 'Vada Pav', quantity: 50, revenue: 750 },
    { name: 'Samosa', quantity: 20, revenue: 280 },
    { name: 'Tea', quantity: 55, revenue: 220 },
  ], total: 1250 },
];

const Analytics = () => {
  const [salesData, setSalesData] = useState(initialSalesData);
  const [form, setForm] = useState({
    date: '',
    total: '',
    products: [{ name: '', quantity: '', revenue: '' }],
  });

  // Handle form changes
  const handleFormChange = (e, idx, field) => {
    if (typeof idx === 'number') {
      // Product field
      const newProducts = [...form.products];
      newProducts[idx][field] = e.target.value;
      setForm({ ...form, products: newProducts });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const addProductField = () => {
    setForm({ ...form, products: [...form.products, { name: '', quantity: '', revenue: '' }] });
  };

  const removeProductField = (idx) => {
    const newProducts = form.products.filter((_, i) => i !== idx);
    setForm({ ...form, products: newProducts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (!form.date || !form.total || form.products.some(p => !p.name || !p.quantity || !p.revenue)) {
      alert('Please fill all fields.');
      return;
    }
    // Add new sales entry
    setSalesData([
      ...salesData,
      {
        date: form.date,
        total: Number(form.total),
        products: form.products.map(p => ({
          name: p.name,
          quantity: Number(p.quantity),
          revenue: Number(p.revenue),
        })),
      },
    ]);
    // Reset form
    setForm({ date: '', total: '', products: [{ name: '', quantity: '', revenue: '' }] });
  };

  // Aggregate product sales
  const productTotals = {};
  salesData.forEach(day => {
    day.products.forEach(p => {
      if (!productTotals[p.name]) productTotals[p.name] = { quantity: 0, revenue: 0 };
      productTotals[p.name].quantity += p.quantity;
      productTotals[p.name].revenue += p.revenue;
    });
  });

  const topProduct = Object.entries(productTotals).sort((a, b) => b[1].revenue - a[1].revenue)[0];

  // Smart inventory suggestion
  const inventorySuggestion = topProduct ? `Buy more raw materials for ${topProduct[0]} (Top Seller)` : 'No data yet';

  // SNPL logic (mock)
  const lastDaySales = salesData[salesData.length - 1].total;
  const snplEligible = lastDaySales < 1000;
  const snplLimit = 2000;
  const snplUsed = snplEligible ? 800 : 0;
  const snplDue = snplEligible ? 800 : 0;
  const snplMessage = snplEligible
    ? `You are eligible for Stock-Now-Pay-Later. You can get raw materials worth up to ₹${snplLimit}. Repay ₹${snplDue} in 3-5 days.`
    : 'You are not currently eligible for SNPL. Maintain regular sales to unlock this feature.';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Sales Analytics</h1>

      {/* Sales Entry Form */}
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Enter Today's Sales</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              className="input-field"
              required
            />
            <input
              type="number"
              name="total"
              placeholder="Total Sales (₹)"
              value={form.total}
              onChange={handleFormChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <h3 className="font-medium mb-2">Products Sold</h3>
            {form.products.map((p, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={p.name}
                  onChange={e => handleFormChange(e, idx, 'name')}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={p.quantity}
                  onChange={e => handleFormChange(e, idx, 'quantity')}
                  className="input-field"
                  required
                />
                <input
                  type="number"
                  placeholder="Revenue (₹)"
                  value={p.revenue}
                  onChange={e => handleFormChange(e, idx, 'revenue')}
                  className="input-field"
                  required
                />
                {form.products.length > 1 && (
                  <button type="button" onClick={() => removeProductField(idx)} className="text-red-500">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addProductField} className="btn-outline mt-2">Add Product</button>
          </div>
          <button type="submit" className="btn-primary">Submit Sales</button>
        </form>
      </div>

      {/* Product-wise Sales Table */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4">Product-wise Sales (All Time)</h2>
        <table className="w-full mb-4">
          <thead>
            <tr className="text-left text-sm text-gray-700">
              <th>Product</th>
              <th>Total Quantity Sold</th>
              <th>Total Revenue (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(productTotals).map(([name, data]) => (
              <tr key={name} className="border-b">
                <td>{name}</td>
                <td>{data.quantity}</td>
                <td>₹{data.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Selling Item */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4">Top Selling Item</h2>
        {topProduct ? (
          <div className="text-lg font-bold text-green-700">
            {topProduct[0]} (₹{topProduct[1].revenue} revenue, {topProduct[1].quantity} sold)
          </div>
        ) : (
          <div className="text-gray-600">No sales data available.</div>
        )}
      </div>

      {/* Smart Inventory Suggestion */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4">Smart Inventory Suggestion</h2>
        <div className="text-blue-700 font-medium">{inventorySuggestion}</div>
      </div>

      {/* SNPL Offer */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4">Stock-Now-Pay-Later (SNPL)</h2>
        <div className={snplEligible ? 'text-green-700 font-medium' : 'text-gray-600'}>{snplMessage}</div>
        {snplEligible && (
          <div className="mt-2 text-sm text-gray-700">
            <b>SNPL Used:</b> ₹{snplUsed} <br />
            <b>SNPL Due:</b> ₹{snplDue} <br />
            <b>Repayment Window:</b> 3-5 days
            <button
              className="btn-primary mt-4"
              onClick={() => alert('SNPL granted! You can now purchase raw materials on credit.')}
            >
              Get SNPL Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 