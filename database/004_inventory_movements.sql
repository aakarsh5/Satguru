create table if not exists inventory_movements (
  id bigserial primary key,
  product_id text not null references products(id) on delete cascade,
  variant_id text not null,
  quantity_before integer not null,
  quantity_delta integer not null,
  quantity_after integer not null,
  reason text not null,
  note text not null default '',
  changed_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_created_idx on inventory_movements(created_at desc);
create index if not exists inventory_movements_variant_idx on inventory_movements(product_id, variant_id, created_at desc);
