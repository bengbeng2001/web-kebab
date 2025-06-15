-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view customers
CREATE POLICY "Allow authenticated users to view customers"
    ON customers
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert customers
CREATE POLICY "Allow authenticated users to insert customers"
    ON customers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update customers
CREATE POLICY "Allow authenticated users to update customers"
    ON customers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete customers
CREATE POLICY "Allow authenticated users to delete customers"
    ON customers
    FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes for better performance
CREATE INDEX idx_customers_phone_number ON customers(phone_number); 