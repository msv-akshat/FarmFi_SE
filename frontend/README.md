# FarmFi Frontend Clean

Beautiful, modern React frontend for FarmFi smart farming platform.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Features

### ✅ Completed
- 🏠 **Beautiful Homepage**
  - Hero section with compelling CTA
  - Feature highlights (6 main features)
  - How it works section (4 steps)
  - Call-to-action section
  - Professional footer
  
- 🔐 **Authentication Pages**
  - Login page with role selector (Farmer/Employee/Admin)
  - Registration page with location selection
  - Phone number authentication for farmers
  - Username authentication for employees/admins
  - Form validation and error handling

### 🚧 Coming Soon
- Farmer Dashboard with analytics
- Field Management (List, Add, Details)
- Crop Management with season validation
- Disease Detection with image upload
- Prediction History with filters
- Settings & Profile

## Getting Started

### Installation

```bash
cd frontend_clean
npm install
```

### Development

```bash
npm run dev
```

Frontend will run on http://localhost:5173

### Build for Production

```bash
npm run build
```

## API Configuration

Backend API is proxied through Vite config:
- Backend: `http://localhost:5000`
- Frontend uses `/api/*` which proxies to backend

## Pages

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Farmer registration

### Protected Routes
- `/dashboard` - Farmer dashboard (coming soon)

## Design System

### Colors
- Primary: Green shades (50-900)
- Success: Green
- Error: Red
- Warning: Yellow
- Info: Blue

### Components
- `btn-primary` - Primary action button
- `btn-secondary` - Secondary button
- `card` - Card container
- `input-field` - Form input

## Project Structure

```
src/
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── Login.jsx         # Login page
│   ├── Register.jsx      # Registration page
│   └── Dashboard.jsx     # Dashboard (placeholder)
├── App.jsx               # Route definitions
├── main.jsx              # React entry point
└── index.css             # Global styles + Tailwind
```

## Next Steps

1. ✅ Setup Vite + React + Tailwind
2. ✅ Create beautiful homepage
3. ✅ Create login page
4. ✅ Create registration page
5. ⏳ Build farmer dashboard with stats
6. ⏳ Implement field management
7. ⏳ Implement crop management
8. ⏳ Implement disease detection
9. ⏳ Build analytics pages
