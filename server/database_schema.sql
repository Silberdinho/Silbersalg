create table if not exists public.orders (
  order_id bigint generated always as identity primary key,
  order_date timestamptz not null default now()
);

create table if not exists public.order_items (
  item_id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(order_id) on delete cascade,
  product_name text not null
);

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_contact_messages_email on public.contact_messages(email);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at);
