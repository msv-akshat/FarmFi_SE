import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../config/db.js';
import { AppError } from '../utils/appError.js';

// @desc    Register a new farmer
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        // ✅ FIX: Correctly destructure all the farmer fields from the request body
        const { name, phone, password, mandal_id, village_id } = req.body;

        // Check if phone number already exists
        const existingUser = await sql`
            SELECT * FROM farmers WHERE phone = ${phone}
        `;

        if (existingUser.length > 0) {
            // Use next() to pass the error to the global error handler
            return next(new AppError('Phone number already registered', 400));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ FIX: Insert into the 'farmers' table with all the correct columns
        const result = await sql`
            INSERT INTO farmers (name, phone, password, mandal_id, village_id)
            VALUES (${name}, ${phone}, ${hashedPassword}, ${mandal_id}, ${village_id})
            RETURNING id, name, phone, mandal_id, village_id
        `;

        const farmer = result[0];

        // ✅ FIX: Create a JWT token so the user is automatically logged in after registering
        const token = jwt.sign(
            { id: farmer.id, role: 'farmer' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            data: {
                farmer: {
                    id: farmer.id,
                    name: farmer.name,
                    phone: farmer.phone,
                    mandal_id: farmer.mandal_id,
                    village_id: farmer.village_id
                },
                token // Send the token to the frontend
            }
        });
    } catch (error) {
        console.error("❌ Error in register:", error);
        // Pass any other errors to the global error handler
        next(error);
    }
};


// @desc    Login user (farmer/employee/admin)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { identifier, password, userType } = req.body;

        let user;

        // Determine table based on user type
        switch (userType) {
            case 'farmer':
                user = await sql`
                    SELECT * FROM farmers WHERE phone = ${identifier}
                `;
                break;
            case 'employee':
            case 'admin':
                user = await sql`
                    SELECT * FROM employees 
                    WHERE username = ${identifier} AND role = ${userType}
                `;
                break;
            default:
                return next(new AppError('Invalid user type', 400));
        }

        if (!user.length) {
            return next(new AppError('Invalid credentials', 401));
        }

        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Create token
        const token = jwt.sign(
            { id: user[0].id, role: userType },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Remove password from response
        const { password: pwd, ...userWithoutPassword } = user[0];

        res.status(200).json({
            success: true,
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};