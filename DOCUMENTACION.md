# Documentación — Estalingrado Corp · Recepción de clientes y sistema de gestión

Este archivo reúne el historial completo del proyecto: qué se construyó, con qué
criterios, qué se verificó y qué queda pendiente. La bitácora cronológica de
sesiones está en `bitacora.txt`.

Fecha de esta versión: 19/10/2026.

---

## 1. Qué es el proyecto

Carpeta de trabajo de Estalingrado Corp que contiene dos frentes:

1. **Recepción de clientes (IMPLEMENTADA con Supabase en Etapa 7)** — página
   HTML/CSS/JS vanilla en la raíz de la carpeta que centraliza los dos
   servicios de la empresa (servicio técnico informático y creación/desarrollo
   de sitios web) con un flujo de solicitud guiado de 3 pasos. Las solicitudes
   se guardan en PostgreSQL (Supabase) y se administran desde `admin.html`.
   Mientras `js/config.js` esté vacío, el envío queda deshabilitado y la
   interfaz lo informa (nunca simula un envío).
2. **Panel de administración (IMPLEMENTADO)** — `admin.html` sin enlace
   público: login con usuario de Supabase, lista de solicitudes, filtros,
   detalle, estados, notas internas y exportación CSV. No hay backend propio:
   habla con la API REST de Supabase; la seguridad está en RLS.

El sitio institucional de referencia es
https://estalingradocorp.github.io/EstalingradoCorp/index.html (auditoriado en
la Etapa 1). Este proyecto no modifica ni depende de sus archivos.

## 2. Restricciones del proyecto (aprobadas en el chat)

- Sin frameworks, sin build, sin Node en el producto; CSS3 y JS vanilla.
- Sin dependencias nuevas: solo Google Fonts (Inter + JetBrains Mono) y
  Font Awesome 6.5.1 por CDN, mismas que la página institucional.
- Identidad visual heredada de la auditoría: fondo `#000`, azules
  `#2563eb/#3b82f6/#60a5fa/#1d4ed8`, degradado `.tg`, tarjetas glass, navbar
  fija con blur. Los violets (`#7c3aed/#6d28d9`) se usan **solo** en los orbes
  decorativos nuevos, sin tocar los componentes institucionales.
- No inventar datos de contacto (teléfono/correo no publicados quedan pendientes;
  el usuario propuso `estalingradocorp.servicios@gmail.com`, aún sin confirmar).
- El envío y el panel usan **solo** la anon key pública de Supabase + RLS; la
  `service_role` nunca se escribe en el frontend. Sin frameworks, sin build y
  sin backend propio en el producto.
- No implementar todavía un sistema de gestión completo (clientes, facturación,
  presupuestos): la Etapa 7 se limita a solicitudes y su panel.
- El usuario no puede ver imágenes: toda revisión visual fina se hace con
  checklist manual; las pruebas automatizadas cubren comportamiento y geometría.

## 3. Historial de etapas (recepción)

| Etapa | Contenido | Estado |
|---|---|---|
| 1 | Auditoría visual y técnica de la página institucional de referencia (identidad, estructura, dependencias, contactos). | Hecha |
| 2 | Base del proyecto: estructura, navbar glass, hero, tarjetas de servicios, contacto, footer; tokens de color/tipografía verificados. | Hecha |
| 3 | Flujo de recepción: stepper de 3 pasos, validación con `aria-invalid` + foco al primer inválido, revisión con `textContent` (sin HTML del usuario), envío deshabilitado (`ENVIO`). | Hecha |
| 4 | Auditoría en navegador real (Chromium/Playwright) a 1440/390/360 px; suites jsdom (63 aserciones) y Playwright en verde; **bug corregido**: cambiar de servicio en pasos 2/3 dejaba el resumen obsoleto (la tarjeta ahora reinicia el paso correspondiente). | Hecha |
| 5 (19/10/2026) | Fondo dinámico con red de orbes flotantes (canvas que imita la página institucional); **desduplicación** de la selección de servicio (se elimina el paso 1 del formulario: los radios, "Continuar" y su error; la selección vive solo en las tarjetas de `#servicios`); documentación completa (`DOCUMENTACION.md` + `bitacora.txt`). Corregido tras revisión del usuario: se quitó el aviso y la línea informativa agregados de más (la única función del formulario es despliegarse al tocar una tarjeta). | Hecha |
| 6 (19/10/2026) | Tipografía y formulario más legibles e intuitivos, solo en `#recepcion` (ver §4.4): jerarquía de títulos y subtítulos de grupo, labels 13px, inputs Inter 16px de 48px, placeholders de ejemplo, nota de campos obligatorios. | Hecha |
| 7 (19/10/2026) | **Supabase + panel**: `supabase/schema.sql` (tablas `solicitudes`/`admins`, trigger, RLS), guía `supabase/INSTRUCCIONES.md`, `js/config.js`, envío real por REST con estados/honeypot, `admin.html` + `css/admin.css` + `js/admin.js` (login, stats, filtros, detalle, estados, notas, CSV), `robots.txt`, suites nuevas y `git init`. Ver §4.2 y §4.5. | Hecha (falta configuración del usuario) |

