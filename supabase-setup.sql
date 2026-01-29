-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- PRODUTOS
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  barcode text unique,
  price numeric(10,2) not null,
  cost numeric(10,2) not null,
  stock_quantity int default 0,
  min_stock_alert int default 5,
  category text,
  image_url text,
  created_at timestamp default now()
);

-- TRANSAÇÕES
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('sale','expense')),
  total_amount numeric(10,2) not null,
  payment_method text,
  created_at timestamp with time zone default now()
);

-- ITENS DA TRANSAÇÃO
create table if not exists transaction_items (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references transactions(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  unit_price numeric(10,2),
  unit_cost numeric(10,2)
);

-- AGENDA (EVENTOS & RESERVAS)
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  title text,
  start_date timestamp,
  end_date timestamp,
  type text,
  cost numeric
);

-- HABILITAR REALTIME (Modo Idempotente)
-- Se der erro de "already member", você pode ignorar, as tabelas já estão registradas no Realtime.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Table products already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Table transactions already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE transaction_items;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Table transaction_items already in publication';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Table events already in publication';
  END;
END $$;
