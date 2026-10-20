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
   detalle, estados, notas internas y exportación a Excel (`.xlsx`). No hay
   backend propio:
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
| 7 (19/10/2026) | **Supabase + panel**: `supabase/schema.sql` (tablas `solicitudes`/`admins`, trigger, RLS), guía `supabase/INSTRUCCIONES.md`, `js/config.js`, envío real por REST con estados/honeypot, `admin.html` + `css/admin.css` + `js/admin.js` (login, stats, filtros, detalle, estados, notas, CSV), `robots.txt`, suites nuevas y `git init`. Ver §4.2 y §4.5. | Hecha y conectada (proyecto Supabase real el 19/10/2026) |
| 8 (19/10/2026) | **Accesos y botones**: hero con "Servicios informáticos y web" (ancla a `#servicios`) y "Conocer la empresa" (sitio institucional en otra pestaña); repaso visual de los botones del formulario y del panel (radio, alto táctil, contraste, foco y estado deshabilitado). Ver §4.7. | Hecha |
| 9 (20/10/2026) | **Soporte al cliente como tercer servicio**: sección `#soporte` (pasos + correo + CTA), tarjeta `#servicio-soporte`, grupo `#campos-soporte` (motivo obligatorio + producto relacionado), refactor de `aplicarServicio` a 3 grupos, columnas nuevas en la base con `supabase/migracion-soporte.sql`, filtro y detalle en el panel, y suites ampliadas (322 aserciones). Ver §4.8. | Hecha (falta correr el SQL en Supabase) |
| 10 (20/10/2026) | **Exportación a Excel `.xlsx` sin librerías**: nuevo `js/exportacion.js` (ZIP sin comprimir + CRC32 y XML de OOXML escritos a mano), botón "Exportar Excel" que reemplaza al CSV, hojas *Solicitudes* y *Resumen*, agrupamiento por servicio y exportación de lo filtrado. Ver §4.9. | Hecha |
| 11 (20/10/2026) | **Soporte sin redundancia**: se quitó la tarjeta `#servicio-soporte` de `#servicios` (quedan dos: técnico y web) y el botón "Soporte al cliente" de la sección `#soporte` (`btn--solid`, `fa-headset`, `data-servicio="soporte"`) abre el formulario directo con los campos de soporte. Sin cambios de lógica en el JS; suites ajustadas (340 aserciones). Ver §4.8. | Hecha y publicada |
| 12 (20/10/2026) | **Escritura del hero** como la página institucional: pill, título y párrafo se escriben carácter por carácter (30 ms/char) con cursor `▌` que parpadea; el JS **vacía los textos síncronamente antes del primer pintado** (nunca se ve el texto completo para reescribirlo), el span `.tg` se conserva, los espacios del fuente se colapsan (sin pausas raras), se reserva el alto final (sin salto de layout) y con movimiento reducido no se anima. Ver §4.10. | Hecha y publicada |
| 13 (20/10/2026) | **Orbes minimalistas**: el canvas de fondo ya no dibuja el aura difusa alrededor de cada orbe; quedan círculos de color puro con la misma red de líneas. Ver §4.10. | Hecha y publicada |
| 14 (20/10/2026) | **Imágenes institucionales**: fotos agregadas por la empresa en `Imagenes/`, integradas en dos lugares distintos — `imagen.jpg` (cerebro con contraste azul y logo) como pieza visual del hero y `oficina.jpg` en el intro de `#soporte`, junto al título "Soporte al cliente", con pie minimalista "Oficinas" en blanco. Ver §4.11. | Hecha y publicada |

## 4. Recepción: diseño actual del flujo

### 4.1 Interacción

1. El usuario elige el servicio **solo** con las entradas `data-servicio`
   (`tecnico|web|soporte`): las dos tarjetas de `#servicios` (técnico y web)
   y, desde la Etapa 11, el botón "Soporte al cliente" de la sección `#soporte`.
   No existe una segunda selección dentro del formulario (se eliminó la
   duplicación: radios, botón Continuar y error de servicio del flujo viejo ya
   no están en el HTML ni en el JS).
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
  `dispositivo` (técnico), `tipo_proyecto` y `sitio_actual` (web), o
  `motivo_soporte` y `producto_relacionado` (soporte). No puede fijar `estado`
  ni `notas_internas` (lo impide también RLS).
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
- **Exportación a Excel (Etapa 10, ver §4.9)**: exporta lo filtrado a un
  `.xlsx` real con hojas *Solicitudes* (15 columnas, agrupado por servicio) y
  *Resumen* (conteos por estado y por servicio).