## 4. Recepción: diseño actual del flujo

### 4.1 Interacción

1. El usuario elige el servicio **solo** en las tarjetas `#servicios`
   (atributo `data-servicio="tecnico|web"`). No existe una segunda selección
   dentro del formulario (se eliminó la duplicación: radios, botón Continuar
   y error de servicio del flujo viejo ya no están en el HTML ni en el JS).
2. Al tocar una tarjeta, **el formulario se despliega** directamente en el
   **paso 2 (Datos)**: el stepper de 3 ítems pasa a verse con el 01 completado
   (muestra el nombre del servicio elegido) y el 02 activo. Sin elementos
   intermedios ni indicadores agregados: el formulario es el mismo de antes,
   sin el paso de selección duplicado.
3. Validación: campos comunes (nombre, medio de contacto, descripción) +
   campos del grupo del servicio elegido; los controles del grupo inactivo
   quedan `disabled`. Errores con `aria-invalid`, mensajes `err-*` y foco al
   primer campo inválido; corrección en línea al escribir.
4. **Revisión** (`#paso-resumen`): resumen armado solo con `textContent`;
   opción "Editar" que conserva todos los datos.
5. **Cambio de servicio en vivo**: pulsar la otra tarjeta en cualquier momento
   alterna los grupos; si se está en Revisión, se vuelve a Datos porque el
   resumen dejó de corresponder (bug de Etapa 4, ahora cubierto por pruebas).

### 4.2 Envío con Supabase (Etapa 7)

- Configuración única: `js/config.js` define
  `window.CONFIG_SUPABASE = { url, anonKey }` (la usa tanto `main.js` como
  `admin.js`). Si `url` o `anonKey` están vacías, `main.js` deja
  `ENVIO.tipo = null`: el botón "Enviar solicitud" queda deshabilitado y el
  bloque `#estado-envio` informa que el canal no está configurado. **Nunca** se
  simula un envío exitoso ni se borran los datos.
- Con Supabase configurado, `enviarASupabase()` hace `POST` a
  `{url}/rest/v1/solicitudes` con headers `apikey`, `Authorization: Bearer`
  (anon key), `Content-Type: application/json` y `Prefer: return=minimal`;
  timeout de 20 s con `AbortController`.
- `datosParaSupabase()` envía snake_case y solo los campos del servicio elegido:
  comunes (`servicio`, `nombre`, `contacto`, `descripcion`) + `tipo_problema` y
  `dispositivo` (técnico) o `tipo_proyecto` y `sitio_actual` (web). No puede
  fijar `estado` ni `notas_internas` (lo impide también RLS).
- Estados de interfaz: "Enviando…" (ámbar), éxito (verde, ícono check, se
  ocultan "Editar" y aparece "Nueva solicitud") o error (rojo, conserva los
  datos y habilita reintentar; si falla, el botón vuelve a estar activo).
- **Honeypot** `#hp-empresa` oculto: si viene completo, se muestra la misma
  confirmación pero no se ejecuta `fetch`.
- El HTML tiene `#btn-nueva` oculto hasta el éxito; al pulsarlo se resetea el
  formulario, se limpian errores y se vuelve al paso 2.

### 4.3 Fondo dinámico con orbes flotantes (Etapa 5)

