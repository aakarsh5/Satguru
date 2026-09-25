create table if not exists categories (
  id text primary key,
  slug text not null unique,
  parent_id text references categories(id) on delete set null,
  sort_order integer not null default 0,
  payload jsonb not null
);

create table if not exists products (
  id text primary key,
  slug text not null unique,
  status text not null check (status in ('draft', 'active', 'archived')),
  payload jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists products_status_idx on products(status);
create index if not exists products_payload_idx on products using gin(payload);
