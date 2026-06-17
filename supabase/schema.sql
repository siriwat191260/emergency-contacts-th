-- ════════════════════════════════════════
-- Emergency Contacts Thailand — Schema
-- Run this in Supabase SQL Editor
-- ════════════════════════════════════════

-- 1. contacts table
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_en     text,
  phone       text not null,
  category    text not null default 'other',
  region      text not null default 'national',
  description text,
  is_pinned   boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.handle_updated_at();

-- 3. Row Level Security
alter table public.contacts enable row level security;

-- Public (PWA) can read active contacts only
create policy "Public read active contacts"
  on public.contacts for select
  to anon, authenticated
  using (is_active = true);

-- Authenticated admin can do everything
create policy "Admin full access"
  on public.contacts for all
  to authenticated
  using (true)
  with check (true);

-- 4. Enable realtime
alter publication supabase_realtime add table public.contacts;

-- 5. Seed data
insert into public.contacts (name, name_en, phone, category, region, description, is_pinned, sort_order) values
  ('แจ้งเหตุด่วน / เหตุร้าย',    'Emergency Police',           '191',  'police',   'national', 'ตำรวจ แจ้งเหตุด่วนเหตุร้ายทั่วประเทศ',            true,  1),
  ('เจ็บป่วยฉุกเฉิน ERMT',        'Emergency Medical',          '1669', 'medical',  'national', 'หน่วยแพทย์ฉุกเฉิน ทั่วประเทศ 24 ชั่วโมง',        true,  2),
  ('ไฟไหม้ ดับเพลิง',             'Fire Department',            '199',  'fire',     'national', 'กองบัญชาการตำรวจดับเพลิง',                        false, 3),
  ('ตำรวจท่องเที่ยว',             'Tourist Police',             '1155', 'police',   'national', 'ตำรวจท่องเที่ยว บริการนักท่องเที่ยว',             true,  4),
  ('หน่วยแพทย์ฉุกเฉิน กทม.',      'BMA Emergency Medical',      '1646', 'medical',  'bangkok',  'หน่วยแพทย์ฉุกเฉินกรุงเทพมหานคร',                 false, 5),
  ('หน่วยกู้ชีพ',                 'Rescue Unit',                '1554', 'medical',  'national', 'หน่วยกู้ชีพ ทั่วประเทศ',                          false, 6),
  ('แจ้งรถหาย',                   'Report Stolen Vehicle',      '1192', 'police',   'national', 'แจ้งรถหาย สำนักงานตำรวจแห่งชาติ',                 false, 7),
  ('ตำรวจทางหลวง',                'Highway Police',             '1193', 'road',     'national', 'ตำรวจทางหลวง กรมทางหลวง',                         false, 8),
  ('กรมทางหลวงชนบท',              'Rural Road Department',      '1146', 'road',     'national', 'กรมทางหลวงชนบท ถนนชนบท',                          false, 9),
  ('สายตรงทางด่วน',               'Expressway Hotline',         '1543', 'road',     'bangkok',  'EXAT ทางพิเศษกรุงเทพมหานคร',                      false, 10),
  ('ข้อมูลการจราจร',              'Traffic Information',        '1197', 'road',     'national', 'กรมทางหลวง สอบถามการจราจร',                       false, 11),
  ('การรถไฟแห่งประเทศไทย',        'State Railway of Thailand',  '1690', 'road',     'national', 'สอบถามตารางรถไฟ',                                  false, 12),
  ('ศูนย์เตือนภัยพิบัติแห่งชาติ', 'National Disaster Warning',  '192',  'disaster', 'national', 'NDWC น้ำท่วม แผ่นดินไหว',                         false, 13),
  ('ศูนย์ปลอดภัยคมนาคม',          'Transport Safety Center',    '1356', 'disaster', 'national', 'กระทรวงคมนาคม',                                   false, 14),
  ('อุบัติเหตุทางน้ำ',            'Marine Accident',            '1196', 'fire',     'national', 'ศูนย์ช่วยเหลือทางทะเล',                            false, 15),
  ('ร่วมด้วยช่วยกัน',             'Road Assistance',            '1677', 'other',    'national', 'ช่วยเหลือผู้ประสบภัยบนท้องถนน',                   false, 16);
