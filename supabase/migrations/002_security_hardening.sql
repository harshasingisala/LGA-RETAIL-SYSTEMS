-- PURPOSE: Hardens elevated billing and role helper functions after initial setup.
-- USAGE: Apply after 001_core_schema.sql to an existing Supabase project.

create or replace function public.generate_invoice_number()
returns text
language plpgsql
set search_path = ''
as $$
begin
  return 'INV-' || to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.invoice_seq')::text, 4, '0');
end;
$$;

create or replace function public.create_sale(
  p_cashier_id    uuid,
  p_customer_name text,
  p_customer_phone text,
  p_payment_mode  public.payment_mode,
  p_amount_paid   numeric,
  p_discount      numeric,
  p_notes         text,
  p_items         jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sale_id       uuid;
  v_invoice_no    text;
  v_item          jsonb;
  v_quantity      integer;
  v_unit_price    numeric;
  v_gst_rate      numeric;
  v_subtotal      numeric := 0;
  v_gst_total     numeric := 0;
  v_product_name  text;
  v_current_stock integer;
begin
  if auth.uid() is null or auth.uid() <> p_cashier_id then
    raise exception 'The cashier must match the signed-in user';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid() and is_active = true
  ) then
    raise exception 'The signed-in user is inactive or has no profile';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'A sale must contain at least one item';
  end if;

  if coalesce(p_discount, 0) < 0 or coalesce(p_amount_paid, 0) < 0 then
    raise exception 'Amounts must not be negative';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity <= 0 then
      raise exception 'Item quantity must be greater than zero';
    end if;

    select name, stock, unit_price, gst_rate
      into v_product_name, v_current_stock, v_unit_price, v_gst_rate
      from public.products
     where id = (v_item->>'product_id')::uuid
       and is_active = true
       for update;

    if not found then
      raise exception 'Product % not found or inactive', v_item->>'product_id';
    end if;

    if v_current_stock < v_quantity then
      raise exception 'Insufficient stock for "%". Available: %, requested: %',
        v_product_name, v_current_stock, v_quantity;
    end if;

    update public.products
       set stock = stock - v_quantity,
           updated_at = now()
     where id = (v_item->>'product_id')::uuid;

    v_subtotal := v_subtotal + v_unit_price * v_quantity;
    v_gst_total := v_gst_total + v_unit_price * v_quantity * v_gst_rate / 100;
  end loop;

  if coalesce(p_discount, 0) > v_subtotal + v_gst_total then
    raise exception 'Discount cannot exceed the sale total';
  end if;

  v_invoice_no := public.generate_invoice_number();

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

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select name, unit_price, gst_rate
      into v_product_name, v_unit_price, v_gst_rate
      from public.products
     where id = (v_item->>'product_id')::uuid;

    insert into public.sale_items (
      sale_id, product_id, product_name, quantity, unit_price, gst_rate
    ) values (
      v_sale_id,
      (v_item->>'product_id')::uuid,
      v_product_name,
      (v_item->>'quantity')::integer,
      v_unit_price,
      v_gst_rate
    );
  end loop;

  return v_sale_id;
end;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

revoke all on function public.generate_invoice_number() from public, anon, authenticated;
revoke all on function public.create_sale(uuid, text, text, public.payment_mode, numeric, numeric, text, jsonb)
  from public, anon;
grant execute on function public.create_sale(uuid, text, text, public.payment_mode, numeric, numeric, text, jsonb)
  to authenticated;
revoke all on function public.current_user_role() from public, anon;
grant execute on function public.current_user_role() to authenticated;
