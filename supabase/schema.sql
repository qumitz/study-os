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
-- Читать профили могут все авторизованные пользователи колледжа (чтобы видеть одногруппников и оценки)
create policy "Профили видны авторизованным пользователям"
  on public.profiles for select
  to authenticated
  using (true);

-- Создавать свой профиль может владелец, обновлять — владелец или администратор
create policy "Пользователь или админ может редактировать профиль"
  on public.profiles for update
  to authenticated
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Пользователь может вставлять свой профиль"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Удалять профили могут администраторы или сам владелец
create policy "Удаление профилей разрешено админам и владельцу"
  on public.profiles for delete
  to authenticated
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- 5. Политики безопасности для student_progress:
-- Студенты могут читать свой прогресс, преподаватели и админы — всех студентов
create policy "Прогресс виден владельцу или преподавателям"
  on public.student_progress for select
  to authenticated
  using (
    auth.uid() = user_id 
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('teacher', 'admin')
    )
  );

-- Студенты могут обновлять свой прогресс
create policy "Студент может обновлять свой прогресс"
  on public.student_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Преподаватели и админы могут сбрасывать/корректировать оценки
create policy "Преподаватели могут управлять прогрессом"
  on public.student_progress for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('teacher', 'admin')
    )
  );

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
