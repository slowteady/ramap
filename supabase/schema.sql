-- 라맵 Supabase 스키마 — SQL Editor에서 1회 실행
-- 서버 코드 없음: 브라우저가 anon key로 직접 호출, 보안은 전부 RLS

-- 완식·저장 기록 (로그인 유저)
create table if not exists public.records (
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_id text not null,
  status text not null check (status in ('visited', 'want')),
  count integer not null default 0,
  first_at timestamptz,
  last_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, shop_id)
);

alter table public.records enable row level security;

create policy "records: 본인 것만 조회" on public.records
  for select using (auth.uid() = user_id);
create policy "records: 본인 것만 추가" on public.records
  for insert with check (auth.uid() = user_id);
create policy "records: 본인 것만 수정" on public.records
  for update using (auth.uid() = user_id);
create policy "records: 본인 것만 삭제" on public.records
  for delete using (auth.uid() = user_id);

-- 제보 (익명 허용, 쓰기 전용)
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  type text not null check (type in ('new', 'edit', 'closed')),
  shop_name text not null,
  location text not null,
  message text,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "reports: 누구나 제출" on public.reports
  for insert with check (true);
-- select 정책 없음 = anon으로 조회 불가. 검수는 대시보드(service role)에서

-- 등록 요청 사진 (익명 업로드 허용, 비공개 — 검수 승인분만 운영자가 공개 경로로 이동)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "report-photos: 누구나 업로드" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'report-photos');
-- select 정책 없음 = 업로드한 본인도 URL로 열람 불가. 검수는 대시보드에서
