create table if not exists profiles (
    id uuid primary key,
    email text not null unique,
    full_name text,
    role text not null default 'practitioner',
    status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists auth_events (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete set null,
    event_type text not null check (
        event_type in (
            'signup',
            'login',
            'login_failed',
            'logout',
            'google_login',
            'password_reset_requested',
            'session_refreshed',
            'session_expired'
        )
    ),
    ip inet,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_auth_events_user_id on auth_events(user_id);
create index if not exists idx_auth_events_event_type on auth_events(event_type);
create index if not exists idx_auth_events_created_at on auth_events(created_at desc);

alter table profiles enable row level security;
alter table auth_events enable row level security;

drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles
    for select
    using (auth.uid() = id);

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

drop policy if exists auth_events_self_select on auth_events;
create policy auth_events_self_select on auth_events
    for select
    using (auth.uid() = user_id);
