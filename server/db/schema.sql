-- PantryPal: initial Supabase database setup.
-- Run this in the Supabase SQL Editor for your PantryPal project.
-- Supabase setup for PantryPal. Run seed.sql after this for a fresh database.
-- This schema matches the fields in PantryPal's existing JSON files.
-- Ingredients inside a recipe remain structured JSON so quantities,
-- alternative choices, optional items, and component sections stay together.
-- The separate ingredients table is the search/autocomplete vocabulary.

begin;

create table if not exists public.recipes (
    id bigint primary key check (id > 0),
    slug text not null unique check (length(trim(slug)) > 0),
    name text not null check (length(trim(name)) > 0),
    filipino_name text,
    category text not null check (length(trim(category)) > 0),
    prep_time_text text not null,
    cook_time_text text,
    prep_minutes integer check (prep_minutes >= 0),
    cook_minutes integer check (cook_minutes >= 0),
    additional_time_text text,
    yield_type text not null check (yield_type in ('serves', 'makes')),
    yield_text text not null,
    ingredients jsonb not null
        check (jsonb_typeof(ingredients) = 'array' and ingredients <> '[]'::jsonb),
    instructions jsonb not null
        check (jsonb_typeof(instructions) = 'array' and instructions <> '[]'::jsonb),
    source_tips text[] not null default '{}'::text[],
    source jsonb not null check (jsonb_typeof(source) = 'object'),
    review_flags text[] not null default '{}'::text[],
    default_image text,
    created_at timestamptz not null default now()
);

create table if not exists public.ingredients (
    id text primary key check (length(trim(id)) > 0),
    name text not null unique check (length(trim(name)) > 0),
    aliases text[] not null default '{}'::text[],
    created_at timestamptz not null default now()
);

create index if not exists recipes_category_idx
    on public.recipes (category);

-- React calls Express. Express uses the server-only DATABASE_URL to query
-- PostgreSQL. Never put that connection string in frontend code.
-- No login is needed for the read-only recipe endpoints.
alter table public.recipes enable row level security;
alter table public.ingredients enable row level security;

-- Anonymous visitors cannot change the curated collection through Supabase.
-- Data access for this design goes through the Express backend.
revoke all privileges on table public.recipes, public.ingredients
    from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete
    on table public.recipes, public.ingredients to service_role;

commit;

-- A new project should show both tables with 0 rows.
-- After importing, the expected counts are 100 recipes and 193 ingredients.
select 'recipes' as table_name, count(*) as row_count from public.recipes
union all
select 'ingredients' as table_name, count(*) as row_count from public.ingredients;
