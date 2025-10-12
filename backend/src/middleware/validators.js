// validators.js
import { body, validationResult } from 'express-validator';

// Common error handler for validation
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg, // return only first error message
        });
    }
    next();
};

export const validateRegistration = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit phone number'),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('mandal_id')
        .notEmpty().withMessage('Mandal is required')
        .isInt().withMessage('Invalid mandal ID'),

    body('village_id')
        .notEmpty().withMessage('Village is required')
        .isInt().withMessage('Invalid village ID'),
    validate
];

export const validateLogin = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Username/Phone is required'),

    body('password')
        .notEmpty().withMessage('Password is required'),

    body('userType')
        .isIn(['farmer', 'employee', 'admin']).withMessage('Invalid user type'),
    validate
];