- **Seguridad**: todo se pinta con `textContent` (XSS neutralizado), no hay
  enlaces desde la página pública, y la autorización real es RLS: solo un
  usuario con fila en `admins` puede leer/actualizar. El frontend nunca usa
  `service_role`; la anon key es pública por diseño.
- **Acceso**: sin botón visible; en `js/main.js` un atajo abre `admin.html`
  cuando se mantiene **Ctrl** y se hacen **3 clics seguidos sobre el logo**
  (se abre en otra pestaña y se cancela la navegación al ancla). Alternativas:
  dirección directa en favoritos y "Agregar a la pantalla de inicio" en el
  celular.
- **Sin configurar**: si `js/config.js` está vacío, el login queda deshabilitado
  y se muestra un aviso con el enlace a `supabase/INSTRUCCIONES.md`.
- **Móvil**: stats y tarjetas se reacomodan; el diálogo ocupa el ancho completo;
  sin desborde horizontal a 360 px (verificado).

### 4.6 Endurecimiento de seguridad (19/10/2026)

Revisión completa pedida por el usuario tras conectar Supabase. Cambios:

- **Anti-spam en la base**: trigger `solicitudes_limitar` /
  `limitar_solicitudes()` (función `SECURITY DEFINER` con `search_path = public`
  para contar filas sin que la RLS la frene) que rechaza la cuarta solicitud del
  mismo `contacto` en 10 minutos con
  `raise exception 'DEMASIADAS_SOLICITUDES…'`. Índice
  `(contacto, creado_en desc)` para que el conteo sea barato.
- **Mensaje claro en el frontend**: `enviarASupabase()` lee el cuerpo del error
  (`respuesta.text()`, con guarda por si el `fetch` simulado no lo tiene) y, si
  contiene `DEMASIADAS_SOLICITUDES`, muestra "Esperá unos minutos" en lugar del
  error genérico; los datos siguen en pantalla.
- **CSP en `index.html` y `admin.html`**:
  `default-src 'self'; img-src 'self' data:; style-src 'self' <cdnjs> <fonts.googleapis>;
  font-src <cdnjs> <fonts.gstatic>; script-src 'self'; connect-src 'self'
  https://*.supabase.co; object-src 'none'; frame-src 'none'; base-uri 'self';
  form-action 'self'; upgrade-insecure-requests`. No hay scripts, estilos ni
  manejadores inline en el HTML, así que no hizo falta `unsafe-inline`. Se sumó
  `meta referrer = strict-origin-when-cross-origin`.
- **CSV (Etapa 7, reemplazado en la Etapa 10)**: `celdaCsv()` antepone un
  apóstrofo a las celdas que empiezan con `= + - @` (o tabulación/retorno) para
  neutralizar la inyección de fórmulas en Excel/Sheets. El CSV ya no existe: el
  `.xlsx` de §4.9 escribe las celdas como `inlineStr`, de modo que el archivo no
  puede contener fórmulas.
- **Verificación**: `verificar-csp.js` (Chromium) sobre local y sobre la página
  publicada: 0 cortes por CSP, 0 errores de consola, íconos de Font Awesome y
  logo cargados. `Enforce HTTPS` de GitHub Pages confirmado activo. Auditoría de
  secretos: no hay `service_role` ni claves privadas en el repositorio; la
  `anon key` es pública por diseño.
- **Pendiente del usuario**: apagar "Allow new users to sign up", contraseña
  larga y única para el panel y verificación en dos pasos en GitHub/Supabase.

### 4.7 Accesos y botones (19/10/2026)

Cambios pedidos por el usuario:

