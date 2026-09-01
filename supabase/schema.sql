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

-- 프로필 (닉네임 자동 할당, 약관 동의 기록)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 12),
  nickname_updated_at timestamptz,
  agreed_at timestamptz,
  agreed_terms_version text,
  agreed_privacy_version text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: 로그인 유저는 조회" on public.profiles
  for select to authenticated using (true);
create policy "profiles: 본인 동의 정보만 수정" on public.profiles
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and nickname = (select p.nickname from public.profiles p where p.user_id = auth.uid())
  );
-- insert 정책 없음 = 클라 생성 불가, 아래 트리거(definer)만 생성
-- 닉네임 변경은 후속 플랜(30일 쿨다운 트리거)에서 개방 — 그 전까지 with check로 불변 강제

create or replace function public.generate_nickname()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  adjectives text[] := array[
    '따뜻한','느긋한','씩씩한','다정한','포근한','반짝이는','발랄한','엉뚱한',
    '든든한','명랑한','깜찍한','우아한','정겨운','산뜻한','졸린','춤추는',
    '호기심많은','행복한','순한','똑똑한','용감한','친절한','귀여운','말랑한',
    '도도한','재빠른','잠꾸러기','호탕한','새침한','늠름한'
  ];
  nouns text[] := array[
    '돈코츠','니보시','차슈','멘마','아지타마','카에다마','츠케멘','시오',
    '쇼유','미소','마제소바','토리파이탄','탄탄멘','이에케','지로','나루토',
    '김노리','파기름','완탕','교자','스프','면발','고명','반숙',
    '라유','유자','마늘','숙주','챠미','다레'
  ];
  base text;
  candidate text;
begin
  for i in 1..10 loop
    candidate := adjectives[1 + floor(random() * array_length(adjectives, 1))]
              || nouns[1 + floor(random() * array_length(nouns, 1))];
    if not exists (select 1 from public.profiles where nickname = candidate) then
      return candidate;
    end if;
  end loop;

  for i in 1..10 loop
    base := adjectives[1 + floor(random() * array_length(adjectives, 1))]
         || nouns[1 + floor(random() * array_length(nouns, 1))];
    candidate := base || lpad(floor(random() * 10000)::text, 4, '0');
    if not exists (select 1 from public.profiles where nickname = candidate)
       and char_length(candidate) <= 12 then
      return candidate;
    end if;
  end loop;

  return '라멘' || lpad((floor(extract(epoch from now()))::bigint % 100000000)::text, 8, '0');
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nickname)
  values (new.id, public.generate_nickname())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 기존 유저 백필 (스키마 실행 시 1회)
insert into public.profiles (user_id, nickname)
select u.id, public.generate_nickname()
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);
