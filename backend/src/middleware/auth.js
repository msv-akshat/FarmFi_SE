import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'farmfi-secret-2025';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const requireFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ success: false, message: 'Farmer access required' });
  }
  next();
};

export const requireEmployee = (req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ success: false, message: 'Employee access required' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Combined middleware for admin routes
export const adminAuth = [authenticateToken, requireAdmin];
