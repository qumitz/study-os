-- =========================================================================
-- Study OS — Мгновенная синхронизация между телефоном и компьютером
-- Выполните этот SQL в Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Таблица сданных практических и лабораторных работ (с поддержкой любых ID)
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

-- Включаем RLS
alter table public.practical_submissions enable row level security;

-- Политики для practical_submissions: чтение и запись открыты для авторизованных и анонимных
drop policy if exists "practical_submissions_select" on public.practical_submissions;
drop policy if exists "Студенты видят свои работы, преподаватели - группы" on public.practical_submissions;
create policy "practical_submissions_select"
  on public.practical_submissions for select
  to authenticated, anon
  using (true);

drop policy if exists "practical_submissions_upsert" on public.practical_submissions;
drop policy if exists "Студенты могут отправлять свои работы" on public.practical_submissions;
create policy "practical_submissions_upsert"
  on public.practical_submissions for all
  to authenticated, anon
  using (true)
  with check (true);

create index if not exists idx_practical_submissions_group on public.practical_submissions(group_name, subject_id);
create index if not exists idx_practical_submissions_student on public.practical_submissions(student_id);

-- 2. Открываем чтение профилей (profiles) для всех устройств
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "Профили видны авторизованным пользователям" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  to authenticated, anon
  using (true);

drop policy if exists "profiles_insert_open" on public.profiles;
drop policy if exists "Пользователь может вставлять свой профиль" on public.profiles;
create policy "profiles_insert_open"
  on public.profiles for insert
  to authenticated, anon
  with check (true);

drop policy if exists "profiles_update_open" on public.profiles;
drop policy if exists "Пользователь или админ может редактировать профиль" on public.profiles;
create policy "profiles_update_open"
  on public.profiles for update
  to authenticated, anon
  using (true);

-- 3. Открываем чтение и запись оценок и прогресса (student_progress) для всех устройств
drop policy if exists "progress_select_public" on public.student_progress;
drop policy if exists "Прогресс виден владельцу или преподавателям" on public.student_progress;
create policy "progress_select_public"
  on public.student_progress for select
  to authenticated, anon
  using (true);

drop policy if exists "progress_all_open" on public.student_progress;
drop policy if exists "Преподаватели могут управлять прогрессом" on public.student_progress;
drop policy if exists "Студент может обновлять свой прогресс" on public.student_progress;
create policy "progress_all_open"
  on public.student_progress for all
  to authenticated, anon
  using (true)
  with check (true);

-- Проверка
notify pgrst, 'reload schema';
