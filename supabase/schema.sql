-- 라맵 Supabase 스키마 — SQL Editor에서 1회 실행
-- 서버 코드 없음: 브라우저가 anon key로 직접 호출, 보안은 전부 RLS

-- 완식·저장 기록 (로그인 유저)
create table if not exists public.records (
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_id text not null,
  visited boolean not null default false,
  saved boolean not null default false,
  count integer not null default 0,
  first_at timestamptz,
  last_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, shop_id),
  constraint records_visited_or_saved check (visited or saved)
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
    '수줍은','씩씩한','새침한','진지한','늠름한','다정한','엉뚱한','느긋한',
    '도도한','명랑한','우아한','용감한','호탕한','깜찍한','야무진','잠꾸러기',
    '춤추는','졸린','꼬들한','뽀얀','담백한','얼큰한','촉촉한','쫄깃한',
    '따끈한','구수한','고소한','진한','콧테리','앗사리'
  ];
  nouns text[] := array[
    '돈코츠','쇼유','시오','미소','파이탄','친탄','니보시','츠케멘',
    '탄탄멘','교카이','차슈','멘마','아지타마','네기','노리','나루토',
    '우즈라','유즈','카쿠니','타카나','완탕','하리가네','바리카타','카타메',
    '카에다마','호소멘','후토멘','오오모리','마시마시','토쿠세이'
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

-- 약관 동의 게이트 (2026-09-01): 미동의 유저는 기록 쓰기 불가
drop policy if exists "records: 본인 것만 추가" on public.records;
create policy "records: 본인 것만 추가" on public.records
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.agreed_at is not null
    )
  );
drop policy if exists "records: 본인 것만 수정" on public.records;
create policy "records: 본인 것만 수정" on public.records
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.agreed_at is not null
    )
  );

-- Plan 6 초기 적용분의 영문명 중복 정책 제거 (permissive OR 결합으로 동의 게이트가 무력화됨)
drop policy if exists "records_select_own" on public.records;
drop policy if exists "records_insert_own" on public.records;
drop policy if exists "records_update_own" on public.records;
drop policy if exists "records_delete_own" on public.records;

-- 완식/저장 공존 전환 (2026-09-01): status 배타 → visited/saved 불리언
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'records' and column_name = 'status'
  ) then
    alter table public.records add column if not exists visited boolean not null default false;
    alter table public.records add column if not exists saved boolean not null default false;
    update public.records set visited = (status = 'visited'), saved = (status = 'want');
    alter table public.records drop column status;
    alter table public.records
      add constraint records_visited_or_saved check (visited or saved);
  end if;
end $$;

-- select/delete 정책 복구 (2026-09-01): 실DB엔 Plan 6 영문 정책만 있었고
-- 위의 영문 정책 drop이 select/delete 커버리지를 지워 upsert(on conflict)가 42501로 거부됨
drop policy if exists "records: 본인 것만 조회" on public.records;
create policy "records: 본인 것만 조회" on public.records
  for select using (auth.uid() = user_id);
drop policy if exists "records: 본인 것만 삭제" on public.records;
create policy "records: 본인 것만 삭제" on public.records
  for delete using (auth.uid() = user_id);

-- 완식 기록 (2026-09-01): 완식에 붙는 사진·한줄평 부가물 — 검수 승인분만 타인 노출
create table if not exists public.record_photos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_id text not null,
  photo_path text not null,
  comment text check (char_length(comment) <= 30),
  consent boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  created_at timestamptz not null default now(),
  -- 다중 사진 제출 묶음 키 (2026-09-02) — 같은 제출의 행들이 공유, 구 데이터는 null(행 단독)
  entry_id uuid
);

-- 기적용 DB에는: alter table public.record_photos add column if not exists entry_id uuid;

alter table public.record_photos enable row level security;

create policy "record_photos: 본인 전부, 타인은 승인·동의분만 조회" on public.record_photos
  for select using (
    auth.uid() = user_id
    or (status = 'approved' and consent)
  );
create policy "record_photos: 본인만 추가 (동의 유저, pending 고정)" on public.record_photos
  for insert with check (
    auth.uid() = user_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.agreed_at is not null
    )
  );
create policy "record_photos: 본인 것만 삭제" on public.record_photos
  for delete using (auth.uid() = user_id);
-- update 정책 없음 = 클라 수정 불가. status·reject_reason은 대시보드(service role)만

-- 사진은 단일 비공개 버킷 + RLS로 노출 제어 — 승인 시 파일 이동 없이 status 변경만
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('record-photos', 'record-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "record-photos: 본인 경로에만 업로드" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'record-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "record-photos: 본인 또는 승인·동의분 조회" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'record-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.record_photos rp
        where rp.photo_path = name and rp.status = 'approved' and rp.consent
      )
    )
  );
create policy "record-photos: 본인 경로 삭제" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'record-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 완식 기록 닉네임 표시 (2026-09-01): 비로그인 열람(원칙: 열람 완전 개방)을 위해
-- profiles 조회에 anon 정책 추가(기존 정책과 permissive OR 공존) — 민감정보 없음(닉네임·동의시각뿐).
-- 닉네임 조인은 FK 변경 없이 클라이언트 2쿼리(user_id 수집 → profiles in 조회)로 처리
create policy "profiles: 비로그인도 조회" on public.profiles
  for select to anon using (true);

-- 회원탈퇴 (2026-09-01): 본인 auth.users 행 삭제 → profiles·records·record_photos cascade.
-- 스토리지 객체는 소유자 삭제가 선행돼야 함(Supabase 제약) — 클라이언트가 본인 경로 파일을 먼저 지운 뒤 호출
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke execute on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
