# Guía: conectar la página con Supabase (paso a paso)

Esta guía es para quien recién empieza. No hace falta saber programar para
seguirla: solo hay que copiar y pegar en el panel de Supabase.

## ¿Qué es Supabase, en simple?

Supabase es un servicio en la nube que te da, sin programar un servidor:

- una **base de datos** PostgreSQL (donde se guardan las solicitudes),
- un **sistema de usuarios y contraseñas** (para el panel de administración),
- una **API automática** (la página habla con la base de datos por internet).

La página sigue siendo HTML/CSS/JS normal; no necesita Node ni un servidor
propio. GitHub solo sirve para publicar la página; **no hace falta para
conectar Supabase**.

## 1. Crear el proyecto

1. Entrá a <https://supabase.com/dashboard> e iniciá sesión.
2. **New project**.
3. Nombre: `estalingrado-corp` (o el que quieras).
4. Contraseña de la base: fuerte, y guardala en un lugar seguro.
5. Región: **South America (São Paulo)**.
6. Crear y esperar ~2 minutos a que termine.

## 2. Copiar la URL y la clave pública

1. En el proyecto: **Settings → API**.
2. Copiá **Project URL** (algo como `https://abcd1234.supabase.co`).
3. Copiá **anon public** (empieza con `eyJ...`).
4. Abrí el archivo `js/config.js` de este proyecto y completá:

```js
window.CONFIG_SUPABASE = window.CONFIG_SUPABASE || {
  url: 'https://TU-PROYECTO.supabase.co',
  anonKey: 'eyJ...tu-anon-key...'
};
```

> La `anon key` es **pública a propósito**: se usa en el navegador y está
> protegida por las reglas de la base (RLS). La clave **`service_role`**
> NUNCA se pone acá: esa sí es secreta y salta toda la seguridad.

## 3. Crear las tablas y las reglas de seguridad

1. En Supabase: **SQL Editor → New query**.
2. Abrí `supabase/schema.sql`, copiá **todo** y pegalo.
3. Pulsá **Run**. Debería decir "Success".
4. Podés ejecutarlo de nuevo sin miedo: no duplica nada.

Qué crea:

| Objeto | Para qué |
|---|---|
| `solicitudes` | cada pedido que llega desde la web |
| `admins` | qué usuarios pueden entrar al panel |
| políticas RLS | el público solo puede **crear**; los admins leen/editan |
| trigger | actualiza `actualizado_en` en cada cambio |

## 4. Crear el usuario administrador

1. **Authentication → Sign In / Up**: desactivá **Allow new users to sign up**
   (el panel no se registra solo; los usuarios se crean a mano).
2. **Authentication → Users → Add user**:
   - correo del admin (ej. el Gmail que vayas a usar),
   - contraseña,
   - activá **Auto Confirm User**.
3. Copiá el **UUID** que muestra la lista de usuarios.
4. Volvé al **SQL Editor** y ejecutá:

```sql
insert into public.admins (user_id, email)
values ('PEGA-AQUI-EL-UUID', 'correo-del-admin@ejemplo.com')
on conflict (user_id) do nothing;
```

5. Verificá que quedó: `select * from public.admins;`

## 5. Probar

1. Abrí la página con un servidor local (no con doble clic):

```powershell
npx http-server . -p 8080
```

2. Entrá a `http://localhost:8080/index.html`, elegí un servicio, completá y
   tocá **Enviar solicitud**. Debería aparecer la confirmación verde.
3. En Supabase: **Table Editor → solicitudes** → ahí está la fila.
4. Entrá a `http://localhost:8080/admin.html`, iniciá sesión con el usuario
   admin y deberías ver la solicitud.

## 6. Cosas importantes

- **Nunca** pongas la `service_role` en el código de la página.
- Si el proyecto gratuito queda inactivo, Supabase puede **pausarlo**. Se
  reactiva desde el dashboard (Project → Restore).
- El panel **no** se enlaza desde la página pública: se entra directo por
  `/admin.html`. Igual está protegido por contraseña y por RLS.
- Más adelante, cuando tengas el dominio, en GitHub:
  `Settings → Pages → Custom domain`. Después actualizá **Authentication →
  URL Configuration → Site URL** si usás recuperación de contraseña.
- Copias de seguridad: en el plan gratuito no son automáticas. Se pueden
  exportar desde **Database → Backups** o con `pg_dump` más adelante.

## 7. Si algo no funciona

| Síntoma | Revisar |
|---|---|
| El botón "Enviar" sigue deshabilitado | `js/config.js` vacío o con URL/clave mal copiadas |
| "No pudimos enviar" | proyecto pausado, sin internet o RLS mal ejecutado |
| El panel dice "Email o contraseña incorrectos" | usuario no existe, contraseña mal o falta confirmar el correo |
| El panel entra pero no muestra solicitudes | el UUID no está en la tabla `admins` |
| `new row violates row-level security policy` | se ejecutó el SQL viejo o el formulario envía campos fuera de los límites |
| No se puede enviar una solicitud de **soporte** | falta ejecutar `migracion-soporte.sql` (sección 8) |

## 8. Soporte al cliente: actualizar una base existente

Si ya creaste las tablas con el `schema.sql` **anterior** (sin soporte), ejecutá
una sola actualización:

1. En Supabase: **SQL Editor → New query**.
2. Abrí `supabase/migracion-soporte.sql`, copiá **todo** y pegalo.
3. Pulsá **Run**. Debería decir "Success".

Esto agrega las columnas `motivo_soporte` y `producto_relacionado`, amplía la
regla de servicios válidos a `('tecnico', 'web', 'soporte')` y actualiza la
política de seguridad. Se puede ejecutar más de una vez sin romper nada.

Si hiciste el proyecto **desde cero** con el `schema.sql` actual, no hace falta
hacer nada: el soporte ya viene habilitado.
