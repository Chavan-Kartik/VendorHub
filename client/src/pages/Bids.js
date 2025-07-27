import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Bids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBids();
    // eslint-disable-next-line
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/bids/my-bids');
      setBids(res.data || []);
    } catch (err) {
      setError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">Your Bids</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : bids.length === 0 ? (
        <div>No bids found.</div>
      ) : (
        <table className="w-full mb-6">
          <thead>
            <tr className="text-left text-sm text-gray-700">
              <th>Requirement</th>
              <th>Bid Amount</th>
              <th>Status</th>
              <th>Winning</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid._id} className={bid.status === 'accepted' ? 'bg-green-100 font-bold' : ''}>
                <td>
                  <div className="font-semibold">{bid.requirement?.title}</div>
                  <div className="text-xs text-gray-500">{bid.requirement?.description}</div>
                </td>
                <td>₹{bid.amount}</td>
                <td>{bid.status}</td>
                <td>{bid.isWinning ? 'Yes' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Bids; 