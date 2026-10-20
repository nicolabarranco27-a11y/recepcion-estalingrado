-- ============================================================
-- Estalingrado Corp — Soporte al cliente (migración)
-- ------------------------------------------------------------
-- Sirve para habilitar el tercer servicio ("soporte") en una
-- base que ya fue creada con el schema.sql anterior.
-- ------------------------------------------------------------
-- Cómo usarlo:
--   1. Supabase → SQL Editor → New query
--   2. Pegá TODO este archivo y pulsá "Run"
--   3. Se puede ejecutar más de una vez sin romper nada.
-- ============================================================

-- 1) Columnas nuevas para el servicio de soporte.
alter table public.solicitudes add column if not exists motivo_soporte       text;
alter table public.solicitudes add column if not exists producto_relacionado text;

-- 2) Regla de servicio válida: técnico, web y soporte.
--    (En PostgreSQL no se puede editar un check en el lugar: se borra y se
--     crea otro con el mismo nombre.)
alter table public.solicitudes drop constraint if exists solicitudes_servicio_check;
alter table public.solicitudes add constraint solicitudes_servicio_check
  check (servicio in ('tecnico', 'web', 'soporte'));

-- 3) Política de seguridad (RLS) del público: acepta soporte y valida los
--    largos de los dos campos nuevos.
drop policy if exists "publico crea solicitudes" on public.solicitudes;
create policy "publico crea solicitudes"
on public.solicitudes for insert to anon, authenticated
with check (
  servicio in ('tecnico', 'web', 'soporte')
  and estado = 'nueva'
  and notas_internas is null
  and char_length(nombre) between 1 and 120
  and char_length(contacto) between 3 and 200
  and char_length(descripcion) between 1 and 5000
  and (tipo_problema        is null or char_length(tipo_problema)        <= 120)
  and (dispositivo          is null or char_length(dispositivo)          <= 200)
  and (tipo_proyecto        is null or char_length(tipo_proyecto)        <= 120)
  and (sitio_actual         is null or char_length(sitio_actual)         <= 200)
  and (motivo_soporte       is null or char_length(motivo_soporte)       <= 120)
  and (producto_relacionado is null or char_length(producto_relacionado) <= 200)
);

-- ---------- Verificación (opcional) ----------
-- Debería devolver el check que dice ('tecnico', 'web', 'soporte'):
--
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.solicitudes'::regclass
--     and conname = 'solicitudes_servicio_check';
--
-- Y la tabla debería mostrar las columnas motivo_soporte y producto_relacionado.
