-- AJ Taxi Park initial schema. Admin identities are provisioned by a trusted operator.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user','admin','super_admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.has_admin_role(check_user uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id=check_user and is_active=true and role in ('admin','super_admin')); $$;
revoke all on function public.has_admin_role(uuid) from public;
grant execute on function public.has_admin_role(uuid) to authenticated;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 2 and 80),
  model text not null default '' check (char_length(model) <= 100),
  year integer check (year between 1980 and 2035),
  transmission text check (char_length(transmission) <= 40),
  fuel_type text check (char_length(fuel_type) <= 40),
  description jsonb not null default '{"kk":"","ru":"","en":""}'::jsonb,
  image_urls text[] not null default array['/assets/vehicle-placeholder.svg']::text[],
  daily_price numeric(12,2) check (daily_price is null or daily_price >= 0),
  weekly_price numeric(12,2) check (weekly_price is null or weekly_price >= 0),
  monthly_price numeric(12,2) check (monthly_price is null or monthly_price >= 0),
  deposit numeric(12,2) check (deposit is null or deposit >= 0),
  rental_conditions jsonb not null default '{"kk":"","ru":"","en":""}'::jsonb,
  availability_status text not null default 'on_request' check (availability_status in ('available','on_request','unavailable')),
  is_demo boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vehicles_public_status_idx on public.vehicles(is_published,availability_status,brand);

