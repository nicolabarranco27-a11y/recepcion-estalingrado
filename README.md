# Recepción de clientes — Estalingrado Corp

Repositorio: <https://github.com/nicolabarranco27-a11y/recepcion-estalingrado>

Página independiente de recepción de clientes para tres servicios:

1. Servicio técnico informático.
2. Creación y desarrollo de sitios web.
3. Soporte al cliente (consultas, incidencias y reclamos de clientes).

Identidad visual replicada a partir de la auditoría de la página institucional
(https://estalingradocorp.github.io/EstalingradoCorp/index.html). No modifica ni
depende de los archivos del sitio institucional.

## Estructura

```
Servicio tecnico y paginas web/
├── index.html        # Página única (navbar, hero, servicios, recepción, soporte, contacto, footer)
├── admin.html        # Panel interno de solicitudes (sin enlace público, noindex)
├── css/
│   ├── styles.css    # Tokens (variables) + fondo dinámico + componentes + campos del flujo
│   └── admin.css     # Estilos propios del panel
├── js/
│   ├── config.js     # URL + anon key de Supabase (el usuario las pega al crear el proyecto)
│   ├── main.js       # Menú móvil, reveal on scroll, año dinámico, flujo y envío
│   ├── exportacion.js # Generador de archivos .xlsx (ZIP + XML a mano, sin librerías)
│   └── admin.js      # Login, lista, filtros, detalle, notas, exportación a Excel
├── supabase/
│   ├── schema.sql    # Tablas, RLS, trigger e instrucciones del admin (re-ejecutable)
│   ├── migracion-soporte.sql  # Habilita el tercer servicio en una base ya existente
│   └── INSTRUCCIONES.md  # Guía paso a paso para configurar Supabase
├── assets/
│   ├── logo.jpg      # Logo oficial descargado de la página institucional
│   └── favicon.jpg   # Favicon oficial (JPEG; la extensión original .pnj es de Tumblr)
├── Imagenes/
│   ├── cerebro-neuronal.png  # Cerebro recortado con alfa (sin uso en el hero desde la Etapa 18)
│   ├── Cerebro neural de neón azul.png  # Ilustración original, intacta
│   ├── imagen.jpg    # Cerebro anterior con logo (se conserva, ya no se usa)
│   └── oficina.jpg   # Foto de la oficina (intro de #soporte, Etapa 14)
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
  canvas de fondo (Etapas 5 y 13), sin afectar los componentes institucionales.
  Los orbes son minimalistas: círculos de color puro **sin aura** alrededor
  (Etapa 13), unidos por las mismas líneas tenues de siempre.
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
- Redes oficiales: YouTube, Facebook, X (Twitter) y Telegram (enlaces del pie
  institucional), más **Instagram `@nicotips27`**
  (<https://www.instagram.com/nicotips27/>), sumado en la Etapa 15 a los
  canales de `#contacto` y al pie.
- **Correo de soporte (verificado, creado por la empresa):**
  `estalingradocorpsupport@protonmail.com` — publicado en `#soporte` y
  `#contacto` con `mailto:`.
- **Teléfono: no publicado todavía.** No se inventa: queda pendiente de que la
  empresa lo indique.

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

El formulario y el stepper permanecen ocultos hasta que se toca una tarjeta
de servicio o el botón "Soporte al cliente" de la sección `#soporte` (Etapa 11).

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

## Escritura del hero y orbes minimalistas (Etapas 12 y 13)

- **Escritura del hero (Etapa 12)**: al cargar la página, la pill "Recepción
  de clientes · en línea", el título ("Servicio técnico y *sitios web*.") y el
  párrafo principal se escriben carácter por carácter con el mismo ritmo de la
  página institucional (30 ms por carácter) y un cursor `▌` que parpadea mientras
  escriben (blanco en la pill, azul en los textos grandes). El texto vive
  completo en el HTML (bueno para SEO y accesibilidad) pero el JS
  (`js/main.js`) lo **vacía de forma síncrona antes del primer pintado**, así
  que el texto nunca aparece escrito para después reescribirse: se ve vacío y
  se escribe desde cero. Al reescribir respeta los nodos originales: el span
  `.tg` del degradado se conserva, y los saltos de línea del fuente se colapsan
  en un solo espacio para que la escritura no se pause en caracteres en blanco.
  Se reserva el alto final de cada texto para que el hero no salte, y con
  **movimiento reducido** del sistema no se anima: el texto aparece completo de
  entrada, sin cursor.
- **Orbes minimalistas (Etapa 13)**: el canvas de fondo conserva la red de
  puntos y líneas, pero los orbes ya no tienen el halo difuso externo: son
  círculos de color puro, más limpios y minimalistas, como pidió la empresa.

## Imágenes institucionales (Etapa 14)

Dos fotos agregadas por la empresa en `Imagenes/`, integradas cada una en un
lugar pensado (nunca juntas):

- **Hero**: desde la **Etapa 18** el hero **no usa ninguna imagen decorativa**
  (se retiró la ilustración del cerebro). Queda un diseño limpio: el texto a la
  izquierda y la columna derecha reservada como espacio negativo.
  `Imagenes/imagen.jpg` y `Imagenes/cerebro-neuronal.png` se conservan en el
  repo, sin uso.
- **Sección `#soporte`** (`Imagenes/oficina.jpg`, 640×800): foto vertical de
  la oficina en el intro de la sección de soporte (`.soporte__intro`), a la
  derecha del título "Soporte al cliente", que es donde la pidió el usuario.
  Junto a la foto va su pie de figura minimalista: **"Oficinas" en blanco**
  (Inter 600, 22–28 px, sin degradado) y el mono "Salta Capital, Argentina".
  En móvil se apila debajo del encabezado.
- Con `alt` descriptivo, sin librerías, servidas desde el propio
  dominio (compatible con la CSP `img-src 'self'`).

### Hero limpio (Etapa 18)

A pedido del usuario se quitaron del hero la imagen del cerebro y su capa de
sinapsis, porque la integración visual no quedó como se esperaba. El hero
queda minimalista: sin imágenes ni canvas decorativos en el sector derecho, con
espacio negativo reservado y el fondo negro y la estética tecnológica intactos.

- **Se conservaron**: el fondo de partículas general (`#fondo-particulas`, red
  de orbes con líneas, fijo detrás del contenido), el fondo negro, la escritura
  del hero (pill, título y párrafo con cursor), el título, el párrafo, los dos
  botones, el encabezado, la navegación y todas las demás secciones.
- **Se eliminaron**: `figure.hero__visual`, `img.hero__img` y
  `canvas.hero__neural` del HTML; las reglas `.hero__visual`, `.hero__img`,
  `.hero__neural` y el `transform: none` del reveal en el CSS; y la IIFE
  "Sinapsis del hero" de `js/main.js` (365 líneas, exclusiva del cerebro: la
  capa de orbes y la de escritura no se tocaron).
- **No se borró ningún archivo de imagen**: `cerebro-neuronal.png`,
  `Cerebro neural de neón azul.png` e `imagen.jpg` siguen en el repo, por si
  se quiere retomar la integración más adelante.
- La grilla del hero mantiene dos columnas: el texto ocupa la primera y la
  segunda queda reservada como espacio negativo (a 1440 px el título ocupa el
  53 % del contenedor).

### Cerebro neuronal y sinapsis (Etapas 16 y 17, en pausa)

Trabajo **desactivado del hero** en la Etapa 18, pero conservado: si se quiere
retomarlo, el asset y la implementación están en el repo.

`Imagenes/cerebro-neuronal.png` (1299×853, recorte con alfa del original
"Cerebro neural de neón azul", que queda intacto en
`Imagenes/Cerebro neural de neón azul.png`) había reemplazado en el hero a
`Imagenes/imagen.jpg`. Se integraba sin marco visible: el negro de fondo de la
ilustración es **transparente** (alfa real), así que no queda ningún rectángulo;
encima el `mix-blend-mode: screen` funde la luz con el fondo del hero y una
máscara radial suave remata los extremos. Encima iba
`canvas.hero__neural`, decorativo (`aria-hidden`) y con `pointer-events: none`,
que dibujaba pulsos de luz: **solo avanzan por los píxeles luminosos reales** de la
ilustración (la imagen se muestreaba una vez y no se unían puntos por cercanía),
el chip central recibía un brillo tenue sin deformarse y el hover subía la
actividad con vuelta suave. Usaba `requestAnimationFrame`, no creaba nodos por
cuadro, pausaba con la pestaña oculta y con `prefers-reduced-motion` quedaba
solo la imagen estática. Detalle técnico en `DOCUMENTACION.md` §4.13 y §4.14.

La Etapa 17 había corregido además la composición (recorte del asset, alfa
real, desvanecido de bordes y encuadre ~45 % mayor). Al retirar la imagen del
hero, esa corrección queda sin efecto visible, pero el asset ya recortado y con
alfa sigue guardado para una futura reincorporación.

## Soporte al cliente (Etapas 9 y 11)

El soporte es un tercer servicio más, con la misma recepción, la misma base y
el mismo panel:

- **Sección `#soporte`** (entre Recepción y Contacto): qué es, los tres pasos
  para pedirlo y el canal directo (`mailto:estalingradocorpsupport@protonmail.com`).
- **Botón "Soporte al cliente"** en esa misma sección (`btn--solid`, ícono
  `fa-headset`, `data-servicio="soporte"`): baja al formulario de recepción y
  despliega el grupo `#campos-soporte`. En la Etapa 11 se quitó la tercera
  tarjeta de `#servicios` (hoy quedan solo dos: técnico y web) para no duplicar
  entradas; la descripción de `#servicios` indica que el soporte está más abajo.
- **Campos de soporte**: *Motivo* (obligatorio: consulta, ayuda con un servicio,
  incidencia o falla, reclamo, estado de una solicitud u otro) y *Producto o
  servicio relacionado* (opcional). El grupo activo se muestra y los otros dos
  quedan deshabilitados.
- **Base de datos**: `servicio` acepta `'soporte'` y hay dos columnas nuevas
  (`motivo_soporte`, `producto_relacionado`) con sus largos validados en la
  política RLS. Ver `supabase/migracion-soporte.sql`.
- **Panel**: filtro "Soporte", meta con motivo en la lista, filas *Motivo* y
  *Producto relacionado* en el detalle, y esos campos incluidos en el buscador y
  en la exportación.

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
- exportar a **Excel** (`.xlsx` real, generado en el navegador sin librerías)
  lo que esté filtrado, agrupado por servicio y con una hoja de resumen.

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
- **Exportación segura.** El `.xlsx` se arma con celdas de texto (`inlineStr`);
  el archivo no contiene nunca fórmulas (`<f>`), así que ninguna celda del
  usuario puede ejecutarse al abrirlo. Las fechas viajan como fechas reales de
  Excel, no como texto.
- **Panel escondido.** `admin.html` no está enlazado, lleva `noindex` y
  `robots.txt` lo bloquea. La sesión vive en `sessionStorage` (se borra al
  cerrar la pestaña) y el token se refresca solo.
- **HTTPS.** GitHub Pages sirve el sitio por HTTPS con "Enforce HTTPS" activado.
- **Cuentas.** *(hacer)* contraseña larga y única para el panel (guarda en el
  gestor de contraseñas), y verificación en dos pasos en GitHub y en Supabase.
- **Copias y limpieza.** El Excel del panel es la copia de respaldo más simple.
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

**Etapa 9 a 18 (21-22/10/2026):** las suites se ampliaron con el soporte al
cliente, la exportación a Excel, el ajuste del soporte, la escritura del hero,
los orbes minimalistas, las imágenes institucionales, el formulario por sección,
el cerebro neuronal con sinapsis, la corrección de su composición y la
simplificación del hero, y suman hoy
**368 aserciones en verde**: jsdom 91 (recepción) + 11 (técnico) + 66
(Supabase); Chromium 84 (visual) + 36 (extra) + 80 (panel). Se suman fuera del
conteo `probe-soporte.js` y `probe-hero.js` (ahora sonda del hero limpio).

**Revisión humana (20/10/2026):** la estética pixel a pixel no se puede evaluar
automáticamente en esta máquina; el usuario revisó el sitio en varias rondas
(corregió la escritura del hero, el título de oficinas y la ubicación de las
fotos) y aprobó el resultado. Las Etapas 15, 16 y 17 quedan pendientes de su
revisión local. El checklist detallado queda al final de este archivo.


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
- [x] Etapa 9 (20/10/2026): **soporte al cliente** como tercer servicio
      (sección `#soporte`, tarjeta, campos, SQL de migración, panel y pruebas),
      documentado en `DOCUMENTACION.md` §4.8. Requiere ejecutar
      `supabase/migracion-soporte.sql` en Supabase (SQL Editor → Run).
- [x] Etapa 10 (20/10/2026): **exportación a Excel `.xlsx` sin librerías** (nuevo
      `js/exportacion.js`: ZIP sin comprimir con CRC32 propio y XML escrito a
      mano; hojas "Solicitudes" y "Resumen", agrupado por servicio, exporta lo
      filtrado con los filtros en el nombre). Reemplaza al CSV y queda
      documentado en `DOCUMENTACION.md` §4.9.
- [x] Etapa 11 (20/10/2026): el soporte
      se desduplicó: se quitó la tarjeta `#servicio-soporte` de `#servicios`
      (quedan dos tarjetas: técnico y web) y el botón **"Soporte al cliente"**
      de la sección `#soporte` (`btn--solid`, `fa-headset`) abre el formulario
      directo con `data-servicio="soporte"`. Sin cambios de lógica en el JS.
- [x] Etapa 12 (20/10/2026): **escritura del hero** como la página institucional
      (pill, título y párrafo carácter por carácter con cursor `▌`, span `.tg`
      conservado, espacios del fuente colapsados para no pausar, sin salto de
      layout, sin animación con movimiento reducido).
- [x] Etapa 13 (20/10/2026): **orbes minimalistas**: se quitó el aura difusa de
      los orbes del canvas de fondo; quedan círculos de color puro con la misma
      red de líneas.
- [x] Etapa 14 (20/10/2026): **imágenes institucionales**: `Imagenes/imagen.jpg`
      (cerebro con contraste azul y logo) integrada como pieza visual del hero
      y `Imagenes/oficina.jpg` en el intro de `#soporte` (junto al título
      "Soporte al cliente") con pie minimalista "Oficinas" en blanco.
- [x] Etapa 15 (21/10/2026): **formulario por sección**: el mismo formulario se
      despliega en `#recepcion` para técnico y web (igual que antes) y al final
      de `#soporte`, debajo de pasos y canales, al tocar "Soporte al cliente";
      **Instagram** `@nicotips27` sumado a los canales y al pie; **pulido de
      transiciones** discretas (pasos, avisos, menú móvil, nav y botones) con
      movimiento reducido respetado.
- [x] Etapa 16 (21/10/2026): **cerebro neuronal y sinapsis**: el hero usa
      `Imagenes/cerebro-neuronal.png` integrada sin marco (máscara + `screen`)
      con una capa Canvas superpuesta de pulsos que recorren solo las líneas
      luminosas reales de la ilustración, brillo tenue del chip, hover con
      vuelta suave, pausa con pestaña oculta y estático con movimiento
      reducido. **Revocado en el hero por la Etapa 18** (el código y el asset
      quedan en el repo).
- [x] Etapa 17 (21/10/2026): **composición del cerebro**: el asset se recortó
      (banda negra izquierda eliminada) y pasó a **alfa real** con bordes
      desvanecidos, así que desaparece el rectángulo oscuro y el dibujo se
      funde con el fondo; la figura **crece ~45 %** en escritorio por layout
      (sin `transform: scale`, para no romper el mapeo del canvas) sin invadir
      el título ni generar scroll horizontal. La capa de sinapsis se conserva.
      **Sin efecto visible desde la Etapa 18**; el asset recortado queda
      guardado para una futura reincorporación.
- [x] Etapa 18 (22/10/2026): **hero limpio**: a pedido del usuario se quitaron del
      hero la imagen del cerebro y la capa de sinapsis (HTML, CSS y la IIFE
      "Sinapsis del hero" de `js/main.js`). El hero queda minimalista: texto a
      la izquierda, columna derecha reservada como espacio negativo, fondo negro
      y estética tecnológica intactos. **Se conservan** el fondo de partículas
      general (`#fondo-particulas`), la escritura del hero, el título, el
      párrafo, los botones, el encabezado, la navegación y el resto de las
      secciones, y **no se borró ningún archivo de imagen**. Local, pendiente de
      revisión del usuario.
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

## Checklist de revisión visual manual

Ítems 1 a 12 aprobados el 20/10/2026; 4, 13 y 14 ampliados en las Etapas 15 y
16, pendientes de revisión.

Con el sitio servido localmente (`npx http-server . -p 8080`):

1. 1440×900, 390×844 y 360×800: sin scroll horizontal, sin textos cortados.
2. Fondo: se ven los orbes flotantes (puntos de luz azules/violetas **sin aura**,
   unidos por líneas tenues) moviéndose lentamente sobre el negro, sin cubrir
   el texto; con movimiento reducido del sistema, quedan quietos.
3. Recepción inicial: el formulario y el stepper NO aparecen hasta tocar una
   tarjeta o el botón "Soporte al cliente" de la sección `#soporte`.
4. Al pulsar una tarjeta de servicio: se despliega el formulario en "Datos" y el
   stepper muestra 01 completado con el nombre del servicio. Pulsar la otra
   tarjeta alterna los campos sin perder lo escrito. El botón "Soporte al
   cliente" **baja hasta el final de la sección Soporte** y despliega ahí el
   formulario (debajo de pasos y canales), con los campos de soporte (Motivo +
   Producto); las tarjetas de técnico/web lo devuelven a "Recepción".
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
11. Al cargar la página: el hero aparece **vacío** (nunca se ve el texto
    completo primero) y la pill "Recepción de clientes · en línea" se escribe
    carácter por carácter con un cursor que parpadea, después el título del
    hero y por último el párrafo, sin pausas raras en medio de las frases; al
    terminar no queda ningún cursor. Con movimiento reducido del sistema, el
    texto aparece completo de entrada (sin escritura).
12. Hero (Etapa 18): a la derecha del título **no hay ninguna imagen ni capa
    animada**: el sector derecho queda como **espacio negativo** sobre el fondo
    negro, el texto se mantiene legible y centrado verticalmente, y el fondo de
    partículas general sigue animándose detrás. Al bajar a "Soporte al cliente",
    el encabezado acompaña con la foto de la oficina, su pie "Oficinas" en
    blanco y "Salta Capital, Argentina"; sin cortes ni desbordes en ningún ancho.
13. Canales: se ve **Instagram `@nicotips27`** en `#contacto` (ícono + enlace
    a <https://www.instagram.com/nicotips27/>, abre en otra pestaña) y también
    en los íconos del pie. Formulario de soporte: al tocar "Soporte al cliente"
    el formulario aparece al final de la sección (no salta arriba a
    "Recepción"), la página baja sola hasta él y, si después se toca una
    tarjeta de técnico/web, vuelve a `#recepcion` conservando lo escrito.
14. Fondo del hero (Etapa 18): la red de orbes del fondo general sigue
    dibujándose detrás del contenido (círculos de color puro y líneas de
    conexión), los enlaces siguen funcionando con normalidad y la consola queda
    sin errores. Con movimiento reducido del sistema el fondo queda estático y el
    hero completo, sin escritura.
15. Espacio negativo (Etapa 18): en escritorio el título ocupa solo la mitad
    izquierda del contenedor (a 1440 px, el 53 %), la columna derecha queda
    libre de imágenes y el hero no se ve "vacío" ni descentrado; en móvil
    (390 y 360 px) el texto ocupa todo el ancho y **debajo** quedan los botones,
    sin taparlos. Al mover la ventana no aparece scroll horizontal.

## Accesibilidad

- Skip link, `aria-expanded`/`aria-controls` en el menú, foco visible,
  contraste alto sobre fondo negro, `prefers-reduced-motion` respetado
  (reveal y animaciones de los orbes se desactivan).