- **Hero**: el primer botón pasa a decir **"Servicios informáticos y web"** y
  mantiene el ancla `#servicios` (lleva a las dos tarjetas que inician la
  recepción). El segundo botón deja de duplicar el destino del formulario y
  pasa a **"Conocer la empresa"**, enlace externo al sitio institucional
  (`target="_blank"` + `rel="noopener noreferrer"`, ícono
  `fa-arrow-up-right-from-square`).
- **Botones del formulario y del panel**: `.btn` ahora tiene `border-radius`
  10 px (8 px en `.btn--sm`), `min-height` 3.25 rem (2.75 rem en `.btn--sm`),
  `justify-content: center`, `font-weight` 600 y transición con `box-shadow` y
  `transform`. `.btn--outline` gana borde `#52525b`, fondo `rgba(255,255,255,.03)`
  y hover azul con relleno; `.btn--solid` mantiene blanco sobre negro, con
  sombra y leve elevación al pasar el mouse. El estado deshabilitado ya no usa
  `opacity` (quedaba poco legible): usa gris `#3f3f46` con texto `#d4d4d8` en
  sólidos y `#71717a` en contornos. En `.flow__actions` los botones tienen
  `min-width: 11rem` y en móvil se estiran a lo ancho.
- **Verificación** (`verificar-botones.js`): alturas de 52 px (44 px en los
  chicos) y contrastes medidos de 15,78:1 (contorno) y 21:1 (sólidos); las 6
  suites siguen en verde, sin desborde en 390/360 px.

### 4.8 Soporte al cliente (Etapas 9 y 11, 20/10/2026)

El soporte se implementó como **tercer servicio** del mismo flujo: misma
recepción, misma tabla `solicitudes`, mismo panel y misma exportación. En la
Etapa 11 se quitó la entrada duplicada (la tercera tarjeta) para que cada
servicio tenga una única puerta de entrada.

**Página (`index.html`)**

- Enlace "Soporte" en la navbar desktop y en el menú móvil (entre Recepción y
  Contacto, en el orden de la página).
- **Sección `#soporte`** (antes de `#contacto`): descripción, tres pasos en
  `.soporte-steps` (01 pedir · 02 contá qué pasa · 03 recibir respuesta por el
  medio dejado) y canal directo con `mailto:estalingradocorpsupport@protonmail.com`
  (también agregado a la lista de `#contacto`).
- **Botón "Soporte al cliente"** (Etapa 11) en `.soporte-canales`: `btn--solid`
  con ícono `fa-headset` y `href="#recepcion" data-servicio="soporte"` — el
  mismo mecanismo de las tarjetas —, así despliega el formulario con los campos
  de soporte ya activos.
- La **tarjeta `#servicio-soporte`** de `#servicios` fue eliminada (Etapa 11):
  hoy hay dos tarjetas (técnico y web) y la descripción de la sección indica
  que el soporte está más abajo. El paso 01 de `.soporte-steps` apunta al
  botón en lugar de a una tarjeta.
- **Grupo `#campos-soporte`** en el formulario: select *Motivo* obligatorio
  (Consulta general · Ayuda para usar un servicio · Incidencia o falla · Reclamo ·
  Estado de una solicitud o servicio · Otro) e input opcional *Producto o
  servicio relacionado*, con mensaje de error `err-motivo-soporte`.

**Javascript (`js/main.js`)**

- `SERVICIOS.soporte = 'Soporte al cliente'`; `ETIQUETAS` con `motivoSoporte` y
  `productoRelacionado` para el resumen.
- `aplicarServicio()` dejó de ser binaria (`esTecnico`): ahora recorre
  `GRUPOS_SERVICIO` (tecnico, web, soporte), muestra el grupo activo, deshabilita
  los otros dos y toma los textos de `TEXTOS_SERVICIO` (label de nombre, label y
  placeholder de descripción).
- `datosParaSupabase()` pasó de `if técnico / else web` a `if/else if` por
  servicio, evitando que un servicio desconocido mande campos ajenos.
- **Endurecimiento**: el handler de `#btn-enviar` sale si `paso-resumen` está
  oculto → el envío solo ocurre desde el paso 3, nunca desde el botón oculto.

**Base de datos (`supabase/migracion-soporte.sql` + `schema.sql`)**

