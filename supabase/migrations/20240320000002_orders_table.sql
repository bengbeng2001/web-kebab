-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INTEGER NOT NULL,
    customer_id UUID REFERENCES customers(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    printed_at TIMESTAMPTZ,
    cashier TEXT NOT NULL,
    channel TEXT NOT NULL,
    order_type TEXT NOT NULL,
    total_items INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    income_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL
);

-- Create order_products table for the one-to-many relationship
CREATE TABLE order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view orders
CREATE POLICY "Allow authenticated users to view orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert orders
CREATE POLICY "Allow authenticated users to insert orders"
    ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update orders
CREATE POLICY "Allow authenticated users to update orders"
    ON orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete orders
CREATE POLICY "Allow authenticated users to delete orders"
    ON orders
    FOR DELETE
    TO authenticated
    USING (true);

-- Add RLS policies for order_products
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view order products
CREATE POLICY "Allow authenticated users to view order products"
    ON order_products
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert order products
CREATE POLICY "Allow authenticated users to insert order products"
    ON order_products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update order products
CREATE POLICY "Allow authenticated users to update order products"
    ON order_products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy to allow authenticated users to delete order products
CREATE POLICY "Allow authenticated users to delete order products"
    ON order_products
    FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes for better performance
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_products_order_id ON order_products(order_id);
CREATE INDEX idx_order_products_product_id ON order_products(product_id); 