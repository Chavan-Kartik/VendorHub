import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RequirementBids = ({ requirementId, onClose, onAwarded }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, text: '', bidId: null });
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    if (requirementId) {
      fetchBids();
    }
    // eslint-disable-next-line
  }, [requirementId]);

  const fetchBids = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/bids/requirement/${requirementId}`);
      setBids(res.data || []);
    } catch (err) {
      setError('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const handleAward = async (bidId) => {
    setAwarding(true);
    try {
      await axios.post(`/api/requirements/${requirementId}/award`, { bidId });
      alert('Bid awarded successfully!');
      if (onAwarded) onAwarded();
      fetchBids();
    } catch (err) {
      alert('Failed to award bid: ' + (err.response?.data?.message || err.message));
    } finally {
      setAwarding(false);
    }
  };

  const handleReview = async (bidId) => {
    if (!review.text) {
      alert('Please enter a comment for the review.');
      return;
    }
    try {
      await axios.post(`/api/bids/${bidId}/reviews`, {
        rating: review.rating,
        text: review.text
      });
      alert('Review submitted!');
      setReview({ rating: 5, text: '', bidId: null });
      fetchBids();
    } catch (err) {
      alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!requirementId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-bold mb-4">Bids for Requirement</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : bids.length === 0 ? (
          <div>No bids found.</div>
        ) : (
          <ul className="space-y-4">
            {bids.map((bid) => (
              <li key={bid._id} className="border rounded p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div><b>Supplier:</b> {bid.supplier?.name} {bid.supplier?.isVerified && <span className="text-green-600 text-xs ml-2">(Verified)</span>}</div>
                    <div><b>Amount:</b> ₹{bid.amount}</div>
                    <div><b>Delivery Time:</b> {bid.deliveryTime} days</div>
                  </div>
                  <button
                    className="btn-primary"
                    disabled={awarding}
                    onClick={() => handleAward(bid._id)}
                  >
                    Award Bid
                  </button>
                </div>
                {bid.photos && bid.photos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {bid.photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:5000${url}`}
                        alt={`Bid Photo ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
                <div><b>Bid Description:</b> {bid.description}</div>
                <div><b>Materials:</b> {bid.materials.map(m => `${m.name} (${m.quantity} ${m.unit})`).join(', ')}</div>
                <div className="mt-2">
                  <b>Reviews for this Bid:</b>
                  {bid.reviews?.length ? (
                    <ul className="ml-4 list-disc">
                      {bid.reviews.map((r, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{r.rating}★</span> {r.text} <span className="text-xs text-gray-500">by {r.reviewer?.name || 'Vendor'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span> No reviews yet.</span>
                  )}
                </div>
                <div className="mt-2">
                  <b>Add Review:</b>
                  <div className="flex gap-2 items-center mt-1">
                    <select
                      value={review.bidId === bid._id ? review.rating : 5}
                      onChange={e => setReview({ ...review, rating: Number(e.target.value), bidId: bid._id })}
                      className="input-field w-20"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
                    </select>
                    <input
                      type="text"
                      placeholder="Comment"
                      value={review.bidId === bid._id ? review.text : ''}
                      onChange={e => setReview({ ...review, text: e.target.value, bidId: bid._id })}
                      className="input-field flex-1"
                    />
                    <button
                      className="btn-outline"
                      onClick={() => handleReview(bid._id)}
                      type="button"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RequirementBids;