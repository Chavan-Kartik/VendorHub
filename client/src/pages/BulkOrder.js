import React from 'react';

const BulkOrder = () => (
  <div className="max-w-3xl mx-auto py-16 px-4">
    <h1 className="text-4xl font-bold mb-6 text-primary-700">Bulk Order Aggregation (Bidding Service)</h1>
    <p className="text-lg mb-4">
      VendorHub aggregates demand from numerous vendors in a specific geographical area and places a single, large bulk order with wholesalers. This bulk order is delivered to a central <b>micro-distribution hub</b> from where vendors can easily collect their share.
    </p>
    <p className="mb-4">
      By pooling orders and using our transparent bidding service, vendors get access to better prices and reliable supply, overcoming the limitations of small, individual purchases. This service helps vendors save money, reduce risk, and ensure they have the raw materials they need every day.
    </p>
    <div className="mt-8">
      <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
        Join Bulk Order Program
      </button>
    </div>
  </div>
);

export default BulkOrder; 