-- ============================================================
-- Estalingrado Corp — Recepción de clientes
-- Esquema y seguridad para Supabase (PostgreSQL)
-- ------------------------------------------------------------
-- Cómo usarlo:
--   1. Supabase → SQL Editor → New query
--   2. Pegá TODO este archivo y pulsá "Run"
--   3. Se puede ejecutar más de una vez sin duplicar datos.
-- ------------------------------------------------------------
-- Resumen de seguridad (RLS):
--   · El público (anon) SOLO puede insertar solicitudes nuevas.
--   · Los admins autenticados pueden leer y actualizar solicitudes.
--   · Nadie puede borrar filas desde la web.
--   · La tabla admins solo muestra a cada admin su propia fila.
--   · Anti-spam: un mismo contacto no puede cargar más de 3 solicitudes
--     cada 10 minutos (frena bots que rellenan el formulario).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------

create table if not exists public.solicitudes (
  id              uuid primary key default gen_random_uuid(),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  servicio        text not null check (servicio in ('tecnico', 'web')),
  nombre          text not null,
  contacto        text not null,
  tipo_problema   text,
  dispositivo     text,
  tipo_proyecto   text,
  sitio_actual    text,
  descripcion     text not null,
  estado          text not null default 'nueva'
                  check (estado in ('nueva', 'en_revision', 'respondida', 'cerrada')),
  notas_internas  text
);

create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  creado_en  timestamptz not null default now()
);

-- ---------- Índices ----------

create index if not exists solicitudes_creado_en_idx on public.solicitudes (creado_en desc);
create index if not exists solicitudes_estado_idx    on public.solicitudes (estado);

-- ---------- Fecha de modificación automática ----------

create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists solicitudes_tocar_actualizado_en on public.solicitudes;
create trigger solicitudes_tocar_actualizado_en
before update on public.solicitudes
for each row execute function public.tocar_actualizado_en();

-- ---------- Anti-spam ----------
-- Un mismo contacto no puede cargar más de 3 solicitudes cada 10 minutos.
-- Es SECURITY DEFINER para poder contar filas sin quedar frenado por RLS, y
-- fija el search_path (buena práctica de seguridad en Postgres).

create index if not exists solicitudes_contacto_creado_idx
  on public.solicitudes (contacto, creado_en desc);

create or replace function public.limitar_solicitudes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recientes integer;
begin
  select count(*) into recientes
  from public.solicitudes s
  where s.contacto = new.contacto
    and s.creado_en > now() - interval '10 minutes';

  if recientes >= 3 then
    raise exception 'DEMASIADAS_SOLICITUDES: este contacto ya envió solicitudes hace muy poco'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists solicitudes_limitar on public.solicitudes;
create trigger solicitudes_limitar
before insert on public.solicitudes
for each row execute function public.limitar_solicitudes();

-- ---------- Seguridad a nivel de fila (RLS) ----------

alter table public.solicitudes enable row level security;
alter table public.admins      enable row level security;

-- Público: puede crear una solicitud nueva y nada más.
drop policy if exists "publico crea solicitudes" on public.solicitudes;
create policy "publico crea solicitudes"
on public.solicitudes for insert to anon, authenticated
with check (
  servicio in ('tecnico', 'web')
  and estado = 'nueva'
  and notas_internas is null
  and char_length(nombre) between 1 and 120
  and char_length(contacto) between 3 and 200
  and char_length(descripcion) between 1 and 5000
  and (tipo_problema  is null or char_length(tipo_problema)  <= 120)
  and (dispositivo    is null or char_length(dispositivo)    <= 200)
  and (tipo_proyecto  is null or char_length(tipo_proyecto)  <= 120)
  and (sitio_actual   is null or char_length(sitio_actual)   <= 200)
);

-- Admins: leer y actualizar todas las solicitudes.
drop policy if exists "admins leen solicitudes" on public.solicitudes;
create policy "admins leen solicitudes"
on public.solicitudes for select to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins actualizan solicitudes" on public.solicitudes;
create policy "admins actualizan solicitudes"
on public.solicitudes for update to authenticated
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins: cada usuario solo ve su propia fila en la tabla admins.
drop policy if exists "admin ve su registro" on public.admins;
create policy "admin ve su registro"
on public.admins for select to authenticated
using (user_id = auth.uid());

-- ---------- Permisos explícitos ----------

grant usage on schema public to anon, authenticated;
grant insert on public.solicitudes to anon, authenticated;
grant select, update on public.solicitudes to authenticated;
grant select on public.admins to authenticated;
revoke delete, update on public.solicitudes from anon;
revoke insert, update, delete on public.admins from anon, authenticated;

-- ============================================================
-- DESPUÉS DE CREAR EL USUARIO ADMIN
-- ------------------------------------------------------------
-- 1. Supabase → Authentication → Users → Add user
--    (correo + contraseña; "Auto Confirm User" activado)
-- 2. Copiá el UUID del usuario y ejecutá (sin las comillas raras):
--
--    insert into public.admins (user_id, email)
--    values ('PEGA-AQUI-EL-UUID', 'correo-del-admin@ejemplo.com')
--    on conflict (user_id) do nothing;
--
-- 3. Verificá: select * from public.admins;
--
-- RECOMENDADO (Authentication → Sign In / Up):
--   · Apagar "Allow new users to sign up": ya no se crea nadie solo.
--   · (Opcional) Authentication → URL Configuration → Site URL =
--     https://nicolabarranco27-a11y.github.io/recepcion-estalingrado/
-- ============================================================
