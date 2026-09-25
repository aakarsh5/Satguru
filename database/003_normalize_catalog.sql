alter table categories add column if not exists name text;
alter table categories add column if not exists description text not null default '';
alter table categories add column if not exists image jsonb;
alter table categories add column if not exists created_at timestamptz not null default now();
alter table categories add column if not exists updated_at timestamptz not null default now();

alter table products add column if not exists name text;
alter table products add column if not exists description text not null default '';
alter table products add column if not exists body text;
alter table products add column if not exists brand_id text not null default '';
alter table products add column if not exists tags jsonb not null default '[]'::jsonb;
alter table products add column if not exists featured boolean not null default false;

update categories set name = coalesce(payload->>'name', slug) where name is null;
update products set
  name = coalesce(payload->>'name', slug),
  description = coalesce(payload->>'description', ''),
  body = payload->>'body',
  brand_id = coalesce(payload->>'brandId', ''),
  tags = coalesce(payload->'tags', '[]'::jsonb),
  featured = coalesce((payload->>'featured')::boolean, false)
where name is null or name = '';

alter table products alter column name set not null;
alter table products alter column created_at set default now();
alter table products alter column updated_at set default now();
alter table categories alter column name set not null;
alter table categories alter column created_at set default now();
alter table categories alter column updated_at set default now();

do $$
begin
  if exists (
    select 1 from categories
    where parent_id = id
  ) then
    raise exception 'Cannot normalize categories with self-parent references';
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'categories_not_self_parent'
  ) then
    alter table categories add constraint categories_not_self_parent check (parent_id is null or parent_id <> id);
  end if;
end $$;

create table if not exists product_categories (
  product_id text not null references products(id) on delete cascade,
  category_id text not null references categories(id) on delete restrict,
  sort_order integer not null default 0,
  primary key (product_id, category_id)
);
create index if not exists product_categories_category_idx on product_categories(category_id, product_id);

do $$
begin
  if exists (
    select 1
    from products p
    cross join lateral jsonb_array_elements_text(coalesce(p.payload->'categoryIds', '[]'::jsonb)) ids(category_id)
    left join categories c on c.id = ids.category_id
    where c.id is null
  ) then
    raise exception 'Cannot normalize products with unknown category IDs';
  end if;
end $$;

create table if not exists product_images (
  id bigserial primary key,
  product_id text not null references products(id) on delete cascade,
  variant_id text,
  url text not null,
  alt text not null default '',
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on product_images(product_id, variant_id, sort_order);

insert into product_categories (product_id, category_id, sort_order)
select p.id, c.id, row_number() over (partition by p.id order by c.id) - 1
from products p
cross join lateral jsonb_array_elements_text(coalesce(p.payload->'categoryIds', '[]'::jsonb)) ids(category_id)
join categories c on c.id = ids.category_id
on conflict do nothing;

insert into product_images (product_id, variant_id, url, alt, width, height, sort_order)
select p.id, null, i->>'url', coalesce(i->>'alt',''), (i->>'width')::integer, (i->>'height')::integer,
       ordinality - 1
from products p
cross join lateral jsonb_array_elements(coalesce(p.payload->'images','[]'::jsonb)) with ordinality images(i, ordinality)
where i ? 'url'
  and not exists (select 1 from product_images pi where pi.product_id = p.id and pi.variant_id is null and pi.url = i->>'url');

insert into product_images (product_id, variant_id, url, alt, width, height, sort_order)
select p.id, v->>'id', i->>'url', coalesce(i->>'alt',''), (i->>'width')::integer, (i->>'height')::integer,
       (vo + io) - 2
from products p
cross join lateral jsonb_array_elements(coalesce(p.payload->'variants','[]'::jsonb)) with ordinality variants(v, vo)
cross join lateral jsonb_array_elements(coalesce(v->'images','[]'::jsonb)) with ordinality images(i, io)
where i ? 'url'
  and not exists (select 1 from product_images pi where pi.product_id = p.id and pi.variant_id = v->>'id' and pi.url = i->>'url');

create index if not exists products_name_idx on products using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));