- `add column if not exists motivo_soporte / producto_relacionado`.
- El `check` de servicio pasa a `('tecnico','web','soporte')` (drop + add, porque
  en PostgreSQL no se edita un check en el lugar).
- La política RLS de insert se reescribe incluyendo `soporte` y validando
  `<= 120` para `motivo_soporte` y `<= 200` para `producto_relacionado`.
- Todo es idempotente: se puede re-ejecutar sin romper nada.

**Panel (`admin.html` + `js/admin.js`)**

- Opción "Soporte" en `#filtro-servicio`.
- `SERVICIOS.soporte = 'Soporte'`; meta de la lista con
  `tipo_problema || tipo_proyecto || motivo_soporte`.
- Detalle con filas *Motivo* y *Producto relacionado*; el buscador incluye los
  dos campos; la exportación (§4.9) les dedica una columna a cada uno.

**CSS (`css/styles.css`)**

- Nuevos `.soporte-steps` (grid auto-fit con línea azul superior y números en
  mono) y `.soporte-canales` (fila con correo + CTA).
- `.contact-list__value` con `overflow-wrap: anywhere` (el correo largo del
  soporte provocaba desborde horizontal a 360 px; detectado por la suite y
  corregido).

### 4.9 Exportación a Excel (Etapa 10, 20/10/2026)

El CSV del panel se reemplazó por un archivo **`.xlsx` real**, generado en el
navegador **sin ninguna librería** (prohibido por las restricciones del
proyecto). Decidido con el usuario: formato `.xlsx`, exportar lo filtrado en
pantalla, agrupar por servicio y reemplazar al CSV.

**`js/exportacion.js` (módulo nuevo, cargado antes de `admin.js`)**

- **ZIP sin comprimir (STORE)**: escribe a mano los tres bloques del formato
  ZIP — cabeceras locales (`0x04034b50`), directorio central (`0x02014b50`) y
  fin de archivo (`0x06054b50`) — con `DataView`, `crc32` propio (tabla de
  256 posiciones, polinomio `0xEDB88320`), marcas DOS de fecha/hora y el flag
  UTF-8 (`0x0800`). Sin `CompressionStream` ni `zlib`: nada de la plataforma
  de compresión.
- **Codificación UTF-8 propia**: `aUtf8()` convierte strings a bytes manejando
  BMP y pares sustitutos (emoji incluidos), sin depender de `TextEncoder`.
- **Partes OOXML mínimas y válidas**: `[Content_Types].xml`, `_rels/.rels`,
  `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/styles.xml` (4 estilos:
  normal, título en negrita, fecha `dd/mm/yyyy hh:mm` y cabecera con texto
  blanco sobre azul `#1D4ED8`) y una hoja por pestaña.
- **Celdas**: texto como `inlineStr` (el archivo **no puede** contener fórmulas,
  así que la inyección de fórmulas queda eliminada por diseño), números como
  `<v>` y fechas como número serial de Excel con formato de fecha. Todo el texto
  pasa por `limpiarXml()` (saca caracteres de control) y `escaparXml()`
  (`& < > " '`) y se recorta al límite de 32767 caracteres.
- **Hoja**: dimensión, panel congelado en la fila de cabecera, anchos de columna
  personalizados y `autoFilter` (el Excel queda listo para filtrar).
- **API**: `Exportacion.titulo/encabezado/fecha/texto` para armar celdas y
  `Exportacion.crear(hojas)` → `Uint8Array`; `descargar(nombre, bytes)` genera
  el `Blob` (MIME `…spreadsheetml.sheet`) y dispara el `<a download>`.

**Panel (`js/admin.js`)**

- Botón **"Exportar Excel"** (`#btn-xlsx`, `fa-file-excel`) que reemplaza a
  "Exportar CSV".
- **Hoja "Solicitudes"**: `Nº · Recibida · Actualizada · Estado · Servicio ·
  Nombre · Contacto · Tipo de problema · Dispositivo · Tipo de proyecto ·
  Sitio actual · Motivo · Producto relacionado · Descripción · Notas internas`
  (una columna por servicio, sin fusionar; fechas con formato real de Excel).
- **Agrupado por servicio**: `agruparPorServicio()` ordena técnica → web →
  soporte (y lo desconocido al final) respetando el orden descendente de
  fecha que ya trae la lista.
