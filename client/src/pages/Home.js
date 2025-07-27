import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BuildingStorefrontIcon, 
  TruckIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BuildingStorefrontIcon,
      title: 'Local Vendor Connect',
      description: 'Connect with verified local vendors and suppliers in your area'
    },
    {
      icon: TruckIcon,
      title: 'Bidding System',
      description: 'Transparent bidding process for raw materials and supplies'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Insights',
      description: 'Data-driven insights to optimize your business growth'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Suppliers',
      description: 'All suppliers verified with Aadhar and FSSAI licenses'
    },
    {
      icon: MapPinIcon,
      title: 'Locality Based',
      description: 'Find suppliers and vendors in your specific locality'
    },
    {
      icon: CurrencyRupeeIcon,
      title: 'Cost Optimization',
      description: 'Get the best prices through competitive bidding'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              VendorHub
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Empowering local vendors with digital tools and services. Access bulk buying, digital khata, and transparent bidding as a service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* General Introduction Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-700 mb-4">Welcome to VendorHub</h2>
          <p className="text-lg text-gray-700 mb-6">
            Street vendors operate on razor-thin, day-to-day cash flow. They lack the capital to buy in bulk for better prices and have no access to formal credit. A single day of bad sales can disrupt their ability to buy raw materials for the next day. VendorHub is here to help.
          </p>
          <p className="text-lg text-gray-700">
            We aggregate demand from numerous vendors in a specific area and place a single, large bulk order with wholesalers. This bulk order is delivered to a central "micro-distribution hub" from where vendors can easily collect their share. Plus, our digital ledger (khata) app helps vendors build a trust score and unlock access to micro-credit.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bulk Order Aggregation */}
          <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-2xl font-bold text-primary-700 mb-2">Bulk Order Aggregation (Bidding Service)</h3>
            <p className="text-gray-700 mb-4 text-center">
              Pool your demand with other vendors to access better prices and reliable supply. Collect your share from a central micro-distribution hub.
            </p>
            <Link to="/bulk-order" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Learn More
            </Link>
          </div>
          {/* StallStock Khata & Micro-Credit */}
          <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-2xl font-bold text-primary-700 mb-2">VendorHub Khata & Micro-Credit</h3>
            <p className="text-gray-700 mb-4 text-center">
              Use our digital ledger to track sales, build a trust score, and unlock access to short-term credit for your daily needs.
            </p>
            <Link to="/khata" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose VendorHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform brings together local vendors and suppliers with innovative features 
              designed to streamline your business operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vendors List Requirements
              </h3>
              <p className="text-gray-600">
                Local vendors list their raw material requirements with specifications and budget.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Suppliers Place Bids
              </h3>
              <p className="text-gray-600">
                Verified suppliers place competitive bids with delivery terms and pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Best Bid Wins
              </h3>
              <p className="text-gray-600">
                Vendors select the best bid and suppliers deliver quality materials on time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of vendors and suppliers already using our platform.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Journey Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 