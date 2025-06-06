-- Enable read access for joined tables
CREATE POLICY "Enable read access for joined tables"
ON "public"."Product"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM "public"."Category"
    WHERE "Category"."id_category" = "Product"."id_category"
  )
);

-- Enable insert for authenticated users with valid category
CREATE POLICY "Enable insert for authenticated users with valid category"
ON "public"."Product"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."Category"
    WHERE "Category"."id_category" = "Product"."id_category"
  )
);

-- Enable update for authenticated users with valid category
CREATE POLICY "Enable update for authenticated users with valid category"
ON "public"."Product"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."Category"
    WHERE "Category"."id_category" = "Product"."id_category"
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."Category"
    WHERE "Category"."id_category" = "Product"."id_category"
  )
);

-- Enable delete for authenticated users with valid category
CREATE POLICY "Enable delete for authenticated users with valid category"
ON "public"."Product"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."Category"
    WHERE "Category"."id_category" = "Product"."id_category"
  )
);

-- Enable read access for categories with products
CREATE POLICY "Enable read access for categories with products"
ON "public"."Category"
AS PERMISSIVE
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM "public"."Product"
    WHERE "Product"."id_category" = "Category"."id_category"
  )
);

-- Prevent category deletion if it has products
CREATE POLICY "Prevent category deletion if it has products"
ON "public"."Category"
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  NOT EXISTS (
    SELECT 1 FROM "public"."Product"
    WHERE "Product"."id_category" = "Category"."id_category"
  )
); 