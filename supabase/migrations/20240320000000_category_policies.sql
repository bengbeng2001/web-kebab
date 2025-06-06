-- Enable read access for all users
CREATE POLICY "Enable read access for all users"
ON "public"."Category"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

-- Enable insert for authenticated users only
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."Category"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable update for authenticated users only
CREATE POLICY "Enable update for authenticated users only"
ON "public"."Category"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable delete for authenticated users only
CREATE POLICY "Enable delete for authenticated users only"
ON "public"."Category"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true); 