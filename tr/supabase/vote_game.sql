-- THE SIGMA GAMES — run once in Supabase SQL Editor.
-- Makes votes atomic (no more users overwriting each other's counts) and enables live updates.

create table if not exists public.game_stats (
  game_id text primary key,
  likes integer not null default 0,
  dislikes integer not null default 0
);
alter table public.game_stats add column if not exists updated_at timestamptz default now();

alter table public.game_stats enable row level security;

drop policy if exists "Public can read game stats" on public.game_stats;
create policy "Public can read game stats" on public.game_stats for select using (true);

create or replace function public.vote_game(p_game_id text, p_like_delta integer, p_dislike_delta integer)
returns public.game_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.game_stats;
begin
  if p_like_delta not between -1 and 1 or p_dislike_delta not between -1 and 1 then
    raise exception 'invalid delta';
  end if;
  if p_game_id !~ '^[a-z0-9-]{1,64}$' then
    raise exception 'invalid game id';
  end if;

  insert into public.game_stats as g (game_id, likes, dislikes)
  values (p_game_id, greatest(p_like_delta, 0), greatest(p_dislike_delta, 0))
  on conflict (game_id) do update
    set likes = greatest(g.likes + p_like_delta, 0),
        dislikes = greatest(g.dislikes + p_dislike_delta, 0),
        updated_at = now()
  returning * into r;

  return r;
end;
$$;

grant execute on function public.vote_game(text, integer, integer) to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.game_stats;
exception when duplicate_object then null;
end $$;
