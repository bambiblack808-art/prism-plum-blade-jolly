-- Per-user photo booth shots (JPEG data URLs, pruned to a short strip)
create table if not exists shots (
  id          serial primary key,
  user_id     text not null,
  image_data  text not null,
  filter_id   text not null default 'clear',
  created_at  timestamptz not null default now()
);

create index if not exists shots_user_id_created_at_idx
  on shots (user_id, created_at desc);