- Un `<canvas id="fondo-particulas">` fijo detrás del contenido
  (`position:fixed`, `z-index:-1`, `pointer-events:none`, `aria-hidden`)
  dibuja una red de orbes flotantes que **imita el fondo de la página
  institucional** (su canvas `#pc`), implementado en `js/main.js` sin
  dependencias ni librerías:
  - Cantidad: `min(110, área/16000)` de orbes (la referencia usa `min(80, área/15000)`).
  - Tamaño 0.9–3.5 px con halo suave (la referencia: 0.5–2.5 px sin halo);
    velocidad ±0.15 px por cuadro; opacidad 0.15–0.6.
  - **Líneas de unión a menos de 120 px** con alpha `0.07·(1−d/120)` y
    grosor 0.5 px — exactamente la regla de la referencia (80 px de
    alpha inicial en la referencia: `0.08·(1−d/120)`).
  - Colores: azules institucionales `#2563eb`/`#3b82f6` y un tercio de
    violeta `#7c3aed` (pedido del usuario en la Etapa 5).
  - Envoltura toroidal (sale por un borde, reaparece en el opuesto) y
    redibujo en `resize`.
- `prefers-reduced-motion`: el canvas se dibuja una vez y **no se anima**
  (verificado midiendo dos capturas del canvas separadas 700 ms: idénticas).

### 4.4 Tipografía y legibilidad del formulario (Etapa 6, 19/10/2026)

Mejora pedida por el usuario ("legible fácilmente e intuitivo"), acotada a la
sección `#recepcion`/`.flow` (identidad intacta: Inter + JetBrains Mono, mismos
tokens de color; el resto de la página no cambió):

- **Jerarquía**: título de paso 1.125rem → 1.375rem; subtítulos de grupo con
  regla fina (`.flow__subtitulo`): "Tus datos", "Equipo y problema",
  "Tu sitio web", "Qué necesitás" (este último con separador punteado).
- **Labels**: 11px → 13px semibold, `#a1a1aa` (antes `#71717a`); `(opcional)`
  de 10px → 11px.
- **Campos**: de mono 14px a **Inter 16px** (mejor lectura y evita el zoom
  automático de iOS), `font-weight:400`, alto mínimo 48px, subrayado reforzado
  (`#27272a` → `#3f3f46`, hover `#52525b`), placeholder legible (`#3f3f46` →
  `#71717a`) y **placeholder de ejemplo** en nombre y contacto.
- **Descripción dinámica**: `aplicarServicio()` cambia el placeholder del
  textarea según el servicio (ejemplo técnico o web).
- **Ayudas**: nota "Los campos marcados con * son obligatorios"
  (`.flow__nota`) arriba del formulario; hints 11px mono → 13px Inter;
  errores 13px → 14px semibold; textarea min-height 7rem → 8.5rem.
- **Stepper**: 11px → 12px (móvil 11px) con paso activo en bold.
- **Paso Revisión**: etiquetas 11px → 12px, valores 15px → 16px peso 400;
  caja de estado de envío 13/14px → 15px.
- **Botones del flujo**: alto mínimo 48px, 13px, con flecha de avance en
  "Revisar solicitud" y "Enviar solicitud".

Verificado: 4 suites en verde tras los cambios (62+11 jsdom, 64 visual,
26 extra) — ninguna aserción dependía de los tamaños modificados.

### 4.5 Panel de administración (Etapa 7, 19/10/2026)

`admin.html` (mismo lenguaje visual; `meta robots noindex` y `Disallow:
/admin.html` en `robots.txt`) funciona como una SPA mínima en vanilla JS:

- **Login**: `POST /auth/v1/token?grant_type=password` con la anon key. Guarda
  `access_token`, `refresh_token`, vencimiento y correo en `sessionStorage`
  (`ec_admin_sesion`). Al cargar valida contra `/auth/v1/user`; ante un 401
  refresca una vez (`grant_type=refresh_token`) y, si falla, vuelve al login.
- **Lista**: `GET /rest/v1/solicitudes?select=*&order=creado_en.desc&limit=500`;
  stats por estado, búsqueda por texto y filtros por estado/servicio, todo en
  cliente. Cada tarjeta muestra fecha, badge, nombre, contacto y descripción.
