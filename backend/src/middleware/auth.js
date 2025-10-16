import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

export const protectFarmer = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(new AppError('No token, authorization denied', 401));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'farmer')
      return next(new AppError('Not authorized as farmer', 403));
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    next(new AppError('Token is not valid', 401));
  }
};

export const protectEmployee = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "employee")) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};