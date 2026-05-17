# LGA Retail Systems — Production Transformation

## What was changed and why

| File | Change | Reason |
|---|---|---|
| `supabase/migrations/001_core_schema.sql` | NEW | Full retail DB schema — products, sales, stock, GST, RLS |
| `supabase/seed/002_seed_products.sql` | NEW | Real FMCG seed data replaces hardcoded sampleData.js |
| `frontend/src/context/AuthContext.jsx` | NEW | Real Supabase auth replaces localStorage fake session |
| `frontend/src/services/supabaseClient.js` | NEW | Singleton Supabase client for frontend |
| `frontend/src/pages/LoginPage.jsx` | REPLACED | Now calls `supabase.auth.signInWithPassword` |
| `frontend/src/App.jsx` | REPLACED | Uses AuthContext, added /billing route, role guards |
| `frontend/src/main.jsx` | REPLACED | Wraps app in `<AuthProvider>` |
| `frontend/src/services/inventoryService.js` | REPLACED | Real Supabase queries, barcode lookup, category filter |
| `frontend/src/services/salesService.js` | REPLACED | Calls `create_sale` RPC for atomic billing |
| `frontend/src/pages/BillingPage.jsx` | NEW | Full POS screen — cart, GST, payment, keyboard shortcuts |
| `frontend/src/utils/constants.js` | UPDATED | Added `/billing` route |

## Setup

### 1. Supabase project
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
supabase db push < supabase/migrations/001_core_schema.sql

# Seed products
supabase db push < supabase/seed/002_seed_products.sql
```

### 2. Create first admin user
In Supabase dashboard → Authentication → Users → Invite user.
Then run in SQL editor:
```sql
insert into public.profiles (id, full_name, role)
values ('<user-uuid-from-auth>', 'Store Admin', 'admin');
```

### 3. Frontend env
```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your project settings
npm install @supabase/supabase-js
npm run dev
```

## Billing keyboard shortcuts
| Key | Action |
|---|---|
| F2 | Focus product search |
| F9 | Confirm and submit sale |
| Esc | Clear search results |

## Architecture decisions

**Why `create_sale` as a Postgres RPC?**
Stock deduction and sale creation must be atomic. If done as two separate API calls, concurrent cashiers billing the last unit will both succeed, leaving stock at -1. The RPC uses `SELECT ... FOR UPDATE` to row-lock the product before deducting, and the entire function runs in one transaction — either everything commits or nothing does.

**Why Supabase Auth over custom JWT?**
Supabase handles token refresh, session persistence, and secure cookie storage. Custom JWT adds attack surface with no benefit at this scale. RLS policies use `auth.uid()` directly, so no server-side auth middleware is needed for read operations.

**Why RLS instead of API-level permission checks?**
RLS is enforced at the database level and cannot be bypassed by application bugs. A cashier querying `sales` directly will only ever see their own records regardless of what the frontend sends.
