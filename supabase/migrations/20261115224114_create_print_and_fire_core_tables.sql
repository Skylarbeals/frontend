/*
# Create Print & Fire core tables, quote file storage, and access rules

## 1. Plain-English summary
This sets up everything the Print & Fire website stores:
- The filaments the shop has on hand, with notes on what each one is best used for.
- Items for sale in the current inventory.
- Customer quote requests, including the customer's contact details, chosen filament and color, comment, and a link to their uploaded 3D file.
- A private storage bucket where customer 3D files are kept.

## 2. New Tables
- `filaments`
  - `id` (uuid, primary key)
  - `name` (text, required) - display name such as "Matte Black PLA"
  - `material` (text, required) - for example PLA, PETG, ABS, TPU
  - `color` (text, required) - color name shown to customers
  - `color_hex` (text, optional) - swatch color such as #1f1f1f
  - `best_used_for` (text, required) - guidance for customers
  - `in_stock` (boolean, default true)
  - `created_at` (timestamptz)
- `inventory_items`
  - `id` (uuid, primary key)
  - `name` (text, required)
  - `description` (text, optional)
  - `price_cents` (integer, required, zero or more) - price in cents
  - `quantity` (integer, required, zero or more) - units available
  - `image_url` (text, optional)
  - `created_at` (timestamptz)
- `quote_requests`
  - `id` (uuid, primary key)
  - `customer_name` (text, required)
  - `customer_email` (text, required)
  - `material` (text, required) - filament type the customer picked
  - `color` (text, required) - color the customer picked
  - `comment` (text, optional)
  - `file_path` (text, required) - location of the uploaded file in storage
  - `file_name` (text, required) - original file name
  - `status` (text, default 'new'; one of new, quoted, closed)
  - `created_at` (timestamptz)

## 3. Storage
- New private bucket `quote-files` for customer uploads (limit 50 MB per file). Files are not publicly viewable.

## 4. Security changes
- Row level security is enabled on all three tables.
- `filaments` and `inventory_items`: anyone using the site can read, add, edit, and delete rows. This is intentional for the current no-sign-in setup and must be revisited before adding a staff login.
- `quote_requests`: anyone can submit a request (insert) but nobody using the public site can read existing requests.
- Storage: anyone can upload into `quote-files`; nobody can read or delete objects through the public API.
- Grants are given explicitly to `anon` and `authenticated` for only the verbs the app uses.

## 5. Important notes
1. No existing data is changed or removed. This migration only creates new objects and is safe to re-run.
2. Quote requests and uploaded files are readable only from the database dashboard until a staff sign-in is added.
*/

CREATE TABLE IF NOT EXISTS filaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  material text NOT NULL,
  color text NOT NULL,
  color_hex text,
  best_used_for text NOT NULL,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  material text NOT NULL,
  color text NOT NULL,
  comment text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE filaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON filaments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_items TO anon, authenticated;
GRANT INSERT ON quote_requests TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_filaments" ON filaments;
CREATE POLICY "anon_select_filaments" ON filaments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_filaments" ON filaments;
CREATE POLICY "anon_insert_filaments" ON filaments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_filaments" ON filaments;
CREATE POLICY "anon_update_filaments" ON filaments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_filaments" ON filaments;
CREATE POLICY "anon_delete_filaments" ON filaments FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_inventory_items" ON inventory_items;
CREATE POLICY "anon_select_inventory_items" ON inventory_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inventory_items" ON inventory_items;
CREATE POLICY "anon_insert_inventory_items" ON inventory_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inventory_items" ON inventory_items;
CREATE POLICY "anon_update_inventory_items" ON inventory_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inventory_items" ON inventory_items;
CREATE POLICY "anon_delete_inventory_items" ON inventory_items FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quote_requests" ON quote_requests;
CREATE POLICY "anon_insert_quote_requests" ON quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('quote-files', 'quote-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_quote_files" ON storage.objects;
CREATE POLICY "anon_upload_quote_files" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'quote-files');
