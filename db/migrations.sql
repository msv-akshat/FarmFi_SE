-- Udhyan Setu: Initial Schema Migration

-- Employees table (for admins and employees)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mandals table
CREATE TABLE mandals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Villages table
CREATE TABLE villages (
    id SERIAL PRIMARY KEY,
    mandal_id INTEGER REFERENCES mandals(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(mandal_id, name),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Farmers table (no admin verification needed for registration)
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mandal_id INTEGER REFERENCES mandals(id),
    village_id INTEGER REFERENCES villages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fields table (requires admin verification)
CREATE TABLE fields (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    field_name VARCHAR(100),
    area NUMERIC(10,2),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES employees(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Field Images table
CREATE TABLE field_images (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) CHECK (image_type IN ('leaf', 'growth', 'other')),
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disease Detections table
CREATE TABLE disease_detections (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES field_images(id) ON DELETE CASCADE,
    disease_name VARCHAR(100),
    confidence_score NUMERIC(5,2),
    suggested_action TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crop Data table
CREATE TABLE crop_data (
    id SERIAL PRIMARY KEY,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    crop_year INTEGER NOT NULL,
    season VARCHAR(50) CHECK (season IN ('Kharif', 'Rabi', 'Whole Year')),
    area NUMERIC(10,2),
    production NUMERIC(10,2),
    annual_rainfall NUMERIC(10,2),
    fertilizer NUMERIC(10,2),
    pesticide NUMERIC(10,2),
    yield NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Yield Predictions table
CREATE TABLE yield_predictions (
    id SERIAL PRIMARY KEY,
    crop_data_id INTEGER REFERENCES crop_data(id) ON DELETE CASCADE,
    predicted_yield NUMERIC(10,2),
    confidence_score NUMERIC(5,2),
    prediction_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Actions Log table
CREATE TABLE admin_actions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bulk Upload Records table
CREATE TABLE bulk_uploads (
    id SERIAL PRIMARY KEY,
    uploaded_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);