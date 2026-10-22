create table if not exists customer_orders (
  id text primary key,
  shop_name text not null,
  phone text not null,
  address text not null,
  notes text not null default '',
  items jsonb not null,
  status text not null default 'new' check (status in ('new', 'confirmed', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_orders_created_idx on customer_orders(created_at desc);
create index if not exists customer_orders_status_created_idx on customer_orders(status, created_at desc);