- **Detalle**: `<dialog>` nativo con fecha, servicio, contacto y campos del
  servicio; permite cambiar `estado` (`nueva`, `en_revision`, `respondida`,
  `cerrada`) y guardar `notas_internas` con
  `PATCH /rest/v1/solicitudes?id=eq.<uuid>` + `Prefer: return=minimal`.
- **CSV**: exporta lo filtrado con BOM UTF-8 y separador `;` (Excel es-AR);
  columnas Fecha, Servicio, Estado, Nombre, Contacto, Tipo, Equipo o sitio,
  Descripción y Notas internas.
- **Seguridad**: todo se pinta con `textContent` (XSS neutralizado), no hay
  enlaces desde la página pública, y la autorización real es RLS: solo un
  usuario con fila en `admins` puede leer/actualizar. El frontend nunca usa
  `service_role`; la anon key es pública por diseño.
- **Sin configurar**: si `js/config.js` está vacío, el login queda deshabilitado
  y se muestra un aviso con el enlace a `supabase/INSTRUCCIONES.md`.
- **Móvil**: stats y tarjetas se reacomodan; el diálogo ocupa el ancho completo;
  sin desborde horizontal a 360 px (verificado).

## 5. Pruebas (07/10 → 19/10/2026)

Las suites viven **fuera del proyecto** (carpeta temporal de trabajo), porque
el proyecto no usa Node/build. Son 6 suites (4 de recepción + 2 de Etapa 7):

| Suite | Motor | Alcance | Resultado (19/10/2026) |
|---|---|---|---|
| `test-recepcion.js` | jsdom | Estado inicial (formulario/stepper ocultos, sin duplicación, sin elementos agregados), despliegue por tarjeta, grupos alternados, validación, foco, corrección en línea, revisión, XSS literal, cambio de servicio desde revisión, envío deshabilitado, menú móvil, canvas de fondo. | 62/62 PASS |
| `test-tecnico.js` | jsdom | Camino del servicio técnico: validación de `tipo-problema`, dispositivo opcional, resumen y edición. | 11/11 PASS |
| `etapa4-visual.js` | Chromium real | 1440/390/360 px: sin desborde horizontal, consola limpia, recursos locales OK, orbes (canvas fijo sin eventos, ajustado al viewport y **con píxeles dibujados**), recorrido completo tarjeta→errores→revisión, caracteres especiales/emoji, XSS, editar conserva datos. | 64/64 PASS |
| `etapa4-extra.js` | Chromium real | Anclas vs navbar, skip link, foco visible con teclado, Enter implícito, cambio de servicio en vivo sin resumen obsoleto, campos de grupo preservados, texto >2000 chars, labels/`aria-describedby`, stepper coherente, `prefers-reduced-motion` (orbes estáticos: dos capturas idénticas), solapamientos @360. | 26/26 PASS |
| `test-supabase.js` | jsdom | `CONFIG_SUPABASE` simulado: botón habilitado, POST a `/rest/v1/solicitudes`, URL/headers/`Prefer`, payload snake_case por servicio, éxito + "Nueva solicitud", error de red con datos conservados y reintento, honeypot sin `fetch`. | 48/48 PASS |
| `test-admin.js` | Chromium real | Panel con API simulada por `page.route` (incluye preflight CORS): login inválido/válido, sesión, stats, lista, XSS, filtros, detalle, PATCH 204, CSV (BOM/`;`), recarga con sesión, logout y móvil 360 sin desborde. | 60/60 PASS |

Las suites de Etapa 7 usan `window.fetch` / `page.route` simulados, no un
proyecto Supabase real: falta validar con el proyecto del usuario (pendiente).

Verificado lo funcional y geométrico; **no** se pudo verificar automáticamente
la estética subjetiva (la asistente no ve imágenes) → checklist manual en
`README.md`.

## 6. Supabase y panel de solicitudes (Etapa 7)

El plan anterior de gestión (React + Node/Fastify + Prisma) quedó **descartado**
para esta etapa: el usuario aprobó Supabase para no mantener un servidor propio
y seguir con HTML/CSS/JS vanilla. Lo implementado es:

