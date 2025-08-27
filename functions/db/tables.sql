-- 1️⃣ Users table
-- Updated Users table with optional contact info
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    password text NOT NULL,           -- hashed password
    is_verified boolean DEFAULT false,
    role text DEFAULT 'user',        -- user, admin
    last_login timestamp with time zone,
    lock_time timestamp null,
    failed_login_attempts int DEFAULT 0,
    account_locked boolean DEFAULT false,
    
    -- Optional contact info
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    country text,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


-- 2️⃣ Email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 3️⃣ Files table (admin uploaded)
CREATE TABLE IF NOT EXISTS files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    gdrive_url text NOT NULL,       -- Google Drive file URL
    file_size bigint,
    price numeric(10,2) DEFAULT 0,
    file_ext text,
    gdrive_file_id text,            -- Google Drive file ID
    is_active boolean DEFAULT true, 
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4️⃣ Payments table
CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    file_id uuid REFERENCES files(id) ON DELETE CASCADE,
    payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
    paypal_order_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD',
    status text DEFAULT 'pending', -- pending, completed, failed
    payment_method text DEFAULT 'paypal',
    payer_email text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5️⃣ Downloads table
CREATE TABLE IF NOT EXISTS downloads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    file_id uuid REFERENCES files(id) ON DELETE CASCADE,
    download_url text NOT NULL UNIQUE,
    downloaded boolean DEFAULT false,
    download_count int DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    last_downloaded_at timestamp with time zone    
);


-- 6️⃣ Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


-- ✅ Indexes for performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_file ON downloads(user_id, file_id);
CREATE INDEX IF NOT EXISTS idx_files_active ON files(is_active);