-- ============================================================
-- LGA RETAIL SYSTEMS — Core Schema Migration 001
-- Run via: supabase db push  OR  psql -f this file
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- fast ILIKE product search

-- ── Enums ────────────────────────────────────────────────────
create type user_role       as enum ('admin', 'manager', 'cashier');
create type payment_mode    as enum ('cash', 'upi', 'card', 'credit', 'mixed');
create type sale_status     as enum ('completed', 'voided', 'refunded');
create type po_status       as enum ('draft', 'ordered', 'received', 'cancelled');

-- ── User profiles (extends auth.users) ──────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  role          user_role not null default 'cashier',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Suppliers ────────────────────────────────────────────────
create table public.suppliers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text,
  phone         text,
  email         text,
  address       text,
  gstin         text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Products / SKUs ──────────────────────────────────────────
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  sku             text unique not null,
  barcode         text unique,
  name            text not null,
  category        text not null,
  unit            text not null default 'piece',
  unit_price      numeric(10,2) not null check (unit_price >= 0),
  cost_price      numeric(10,2) check (cost_price >= 0),
  gst_rate        numeric(5,2) not null default 0 check (gst_rate >= 0 and gst_rate <= 100),
  hsn_code        text,
  stock           integer not null default 0 check (stock >= 0),
  reorder_level   integer not null default 0 check (reorder_level >= 0),
  max_stock       integer,
  expiry_date     date,
  supplier_id     uuid references public.suppliers(id) on delete set null,
  image_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Sales header ─────────────────────────────────────────────
create table public.sales (
  id              uuid primary key default gen_random_uuid(),
  invoice_number  text unique not null,
  cashier_id      uuid not null references public.profiles(id),
  customer_name   text,
  customer_phone  text,
  subtotal        numeric(10,2) not null check (subtotal >= 0),
  gst_total       numeric(10,2) not null default 0 check (gst_total >= 0),
  discount        numeric(10,2) not null default 0 check (discount >= 0),
  total_amount    numeric(10,2) not null check (total_amount >= 0),
  amount_paid     numeric(10,2) not null check (amount_paid >= 0),
  change_due      numeric(10,2) generated always as (amount_paid - total_amount) stored,
  payment_mode    payment_mode not null,
  status          sale_status not null default 'completed',
  notes           text,
  created_at      timestamptz not null default now()
);

