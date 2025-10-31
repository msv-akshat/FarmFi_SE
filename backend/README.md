# FarmFi Clean Backend

## ✅ Completed Features

### Authentication & Authorization
- ✅ Farmer registration with phone number
- ✅ Login for Farmer/Employee/Admin
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Change password with old password verification
- ✅ Get mandals and villages for registration

### Farmer Dashboard
- ✅ Get dashboard statistics (fields, crops, area, predictions)

### Field Management
- ✅ Create field with any mandal/village location
- ✅ Get all fields with filters (status)
- ✅ Get field details with full analytics
- ✅ View crops per field
- ✅ View disease predictions per field

### Crop Management  
- ✅ Create crop with season validation rules:
  - No duplicate Rabi in same year
  - No duplicate Kharif in same year
  - No "Whole Year" if other crops exist
  - No other crops if "Whole Year" exists
- ✅ Get all crops with filters (status, field, season, year)
- ✅ Get crop details with prediction history
- ✅ Get current growing crops for disease detection
- ✅ Only approved crops can be used for predictions

### Disease Detection & Predictions
- ✅ Save disease prediction from Lambda
- ✅ Get all predictions with filters (field, crop, severity)
- ✅ Get prediction details
- ✅ Link predictions to approved crops only

### Utilities
- ✅ Get all crop types

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
```
POST   /register              - Farmer registration
POST   /login                 - Login (farmer/employee/admin)
GET    /locations             - Get mandals & villages
POST   /change-password       - Change password
```

### Farmer Routes (`/api/farmer`) - All Protected
```
GET    /dashboard/stats       - Dashboard statistics
GET    /fields                - Get all fields (?status=)
POST   /fields                - Create field
GET    /fields/:id            - Field details with analytics
GET    /fields/:id/current-crops - Current growing crops
GET    /crops                 - Get all crops (?status, ?field_id, ?season, ?year)
POST   /crops                 - Create crop
GET    /crops/:id             - Crop details with predictions
GET    /predictions           - Get predictions (?field_id, ?crop_id, ?severity)
POST   /predictions           - Save prediction
GET    /predictions/:id       - Prediction details
GET    /crop-types            - Get all crop types
```

## 🚀 Running the Server

```bash
cd backend_clean
npm install
npm start       # Production
npm run dev     # Development with auto-reload
```

Server runs on: http://localhost:5000
Health check: http://localhost:5000/health

## 📋 Environment Variables

Create `.env` file:
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## ✨ Key Features

1. **Season Validation** - Prevents crop conflicts
2. **Approval Workflow** - Fields/crops need verification
3. **Secure Auth** - Bcrypt password hashing
4. **Role-based Access** - Middleware for different roles
5. **Comprehensive Analytics** - Detailed stats for fields/crops
6. **Disease Tracking** - Full prediction history

## 📝 Next Steps

Build the frontend with:
- Registration & Login forms
- Dashboard with stats
- Field management pages
- Crop management with season validation
- Disease detection with image upload
- Analytics pages
- Prediction history with filters