- **Hoja "Resumen"**: fecha de generación, cantidad de solicitudes, filtros
  aplicados y conteos por estado y por servicio.
- **Exporta `filtradas()`**: lo que está en pantalla es lo que sale del archivo.
- **Nombre de archivo**: `solicitudes-AAAA-MM-DD.xlsx` con los filtros
  agregados (`-nueva`, `-soporte`, `-q-panaderia`…): la búsqueda se pasa por
  `NFD`, se le sacan las tildes y se limita a 24 caracteres.
- Sin filas filtradas no descarga nada y lo informa; si `js/exportacion.js`
  no cargara, muestra un aviso en vez de fallar en silencio.

**Pruebas (`test-admin.js`, +14 aserciones)**: descarga interceptada con
`page.waitForEvent('download')`, verificación de la firma `PK`, parser de ZIP
incluido en la suite (`leerZip()`, acepta STORE y DEFLATE), estructura del
paquete, las dos hojas, cabeceras, fechas con `s="2"`, HTML escapado, ausencia
de fórmulas, orden agrupado, exportación filtrada, nombre con filtros y el
caso sin filas.

### 4.10 Escritura del hero y orbes minimalistas (Etapas 12 y 13, 20/10/2026)

Dos ajustes estéticos pedidos por el usuario para acercarse más a la página
institucional: la animación de escritura del hero y orbes de fondo sin aura.

**Escritura del hero (`js/main.js` + `css/styles.css`)**

- IIFE propio, sin dependencias, al estilo ES5 del resto del proyecto. Al
  cargar (y tras `document.fonts.ready`, para medir con las fuentes puestas),
  se reescriben carácter por carácter con `setInterval` de 30 ms — el mismo
  ritmo de la página institucional — la pill "Recepción de clientes · en
  línea", después el título y por último el párrafo, cada uno con un cursor
  `▌` (`span.hero__cursor`, `aria-hidden`, parpadeo con
  `@keyframes hero-parpadeo`) que desaparece al terminar. En la pill el cursor
  va en blanco (`.pill .hero__cursor`) porque el texto ya es azul.
- El texto vive completo en el HTML (SEO y accesibilidad intactos) pero, apenas
  corre `main.js` (síncrono al final del `<body>`, **antes del primer pintado**),
  los tres textos se vacían y se reserva su alto: el navegador nunca muestra el
  texto completo para después reescribirlo — se ve vacío y se escribe desde
  cero (corregido tras revisión del usuario: antes el texto completo aparecía
  un instante y luego "se re-escribía"). El JS lee los `childNodes` originales
  y los recrea por segmentos, de modo que el `span.tg` del degradado se
  conserva con su clase mientras se escribe.
- **Colapso de espacios** (corregido tras revisión del usuario): el texto del
  HTML tiene saltos de línea e indentación dentro de un mismo nodo; si no se
  normalizan (`\s+` → un espacio, sin espacios al inicio/fin), la animación
  los escribiría uno por uno y la frase se pausaba ~330 ms en seco debajo del
  título.
- Sin salto de layout: antes de borrar cada texto se reserva su alto final en
  `min-height` (medido con las fuentes cargadas) y se libera al terminar.
- **Movimiento reducido**: si `prefers-reduced-motion: reduce` está activo, la
  función ni arranca (el texto ya está completo en el HTML y no hay cursor).

**Orbes sin aura (`js/main.js`)**

- `Orbe.prototype.dibujar()` dejó de pintar el círculo exterior difuso
  (radio `size * 2.6`, alphas al 20 %): ahora dibuja solo el círculo central
  de color. La red de líneas entre orbes cercanos no cambia.

**Pruebas**: `etapa4-visual.js` (+7) verifica en Chromium que al evento load el
título **no** está completo ni con cursor escriturero (anti-flash), que el
cursor `▌` aparece al cargar (con `aria-hidden="true"`), que la escritura
termina sin cursor y con la pill, el título y el párrafo completos, que el
`span.tg` se conserva y que el párrafo final no conserva espacios raros del
fuente (texto exacto). `etapa4-extra.js` (+1) verifica en el contexto
`reducedMotion: 'reduce'` que el hero (pill, título y párrafo) está completo
sin cursor ni escritura.