-- ── Sale line items ──────────────────────────────────────────
create table public.sale_items (
  id              uuid primary key default gen_random_uuid(),
  sale_id         uuid not null references public.sales(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  product_name    text not null,   -- snapshot at time of sale
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(10,2) not null check (unit_price >= 0),
  gst_rate        numeric(5,2) not null default 0,
  gst_amount      numeric(10,2) generated always as (
    round(unit_price * quantity * gst_rate / 100, 2)
  ) stored,
  line_total      numeric(10,2) generated always as (
    round(unit_price * quantity * (1 + gst_rate / 100), 2)
  ) stored
);

-- ── Purchase Orders ──────────────────────────────────────────
create table public.purchase_orders (
  id              uuid primary key default gen_random_uuid(),
  po_number       text unique not null,
  supplier_id     uuid not null references public.suppliers(id),
  created_by      uuid not null references public.profiles(id),
  status          po_status not null default 'draft',
  total_amount    numeric(10,2) not null default 0,
  notes           text,
  ordered_at      timestamptz,
  received_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.purchase_order_items (
  id              uuid primary key default gen_random_uuid(),
  po_id           uuid not null references public.purchase_orders(id) on delete cascade,
  product_id      uuid not null references public.products(id),
  quantity        integer not null check (quantity > 0),
  unit_cost       numeric(10,2) not null check (unit_cost >= 0),
  received_qty    integer not null default 0 check (received_qty >= 0)
);

-- ── Inventory adjustments (manual corrections, write-offs) ──
create table public.inventory_adjustments (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id),
  adjusted_by     uuid not null references public.profiles(id),
  quantity_delta  integer not null,   -- positive = add, negative = remove
  reason          text not null,
  created_at      timestamptz not null default now()
);

-- ── Audit log (immutable) ─────────────────────────────────────
create table public.audit_log (
  id              bigint generated always as identity primary key,
  actor_id        uuid references public.profiles(id) on delete set null,
  action          text not null,
  table_name      text,
  record_id       uuid,
  old_data        jsonb,
  new_data        jsonb,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_products_sku       on public.products(sku);
create index idx_products_barcode   on public.products(barcode) where barcode is not null;
create index idx_products_category  on public.products(category);
create index idx_products_stock     on public.products(stock) where is_active = true;
create index idx_products_name_trgm on public.products using gin(name gin_trgm_ops);

create index idx_sales_cashier      on public.sales(cashier_id);
create index idx_sales_created      on public.sales(created_at desc);
create index idx_sales_invoice      on public.sales(invoice_number);

create index idx_sale_items_sale    on public.sale_items(sale_id);
create index idx_sale_items_product on public.sale_items(product_id);

create index idx_audit_actor        on public.audit_log(actor_id);
create index idx_audit_table        on public.audit_log(table_name, record_id);
create index idx_audit_created      on public.audit_log(created_at desc);

-- ============================================================
-- INVOICE NUMBER SEQUENCE
-- ============================================================
create sequence if not exists invoice_seq start 1001;

create or replace function generate_invoice_number()
returns text language plpgsql as $$
begin
  return 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('invoice_seq')::text, 4, '0');
end;
$$;

-- ============================================================
-- ATOMIC BILLING FUNCTION
-- Inserts sale header + items + deducts stock in one transaction
-- Returns the created sale id or raises on stock failure
-- ============================================================
create or replace function create_sale(
  p_cashier_id    uuid,
  p_customer_name text,
  p_customer_phone text,
  p_payment_mode  payment_mode,
  p_amount_paid   numeric,
  p_discount      numeric,
  p_notes         text,
  p_items         jsonb   -- array of {product_id, quantity, unit_price, gst_rate}
)
returns uuid language plpgsql security definer as $$
declare
  v_sale_id       uuid;
  v_invoice_no    text;
  v_item          jsonb;
  v_subtotal      numeric := 0;
  v_gst_total     numeric := 0;
  v_line_total    numeric;
  v_product_name  text;
  v_current_stock integer;
begin
  -- Validate each item and check stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select name, stock
      into v_product_name, v_current_stock
      from public.products
     where id = (v_item->>'product_id')::uuid
       and is_active = true
       for update;   -- row-level lock prevents race condition

    if not found then
      raise exception 'Product % not found or inactive', v_item->>'product_id';
    end if;

    if v_current_stock < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for "%". Available: %, requested: %',
        v_product_name, v_current_stock, (v_item->>'quantity')::int;
    end if;

    -- Deduct stock immediately under lock
    update public.products
       set stock = stock - (v_item->>'quantity')::int,
           updated_at = now()
     where id = (v_item->>'product_id')::uuid;

    -- Accumulate totals
    v_line_total := (v_item->>'unit_price')::numeric
                  * (v_item->>'quantity')::int
                  * (1 + (v_item->>'gst_rate')::numeric / 100);
    v_subtotal   := v_subtotal + (v_item->>'unit_price')::numeric * (v_item->>'quantity')::int;
    v_gst_total  := v_gst_total + (v_item->>'unit_price')::numeric
                  * (v_item->>'quantity')::int * (v_item->>'gst_rate')::numeric / 100;
  end loop;

  v_invoice_no := generate_invoice_number();

  -- Insert sale header
  insert into public.sales (
    invoice_number, cashier_id, customer_name, customer_phone,
    subtotal, gst_total, discount, total_amount, amount_paid,
    payment_mode, notes
  ) values (
    v_invoice_no, p_cashier_id, p_customer_name, p_customer_phone,
    round(v_subtotal, 2), round(v_gst_total, 2), coalesce(p_discount, 0),
    round(v_subtotal + v_gst_total - coalesce(p_discount, 0), 2),
    p_amount_paid, p_payment_mode, p_notes
  ) returning id into v_sale_id;

  -- Insert line items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select name into v_product_name from public.products
     where id = (v_item->>'product_id')::uuid;

    insert into public.sale_items (
      sale_id, product_id, product_name, quantity, unit_price, gst_rate
    ) values (
      v_sale_id,
      (v_item->>'product_id')::uuid,
      v_product_name,
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      coalesce((v_item->>'gst_rate')::numeric, 0)
    );
  end loop;

  return v_sale_id;
end;
$$;

-- ============================================================
-- UPDATED_AT AUTO-TRIGGER
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function set_updated_at();

create trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row execute function set_updated_at();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles             enable row level security;
alter table public.products             enable row level security;
alter table public.suppliers            enable row level security;
alter table public.sales                enable row level security;
alter table public.sale_items           enable row level security;
alter table public.purchase_orders      enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.inventory_adjustments enable row level security;
alter table public.audit_log            enable row level security;

-- Helper: get current user's role
create or replace function current_user_role()
returns user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles: users see their own; admins see all
create policy "profiles_self"   on public.profiles for select using (id = auth.uid());
create policy "profiles_admin"  on public.profiles for all    using (current_user_role() = 'admin');

-- Products: all authenticated users can read; only admin/manager can write
create policy "products_read"   on public.products for select using (auth.uid() is not null);
create policy "products_write"  on public.products for all    using (current_user_role() in ('admin', 'manager'));

-- Suppliers: same as products
create policy "suppliers_read"  on public.suppliers for select using (auth.uid() is not null);
create policy "suppliers_write" on public.suppliers for all    using (current_user_role() in ('admin', 'manager'));

-- Sales: cashiers see their own; admin/manager see all
create policy "sales_own"       on public.sales for select using (cashier_id = auth.uid());
create policy "sales_all"       on public.sales for select using (current_user_role() in ('admin', 'manager'));
create policy "sales_insert"    on public.sales for insert with check (cashier_id = auth.uid());

-- Sale items: follow parent sale visibility
create policy "sale_items_read" on public.sale_items for select
  using (exists (select 1 from public.sales s where s.id = sale_id
    and (s.cashier_id = auth.uid() or current_user_role() in ('admin','manager'))));

-- Audit log: admin only
create policy "audit_admin"     on public.audit_log for select using (current_user_role() = 'admin');
