# Recepción de clientes — Estalingrado Corp

Página independiente de recepción de clientes para dos servicios:

1. Servicio técnico informático.
2. Creación y desarrollo de sitios web.

Identidad visual replicada a partir de la auditoría de la página institucional
(https://estalingradocorp.github.io/EstalingradoCorp/index.html). No modifica ni
depende de los archivos del sitio institucional.

## Estructura

```
Servicio tecnico y paginas web/
├── index.html        # Página única (navbar, hero, servicios, recepción, contacto, footer)
├── admin.html        # Panel interno de solicitudes (sin enlace público, noindex)
├── css/
│   ├── styles.css    # Tokens (variables) + fondo dinámico + componentes + campos del flujo
│   └── admin.css     # Estilos propios del panel
├── js/
│   ├── config.js     # URL + anon key de Supabase (el usuario las pega al crear el proyecto)
│   ├── main.js       # Menú móvil, reveal on scroll, año dinámico, flujo y envío
│   └── admin.js      # Login, lista, filtros, detalle, notas, CSV (API REST de Supabase)
├── supabase/
│   ├── schema.sql    # Tablas, RLS, trigger e instrucciones del admin (re-ejecutable)
│   └── INSTRUCCIONES.md  # Guía paso a paso para configurar Supabase
├── assets/
│   ├── logo.jpg      # Logo oficial descargado de la página institucional
│   └── favicon.jpg   # Favicon oficial (JPEG; la extensión original .pnj es de Tumblr)
├── robots.txt        # Bloquea /admin.html para buscadores
├── DOCUMENTACION.md  # Historial completo: etapas, diseño del flujo, pruebas, sistema de gestión
├── bitacora.txt      # Cronología de sesiones de trabajo
└── README.md
```

## Cómo visualizar localmente

Opción 1 (sin servidor): abrir `index.html` directamente en el navegador.

Opción 2 (servidor local, recomendado para probar rutas reales):

```powershell
cd "C:\Users\nbmn8\OneDrive\Escritorio\Servicio tecnico y paginas web"
npx http-server . -p 8080
# luego abrir http://localhost:8080
```

## Identidad visual (verificada, no inventada)

- Fondos: `#000` (general), tarjetas `rgba(255,255,255,.02)` con borde `rgba(255,255,255,.05)`.
- Acentos: azules `#2563eb`, `#3b82f6`, `#60a5fa`, `#1d4ed8`; degradado `.tg`
  `linear-gradient(135deg, #60a5fa, #2563eb, #1d4ed8)`.
- Violets `#7c3aed`/`#6d28d9`/`#8b5cf6`: solo en un tercio de los orbes del
  canvas de fondo (Etapas 5), sin afectar los componentes institucionales.
- Textos: `#e5e7eb` / blanco; secundarios zinc `#a1a1aa`, `#71717a`, `#52525b`.
- Tipografías: Inter (contenido), JetBrains Mono (etiquetas técnicas).
- Componentes reutilizados del patrón institucional: navbar glass fija, pill/badge
  con punto pulsante, botones contorno uppercase, encabezado de sección con línea
  azul, tarjetas glass con hover lift + barrido azul, glow-line de footer.

## Dependencias (mismas que la página institucional)

- Google Fonts: Inter + JetBrains Mono.
- Font Awesome 6.5.1 (cdnjs).
- Sin frameworks, sin build, sin Node.

## Datos de contacto (verificados en empresa.html)

- Ubicación: Salta Capital, Argentina (zona sur).
- Redes oficiales: YouTube, Facebook, X (Twitter), Telegram (enlaces del pie
  institucional).
- **Teléfono y correo: no publicados en el sitio institucional.** No se inventaron;
  quedan pendientes de verificación antes de mostrarlos.

## Recepción de solicitudes (Etapas 3 y 5)

Flujo en `#recepcion` con tres pasos (stepper accesible):

1. **Servicio** — se elige **solo** con las tarjetas de la sección `#servicios`
   (no hay una segunda selección dentro del formulario; ese paso se eliminó).
   Al tocar una tarjeta, el formulario se despliega en el paso 2 y el ítem 01
   del stepper queda completado con el nombre del servicio elegido.
2. **Datos** — formulario validado en el cliente: campos comunes (nombre y medio
   de contacto) más campos según el servicio elegido; los campos del grupo
   inactivo quedan deshabilitados. Los errores usan `aria-invalid` y mueven el
   foco al primer campo inválido.
3. **Revisión** — resumen armado solo con `textContent` (sin inyectar HTML del
   usuario), opción de editar que conserva todos los datos. Si el usuario cambia
   el servicio desde Revisión, el flujo vuelve a Datos (el resumen dejó de
   corresponder).

El formulario y el stepper permanecen ocultos hasta que se toca una tarjeta.

## Envío con Supabase (Etapa 7)

Cada solicitud se guarda en una tabla PostgreSQL de Supabase mediante su API
REST (sin librerías ni backend propio):

- `js/config.js` define `window.CONFIG_SUPABASE` con `url` y `anonKey`. Mientras
  estén vacías, el botón "Enviar solicitud" queda deshabilitado y la interfaz
  avisa que el canal no está configurado (nunca simula un envío).
- Con Supabase configurado, `js/main.js` hace un `POST` a
  `/rest/v1/solicitudes` con los campos del servicio elegido (snake_case), un
  `Prefer: return=minimal` y un límite de 20 segundos.
- Estados en pantalla: "Enviando…", éxito (verde, con botón "Nueva solicitud")
  o error (rojo, conserva los datos y permite reintentar).
- **Honeypot** oculto (`#hp-empresa`): si un bot lo completa, se muestra la
  confirmación pero **no** se envía nada.
- La `anon key` es pública por diseño; la seguridad real está en las políticas
  RLS de `supabase/schema.sql`. La clave `service_role` **nunca** va al frontend.
- Configuración completa, paso a paso: `supabase/INSTRUCCIONES.md`.

## Panel de administración (Etapa 7)

`admin.html` (sin enlace desde la página pública, `noindex` + bloqueo en
`robots.txt`) permite, en vanilla JS contra la API REST de Supabase:

- iniciar sesión con un usuario administrador creado en el dashboard
  (la sesión se guarda en `sessionStorage`; se refresca el token ante un 401);
- ver estadísticas por estado y la lista de solicitudes (máx. 500, más nuevas
  primero), con búsqueda y filtros por estado/servicio;
- abrir el detalle en un `<dialog>`, cambiar el estado (`nueva`, `en_revision`,
  `respondida`, `cerrada`) y guardar notas internas;
- exportar a CSV (UTF-8 con BOM y separador `;`, listo para Excel) lo que esté
  filtrado.

Todo el contenido se renderiza con `textContent` (a prueba de XSS). Si
`js/config.js` está vacío, el login queda deshabilitado con un aviso. Los
administradores se crean en Supabase (Authentication → Users) y se habilitan
insertando su UUID en la tabla `admins` (ver `supabase/schema.sql`).

Verificado con pruebas automatizadas jsdom y Chromium real (ver abajo y en
`DOCUMENTACION.md`).

Verificado con pruebas automatizadas jsdom y Chromium real (ver abajo y en
`DOCUMENTACION.md`).

## Fondo dinámico con orbes flotantes (Etapa 5)

Un `<canvas id="fondo-particulas">` fijo detrás del contenido (`z-index:-1`,
`pointer-events:none`, `aria-hidden`, sin dependencias ni librerías) dibuja una
red de orbes flotantes que **imita el fondo animado de la página institucional**:
orbes que flotan lentamente (±0.15 px por cuadro) y se unen con líneas tenues
cuando quedan a menos de 120 px — la misma regla del canvas `#pc` de la
referencia. Paleta: azules institucionales más un tercio de violetas. Con
`prefers-reduced-motion` se dibuja una vez y queda estático.

## Etapa 4 — Auditoría en navegador real (Chromium/Playwright)

Ejecutada el 18/10/2026 contra un servidor local, con resoluciones 1440 px,
390 px y 360 px. Todas las suites quedaron en verde tras la corrección:

- **Sin desborde horizontal** en las tres resoluciones (también sin elementos
  fuera del viewport).
- **Recorridos funcionales completos** en navegador real: acceso por tarjeta,
   avance/retroceso de pasos, validación de vacíos con foco al primer campo
   inválido, corrección en línea, cambio de servicio sin contaminar el resumen,
   campos de grupo preservados al volver, edición sin pérdida, texto extenso
   (>2000 caracteres, sin recorte en el DOM), caracteres especiales y emoji,
   XSS neutralizado (resumen 100% texto literal, ningún diálogo ejecutado) y
   envío deshabilitado.
- **Enter en campos de texto** dispara el envío implícito del formulario y la
  validación correspondiente.
- **Accesibilidad**: skip link, foco visible con teclado, labels y
  `aria-describedby` íntegros, stepper con `aria-current` coherente, menú móvil
  con Escape y retorno de foco, `prefers-reduced-motion` con todos los reveal
  visibles sin scroll.
- **Consola limpia** y sin recursos locales fallidos.

**Error encontrado y corregido (Etapa 4):** al pulsar una tarjeta de servicio
estando en el paso 2 o 3, el flujo se quedaba en el paso actual con el resumen
obsoleto. Corregido y ahora cubierto por pruebas: cambiar de servicio desde
Revisión vuelve a Datos con el resumen descartado.

**Verificación (19/10/2026):** las suites se reescribieron para el flujo nuevo
y quedaron en verde: jsdom 62/62 + 11/11 aserciones; Playwright visual 64/64
(1440/390/360 px, consola limpia, sin desborde, canvas de orbes con píxeles
dibujados); Playwright extra 26/26 (incluye `prefers-reduced-motion` con los
orbes dibujados y sin animación). Sin scroll horizontal en ninguna resolución.

**Etapa 7 (19/10/2026):** se agregaron `test-supabase.js` (jsdom, 48/48:
payload, headers, éxito, error con reintento, honeypot y reinicio) y
`test-admin.js` (Chromium, 60/60: login inválido/válido, stats, lista, XSS,
filtros, detalle, PATCH, CSV, sesión, salida y móvil). Las cuatro suites
anteriores siguen en verde. Las pruebas de red usan `fetch` y `page.route`
simulados: todavía **no** se ejecutaron contra un proyecto Supabase real
(eso requiere que el usuario cree el suyo y complete `js/config.js`).

**Limitación honesta:** la revisión visual pixel a pixel (estética, espaciados,
legibilidad subjetiva) no pudo evaluarse automáticamente en esta máquina.
Queda pendiente de inspección humana con el checklist al final de este archivo.

**Observación (no modificada por identidad aprobada):** los enlaces del pie
tienen objetivos táctiles de 17–26 px en móvil; se mantienen iguales al sitio
institucional.

## Estado y pendientes

- [x] Etapa 1: auditoría visual y técnica.
- [x] Etapa 2: base del proyecto (estructura, navbar, hero, dos servicios, contacto).
- [x] Etapa 3: flujo de recepción (selección → validación → revisión → envío deshabilitado).
- [x] Etapa 4: auditoría en navegador real + corrección del resumen obsoleto.
- [x] Etapa 5 (19/10/2026): fondo con orbes flotantes (canvas que imita la
      página institucional), selección de servicio desduplicada (solo tarjetas),
      documentación completa (`DOCUMENTACION.md` + `bitacora.txt`) y suites
      reescritas en verde. Corregido tras revisión: se quitó un aviso y una
      línea informativa que no se pedían.
- [x] Etapa 6 (19/10/2026): tipografía y formulario más legibles (solo
      `#recepcion`), documentado en `DOCUMENTACION.md` §4.4.
- [x] Etapa 7 (19/10/2026): Supabase (schema + guía + `js/config.js`), envío
      real desde el formulario con estados y honeypot, panel `admin.html`
      (login, lista, filtros, detalle, notas, CSV), `robots.txt` y suites
      nuevas en verde. `git init` + primer commit local.
- [ ] **Configurar Supabase (lo hace el usuario):** crear el proyecto, pegar
      URL + anon key en `js/config.js`, ejecutar `supabase/schema.sql`, crear el
      usuario admin e insertar su UUID en `admins`. Guía:
      `supabase/INSTRUCCIONES.md`.
- [ ] Probar el envío y el panel contra el proyecto Supabase real.
- [ ] Elegir cuenta de GitHub (`laboutiquecatydog` o `nicolabarranco27-a11y`)
      y subir el repositorio (el remoto todavía no está configurado).
- [ ] Revisión visual humana (checklist inferior) en escritorio y móvil.
- [ ] Verificar teléfono/correo oficiales cuando estén publicados
      (correo propuesto: `estalingradocorp.servicios@gmail.com`, sin confirmar).
- [ ] No configurar dominio ni publicar (fuera del alcance de esta etapa).

## Checklist de revisión visual manual (pendiente)

Con el sitio servido localmente (`npx http-server . -p 8080`):

1. 1440×900, 390×844 y 360×800: sin scroll horizontal, sin textos cortados.
2. Fondo: se ven los orbes flotantes (puntos de luz azules/violetas unidos por
   líneas tenues) moviéndose lentamente sobre el negro, sin cubrir el texto;
   con movimiento reducido del sistema, quedan quietos.
3. Recepción inicial: el formulario y el stepper NO aparecen hasta tocar una tarjeta.
4. Al pulsar una tarjeta de servicio: se despliega el formulario en "Datos" y el
   stepper muestra 01 completado con el nombre del servicio. Pulsar la otra
   tarjeta alterna los campos sin perder lo escrito.
5. Paso Datos: encabezado grande, nota de campos obligatorios y subtítulos de
   grupo ("Tus datos" · "Equipo y problema"/"Tu sitio web" · "Qué necesitás")
   con regla fina; labels de 13px legibles, placeholders de ejemplo visibles,
   errores en rojo visible (`#f87171`) debajo del campo, botón "Revisar
   solicitud" con flecha.
6. Paso Revisión: resumen alineado, texto largo envuelto en varias líneas, caja de
   estado ámbar legible, "Enviar solicitud" visible pero deshabilitado (gris),
   "Editar" conserva todos los datos.
7. Móvil: menú hamburguesa cubre bien la pantalla, links del menú cómodos,
   formulario de una columna.
8. Animación de aparición (reveal) suave al hacer scroll; sin parpadeos.
9. Panel (`/admin.html`) en escritorio y móvil: login centrado y legible, aviso
   ámbar si falta configurar Supabase, stats y tarjetas que se reacomodan sin
   scroll horizontal, filtros cómodos, diálogo de detalle a pantalla completa
   en móvil, badges de estado con color y contraste claro.
10. Envío real (cuando Supabase esté configurado): confirmación verde con
    "Nueva solicitud", error rojo con datos conservados si se corta internet,
    y la fila visible en el panel y en el Table Editor de Supabase.

## Accesibilidad

- Skip link, `aria-expanded`/`aria-controls` en el menú, foco visible,
  contraste alto sobre fondo negro, `prefers-reduced-motion` respetado
  (reveal y animaciones de los orbes se desactivan).