### 4.11 Imágenes institucionales (Etapa 14, 20/10/2026)

La empresa agregó la carpeta `Imagenes/` con dos fotos, integradas cada una
en un lugar distinto y pensado (el usuario pidió no ponerlas juntas):

- **`Imagenes/imagen.jpg` (1640×924, apaisada)** — imagen del cerebro con
  contraste azul y el logo al centro. Vive en el hero: `figure.hero__visual`
  como segunda columna de `.hero .container` (`grid` de `1.1fr / .9fr`,
  centrado vertical), a la derecha del título. Estilo propio de la marca:
  radio `--radius-card`, borde `--card-border` y doble sombra (negra +
  resplandor azul). A ≤900 px la grilla pasa a una sola columna y la imagen
  se apila debajo del texto con `max-width: 34rem`. El usuario la dejó
  "como está": no se movió ni se retoquó en la revisión final.
- **`Imagenes/oficina.jpg` (640×800, vertical)** — foto de la oficina, en el
  **intro de la sección `#soporte`** (`.soporte__intro`, lugar elegido por
  el usuario: "por donde dice Soporte al cliente"). El intro es una grilla
  `1.15fr / .85fr` con `align-items: start`: a la izquierda el `section__head`
  de la sección (con su `margin-bottom` anulado dentro del intro), a la
  derecha la foto (`figure.oficinas__figura`) con `margin-top: -3rem`, que la
  **sube 48 px por encima de la primera línea del encabezado** (ajuste
  pedido: "un poco más arriba a la derecha"). La foto mide
  **`max-width: 360px`** (antes 300, se agrandó a pedido: "un poco más
  grande") y mantiene su borde derecho en el borde del contenedor. Va con su
  `figcaption.oficinas__pie`: **"Oficinas" en blanco**
  (`var(--text-strong)`, Inter 600, `clamp(1.375rem, 2.5vw, 1.75rem)` →
  22–28 px, sin degradado, minimalista a pedido del usuario tras ver la
  versión gigante) y debajo el pie mono `Salta Capital, Argentina` (dato ya
  publicado en `#contacto`). A ≤768 px el intro pasa a una sola columna
  (encabezado arriba, foto abajo) y se anula el `margin-top` negativo de la
  foto. El bloque `.oficinas` original en `#recepcion` fue eliminado.
- Ambas con `width`/`height` reales (sin saltos de layout), `alt`
  descriptivo y servidas desde el propio origen (`img-src 'self'` de la CSP,
  sin cortes). Sin librerías ni JS nuevo: solo HTML + CSS.

**Pruebas**: `etapa4-visual.js` (+2) verifica en Chromium que las dos imágenes
están cargadas (`complete` + `naturalWidth > 0`) y que la de la oficina vive
dentro de `#soporte` (no quedó en `#recepcion`), y que el pie tiene el
título "Oficinas" **blanco** (`rgb(255,255,255)`), **compacto** (≤32 px), el
texto "Salta Capital, Argentina" y `alt` en ambas fotos. El chequeo de
desborde a 1440/390/360 y una revisión manual de layout con Playwright
(rectángulos en 1440/768/390/360) confirmaron que la foto no se solapa con
el encabezado, que los pasos del soporte quedan debajo y que no hay scroll
horizontal.

## 5. Pruebas (07/10 → 20/10/2026)

Las suites viven **fuera del proyecto** (carpeta temporal de trabajo), porque
el proyecto no usa Node/build. Son 6 suites (4 de recepción + 2 de Etapa 7):

| Suite | Motor | Alcance | Resultado (20/10/2026) |
|---|---|---|---|
| `test-recepcion.js` | jsdom | Estado inicial (formulario/stepper ocultos, sin duplicación, sin elementos agregados), estructura del soporte (2 tarjetas, sin `#servicio-soporte`, CTA "Soporte al cliente" con `btn--solid`/`fa-headset`, nav con 5 enlaces, mailto), despliegue por tarjeta/CTA, grupos alternados (3 servicios), validación, foco, corrección en línea, revisión, XSS literal, cambio de servicio desde revisión, motivo de soporte obligatorio, envío deshabilitado, menú móvil, canvas de fondo. | 86/86 PASS |
| `test-tecnico.js` | jsdom | Camino del servicio técnico: validación de `tipo-problema`, dispositivo opcional, resumen y edición. | 11/11 PASS |
| `etapa4-visual.js` | Chromium real | 1440/390/360 px: sin desborde horizontal, consola limpia, recursos locales OK, orbes (canvas fijo sin eventos, ajustado al viewport y **con píxeles dibujados**), **escritura del hero** (anti-flash: título no completo al load; cursor visible al cargar; pill/título/párrafo completos sin cursor; `span.tg` conservado y párrafo sin espacios raros), **imágenes institucionales** (hero y oficina en `#soporte` cargadas, título "Oficinas" blanco compacto y `alt` presentes), recorrido completo tarjeta→errores→revisión, caracteres especiales/emoji, XSS, editar conserva datos. | 73/73 PASS |
| `etapa4-extra.js` | Chromium real | Anclas vs navbar (incluye `#soporte`), skip link, foco visible con teclado, Enter implícito, CTA de soporte (despliega el formulario con sus campos), cambio de servicio en vivo sin resumen obsoleto, campos de grupo preservados, texto >2000 chars, labels/`aria-describedby`, stepper coherente, `prefers-reduced-motion` (orbes estáticos: dos capturas idénticas, y hero completo sin escritura ni cursor), solapamientos @360. | 34/34 PASS |
| `test-supabase.js` | jsdom | `CONFIG_SUPABASE` simulado: botón habilitado, POST a `/rest/v1/solicitudes`, URL/headers/`Prefer`, payload snake_case por servicio (técnico, web y **soporte**), motivo vacío sin POST, éxito + "Nueva solicitud", error de red con datos conservados y reintento, honeypot sin `fetch`, y respuesta anti-spam (título y texto específicos). | 66/66 PASS |
| `test-admin.js` | Chromium real | Panel con API simulada por `page.route` (incluye preflight CORS): login inválido/válido, sesión, stats, lista (3 filas), XSS, filtros, filtro y detalle de **soporte** (motivo, producto, búsqueda), PATCH 204, **exportación a Excel** (firma ZIP, estructura del paquete, dos hojas, cabeceras, fechas, escapado, sin fórmulas, agrupado por servicio, exportación filtrada y nombre con filtros), recarga con sesión, logout y móvil 360 sin desborde. | 80/80 PASS |

**Total: 350 aserciones en verde (0 fallos).**

Además, verificadores puntuales de navegador real (fuera del conteo):
`verificar-csp.js` (0 cortes de la política), `verificar-botones.js` (contraste
y alto táctil) y `verificar-soporte.js` (flujo completo del soporte contra un
servidor local, 14 aserciones, en verde el 20/10/2026).

Las suites de Etapa 7 usan `window.fetch` / `page.route` simulados. Desde el
19/10/2026 el proyecto real ya está conectado y probado a mano de punta a punta
(envío público + login + fila visible); además se comprobó con la anon key que
la lectura pública devuelve 0 filas y que las escrituras inválidas se rechazan.

Verificado lo funcional y geométrico; **no** se pudo verificar automáticamente
la estética subjetiva (la asistente no ve imágenes) → checklist manual en
`README.md`.

## 6. Supabase y panel de solicitudes (Etapa 7)

El plan anterior de gestión (React + Node/Fastify + Prisma) quedó **descartado**
para esta etapa: el usuario aprobó Supabase para no mantener un servidor propio
y seguir con HTML/CSS/JS vanilla. Lo implementado es:

- **Base de datos** (PostgreSQL en Supabase), creada por `supabase/schema.sql`:
  - `public.solicitudes`: `id uuid`, `creado_en`, `actualizado_en`, `servicio`
    (`tecnico|web|soporte`), `nombre`, `contacto`, `tipo_problema`, `dispositivo`,
    `tipo_proyecto`, `sitio_actual`, `motivo_soporte`, `producto_relacionado`,
    `descripcion`, `estado`
    (`nueva|en_revision|respondida|cerrada`, default `nueva`) y
    `notas_internas`.
  - `public.admins`: `user_id uuid` → `auth.users` (PK), `email`, `creado_en`.
  - Trigger `tocar_actualizado_en` para mantener `actualizado_en`.
  - Trigger `solicitudes_limitar` (anti-spam: 3 solicitudes por contacto cada
    10 minutos) con función `SECURITY DEFINER`.
  - Índices por fecha/estado, por servicio y por `(contacto, creado_en desc)`
    para el conteo anti-spam.
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
  notas internas, exportación a Excel). No incluye clientes, equipos,
  presupuestos, facturación
  ni envío de correos; quedan como futuras etapas si se piden.
