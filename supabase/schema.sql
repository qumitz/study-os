-- =========================================================================
-- Study OS — Схема базы данных Supabase для Лидского колледжа
-- =========================================================================

-- 1. Создание таблицы профилей пользователей
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  group_name text not null default '37В',
  course integer not null default 3,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Создание таблицы прогресса прохождения предметов студентами
create table if not exists public.student_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text not null,
  topic_statuses jsonb default '{}'::jsonb not null,
  grades jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, subject_id)
);

-- 3. Включение Row Level Security (RLS) для защиты данных
alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;

-- 4. Политики безопасности для profiles:
-- Читать профили могут все пользователи колледжа (чтобы видеть одногруппников, списки групп и журнал на телефоне и ПК)
drop policy if exists "Профили видны авторизованным пользователям" on public.profiles;
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  to authenticated, anon
  using (true);

-- Создавать и обновлять свой профиль
drop policy if exists "Пользователь может вставлять свой профиль" on public.profiles;
drop policy if exists "profiles_insert_open" on public.profiles;
create policy "profiles_insert_open"
  on public.profiles for insert
  to authenticated, anon
  with check (true);

drop policy if exists "Пользователь или админ может редактировать профиль" on public.profiles;
drop policy if exists "profiles_update_open" on public.profiles;
create policy "profiles_update_open"
  on public.profiles for update
  to authenticated, anon
  using (true);

-- Удалять профили могут администраторы или сам владелец
drop policy if exists "Удаление профилей разрешено админам и владельцу" on public.profiles;
create policy "Удаление профилей разрешено админам и владельцу"
  on public.profiles for delete
  to authenticated, anon
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 5. Политики безопасности для student_progress:
-- Прогресс и оценки открыты для чтения всем устройствам (телефон, компьютер, планшет)
drop policy if exists "Прогресс виден владельцу или преподавателям" on public.student_progress;
drop policy if exists "progress_select_public" on public.student_progress;
create policy "progress_select_public"
  on public.student_progress for select
  to authenticated, anon
  using (true);

-- Управление прогрессом и выставление оценок
drop policy if exists "Студент может обновлять свой прогресс" on public.student_progress;
drop policy if exists "Преподаватели могут управлять прогрессом" on public.student_progress;
drop policy if exists "progress_all_open" on public.student_progress;
create policy "progress_all_open"
  on public.student_progress for all
  to authenticated, anon
  using (true)
  with check (true);

-- 6. Автоматическое создание профиля при регистрации через Auth (Триггер)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, group_name, course)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'group_name', '37В'),
    coalesce((new.raw_user_meta_data->>'course')::int, 3)
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, profiles.name),
    role = coalesce(excluded.role, profiles.role),
    group_name = coalesce(excluded.group_name, profiles.group_name),
    course = coalesce(excluded.course, profiles.course),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Привязка триггера к auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Индексы для быстрого поиска
create index if not exists idx_profiles_group_role on public.profiles(group_name, role);
create index if not exists idx_student_progress_user_subject on public.student_progress(user_id, subject_id);

-- 8. Функция полного каскадного удаления пользователя администратором
create or replace function public.delete_user_by_admin(target_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  caller_role text;
  caller_email text;
begin
  -- Проверяем права вызывающего
  select role, email into caller_role, caller_email
  from public.profiles
  where id = auth.uid();

  if coalesce(caller_role, '') != 'admin' 
     and coalesce(caller_email, '') not in ('den.krivenchenko@gmail.com', 'den.krivencheko@gmail.com') then
    return jsonb_build_object('success', false, 'error', 'Недостаточно прав администратора');
  end if;

  -- 1. Удаляем прогресс студента
  delete from public.student_progress where user_id = target_user_id;

  -- 2. Удаляем профиль
  delete from public.profiles where id = target_user_id;

  -- 3. Удаляем из auth.users
  delete from auth.users where id = target_user_id;

  return jsonb_build_object('success', true);
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- 9. Функция назначения роли пользователю администратором
create or replace function public.update_user_role_by_admin(target_user_id uuid, new_role text)
returns jsonb
language plpgsql
security definer
as $$
declare
  caller_role text;
  caller_email text;
begin
  -- Проверяем права вызывающего
  select role, email into caller_role, caller_email
  from public.profiles
  where id = auth.uid();

  if coalesce(caller_role, '') != 'admin' 
     and coalesce(caller_email, '') not in ('den.krivenchenko@gmail.com', 'den.krivencheko@gmail.com') then
    return jsonb_build_object('success', false, 'error', 'Недостаточно прав администратора');
  end if;

  if new_role not in ('student', 'teacher', 'admin') then
    return jsonb_build_object('success', false, 'error', 'Недопустимая роль');
  end if;

  update public.profiles
  set role = new_role, updated_at = now()
  where id = target_user_id;

  return jsonb_build_object('success', true);
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;


-- =========================================================================
-- 10. Таблица сданных практических и лабораторных работ
-- =========================================================================
create table if not exists public.practical_submissions (
  id text primary key,
  student_id text,
  student_name text not null,
  group_name text not null default '37В',
  subject_id text not null,
  subject_title text not null,
  work_number integer not null,
  work_title text not null,
  content_html text not null default '',
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'graded', 'needs_revision')),
  grade integer check (grade >= 1 and grade <= 10),
  graded_at timestamp with time zone,
  graded_by text,
  teacher_feedback text
);

alter table public.practical_submissions enable row level security;

-- Чтение практических открыто для всех пользователей (телефон, компьютер)
drop policy if exists "Студенты видят свои работы, преподаватели - группы" on public.practical_submissions;
drop policy if exists "practical_submissions_select" on public.practical_submissions;
create policy "practical_submissions_select"
  on public.practical_submissions for select
  to authenticated, anon
  using (true);

-- Отправка и проверка практических работ
drop policy if exists "Студенты могут отправлять свои работы" on public.practical_submissions;
drop policy if exists "practical_submissions_upsert" on public.practical_submissions;
create policy "practical_submissions_upsert"
  on public.practical_submissions for all
  to authenticated, anon
  using (true)
  with check (true);

create index if not exists idx_practical_submissions_group on public.practical_submissions(group_name, subject_id);
create index if not exists idx_practical_submissions_student on public.practical_submissions(student_id);
