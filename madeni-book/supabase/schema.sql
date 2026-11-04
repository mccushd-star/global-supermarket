-- Madeni Book database. Run once in the Supabase SQL editor (or `supabase db push`).
-- Model: a SHOP has BRANCHES and STAFF. Every record belongs to a shop, and most to one branch.
-- Row level security keeps shops apart from each other and branches apart from each other.

create extension if not exists pgcrypto;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- role: owner (all branches, staff, settings), manager (one branch, everything in it), seller (one branch, sales and credit)
create table if not exists public.memberships (
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','manager','seller')),
  branch_id text,
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id),
  check ((role = 'owner' and branch_id is null) or (role <> 'owner' and branch_id is not null))
);

-- One generic table for the app's collections: branches, meta, products, stock, sales, expenses, customers, entries, payments.
create table if not exists public.records (
  shop_id uuid not null references public.shops(id) on delete cascade,
  coll text not null,
  id text not null,
  branch_id text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (shop_id, coll, id)
);
create index if not exists records_shop_branch on public.records (shop_id, branch_id);
alter table public.records replica identity full;

-- Payment provider secrets. No policies are defined, so only the service role (edge functions) can touch it.
create table if not exists public.payment_config (
  shop_id uuid primary key references public.shops(id) on delete cascade,
  mpesa_key text, mpesa_secret text, mpesa_shortcode text, mpesa_passkey text,
  mpesa_party_b text, mpesa_type text default 'till' check (mpesa_type in ('till','paybill')),
  airtel_client_id text, airtel_client_secret text,
  airtel_country text default 'KE', airtel_currency text default 'KES',
  updated_at timestamptz not null default now()
);

alter table public.shops enable row level security;
alter table public.memberships enable row level security;
alter table public.records enable row level security;
alter table public.payment_config enable row level security;

-- helpers (security definer so policies do not recurse into memberships)
create or replace function public.my_role(s uuid) returns text
language sql stable security definer set search_path = public as
$$ select role from public.memberships where shop_id = s and user_id = auth.uid() $$;

create or replace function public.my_branch(s uuid) returns text
language sql stable security definer set search_path = public as
$$ select branch_id from public.memberships where shop_id = s and user_id = auth.uid() $$;

-- shops: members can read their own shop; creation goes through create_shop()
drop policy if exists shops_read on public.shops;
create policy shops_read on public.shops for select to authenticated using (public.my_role(id) is not null);
drop policy if exists shops_rename on public.shops;
create policy shops_rename on public.shops for update to authenticated using (public.my_role(id) = 'owner') with check (public.my_role(id) = 'owner');

-- memberships: you see your own row, owners see everyone in their shop and can remove staff (not themselves)
drop policy if exists mem_read on public.memberships;
create policy mem_read on public.memberships for select to authenticated using (user_id = auth.uid() or public.my_role(shop_id) = 'owner');
drop policy if exists mem_delete on public.memberships;
create policy mem_delete on public.memberships for delete to authenticated using (public.my_role(shop_id) = 'owner' and user_id <> auth.uid());

-- records: read
drop policy if exists rec_read on public.records;
create policy rec_read on public.records for select to authenticated using (
  public.my_role(shop_id) = 'owner'
  or (public.my_role(shop_id) is not null and (branch_id is null or branch_id = public.my_branch(shop_id)))
);

-- records: write. owner anywhere; manager in own branch (not branches/meta); seller in own branch for sales, credit, customers, payments
create or replace function public.can_write(s uuid, c text, b text) returns boolean
language sql stable security definer set search_path = public as $$
  select case public.my_role(s)
    when 'owner'   then true
    when 'manager' then b is not null and b = public.my_branch(s) and c not in ('branches','meta')
    when 'seller'  then b is not null and b = public.my_branch(s) and c in ('sales','entries','customers','payments')
    else false end
$$;

drop policy if exists rec_insert on public.records;
create policy rec_insert on public.records for insert to authenticated with check (public.can_write(shop_id, coll, branch_id));
drop policy if exists rec_update on public.records;
create policy rec_update on public.records for update to authenticated using (public.can_write(shop_id, coll, branch_id)) with check (public.can_write(shop_id, coll, branch_id));
drop policy if exists rec_delete on public.records;
create policy rec_delete on public.records for delete to authenticated using (public.my_role(shop_id) in ('owner','manager') and public.can_write(shop_id, coll, branch_id));

-- touch updated_at
create or replace function public.touch() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before update on public.records for each row execute function public.touch();

-- Sign up a new shop: creates the shop, makes the caller its owner, adds a first branch and the settings record.
create or replace function public.create_shop(shop_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare sid uuid; em text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if coalesce(trim(shop_name), '') = '' then raise exception 'shop name required'; end if;
  select email into em from auth.users where id = auth.uid();
  insert into public.shops(name) values (trim(shop_name)) returning id into sid;
  insert into public.memberships(shop_id, user_id, email, role, branch_id) values (sid, auth.uid(), coalesce(em,''), 'owner', null);
  insert into public.records(shop_id, coll, id, branch_id, data) values
    (sid, 'branches', 'main', null, jsonb_build_object('name', trim(shop_name))),
    (sid, 'meta', 'settings', null, jsonb_build_object('shop', trim(shop_name), 'pay', '', 'payAirtel', ''));
  return sid;
end $$;
revoke all on function public.create_shop(text) from public, anon;
grant execute on function public.create_shop(text) to authenticated;

-- realtime
do $$ begin
  begin alter publication supabase_realtime add table public.records; exception when duplicate_object then null; end;
end $$;