- **Límites conscientes**: la lista trae hasta 500 filas (sin paginación
  todavía), no hay tiempo real ni notificaciones, y el envío depende de que
  `js/config.js` esté completo. El conjunto está conectado y probado contra el
  proyecto Supabase real del usuario el 19/10/2026 (envío, panel, RLS y
  anti-spam).

Pasos del usuario (resueltos el 19/10/2026; detalle en la guía):

1. Crear el proyecto en Supabase y copiar **Project URL** + **anon key** en
   `js/config.js`. ✔
2. Ejecutar `supabase/schema.sql` completo en el SQL Editor. ✔ (re-ejecutar tras
   el endurecimiento del §4.6 para activar el anti-spam)
3. Crear el usuario admin en Authentication (Auto Confirm) e insertar su UUID
   en `public.admins`. ✔
4. Probar el envío en `index.html` y el login en `admin.html`. ✔
5. *(hacer)* Apagar "Allow new users to sign up" en Authentication.

## 7. Pendientes conocidos

1. ✔ Revisión visual humana: el usuario revisó el sitio en varias rondas el
   20/10/2026 (checklist del `README.md`) y aprobó el resultado.
2. **Supabase**: proyecto creado, `js/config.js` completo, `schema.sql` ejecutado
   y admin habilitado. ✔ Falta *(hacer)* apagar "Allow new users to sign up" y
   re-ejecutar `schema.sql` para activar el anti-spam del §4.6.
