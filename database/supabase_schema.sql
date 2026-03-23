-- Supabase PostgreSQL Schema for BusID+

-- 1. Create custom types for ENUMs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'verifier', 'student');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_status') THEN
        CREATE TYPE app_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pass_status') THEN
        CREATE TYPE pass_status AS ENUM ('active', 'expired', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_result') THEN
        CREATE TYPE log_result AS ENUM ('valid', 'invalid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'danger');
    END IF;
END $$;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    roll_no TEXT,
    dept TEXT,
    semester TEXT,
    phone TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    stops TEXT NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    distance TEXT NOT NULL
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id),
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    dept TEXT NOT NULL,
    route_id TEXT NOT NULL REFERENCES routes(id),
    receipt_no TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status app_status DEFAULT 'pending',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    remarks TEXT,
    semester TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT
);

-- 5. Passes Table
CREATE TABLE IF NOT EXISTS passes (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL REFERENCES applications(id),
    student_id TEXT NOT NULL REFERENCES users(id),
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    dept TEXT NOT NULL,
    route_id TEXT NOT NULL REFERENCES routes(id),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    status pass_status DEFAULT 'active',
    photo_url TEXT,
    verify_count INT DEFAULT 0,
    trips_remaining INT DEFAULT 60
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    pass_id TEXT NOT NULL REFERENCES passes(id),
    student_id TEXT NOT NULL REFERENCES users(id),
    route_id TEXT NOT NULL REFERENCES routes(id),
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Verification Logs Table
CREATE TABLE IF NOT EXISTS verify_logs (
    id TEXT PRIMARY KEY,
    pass_id TEXT NOT NULL REFERENCES passes(id),
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    route_id TEXT NOT NULL REFERENCES routes(id),
    result log_result NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip TEXT,
    device TEXT
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Trigger for settings updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

-- 12. Initial Data
INSERT INTO settings (setting_key, setting_value) VALUES
('college_name', 'CITY COLLEGE'),
('academic_year', '2024-25'),
('pass_prefix', 'PASS-'),
('auto_approval', 'false')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO routes (id, name, stops, fare, distance) VALUES
('R01', 'City Center – North Campus', 'City Square → MG Road → College Gate A', 400.00, '12 km'),
('R02', 'East District – Main Campus', 'East Bus Stand → Railway Station → Main Gate', 350.00, '9 km'),
('R03', 'South Hills – Tech Block', 'South Market → Hill Top → Tech Gate', 450.00, '15 km'),
('R04', 'West Zone – Library Block', 'West Colony → Supermarket → Library Gate', 300.00, '7 km'),
('R05', 'Airport Road – Sports Complex', 'Airport Junction → Highway → Sports Gate', 500.00, '18 km')
ON CONFLICT (id) DO NOTHING;

-- Initial Admin Users (Passwords are plain text for now to match current app logic)
INSERT INTO users (id, name, email, password, role) VALUES
('ADMIN_01', 'Nithin N', 'www.nithinnibin@gmail.com', 'nithin@2005', 'admin')
ON CONFLICT (id) DO NOTHING;
-- Announcements Table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id TEXT REFERENCES public.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS for Announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