- **Base de datos** (PostgreSQL en Supabase), creada por `supabase/schema.sql`:
  - `public.solicitudes`: `id uuid`, `creado_en`, `actualizado_en`, `servicio`
    (`tecnico|web`), `nombre`, `contacto`, `tipo_problema`, `dispositivo`,
    `tipo_proyecto`, `sitio_actual`, `descripcion`, `estado`
    (`nueva|en_revision|respondida|cerrada`, default `nueva`) y
    `notas_internas`.
  - `public.admins`: `user_id uuid` → `auth.users` (PK), `email`, `creado_en`.
  - Trigger `tocar_actualizado_en` para mantener `actualizado_en`.
  - Índices por fecha/estado y por servicio.
- **Seguridad (RLS)**:
  - El público (anon) solo puede **insertar** en `solicitudes`, con límites de
    longitud, `estado = 'nueva'` y `notas_internas` nulo.
  - Solo un usuario autenticado con fila en `admins` puede **leer** y
    **actualizar** solicitudes (`exists` contra `admins`); no puede borrar.
  - Cada admin puede leer su propia fila de `admins`.
  - `GRANT`/`REVOKE` explícitos; sin acceso anónimo de lectura/update/delete.
- **Autenticación**: usuarios creados a mano en Supabase (signups desactivados,
  Auto Confirm) + UUID insertado en `admins`. El panel usa la API de auth de
  Supabase y guarda la sesión en `sessionStorage`.
- **Configuración**: `js/config.js` (URL + anon key) y guía para principiantes
  en `supabase/INSTRUCCIONES.md` (crear proyecto en São Paulo, ejecutar SQL,
  crear admin, probar con `npx http-server . -p 8080`, troubleshooting).
- **Alcance del panel v1**: solo solicitudes (lista, filtros, detalle, estado,
  notas internas, CSV). No incluye clientes, equipos, presupuestos, facturación
  ni envío de correos; quedan como futuras etapas si se piden.
- **Límites conscientes**: la lista trae hasta 500 filas (sin paginación
  todavía), no hay tiempo real ni notificaciones, y el envío depende de que el
  usuario complete `js/config.js`. Nada de esto se probó contra un Supabase real.

Pasos que debe hacer el usuario (resumidos; detalle en la guía):

1. Crear el proyecto en Supabase y copiar **Project URL** + **anon key** en
   `js/config.js`.
2. Ejecutar `supabase/schema.sql` completo en el SQL Editor.
3. Crear el usuario admin en Authentication (Auto Confirm) e insertar su UUID
   en `public.admins`.
4. Probar el envío en `index.html` y el login en `admin.html`.

## 7. Pendientes conocidos

1. Revisión visual humana del rediseño y del panel (checklist del `README.md`).
2. **Configurar Supabase**: crear el proyecto, completar `js/config.js`,
   ejecutar `supabase/schema.sql` y crear el admin (lo hace el usuario).
3. Probar el envío y el panel contra el proyecto Supabase real.
4. Repositorio en GitHub: **subido** a
   <https://github.com/nicolabarranco27-a11y/recepcion-estalingrado> (público,
   rama `main`). GitHub Pages activado en
   <https://nicolabarranco27-a11y.github.io/recepcion-estalingrado/>; el primer
   deploy quedó en cola por el incidente de Actions/Pages del 19/10/2026.
   Dominio y correo siguen sin configurar.
5. Verificar teléfono/correo oficiales cuando se publiquen (correo propuesto
   `estalingradocorp.servicios@gmail.com`, sin confirmar).
6. No publicar ni configurar dominio (fuera de alcance hasta que se pida).

## 8. Limitaciones conocidas

- La revisión visual pixel a pixel requiere inspección humana (limitación de
  la asistente, no del proyecto).
- Los enlaces del pie tienen objetivos táctiles de 17–26 px en móvil: se
  mantienen iguales al sitio institucional por identidad aprobada.
- Las pruebas automatizadas no están versionadas en el proyecto (viven en
  carpeta temporal); si se quiere continuidad conviene llevarlas a `tests/`
  en una futura etapa con Node.
- Las pruebas de Supabase/panel usan respuestas simuladas: no cubren errores
  propios del servicio real (proyecto pausado, límites de plan, CORS del
  dominio final). Se validará al configurar el proyecto del usuario.
- La lista del panel está topeada en 500 solicitudes y no tiene paginación ni
  actualización en tiempo real; si el volumen crece habrá que agregarlas.
