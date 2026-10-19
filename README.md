# Recepción de clientes — Estalingrado Corp

Repositorio: <https://github.com/nicolabarranco27-a11y/recepcion-estalingrado>

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

## Accesos del inicio y botones (ajuste 19/10/2026)

- El hero tiene dos botones. El primero, **"Servicios informáticos y web"**,
  baja a `#servicios`, donde están las dos tarjetas con las que arranca la
  recepción. El segundo, **"Conocer la empresa"**, abre el sitio institucional
  (`https://estalingradocorp.github.io/EstalingradoCorp/`) en otra pestaña
  (`target="_blank"` + `rel="noopener noreferrer"`). Antes ambos llevaban al
  mismo lugar del formulario.
- Los botones (`Editar datos`, `Enviar solicitud`, `Nueva solicitud`, y los del
  panel) se repasaron para ganar presencia y contraste: alto mínimo de 52 px
  (44 px en los chicos del panel), radio de 10 px (8 px en los chicos), texto en
  blanco/zinc de alto contraste (≥ 15,8:1 sobre negro), hover con realce azul en
  los de contorno y estado deshabilitado en gris legible (ya no se aclaran con
  `opacity`).

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

### Cómo entrar al panel

Dirección directa (guardala en favoritos):

<https://nicolabarranco27-a11y.github.io/recepcion-estalingrado/admin.html>

No hay botón visible desde la página pública a propósito, para que un visitante
no la encuentre. Tres formas de entrar:

- **Atajo secreto (escritorio):** mantener **Ctrl** y hacer **3 clics seguidos
  sobre el logo** de la barra superior; el panel se abre en otra pestaña.
- **Computadora:** abrir esa dirección y usar la estrella del navegador
  (Marcadores → "Panel Estalingrado").
- **Celular (Android, Chrome):** abrir esa dirección → menú **⋮** (arriba a la
  derecha) → **"Añadir a pantalla de inicio"** → confirmar. Queda un ícono con
  el logo: al tocarlo se abre el panel directo (pide la contraseña la primera
  vez).
- **Celular (iPhone, Safari):** abrir esa dirección → botón **Compartir**
  (cuadrado con la flecha hacia arriba) → deslizar y tocar **"Añadir a pantalla
  de inicio"** → "Añadir". Mismo resultado: un ícono propio.

Verificado con pruebas automatizadas jsdom y Chromium real (ver abajo y en
`DOCUMENTACION.md`).

## Seguridad

Lo que protege al sitio y a los datos (lo marcado con *(hacer)* depende del
usuario; el resto ya está en el código):

- **La clave pública no da acceso a los datos.** `js/config.js` solo contiene la
  `anon key`, pública por diseño. La autorización real está en las políticas RLS
  de `supabase/schema.sql`: el público **solo inserta** una solicitud nueva, con
  límites de longitud y sin poder tocar `estado` ni `notas_internas`; leer y
  actualizar exige ser un admin autenticado. La clave `service_role` no aparece
  en ninguna parte del repositorio.
- **Sin registros abiertos.** *(hacer)* Authentication → Sign In / Up → apagar
  **"Allow new users to sign up"**. Los administradores se crean a mano en el
  dashboard y se habilitan con su UUID en la tabla `admins`.
- **Anti-spam.** Un mismo contacto no puede cargar más de 3 solicitudes cada
  10 minutos (trigger `limitar_solicitudes`); el formulario tiene honeypot y, si
  se alcanza el límite, muestra un aviso claro en vez de un error genérico.
- **Contra XSS.** Todo lo que escribe el usuario se pinta con `textContent` (el
  HTML nunca se interpreta). Además `index.html` y `admin.html` declaran
  `Content-Security-Policy` (solo scripts propios, estilos y fuentes de los CDN
  usados y conexiones a `*.supabase.co`) y
  `referrer: strict-origin-when-cross-origin`.
- **CSV seguro.** La exportación neutraliza la inyección de fórmulas: las celdas
  que empiezan con `=`, `+`, `-` o `@` salen como texto.
- **Panel escondido.** `admin.html` no está enlazado, lleva `noindex` y
  `robots.txt` lo bloquea. La sesión vive en `sessionStorage` (se borra al
  cerrar la pestaña) y el token se refresca solo.
- **HTTPS.** GitHub Pages sirve el sitio por HTTPS con "Enforce HTTPS" activado.
- **Cuentas.** *(hacer)* contraseña larga y única para el panel (guarda en el
  gestor de contraseñas), y verificación en dos pasos en GitHub y en Supabase.
- **Copias y limpieza.** El CSV del panel es la copia de respaldo más simple.
  Las filas de prueba se borran desde Table Editor (fila → Delete row); nadie
  puede borrar desde la web.

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
- [x] Etapa 8 (19/10/2026): accesos del inicio (botón a `#servicios` + enlace al
      sitio institucional) y repaso de botones del formulario y del panel
      (radio, alto táctil y contraste), documentado en `DOCUMENTACION.md` §4.7.
- [x] **Configurar Supabase (19/10/2026):** proyecto `estalingrado-corp` (São
      Paulo) creado, URL + anon key en `js/config.js`, `supabase/schema.sql`
      ejecutado, usuario admin `nbmn38@gmail.com` (Auto Confirm) e insertado su
      UUID en `public.admins`. Guía: `supabase/INSTRUCCIONES.md`.
- [x] Probar el envío y el panel contra el proyecto Supabase real: envío desde
      la página publicada y login + solicitud visible en `/admin.html`.
      Comprobado además que RLS rechaza escrituras inválidas y que el público no
      puede leer la tabla.
- [x] Subir el repositorio a GitHub:
      <https://github.com/nicolabarranco27-a11y/recepcion-estalingrado>
      (público, rama `main`). GitHub Pages **activado** desde `main`:
      <https://nicolabarranco27-a11y.github.io/recepcion-estalingrado/>
      (el primer deploy quedó en cola por un incidente de GitHub Actions/Pages
      del 19/10/2026, ajeno al proyecto). Dominio propio todavía sin configurar.
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
