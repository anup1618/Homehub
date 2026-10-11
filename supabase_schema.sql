-- ==============================================================================
-- HomeHub Luxury Real Estate Marketplace - Supabase Database Schema & Security RLS
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'buyer' check (role in ('buyer', 'investor', 'seller', 'advisor', 'admin')),
  last_login_at timestamp with time zone,
  total_logins integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Automatic Profile Creation Trigger on Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. PROPERTIES TABLE
create table if not exists public.properties (
  id text primary key,
  title text not null,
  price numeric not null,
  price_formatted text,
  location text not null,
  city text,
  neighborhood text,
  beds integer default 0,
  baths numeric default 0,
  sqft integer default 0,
  lot_size text,
  type text default 'Villa',
  status text default 'Active' check (status in ('Active', 'Pending', 'Sold', 'Off-Market')),
  tag text,
  description text,
  main_image text,
  gallery jsonb default '[]'::jsonb,
  amenities jsonb default '[]'::jsonb,
  specifications jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.properties enable row level security;

create policy "Properties are viewable by everyone" 
  on public.properties for select 
  using (true);

create policy "Authenticated users can create listings" 
  on public.properties for insert 
  with check (auth.role() = 'authenticated');

create policy "Users can update their own listings" 
  on public.properties for update 
  using (auth.uid() = created_by);

create policy "Users can delete their own listings" 
  on public.properties for delete 
  using (auth.uid() = created_by);


-- 3. FAVORITES TABLE (Saved Collections)
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_property_favorite unique (user_id, property_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites" 
  on public.favorites for select 
  using (auth.uid() = user_id);

create policy "Users can add to their favorites" 
  on public.favorites for insert 
  with check (auth.uid() = user_id);

create policy "Users can remove from their favorites" 
  on public.favorites for delete 
  using (auth.uid() = user_id);


-- 4. BOOKED TOURS TABLE
create table if not exists public.booked_tours (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  property_id text not null,
  property_title text,
  full_name text not null,
  email text not null,
  phone text,
  tour_date date not null,
  tour_time text not null,
  tour_type text default 'VIP In-Person Showing',
  notes text,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.booked_tours enable row level security;

create policy "Users can view their own tour bookings" 
  on public.booked_tours for select 
  using (auth.uid() = user_id or auth.uid() is null);

create policy "Anyone can book a tour" 
  on public.booked_tours for insert 
  with check (true);

create policy "Users can update their tour bookings" 
  on public.booked_tours for update 
  using (auth.uid() = user_id);


-- 5. AUTHENTICATION & LOGIN AUDIT LOGS (TRACK WHO LOGS IN)
create table if not exists public.auth_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text,
  role text,
  event_type text not null default 'login' check (event_type in ('login', 'signup', 'logout', 'failed_login')),
  device_type text default 'Desktop',
  user_agent text,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.auth_logs enable row level security;

-- Allow insert of auth events
create policy "Anyone can insert auth logs" 
  on public.auth_logs for insert 
  with check (true);

-- Strict Security: Only admins can view all auth logs; users can only view their own
create policy "Admins can view all auth logs, users view own" 
  on public.auth_logs for select 
  using (
    auth.uid() = user_id 
    or exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 6. PAGE VISITS & TRAFFIC TRACKER (TRACK WHO VISITED YOUR PAGE)
create table if not exists public.page_visits (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,                                     -- Unique session identifier
  user_id uuid references auth.users(id) on delete set null,    -- Null if guest visitor, set if authenticated
  user_email text,                                             -- Email if authenticated
  user_name text,                                              -- Full name if authenticated
  page_path text not null,                                      -- Route: 'home', 'browse', 'property-detail', etc.
  page_title text,                                             -- Readable title
  property_id text,                                            -- Estate ID if viewing a listing
  property_title text,                                         -- Estate name if applicable
  referrer text,                                               -- Where the visitor came from
  device_type text default 'Desktop',                          -- Mobile, Tablet, Desktop
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.page_visits enable row level security;

-- Allow logging of page visits from anyone (append-only)
create policy "Anyone can log page visits" 
  on public.page_visits for insert 
  with check (true);

-- Strict Security: Telemetry audit logs are restricted strictly to Administrators
create policy "Admins only can view page visit telemetry" 
  on public.page_visits for select 
  using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Index for speedy analytics queries
create index if not exists idx_page_visits_created_at on public.page_visits(created_at desc);
create index if not exists idx_page_visits_user_id on public.page_visits(user_id);
create index if not exists idx_auth_logs_created_at on public.auth_logs(created_at desc);