3. Envío y panel probados contra el proyecto Supabase real. ✔
4. Repositorio en GitHub: **subido** a
   <https://github.com/nicolabarranco27-a11y/recepcion-estalingrado> (público,
   rama `main`). GitHub Pages activo con "Enforce HTTPS" en
   <https://nicolabarranco27-a11y.github.io/recepcion-estalingrado/>.
   Dominio y correo siguen sin configurar.
5. Verificar teléfono/correo oficiales cuando se publiquen (correo propuesto
   `estalingradocorp.servicios@gmail.com`, sin confirmar).
6. No publicar ni configurar dominio (fuera de alcance hasta que se pida).
7. *(hacer)* contraseña fuerte para el panel y verificación en dos pasos en
   GitHub y Supabase.
8. *(hacer)* **ejecutar `supabase/migracion-soporte.sql`** en el SQL Editor de
   Supabase (guía: §8 de `supabase/INSTRUCCIONES.md`). Hasta que corra esa
   migración, las solicitudes del servicio "Soporte" se rechazan (el resto del
   sitio funciona igual).

## 8. Limitaciones conocidas

- La revisión visual pixel a pixel no se automatiza (limitación de la
  asistente, no del proyecto); el usuario la hizo en varias rondas el
  20/10/2026 y aprobó el resultado.
- Los enlaces del pie tienen objetivos táctiles de 17–26 px en móvil: se
  mantienen iguales al sitio institucional por identidad aprobada.
- Las pruebas automatizadas no están versionadas en el proyecto (viven en
  carpeta temporal); si se quiere continuidad conviene llevarlas a `tests/`
  en una futura etapa con Node.
- Las pruebas de Supabase/panel usan respuestas simuladas; no cubren todos los
  errores propios del servicio real (proyecto pausado, límites de plan, CORS del
  dominio final). El camino principal ya se validó contra el proyecto real
  (19/10/2026) y el anti-spam se comprobó con escrituras inválidas rechazadas.
- La lista del panel está topeada en 500 solicitudes y no tiene paginación ni
  actualización en tiempo real; si el volumen crece habrá que agregarlas.