create table if not exists public.driver_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 24),
  preferred_language text not null check (preferred_language in ('kk','ru','en')),
  owns_vehicle boolean not null,
  vehicle_brand text check (char_length(vehicle_brand) <= 80),
  vehicle_model text check (char_length(vehicle_model) <= 80),
  vehicle_year integer check (vehicle_year is null or vehicle_year between 1980 and 2035),
  additional_message text check (char_length(additional_message) <= 1000),
  privacy_consent boolean not null default true,
  status text not null default 'new' check (status in ('new','under_review','contacted','approved','rejected')),
  admin_notes text check (char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists driver_applications_status_date_idx on public.driver_applications(status,created_at desc);
create index if not exists driver_applications_name_idx on public.driver_applications using gin(to_tsvector('simple',full_name));

create table if not exists public.rental_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 7 and 24),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  vehicle_reference text not null check (char_length(vehicle_reference) <= 200),
  rental_period text not null check (rental_period in ('day','week','month')),
  preferred_start_date date,
  additional_message text check (char_length(additional_message) <= 1000),
  privacy_consent boolean not null default true,
  status text not null default 'new' check (status in ('new','under_review','contacted','approved','rejected')),
  admin_notes text check (char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rental_applications_status_date_idx on public.rental_applications(status,created_at desc);
create index if not exists rental_applications_vehicle_idx on public.rental_applications(vehicle_id);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'general' check (char_length(category) <= 40),
  question_kk text not null check (char_length(question_kk) between 2 and 300),
  question_ru text not null check (char_length(question_ru) between 2 and 300),
  question_en text not null check (char_length(question_en) between 2 and 300),
  answer_kk text not null check (char_length(answer_kk) between 2 and 2000),
  answer_ru text not null check (char_length(answer_ru) between 2 and 2000),
  answer_en text not null check (char_length(answer_en) between 2 and 2000),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faqs_public_sort_idx on public.faqs(is_published,sort_order);

create table if not exists public.site_settings (
  key text primary key check (char_length(key) between 1 and 80),
  value jsonb not null default '""'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key check (char_length(key) between 1 and 80),
  value jsonb not null default '{"kk":"","ru":"","en":""}'::jsonb,
  updated_at timestamptz not null default now()
);

-- A keyed hash of the requester IP is stored, never the raw address.
create table if not exists public.submission_rate_limits (
  ip_hash text primary key check (char_length(ip_hash)=64),
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.consume_submission_rate_limit(p_ip_hash text,p_limit integer default 6,p_window_minutes integer default 15)
returns boolean language plpgsql security definer set search_path = public
as $$
declare new_attempts integer;
begin
  delete from public.submission_rate_limits where updated_at < now() - interval '7 days';
  insert into public.submission_rate_limits(ip_hash,window_started_at,attempts,updated_at)
  values(p_ip_hash,now(),1,now())
  on conflict(ip_hash) do update set
    window_started_at=case when public.submission_rate_limits.window_started_at < now() - make_interval(mins => p_window_minutes) then now() else public.submission_rate_limits.window_started_at end,
    attempts=case when public.submission_rate_limits.window_started_at < now() - make_interval(mins => p_window_minutes) then 1 else public.submission_rate_limits.attempts+1 end,
    updated_at=now()
  returning attempts into new_attempts;
  return new_attempts <= p_limit;
end;
$$;
revoke all on function public.consume_submission_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_submission_rate_limit(text,integer,integer) to service_role;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','vehicles','driver_applications','rental_applications','faqs','site_settings','site_content','submission_rate_limits'] loop
    if table_name <> 'submission_rate_limits' then
      execute format('drop trigger if exists set_updated_at on public.%I',table_name);
      execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',table_name);
    end if;
    execute format('alter table public.%I enable row level security',table_name);
    execute format('revoke all on public.%I from anon,authenticated',table_name);
  end loop;
end $$;

-- The browser can read published catalog and FAQ records. All writes use role-checked server functions.
grant select on public.vehicles,public.faqs to anon,authenticated;
drop policy if exists vehicles_public_read on public.vehicles;
create policy vehicles_public_read on public.vehicles for select to anon,authenticated using (is_published=true);
drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read on public.faqs for select to anon,authenticated using (is_published=true);
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select to authenticated using (id=auth.uid() or public.has_admin_role(auth.uid()));

insert into public.vehicles(brand,model,description,rental_conditions,is_demo,availability_status)
select brand,'',jsonb_build_object('kk','Моделі кейін расталады','ru','Модель будет подтверждена','en','Model to be confirmed'),jsonb_build_object('kk','Демонстрациялық жазба. Қолжетімділікті AJ-ден нақтылаңыз.','ru','Демонстрационная запись. Уточните наличие у AJ.','en','Demonstration record. Confirm availability with AJ.'),true,'on_request'
from (values ('BYD'),('Chery'),('Haval'),('Geely'),('Changan')) as brands(brand)
where not exists(select 1 from public.vehicles v where v.is_demo=true and v.brand=brands.brand);

insert into public.faqs(category,question_kk,question_ru,question_en,answer_kk,answer_ru,answer_en,sort_order)
select s.category,s.question_kk,s.question_ru,s.question_en,s.answer_kk,s.answer_ru,s.answer_en,s.sort_order
from (values
('drivers','AJ автопаркіне қалай қосылуға болады?','Как подключиться к автопарку AJ?','How do I join the AJ fleet?','Сайтта өтінім қалдырыңыз. AJ командасы хабарласып, процесс пен шарттарды түсіндіреді.','Оставьте заявку на сайте. Команда AJ свяжется с вами, расскажет о процессе и уточнит условия.','Send an application through the website. The AJ team will contact you to explain the process and terms.',1),
('drivers','Қандай құжаттар қажет?','Какие документы понадобятся?','Which documents will I need?','Құжаттар тізімін қосылуды талқылағанда AJ командасы хабарлайды.','Список сообщит команда AJ при обсуждении подключения.','AJ will share the requirements while discussing onboarding.',2),
('rental','Сайт арқылы көлік брондауға бола ма?','Можно ли забронировать автомобиль через сайт?','Can I reserve a vehicle on the website?','Форма сұрау жібереді, бірақ броньды растамайды. Қолжетімділік пен шарттарды AJ растауы керек.','Форма отправляет запрос, но не подтверждает бронь. Наличие и условия должен подтвердить AJ.','The form sends an enquiry but does not confirm a reservation. AJ must confirm availability and terms.',3),
('payments','Баға мен кепілдік жарнаны қайдан көруге болады?','Где посмотреть стоимость и залог?','Where can I see prices and deposits?','Расталған прайста жоқ сомаларды AJ-ден нақтылаңыз.','Суммы, которых еще нет в подтвержденном прайсе, нужно уточнить у AJ.','Ask AJ to confirm amounts that are not in a verified price list.',4),
('documents','Құжаттарды сайт арқылы жіберу керек пе?','Нужно ли отправлять документы через сайт?','Should I send documents through the website?','Жоқ. Бұл форма байланыс деректері мен қызметке қызығушылықты ғана жинайды. Құжаттар қажет болса, команда бөлек сұрайды.','Нет. Эта форма собирает только контактные данные и интерес к услугам. Документы команда запросит отдельно, если они понадобятся.','No. This form collects contact details and service interest only. The team will ask separately if documents are needed.',6),
('general','Есептеу құралы табысқа кепілдік бере ме?','Гарантирует ли калькулятор доход?','Does the calculator guarantee earnings?','Жоқ. Ол енгізілген болжамдар негізіндегі есепті ғана көрсетеді.','Нет. Он показывает только результат на основе введенных предположений.','No. It only calculates based on assumptions you enter.',5)
) as s(category,question_kk,question_ru,question_en,answer_kk,answer_ru,answer_en,sort_order)
where not exists(select 1 from public.faqs f where f.question_en=s.question_en);

insert into public.site_settings(key,value) values
('whatsapp_number','""'::jsonb),('phone','""'::jsonb),('address','""'::jsonb),('working_hours','""'::jsonb),('calculator_commission','"0"'::jsonb),('calculator_daily_gross','"35000"'::jsonb),('calculator_working_days','"22"'::jsonb),('calculator_daily_fuel','"4500"'::jsonb),('calculator_daily_other','"1000"'::jsonb),('calculator_monthly_rental','"0"'::jsonb),('default_language','"ru"'::jsonb)
on conflict(key) do nothing;

-- Vehicle image objects are public to read; only active administrators may write or delete.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('vehicle-images','vehicle-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists vehicle_images_public_read on storage.objects;
create policy vehicle_images_public_read on storage.objects for select to anon,authenticated using (bucket_id='vehicle-images');
drop policy if exists vehicle_images_admin_insert on storage.objects;
create policy vehicle_images_admin_insert on storage.objects for insert to authenticated with check (bucket_id='vehicle-images' and public.has_admin_role(auth.uid()));
drop policy if exists vehicle_images_admin_update on storage.objects;
create policy vehicle_images_admin_update on storage.objects for update to authenticated using (bucket_id='vehicle-images' and public.has_admin_role(auth.uid())) with check (bucket_id='vehicle-images' and public.has_admin_role(auth.uid()));
drop policy if exists vehicle_images_admin_delete on storage.objects;
create policy vehicle_images_admin_delete on storage.objects for delete to authenticated using (bucket_id='vehicle-images' and public.has_admin_role(auth.uid()));
