/* Estalingrado Corp — Recepción de clientes
   Menú móvil, reveal on scroll, año dinámico y flujo de recepción. */

/* =====================================================================
   CONFIGURACIÓN ÚNICA DE ENVÍO  ←  se completa en js/config.js
   ---------------------------------------------------------------------
   Sin URL y anon key, el envío NO está habilitado y la interfaz lo
   informa sin borrar datos ni simular confirmaciones.
   Con Supabase configurado, la solicitud se guarda en la tabla
   "solicitudes" usando la API REST (sin librerías).
   ===================================================================== */
var ENVIO = (function () {
  var cfg = window.CONFIG_SUPABASE || {};
  if (cfg.url && cfg.anonKey) {
    var base = String(cfg.url).replace(/\/+$/, '');
    return {
      tipo: 'supabase',
      url: base,
      anonKey: cfg.anonKey,
      destino: base + '/rest/v1/solicitudes'
    };
  }
  return { tipo: null, destino: null };
})();

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Año dinámico del footer */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Menú móvil */
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var closeBtn = document.getElementById('mobile-menu-close');

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    toggle.focus();
  }

  if (toggle && menu && closeBtn) {
    toggle.addEventListener('click', function () {
      menu.hidden ? openMenu() : closeMenu();
    });

    closeBtn.addEventListener('click', closeMenu);

    menu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) closeMenu();
    });
  }

  /* Acceso discreto al panel interno: mantener Ctrl (o Cmd) y hacer 3 clics
     sobre el logo. No hay ningún enlace visible a propósito; en el celular se
     entra por el acceso directo guardado en la pantalla de inicio. */
  var logo = document.querySelector('.brand');
  if (logo) {
    var clicsLogo = 0;
    var reinicioLogo = null;
    logo.addEventListener('click', function (e) {
      if (!e.ctrlKey && !e.metaKey) {
        clicsLogo = 0;
        return;
      }
      /* Evita que Ctrl+clic abra una pestaña con el ancla del logo. */
      e.preventDefault();
      clicsLogo += 1;
      if (reinicioLogo) clearTimeout(reinicioLogo);
      if (clicsLogo >= 3) {
        clicsLogo = 0;
        var panel = window.open('admin.html', '_blank');
        if (!panel) window.location.href = 'admin.html';
        return;
      }
      reinicioLogo = setTimeout(function () { clicsLogo = 0; }, 1500);
    });
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ===================== Fondo dinámico: red de orbes flotantes =====================
     Imita el canvas de la página institucional (#pc): orbes que flotan lentamente y
     se unen con líneas tenues cuando quedan a menos de 120 px. Minimalistas, sin
     aura alrededor. Decorativo: sin eventos, fijo detrás del contenido y estático
     con movimiento reducido. */
  (function () {
    var lienzo = document.getElementById('fondo-particulas');
    if (!lienzo || !lienzo.getContext) return;
    var ctx = lienzo.getContext('2d');
    if (!ctx) return;

    var CONEXION = 120;
    var orbes = [];
    var raf = null;
    var animando = false;
    var COLORES = [
      '37,99,235',   // azul institucional #2563eb
      '59,130,246',  // azul claro #3b82f6
      '124,58,237'   // violeta #7c3aed
    ];

    function medir() {
      lienzo.width = window.innerWidth;
      lienzo.height = window.innerHeight;
    }

    function Orbe() {
      this.x = Math.random() * lienzo.width;
      this.y = Math.random() * lienzo.height;
      this.size = Math.random() * 2.6 + .9;      // 0.9 a 3.5 px
      this.velX = (Math.random() - .5) * .3;     // -0.15 a 0.15 px por cuadro
      this.velY = (Math.random() - .5) * .3;
      this.opacidad = Math.random() * .45 + .15; // 0.15 a 0.6
      this.color = COLORES[Math.floor(Math.random() * COLORES.length)];
    }

    Orbe.prototype.mover = function () {
      this.x += this.velX;
      this.y += this.velY;
      if (this.x > lienzo.width) this.x = 0;
      if (this.x < 0) this.x = lienzo.width;
      if (this.y > lienzo.height) this.y = 0;
      if (this.y < 0) this.y = lienzo.height;
    };

    Orbe.prototype.dibujar = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.color + ',' + this.opacidad + ')';
      ctx.fill();
    };

    function crear() {
      orbes = [];
      var cantidad = Math.min(110, Math.floor((lienzo.width * lienzo.height) / 16000));
      for (var i = 0; i < cantidad; i++) orbes.push(new Orbe());
    }

    function pintar() {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      orbes.forEach(function (o, i) {
        o.mover();
        o.dibujar();
        for (var j = i + 1; j < orbes.length; j++) {
          var p = orbes[j];
          var dx = p.x - o.x;
          var dy = p.y - o.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONEXION) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(' + o.color + ',' + (0.07 * (1 - d / CONEXION)) + ')';
            ctx.lineWidth = .5;
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      });
    }

    function animar() {
      pintar();
      raf = window.requestAnimationFrame(animar);
    }

    function arrancar() {
      medir();
      crear();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pintar(); // estático: se dibuja una vez y no se anima
        return;
      }
      animando = true;
      animar();
    }

    arrancar();

    var espera = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(espera);
      espera = window.setTimeout(function () {
        if (raf) window.cancelAnimationFrame(raf);
        medir();
        crear();
        if (animando) animar();
        else pintar();
      }, 150);
    });
  })();

  /* ===================== Escritura del hero (como la página institucional) =====================
     La pill, el título y el párrafo del hero se escriben carácter por carácter al
     cargar, con cursor que parpadea mientras escriben (igual que la página oficial
     de la empresa). El texto vive en el HTML (SEO y accesibilidad) pero se vacía
     síncronamente al ejecutar este archivo —antes del primer pintado— para que
     nunca se vea el texto completo para después reescribirlo. El JS reconstruye
     los nodos originales: el título conserva el span .tg del degradado y los
     espacios del fuente se colapsan para no pausar la escritura.
     Con movimiento reducido no se anima: se deja el texto tal cual está. */
  (function () {
    if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var VELOCIDAD = 30; // ms por carácter, el mismo ritmo de la página institucional

    var pill = document.querySelector('#inicio .pill');
    var pillTexto = pill ? pill.lastElementChild : null;
    var titulo = document.querySelector('#inicio .hero__title');
    var lead = document.querySelector('#inicio .hero__lead');
    if (!titulo || !lead) return;

    function segmentosDe(el) {
      var segmentos = [];
      for (var i = 0; i < el.childNodes.length; i++) {
        var n = el.childNodes[i];
        if (n.nodeType === 3) {
          if (n.nodeValue) segmentos.push({ texto: n.nodeValue, clase: null });
        } else if (n.nodeType === 1) {
          segmentos.push({ texto: n.textContent, clase: n.className || null });
        }
      }
      /* El HTML tiene saltos de línea e indentación dentro del texto: si no se
         colapsan, se escribirían como "pausas" de caracteres en blanco. */
      var limpio = segmentos
        .map(function (s) { return { texto: s.texto.replace(/\s+/g, ' '), clase: s.clase }; })
        .filter(function (s) { return s.texto.length > 0; });
      if (limpio.length) {
        limpio[0].texto = limpio[0].texto.replace(/^ +/, '');
        limpio[limpio.length - 1].texto = limpio[limpio.length - 1].texto.replace(/ +$/, '');
        limpio = limpio.filter(function (s) { return s.texto.length > 0; });
      }
      return limpio;
    }

    /* Reconstruye el texto completo en el elemento (para medir su alto) */
    function montar(el, segmentos) {
      el.textContent = '';
      segmentos.forEach(function (s) {
        if (s.clase) {
          var span = document.createElement('span');
          span.className = s.clase;
          span.textContent = s.texto;
          el.appendChild(span);
          return;
        }
        el.appendChild(document.createTextNode(s.texto));
      });
    }

    function escribir(el, segmentos, alTerminar) {
      el.textContent = '';
      var nodos = segmentos.map(function (s) {
        if (s.clase) {
          var span = document.createElement('span');
          span.className = s.clase;
          el.appendChild(span);
          return span;
        }
        var nodoTexto = document.createTextNode('');
        el.appendChild(nodoTexto);
        return nodoTexto;
      });
      var cursor = document.createElement('span');
      cursor.className = 'hero__cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = '▌';
      el.appendChild(cursor);

      var total = segmentos.reduce(function (n, s) { return n + s.texto.length; }, 0);
      var i = 0;
      var reloj = window.setInterval(function () {
        if (i >= total) {
          window.clearInterval(reloj);
          cursor.parentNode.removeChild(cursor);
          if (alTerminar) alTerminar();
          return;
        }
        var resto = i;
        for (var k = 0; k < segmentos.length; k++) {
          if (resto < segmentos[k].texto.length) {
            nodos[k].textContent += segmentos[k].texto.charAt(resto);
            break;
          }
          resto -= segmentos[k].texto.length;
        }
        i++;
      }, VELOCIDAD);
    }

    var segPill = pillTexto ? segmentosDe(pillTexto) : null;
    var segTitulo = segmentosDe(titulo);
    var segLead = segmentosDe(lead);

    /* Vacía los textos YA, en este mismo tick de ejecución: como main.js corre
       antes del primer pintado, el navegador nunca llega a mostrar el texto
       completo. Reserva el alto con las fuentes de respaldo como aproximación
       inicial (se re-mide exacto cuando cargan las fuentes reales). */
    var altoTitulo = titulo.offsetHeight;
    var altoLead = lead.offsetHeight;
    if (segPill && segPill.length) pillTexto.textContent = '';
    titulo.textContent = '';
    lead.textContent = '';
    titulo.style.minHeight = altoTitulo + 'px';
    lead.style.minHeight = altoLead + 'px';

    function arrancar() {
      /* Re-mide con las fuentes cargadas: monta y vacía en el mismo tick,
         sin pintado intermedio, para que el alto reservado sea exacto. */
      montar(titulo, segTitulo);
      titulo.style.minHeight = titulo.offsetHeight + 'px';
      titulo.textContent = '';
      montar(lead, segLead);
      lead.style.minHeight = lead.offsetHeight + 'px';
      lead.textContent = '';

      function escribirTitulo() {
        escribir(titulo, segTitulo, function () {
          titulo.style.minHeight = '';
          escribir(lead, segLead, function () { lead.style.minHeight = ''; });
        });
      }
      /* Primero la pill "Recepción de clientes · en línea", como arriba de todo */
      if (segPill && segPill.length) escribir(pillTexto, segPill, escribirTitulo);
      else escribirTitulo();
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(arrancar);
    else arrancar();
  })();

  /* ===================== Flujo de recepción ===================== */

  var form = document.getElementById('form-solicitud');
  if (!form) return;

  /* El formulario es uno solo: se mueve al slot de la sección que lo pide.
     Técnico y web lo usan en #recepcion; soporte lo usa al final de #soporte,
     debajo de sus pasos y canales. Se mueve el mismo nodo para conservar los
     datos cargados y no duplicar ids. */
  var bloque = document.getElementById('bloque-formulario');
  var slotRecepcion = document.getElementById('slot-recepcion');
  var slotSoporte = document.getElementById('slot-soporte');

  function ubicarFormulario(valor) {
    if (!bloque) return;
    var slot = valor === 'soporte' ? slotSoporte : slotRecepcion;
    if (!slot || bloque.parentNode === slot) return;
    slot.appendChild(bloque);
    /* Entrada suave cada vez que el formulario cambia de sección. */
    bloque.classList.remove('entrando');
    void bloque.offsetWidth;
    bloque.classList.add('entrando');
  }

  var stepper = document.getElementById('stepper');
  var stepperServicio = document.getElementById('stepper-servicio');
  var stepperItems = document.querySelectorAll('.stepper__item');
  var pasoDatos = document.getElementById('paso-datos');
  var pasoResumen = document.getElementById('paso-resumen');
  var btnEditar = document.getElementById('btn-editar');
  var btnEnviar = document.getElementById('btn-enviar');
  var grupoTecnico = document.getElementById('campos-tecnico');
  var grupoWeb = document.getElementById('campos-web');
  var grupoSoporte = document.getElementById('campos-soporte');
  var textoNombre = document.getElementById('texto-label-nombre');
  var textoDescripcion = document.getElementById('texto-label-descripcion');
  var campoDescripcion = document.getElementById('descripcion');
  var resumenDl = document.getElementById('resumen');
  var estadoEnvio = document.getElementById('estado-envio');
  var estadoTitulo = document.getElementById('estado-titulo');
  var estadoTexto = document.getElementById('estado-texto');
  var iconoEstado = document.getElementById('icono-estado');
  var btnNueva = document.getElementById('btn-nueva');
  var honeypot = document.getElementById('hp-empresa');

  /* El servicio se elige con las entradas [data-servicio]: las tarjetas de
     #servicios (técnico y web) y el botón de la sección #soporte, sin
     duplicar la selección dentro del formulario. */
  var servicioActual = null;

  var SERVICIOS = {
    tecnico: 'Servicio técnico informático',
    web: 'Creación y desarrollo de sitios web',
    soporte: 'Soporte al cliente'
  };

  var ETIQUETAS = {
    nombre: 'Nombre',
    contacto: 'Medio de contacto',
    tipoProblema: 'Tipo de problema',
    dispositivo: 'Dispositivo o sistema operativo',
    tipoProyecto: 'Tipo de proyecto',
    sitioActual: 'Sitio web actual',
    motivoSoporte: 'Motivo',
    productoRelacionado: 'Producto o servicio relacionado',
    descripcion: 'Descripción'
  };

  var MOTIVOS = {
    'no-habilitado': 'El canal oficial de recepción todavía no está configurado. Tu solicitud no fue enviada y tus datos siguen en pantalla: podés seguir revisándolos o volver a editarlos.',
    'no-implementado': 'El destino está configurado pero el envío real aún no fue implementado. Tu solicitud no fue enviada y tus datos siguen en pantalla.'
  };

  function servicioSeleccionado() {
    return servicioActual;
  }

  function textoServicio(valor) {
    return SERVICIOS[valor] || '—';
  }

  /* --- Pasos (01 Servicio completado con las tarjetas · 02 Datos · 03 Revisión) --- */

  function irAPaso(n) {
    pasoDatos.hidden = n !== 2;
    pasoResumen.hidden = n !== 3;

    stepperItems.forEach(function (item) {
      var num = Number(item.getAttribute('data-paso'));
      item.classList.toggle('is-active', num === n);
      item.classList.toggle('is-done', num < n);
      if (num === n) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });

    var destino = n === 2 ? pasoDatos : pasoResumen;
    destino.focus();
  }

  /* --- Campos específicos del servicio elegido --- */

  function deshabilitarGrupo(grupo, deshabilitado) {
    grupo.querySelectorAll('input, select, textarea').forEach(function (control) {
      control.disabled = deshabilitado;
      if (deshabilitado) marcarCampo(control, false);
    });
  }

  var GRUPOS_SERVICIO = [
    { clave: 'tecnico', grupo: grupoTecnico },
    { clave: 'web', grupo: grupoWeb },
    { clave: 'soporte', grupo: grupoSoporte }
  ];

  var TEXTOS_SERVICIO = {
    tecnico: {
      nombre: 'Nombre del cliente',
      descripcion: 'Descripción del inconveniente',
      placeholder: 'Ej.: La notebook no enciende desde el lunes, ya probé con otro cargador…'
    },
    web: {
      nombre: 'Nombre del cliente o negocio',
      descripcion: 'Descripción de lo que necesitás',
      placeholder: 'Ej.: Quiero una página para mi negocio, con catálogo y contacto…'
    },
    soporte: {
      nombre: 'Nombre del cliente',
      descripcion: 'Descripción de la situación',
      placeholder: 'Ej.: Ya soy cliente de la página y necesito ayuda para cargar mis productos…'
    }
  };

  function aplicarServicio(valor) {
    GRUPOS_SERVICIO.forEach(function (entrada) {
      var activo = entrada.clave === valor;
      entrada.grupo.hidden = !activo;
      deshabilitarGrupo(entrada.grupo, !activo);
    });
    var textos = TEXTOS_SERVICIO[valor] || TEXTOS_SERVICIO.tecnico;
    textoNombre.textContent = textos.nombre;
    textoDescripcion.textContent = textos.descripcion;
    campoDescripcion.placeholder = textos.placeholder;
    stepperServicio.textContent = textoServicio(valor);
  }

  /* El formulario se despliega al tocar una tarjeta de servicio o el botón
     de soporte (paso 2). El de soporte se ubica dentro de #soporte. */
  function abrirFormulario(valor) {
    servicioActual = valor;
    ubicarFormulario(valor);
    aplicarServicio(valor);
    stepper.hidden = false;
    form.hidden = false;
    stepper.classList.add('visible');
    form.classList.add('visible');
    if (!pasoResumen.hidden || pasoDatos.hidden) irAPaso(2);
  }

  document.querySelectorAll('[data-servicio]').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      abrirFormulario(enlace.getAttribute('data-servicio'));
    });
  });

  btnEditar.addEventListener('click', function () { irAPaso(2); });

  /* --- Validación --- */

  function errorDe(control) {
    return document.getElementById('err-' + control.id);
  }

  function marcarCampo(control, invalido) {
    var mensaje = errorDe(control);
    if (invalido) {
      control.setAttribute('aria-invalid', 'true');
      if (mensaje) mensaje.hidden = false;
    } else {
      control.removeAttribute('aria-invalid');
      if (mensaje) mensaje.hidden = true;
    }
  }

  function validar() {
    var invalidos = [];
    pasoDatos.querySelectorAll('[required]').forEach(function (control) {
      if (control.disabled) {
        marcarCampo(control, false);
        return;
      }
      var vacio = control.value.trim() === '';
      marcarCampo(control, vacio);
      if (vacio) invalidos.push(control);
    });
    if (invalidos.length) {
      invalidos[0].focus();
      return false;
    }
    return true;
  }

  /* Corrección en línea: al escribir/cambiar se revalida ese campo */
  ['input', 'change'].forEach(function (tipo) {
    form.addEventListener(tipo, function (e) {
      var control = e.target;
      if (!control.hasAttribute || !control.hasAttribute('required') || control.disabled) return;
      if (control.getAttribute('aria-invalid') === 'true') {
        marcarCampo(control, control.value.trim() === '');
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.hidden || pasoDatos.hidden) return;
    if (!validar()) return;
    mostrarResumen();
  });

  /* --- Revisión --- */

  function fila(etiqueta, valor) {
    var row = document.createElement('div');
    row.className = 'resumen__row';
    var dt = document.createElement('dt');
    dt.className = 'resumen__dt';
    dt.textContent = etiqueta;
    var dd = document.createElement('dd');
    dd.className = 'resumen__dd';
    dd.textContent = valor;
    row.appendChild(dt);
    row.appendChild(dd);
    return row;
  }

  function recolectar() {
    var datos = { servicio: servicioSeleccionado() };
    pasoDatos.querySelectorAll('input, select, textarea').forEach(function (control) {
      if (!control.name || control.disabled) return;
      if (control.closest && control.closest('.hp')) return; // trampa anti-bot
      datos[control.name] = control.value.trim();
    });
    return datos;
  }

  function mostrarResumen() {
    var datos = recolectar();
    resumenDl.textContent = '';
    resumenDl.appendChild(fila('Servicio', textoServicio(datos.servicio)));
    Object.keys(ETIQUETAS).forEach(function (clave) {
      var valor = datos[clave];
      if (valor === undefined || valor === '') return;
      resumenDl.appendChild(fila(ETIQUETAS[clave], valor));
    });
    irAPaso(3);
  }

  /* --- Envío --- */

  var enviando = false;
  var enviada = false;

  function datosParaSupabase(datos) {
    var fila = {
      servicio: datos.servicio,
      nombre: datos.nombre,
      contacto: datos.contacto,
      descripcion: datos.descripcion
    };
    if (datos.servicio === 'tecnico') {
      fila.tipo_problema = datos.tipoProblema || null;
      fila.dispositivo = datos.dispositivo || null;
    } else if (datos.servicio === 'web') {
      fila.tipo_proyecto = datos.tipoProyecto || null;
      fila.sitio_actual = datos.sitioActual || null;
    } else if (datos.servicio === 'soporte') {
      fila.motivo_soporte = datos.motivoSoporte || null;
      fila.producto_relacionado = datos.productoRelacionado || null;
    }
    return fila;
  }

  function mostrarEstado(tipo, titulo, texto) {
    estadoEnvio.hidden = false;
    estadoEnvio.classList.toggle('status--ok', tipo === 'ok');
    estadoEnvio.classList.toggle('status--error', tipo === 'error');
    if (iconoEstado) {
      iconoEstado.className = tipo === 'ok'
        ? 'fa-solid fa-circle-check'
        : tipo === 'error'
          ? 'fa-solid fa-circle-xmark'
          : 'fa-solid fa-triangle-exclamation';
    }
    estadoTitulo.textContent = titulo;
    estadoTexto.textContent = texto;
  }

  function ocultarEstado() {
    estadoEnvio.hidden = true;
    estadoEnvio.classList.remove('status--ok', 'status--error');
  }

  function marcarEnviada(datos) {
    enviada = true;
    btnEnviar.disabled = true;
    btnEnviar.setAttribute('aria-busy', 'false');
    btnEditar.hidden = true;
    if (btnNueva) {
      btnNueva.hidden = false;
      btnNueva.focus();
    }
    mostrarEstado(
      'ok',
      'Solicitud enviada',
      'Recibimos tu solicitud de ' + textoServicio(datos.servicio).toLowerCase() +
      '. Te vamos a contactar por el medio que indicaste (' + datos.contacto + ').'
    );
  }

  function enviarASupabase(datos) {
    if (enviando || enviada) return;
    enviando = true;
    btnEnviar.disabled = true;
    btnEnviar.setAttribute('aria-busy', 'true');
    mostrarEstado('warn', 'Enviando solicitud…', 'Estamos guardando tus datos. No cierres esta página.');

    var controlador = window.AbortController ? new AbortController() : null;
    var temporizador = window.setTimeout(function () {
      if (controlador) controlador.abort();
    }, 20000);

    var opciones = {
      method: 'POST',
      headers: {
        'apikey': ENVIO.anonKey,
        'Authorization': 'Bearer ' + ENVIO.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(datosParaSupabase(datos))
    };
    if (controlador) opciones.signal = controlador.signal;

    window.fetch(ENVIO.destino, opciones).then(function (respuesta) {
      window.clearTimeout(temporizador);
      if (respuesta.ok) {
        enviando = false;
        marcarEnviada(datos);
        return null;
      }
      var errorHttp = new Error('HTTP ' + respuesta.status);
      if (respuesta && typeof respuesta.text === 'function') {
        return respuesta.text().then(function (cuerpo) {
          if (cuerpo && cuerpo.indexOf('DEMASIADAS_SOLICITUDES') !== -1) {
            errorHttp.demasiadas = true;
          }
          throw errorHttp;
        }, function () { throw errorHttp; });
      }
      throw errorHttp;
    }).catch(function (error) {
      window.clearTimeout(temporizador);
      enviando = false;
      btnEnviar.setAttribute('aria-busy', 'false');
      btnEnviar.disabled = false;
      if (error && error.demasiadas) {
        mostrarEstado(
          'error',
          'Esperá unos minutos',
          'Recibimos varias solicitudes desde el mismo contacto hace muy poco. Esperá unos minutos y volvé a intentar; tus datos siguen cargados en pantalla.'
        );
      } else {
        mostrarEstado(
          'error',
          'No pudimos enviar la solicitud',
          'Revisá tu conexión e intentá de nuevo. Tus datos siguen cargados en pantalla.'
        );
      }
      btnEnviar.focus();
    });
  }

  function enviarSolicitud() {
    return { ok: false, motivo: 'no-habilitado' };
  }

  function actualizarEstadoEnvio() {
    var habilitado = ENVIO.tipo === 'supabase';
    btnEnviar.disabled = !habilitado;
    if (!habilitado) {
      mostrarEstado(
        'warn',
        'Solicitud preparada · envío no habilitado todavía',
        'Tus datos están listos y se conservan en pantalla. El canal oficial de recepción de Estalingrado Corp aún no está configurado, así que por ahora no podés enviarla. Podés volver a editar todo lo que quieras.'
      );
    } else {
      ocultarEstado();
    }
  }

  btnEnviar.addEventListener('click', function () {
    if (enviada || enviando) return;
    /* El botón vive en el paso 3 (Revisión): nunca envía desde otro paso. */
    if (pasoResumen.hidden) return;
    var datos = recolectar();

    /* Si la trampa anti-bot está completa, simulamos la confirmación sin enviar. */
    if (honeypot && honeypot.value.trim() !== '') {
      marcarEnviada(datos);
      return;
    }

    if (ENVIO.tipo === 'supabase') {
      enviarASupabase(datos);
      return;
    }

    var resultado = enviarSolicitud(datos);
    if (!resultado.ok) {
      estadoTitulo.textContent = 'La solicitud no fue enviada';
      estadoTexto.textContent = MOTIVOS[resultado.motivo];
      estadoEnvio.hidden = false;
      /* Nunca se borran los datos ni se muestra una confirmación falsa. */
    }
  });

  if (btnNueva) {
    btnNueva.addEventListener('click', function () {
      form.reset();
      enviando = false;
      enviada = false;
      pasoDatos.querySelectorAll('[aria-invalid="true"]').forEach(function (control) {
        marcarCampo(control, false);
      });
      resumenDl.textContent = '';
      btnEditar.hidden = false;
      btnNueva.hidden = true;
      btnEnviar.setAttribute('aria-busy', 'false');
      btnEnviar.disabled = ENVIO.tipo !== 'supabase';
      ocultarEstado();
      irAPaso(2);
      var nombre = document.getElementById('nombre');
      if (nombre) nombre.focus();
    });
  }

  actualizarEstadoEnvio();
})();
