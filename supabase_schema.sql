-- ============================================================
-- SUPABASE SCHEMA CHUẨN ĐỒNG BỘ 100% — Vườn Nha Đam 2026
-- Hỗ trợ mã định danh TEXT (NL01, PN01, Lô 1...) & Đồng bộ 2 chiều
-- Chạy script này trong Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- 1. Xóa các bảng cũ nếu có kiểu dữ liệu UUID để tránh lỗi ép kiểu
DROP TABLE IF EXISTS sales_order_items CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS cost_records CASCADE;
DROP TABLE IF EXISTS production_logs CASCADE;
DROP TABLE IF EXISTS purchase_receipts CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS chemical_logs CASCADE;
DROP TABLE IF EXISTS field_tasks CASCADE;
DROP TABLE IF EXISTS compost_batches CASCADE;
DROP TABLE IF EXISTS circular_nodes CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS plots CASCADE;

-- 2. Tạo bảng Lô đất (plots)
CREATE TABLE plots (
  plot_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  area_m2       NUMERIC(10,2) DEFAULT 0,
  soil_ph       NUMERIC(4,2) DEFAULT 6.5,
  soil_type     TEXT DEFAULT 'Thịt nhẹ',
  status        TEXT DEFAULT 'Chuẩn bị',
  cultivation_stage TEXT DEFAULT 'Làm đất',
  area_coord_code TEXT,
  cultivation_history TEXT,
  last_soil_treatment_date DATE,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. Tạo bảng Cây trồng & Giống (crops)
CREATE TABLE crops (
  crop_id       TEXT PRIMARY KEY,
  plot_id       TEXT,
  plant_type    TEXT DEFAULT 'Nha đam',
  plant_date    DATE,
  density       TEXT,
  stage         TEXT DEFAULT 'Kiến thiết cơ bản',
  seed_source   TEXT,
  plant_count   INT DEFAULT 0,
  seed_count    INT DEFAULT 0,
  seed_batches  JSONB,
  seed_notes    TEXT,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. Tạo bảng Kho vật tư & Nguyên liệu (inventory_items)
CREATE TABLE inventory_items (
  item_id       TEXT PRIMARY KEY,
  item_name     TEXT NOT NULL,
  item_type     TEXT NOT NULL,
  unit          TEXT NOT NULL DEFAULT 'kg',
  qty_in        NUMERIC(12,2) DEFAULT 0,
  qty_out       NUMERIC(12,2) DEFAULT 0,
  qty_remaining NUMERIC(12,2) DEFAULT 0,
  unit_cost     NUMERIC(12,0) DEFAULT 0,
  supplier      TEXT,
  notes         TEXT,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 5. Tạo bảng Phiếu nhập mua hàng (purchase_receipts)
CREATE TABLE purchase_receipts (
  receipt_id          TEXT PRIMARY KEY,
  date                DATE DEFAULT CURRENT_DATE,
  item_id             TEXT,
  item_name           TEXT,
  variety             TEXT,
  supplier            TEXT,
  unit                TEXT DEFAULT 'cây',
  total_received_qty  NUMERIC(12,2) DEFAULT 0,
  goods_cost          NUMERIC(12,0) DEFAULT 0,
  shipping_cost       NUMERIC(12,0) DEFAULT 0,
  discount_amount     NUMERIC(12,0) DEFAULT 0,
  total_cost          NUMERIC(12,0) DEFAULT 0,
  effective_unit_cost NUMERIC(12,0) DEFAULT 0,
  items_list          JSONB,
  notes               TEXT,
  data                JSONB,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 6. Tạo bảng Nhật ký sản xuất / Xuất kho (production_logs)
CREATE TABLE production_logs (
  log_id        TEXT PRIMARY KEY,
  plot_id       TEXT,
  date          DATE DEFAULT CURRENT_DATE,
  material_code TEXT,
  material_name TEXT,
  purpose       TEXT,
  qty_out       NUMERIC(12,2) DEFAULT 0,
  unit          TEXT,
  unit_cost     NUMERIC(12,0) DEFAULT 0,
  total_cost    NUMERIC(12,0) DEFAULT 0,
  target_code   TEXT,
  target_name   TEXT,
  output_qty    NUMERIC(12,2) DEFAULT 0,
  output_unit   TEXT,
  notes         TEXT,
  is_auto_synced BOOLEAN DEFAULT false,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 7. Tạo bảng Lịch tác nghiệp & Nhắc việc (field_tasks)
CREATE TABLE field_tasks (
  task_id         TEXT PRIMARY KEY,
  plot_id         TEXT,
  task_name       TEXT NOT NULL,
  task_type       TEXT NOT NULL,
  execute_date    DATE NOT NULL,
  status          TEXT DEFAULT 'Chờ làm',
  worker_id       TEXT DEFAULT 'Thuý',
  harvest_qty_kg  NUMERIC(10,2) DEFAULT 0,
  harvest_leaves  INT DEFAULT 0,
  stage_milestone TEXT,
  reminder_tag    TEXT,
  day_offset      INT,
  is_auto_reminder BOOLEAN DEFAULT false,
  qr_code         TEXT,
  notes           TEXT,
  completed_at    TIMESTAMPTZ,
  data            JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 8. Tạo bảng BVTV & Dịch hại (chemical_logs)
CREATE TABLE chemical_logs (
  log_id              TEXT PRIMARY KEY,
  plot_id             TEXT,
  agent_name          TEXT NOT NULL,
  agent_type          TEXT,
  dose                TEXT,
  date_applied        DATE NOT NULL,
  phi_days            INT NOT NULL DEFAULT 7,
  harvest_allowed_date DATE,
  technique_notes     TEXT,
  is_correct_drug     BOOLEAN DEFAULT true,
  is_correct_time     BOOLEAN DEFAULT true,
  is_correct_dose     BOOLEAN DEFAULT true,
  is_correct_technique BOOLEAN DEFAULT true,
  data                JSONB,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 9. Tạo bảng Tuần hoàn & Mẻ ủ (circular_nodes & compost_batches)
CREATE TABLE circular_nodes (
  node_id       TEXT PRIMARY KEY,
  node_type     TEXT NOT NULL,
  input_source  TEXT,
  capacity      TEXT,
  status        TEXT DEFAULT 'Hoạt động',
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE compost_batches (
  batch_id          TEXT PRIMARY KEY,
  node_id           TEXT,
  compost_type      TEXT DEFAULT 'Ủ nhanh',
  input_mass_kg     NUMERIC(10,2),
  input_composition TEXT,
  temp_target_min   NUMERIC(5,1) DEFAULT 50,
  temp_target_max   NUMERIC(5,1) DEFAULT 60,
  humidity_pct      NUMERIC(5,1),
  start_date        DATE NOT NULL,
  cover_removal_date DATE,
  next_check_date   DATE,
  turn_interval_days INT DEFAULT 14,
  status            TEXT DEFAULT 'Đang ủ',
  notes             TEXT,
  data              JSONB,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 10. Tạo bảng Bán hàng & Khách hàng (products, customers, sales_orders)
CREATE TABLE products (
  product_id      TEXT PRIMARY KEY,
  product_name    TEXT NOT NULL,
  product_type    TEXT NOT NULL,
  unit            TEXT NOT NULL,
  unit_price      NUMERIC(12,0) DEFAULT 0,
  qty_in_stock    NUMERIC(10,2) DEFAULT 0,
  source_type     TEXT DEFAULT 'Tự làm',
  linked_plot_id  TEXT,
  data            JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customers (
  customer_id         TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  phone               TEXT,
  address             TEXT,
  note                TEXT,
  first_purchase_date DATE,
  data                JSONB,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sales_orders (
  order_id        TEXT PRIMARY KEY,
  customer_id     TEXT,
  order_date      DATE DEFAULT CURRENT_DATE,
  channel         TEXT DEFAULT 'Tại vườn',
  total_amount    NUMERIC(12,0) DEFAULT 0,
  amount_paid     NUMERIC(12,0) DEFAULT 0,
  payment_status  TEXT DEFAULT 'Còn nợ',
  items_list      JSONB,
  note            TEXT,
  data            JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 11. Bật phân quyền truy cập công khai an toàn (Row Level Security - Full Access for Anon)
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemical_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE circular_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compost_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'plots','crops','inventory_items','purchase_receipts','production_logs',
    'field_tasks','chemical_logs','circular_nodes','compost_batches',
    'products','customers','sales_orders'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon" ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated" ON %I', t);
    EXECUTE format('CREATE POLICY "Allow all for anon" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
