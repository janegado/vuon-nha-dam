-- ============================================================
-- SUPABASE SCHEMA — App Quản Trị Vườn Nha Đam
-- Chạy script này trong Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- ============ MODULE 1: Lô & Cây trồng ============

CREATE TABLE plots (
  plot_id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  area_m2       NUMERIC(10,2),
  soil_ph       NUMERIC(4,2),
  soil_type     TEXT,          -- thành phần cơ giới
  status        TEXT DEFAULT 'Đang canh tác',  -- Đang canh tác / Nghỉ / Chuẩn bị
  area_coord_code TEXT,        -- mã định danh khu vực
  cultivation_history TEXT,    -- lịch sử canh tác
  last_soil_treatment_date DATE, -- ngày cày phơi ải/bón vôi gần nhất
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE crops (
  crop_id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plot_id       UUID REFERENCES plots(plot_id) ON DELETE CASCADE,
  plant_type    TEXT DEFAULT 'Nha đam',
  plant_date    DATE,
  density       TEXT,          -- mật độ trồng (VD: "25cm x 30cm")
  stage         TEXT DEFAULT 'Kiến thiết cơ bản',  -- Kiến thiết cơ bản / Kinh doanh
  seed_source   TEXT,          -- nguồn gốc giống
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============ MODULE 2: Vòng tuần hoàn ============

CREATE TABLE circular_nodes (
  node_id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type     TEXT NOT NULL,  -- Ủ phân / Trùn quế / Khí sinh học
  input_source  TEXT,           -- nguồn đầu vào
  capacity      TEXT,           -- sức chứa
  status        TEXT DEFAULT 'Hoạt động',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE compost_batches (
  batch_id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id           UUID REFERENCES circular_nodes(node_id) ON DELETE CASCADE,
  compost_type      TEXT DEFAULT 'Ủ nhanh',  -- Ủ nhanh (7-10 ngày) / Ủ chuyên biệt bã nha đam (70 ngày)
  input_mass_kg     NUMERIC(10,2),
  input_composition TEXT,       -- VD: "60% bã nha đam, 20% xác bã, 20% phân bò"
  temp_target_min   NUMERIC(5,1) DEFAULT 50,   -- °C - theo compost_type
  temp_target_max   NUMERIC(5,1) DEFAULT 60,
  humidity_pct      NUMERIC(5,1),
  start_date        DATE NOT NULL,
  cover_removal_date DATE,     -- ngày dỡ bạt
  next_check_date   DATE,      -- ngày kiểm tra nhiệt độ tiếp
  turn_interval_days INT DEFAULT 14,  -- tần suất đảo trộn
  status            TEXT DEFAULT 'Đang ủ',  -- Đang ủ / Hoàn thành / Hủy
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============ MODULE 3: Lịch tác nghiệp & Nhật ký ============

CREATE TABLE field_tasks (
  task_id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plot_id         UUID REFERENCES plots(plot_id) ON DELETE CASCADE,
  task_name       TEXT NOT NULL,
  task_type       TEXT NOT NULL,  -- Tưới / Bón phân / Làm cỏ / Tỉa lá / Xịt thuốc / Thu hoạch / Khác
  execute_date    DATE NOT NULL,
  status          TEXT DEFAULT 'Chờ làm',  -- Chờ làm / Đã hoàn thành / Bỏ qua
  worker_id       TEXT DEFAULT 'Thuý',
  harvest_qty_kg  NUMERIC(10,2),  -- số kg thu hoạch (nếu task_type = Thu hoạch)
  harvest_leaves  INT,            -- số lá thu hoạch
  qr_code         TEXT,
  notes           TEXT,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============ MODULE 4: BVTV & Dịch hại ============

CREATE TABLE chemical_logs (
  log_id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plot_id             UUID REFERENCES plots(plot_id) ON DELETE CASCADE,
  agent_name          TEXT NOT NULL,     -- tên thuốc
  agent_type          TEXT,              -- sinh học / hóa học
  dose                TEXT,              -- liều lượng
  date_applied        DATE NOT NULL,
  phi_days            INT NOT NULL DEFAULT 7,  -- số ngày cách ly
  harvest_allowed_date DATE,             -- tự tính = date_applied + phi_days
  technique_notes     TEXT,              -- ghi chú kỹ thuật phun
  is_correct_drug     BOOLEAN DEFAULT true,   -- đúng thuốc
  is_correct_time     BOOLEAN DEFAULT true,   -- đúng lúc
  is_correct_dose     BOOLEAN DEFAULT true,   -- đúng liều lượng
  is_correct_technique BOOLEAN DEFAULT true,  -- đúng kỹ thuật
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ============ MODULE 5: Kho vật tư & Tài chính ============

CREATE TABLE inventory_items (
  item_id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name     TEXT NOT NULL,
  item_type     TEXT NOT NULL,  -- Men vi sinh / Phân hữu cơ / Hạt giống / Thuốc BVTV / Khác
  unit          TEXT NOT NULL,  -- kg / lít / gói / chai
  qty_in        NUMERIC(10,2) DEFAULT 0,
  qty_out       NUMERIC(10,2) DEFAULT 0,
  qty_remaining NUMERIC(10,2) DEFAULT 0,
  unit_cost     NUMERIC(12,0) DEFAULT 0,  -- VND
  updated_date  DATE DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cost_records (
  record_id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plot_id         UUID REFERENCES plots(plot_id) ON DELETE SET NULL,
  node_id         UUID REFERENCES circular_nodes(node_id) ON DELETE SET NULL,
  record_type     TEXT,  -- Vật tư / Thu hoạch / Bán hàng / Khác
  input_material  TEXT,
  input_qty       NUMERIC(10,2),
  input_cost      NUMERIC(12,0) DEFAULT 0,   -- VND
  output_qty      NUMERIC(10,2),
  output_value    NUMERIC(12,0) DEFAULT 0,    -- VND
  record_date     DATE DEFAULT CURRENT_DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============ MODULE 6: Bán hàng & CRM ============

CREATE TABLE products (
  product_id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name    TEXT NOT NULL,
  product_type    TEXT NOT NULL,  -- Chậu cảnh / Cây giống / Lá tươi / Mật ong
  unit            TEXT NOT NULL,  -- chậu / cây / kg / chai
  unit_price      NUMERIC(12,0) DEFAULT 0,  -- VND
  qty_in_stock    NUMERIC(10,2) DEFAULT 0,
  source_type     TEXT DEFAULT 'Tự làm',  -- Tự làm / Mua ngoài
  linked_plot_id  UUID REFERENCES plots(plot_id) ON DELETE SET NULL,
  linked_crop_id  UUID REFERENCES crops(crop_id) ON DELETE SET NULL,
  updated_date    DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customers (
  customer_id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT NOT NULL,
  phone               TEXT,
  address             TEXT,
  note                TEXT,
  first_purchase_date DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sales_orders (
  order_id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id     UUID REFERENCES customers(customer_id) ON DELETE SET NULL,
  order_date      DATE DEFAULT CURRENT_DATE,
  channel         TEXT DEFAULT 'Tại vườn',  -- Tại vườn / Facebook / Zalo / Khác
  total_amount    NUMERIC(12,0) DEFAULT 0,  -- VND
  amount_paid     NUMERIC(12,0) DEFAULT 0,  -- VND
  payment_status  TEXT DEFAULT 'Còn nợ',    -- Đã thu đủ / Còn nợ
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sales_order_items (
  order_item_id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID REFERENCES sales_orders(order_id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(product_id) ON DELETE SET NULL,
  qty             NUMERIC(10,2) NOT NULL,
  unit_price      NUMERIC(12,0) DEFAULT 0,
  subtotal        NUMERIC(12,0) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============ INDEX cho tìm kiếm nhanh ============

CREATE INDEX idx_crops_plot ON crops(plot_id);
CREATE INDEX idx_tasks_plot_date ON field_tasks(plot_id, execute_date);
CREATE INDEX idx_tasks_date ON field_tasks(execute_date);
CREATE INDEX idx_chemical_plot ON chemical_logs(plot_id);
CREATE INDEX idx_batches_node ON compost_batches(node_id);
CREATE INDEX idx_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_order_items_order ON sales_order_items(order_id);
CREATE INDEX idx_products_type ON products(product_type);

-- ============ RLS (Row Level Security) — tắt tạm cho single-user ============
-- Khi cần multi-user sau này, bật RLS và thêm policy theo user_id

ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE circular_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compost_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemical_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

-- Policy cho phép tất cả (single-user mode)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'plots','crops','circular_nodes','compost_batches',
    'field_tasks','chemical_logs','inventory_items','cost_records',
    'products','customers','sales_orders','sales_order_items'
  ]) LOOP
    EXECUTE format('CREATE POLICY "Allow all for anon" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Allow all for authenticated" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
