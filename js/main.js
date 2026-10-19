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
     se unen con líneas tenues cuando quedan a menos de 120 px. Decorativo: sin
     eventos, fijo detrás del contenido y estático con movimiento reducido. */
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
      ctx.arc(this.x, this.y, this.size * 2.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.color + ',' + (this.opacidad * .2) + ')';
      ctx.fill();
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

  /* ===================== Flujo de recepción ===================== */

  var form = document.getElementById('form-solicitud');
  if (!form) return;

  var stepper = document.getElementById('stepper');
  var stepperServicio = document.getElementById('stepper-servicio');
  var stepperItems = document.querySelectorAll('.stepper__item');
  var pasoDatos = document.getElementById('paso-datos');
  var pasoResumen = document.getElementById('paso-resumen');
  var btnEditar = document.getElementById('btn-editar');
  var btnEnviar = document.getElementById('btn-enviar');
  var grupoTecnico = document.getElementById('campos-tecnico');
  var grupoWeb = document.getElementById('campos-web');
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

  /* El servicio se elige únicamente con las tarjetas de la sección
     #servicios (sin duplicar la selección dentro del formulario). */
  var servicioActual = null;

  var SERVICIOS = {
    tecnico: 'Servicio técnico informático',
    web: 'Creación y desarrollo de sitios web'
  };

  var ETIQUETAS = {
    nombre: 'Nombre',
    contacto: 'Medio de contacto',
    tipoProblema: 'Tipo de problema',
    dispositivo: 'Dispositivo o sistema operativo',
    tipoProyecto: 'Tipo de proyecto',
    sitioActual: 'Sitio web actual',
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

  function aplicarServicio(valor) {
    var esTecnico = valor === 'tecnico';
    grupoTecnico.hidden = !esTecnico;
    grupoWeb.hidden = esTecnico;
    deshabilitarGrupo(grupoTecnico, !esTecnico);
    deshabilitarGrupo(grupoWeb, esTecnico);
    textoNombre.textContent = esTecnico ? 'Nombre del cliente' : 'Nombre del cliente o negocio';
    textoDescripcion.textContent = esTecnico ? 'Descripción del inconveniente' : 'Descripción de lo que necesitás';
    campoDescripcion.placeholder = esTecnico
      ? 'Ej.: La notebook no enciende desde el lunes, ya probé con otro cargador…'
      : 'Ej.: Quiero una página para mi negocio, con catálogo y contacto…';
    stepperServicio.textContent = textoServicio(valor);
  }

  /* El formulario se despliega al tocar una tarjeta de servicio (paso 2). */
  function abrirFormulario(valor) {
    servicioActual = valor;
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
    } else {
      fila.tipo_proyecto = datos.tipoProyecto || null;
      fila.sitio_actual = datos.sitioActual || null;
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
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      enviando = false;
      marcarEnviada(datos);
    }).catch(function () {
      window.clearTimeout(temporizador);
      enviando = false;
      btnEnviar.setAttribute('aria-busy', 'false');
      btnEnviar.disabled = false;
      mostrarEstado(
        'error',
        'No pudimos enviar la solicitud',
        'Revisá tu conexión e intentá de nuevo. Tus datos siguen cargados en pantalla.'
      );
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
