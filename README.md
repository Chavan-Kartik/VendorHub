# Vendor Bidding Platform

A comprehensive web application that connects local vendors with raw material suppliers through a transparent bidding system. Built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Core Functionality
- **Bidding System**: Vendors list raw material requirements, suppliers place competitive bids
- **Analytics Dashboard**: Data-driven insights for vendor growth optimization
- **Verification System**: E-Aadhar and FSSAI license verification for suppliers
- **Locality-based Matching**: Connect vendors and suppliers by location
- **Real-time Updates**: Live status updates for requirements and bids

### Vendor Features
- Create and manage raw material requirements
- Set budget ranges and delivery specifications
- View and compare supplier bids
- Award contracts to winning suppliers
- Analytics dashboard with sales insights
- Growth recommendations based on data

### Supplier Features
- Browse available requirements by locality
- Place competitive bids with pricing and terms
- Document verification (Aadhar + FSSAI)
- Track bid status and order history
- Manage delivery schedules

### Security & Verification
- JWT-based authentication
- Password encryption with bcrypt
- Supplier verification with government documents
- Role-based access control
- Input validation and sanitization

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vendor-bidding-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vendor-bidding
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend client (port 3000).

## 📁 Project Structure

```
vendor-bidding-platform/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── public/            # Static files
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-supplier` - Supplier verification
- `GET /api/auth/profile` - Get user profile

### Requirements
- `GET /api/requirements` - List all requirements
- `POST /api/requirements` - Create new requirement
- `GET /api/requirements/:id` - Get requirement details
- `PUT /api/requirements/:id` - Update requirement
- `POST /api/requirements/:id/award` - Award bid

### Bidding
- `POST /api/bids` - Place a bid
- `GET /api/bids/my-bids` - Get user's bids
- `PUT /api/bids/:id` - Update bid
- `DELETE /api/bids/:id` - Withdraw bid

### Analytics
- `POST /api/analytics/sales-data` - Add sales data
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `POST /api/analytics/generate-recommendations` - Generate insights

## 🎯 Usage

### For Vendors
1. Register as a vendor
2. Create raw material requirements with specifications
3. Review incoming bids from suppliers
4. Award contracts to preferred suppliers
5. Track analytics and growth insights

### For Suppliers
1. Register as a supplier
2. Complete verification with Aadhar and FSSAI documents
3. Browse requirements in your locality
4. Place competitive bids
5. Manage awarded contracts

## 🔒 Security Features

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **Password Security**: bcrypt hashing
- **CORS**: Configured for secure cross-origin requests
- **Helmet**: Security headers middleware

## 📊 Analytics Features

- Sales data tracking and analysis
- Material usage optimization
- Profit margin calculations
- Growth recommendations
- Performance metrics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Real-time notifications
- Mobile app development
- Advanced analytics with ML
- Payment integration
- Delivery tracking
- Supplier rating system
- Multi-language support

---

**Built with ❤️ for the hackathon community** 