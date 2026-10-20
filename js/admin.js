/* =========================================================
   Estalingrado Corp — Panel de administración
   Vanilla JS. Habla con Supabase por su API REST (sin librerías).
   La seguridad real vive en las políticas RLS de supabase/schema.sql.
   ========================================================= */

(function () {
  'use strict';

  var CONFIG = window.CONFIG_SUPABASE || {};
  var configurado = Boolean(CONFIG.url && CONFIG.anonKey);
  var BASE = configurado ? String(CONFIG.url).replace(/\/+$/, '') : '';
  var CLAVE_SESION = 'ec_admin_sesion';

  var ESTADOS = {
    nueva: 'Nueva',
    en_revision: 'En revisión',
    respondida: 'Respondida',
    cerrada: 'Cerrada'
  };

  var SERVICIOS = {
    tecnico: 'Servicio técnico',
    web: 'Sitio web',
    soporte: 'Soporte'
  };

  function $(id) { return document.getElementById(id); }

  var vistaLogin = $('vista-login');
  var vistaPanel = $('vista-panel');
  var formLogin = $('form-login');
  var loginEmail = $('login-email');
  var loginPassword = $('login-password');
  var loginError = $('login-error');
  var loginNota = $('login-nota');
  var btnLogin = $('btn-login');
  var usuarioEl = $('admin-usuario');
  var btnSalir = $('btn-salir');

  var statsEl = $('admin-stats');
  var listaEl = $('lista-solicitudes');
  var vacioEl = $('admin-vacio');
  var infoEl = $('admin-info');
  var buscarEl = $('filtro-busqueda');
  var filtroEstadoEl = $('filtro-estado');
  var filtroServicioEl = $('filtro-servicio');
  var btnRecargar = $('btn-recargar');
  var btnExcel = $('btn-xlsx');

  var dialogo = $('dialog-solicitud');
  var detalleDatos = $('detalle-datos');
  var detalleEstado = $('detalle-estado');
  var detalleNotas = $('detalle-notas');
  var detalleError = $('detalle-error');
  var btnGuardar = $('btn-guardar');
  var btnCerrarDialogo = $('btn-cerrar-dialog');
  var btnCancelarDetalle = $('btn-cancelar-detalle');
  var dialogoTitulo = $('dialog-titulo');

  var sesion = null;
  var solicitudes = [];
  var solicitudAbierta = null;
  var cargando = false;
  var esperaBusqueda = null;

  /* ---------- Utilidades ---------- */

  function el(tag, clase, texto) {
    var nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto;
    return nodo;
  }

  function fechaLegible(iso) {
    if (!iso) return '—';
    var fecha = new Date(iso);
    if (isNaN(fecha.getTime())) return '—';
    return fecha.toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function horaActual() {
    return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  function leerSesion() {
    try {
      var crudo = window.sessionStorage.getItem(CLAVE_SESION);
      return crudo ? JSON.parse(crudo) : null;
    } catch (e) {
      return null;
    }
  }

  function guardarSesion(datos) {
    try {
      window.sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
    } catch (e) { /* sin storage: la sesión vive solo en memoria */ }
  }

  function borrarSesion() {
    try { window.sessionStorage.removeItem(CLAVE_SESION); } catch (e) {}
  }

  /* ---------- API REST de Supabase ---------- */

  function conCabeceras(extra) {
    var cabeceras = {
      'apikey': CONFIG.anonKey,
      'Authorization': 'Bearer ' + (sesion ? sesion.access_token : CONFIG.anonKey),
      'Content-Type': 'application/json'
    };
    if (extra) {
      Object.keys(extra).forEach(function (clave) { cabeceras[clave] = extra[clave]; });
    }
    return cabeceras;
  }

  function refrescarSesion() {
    if (!sesion || !sesion.refresh_token) {
      return Promise.reject(new Error('La sesión expiró.'));
    }
    return window.fetch(BASE + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'apikey': CONFIG.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: sesion.refresh_token })
    }).then(function (respuesta) {
      if (!respuesta.ok) throw new Error('La sesión expiró.');
      return respuesta.json();
    }).then(function (datos) {
      sesion = {
        access_token: datos.access_token,
        refresh_token: datos.refresh_token,
        expires_at: Date.now() + (datos.expires_in || 3600) * 1000,
        email: sesion.email
      };
      guardarSesion(sesion);
      return sesion;
    }).catch(function (error) {
      sesion = null;
      borrarSesion();
      mostrarLogin('Tu sesión expiró. Volvé a ingresar.');
      throw error;
    });
  }

  function peticionSegura(ruta, opciones) {
    opciones = opciones || {};
    var intentar = function () {
      return window.fetch(BASE + ruta, {
        method: opciones.method || 'GET',
        headers: conCabeceras(opciones.headers),
        body: opciones.body
      });
    };
    var porVencer = sesion && sesion.expires_at && (sesion.expires_at - Date.now() < 60000);
    var previa = porVencer ? refrescarSesion().catch(function () { return null; }) : Promise.resolve();
    return previa.then(intentar).then(function (respuesta) {
      if (respuesta.status !== 401) return respuesta;
      return refrescarSesion().then(function () { return intentar(); });
    });
  }

  /* ---------- Vistas ---------- */

  function mostrarLogin(mensaje) {
    vistaPanel.hidden = true;
    vistaLogin.hidden = false;
    btnSalir.hidden = true;
    usuarioEl.hidden = true;
    if (mensaje) {
      loginError.textContent = mensaje;
      loginError.hidden = false;
    }
  }

  function mostrarPanel() {
    vistaLogin.hidden = true;
    vistaPanel.hidden = false;
    btnSalir.hidden = false;
    usuarioEl.hidden = false;
    usuarioEl.textContent = sesion && sesion.email ? sesion.email : 'Admin';
  }

  /* ---------- Sesión ---------- */

  function iniciarSesion(email, password) {
    loginError.hidden = true;
    btnLogin.disabled = true;
    btnLogin.setAttribute('aria-busy', 'true');

    window.fetch(BASE + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'apikey': CONFIG.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (respuesta) {
      return respuesta.json().catch(function () { return {}; }).then(function (datos) {
        if (!respuesta.ok) {
          var mensaje = datos.msg || datos.error_description || ('HTTP ' + respuesta.status);
          throw new Error(mensaje);
        }
        return datos;
      });
    }).then(function (datos) {
      sesion = {
        access_token: datos.access_token,
        refresh_token: datos.refresh_token,
        expires_at: Date.now() + (datos.expires_in || 3600) * 1000,
        email: (datos.user && datos.user.email) || email
      };
      guardarSesion(sesion);
      loginPassword.value = '';
      mostrarPanel();
      return cargarSolicitudes();
    }).catch(function (error) {
      var texto = /invalid/i.test(error.message)
        ? 'Correo o contraseña incorrectos.'
        : 'No pudimos iniciar sesión: ' + error.message;
      loginError.textContent = texto;
      loginError.hidden = false;
    }).finally(function () {
      btnLogin.disabled = false;
      btnLogin.setAttribute('aria-busy', 'false');
    });
  }

  function validarSesion() {
    if (!sesion) { mostrarLogin(); return Promise.resolve(); }
    return window.fetch(BASE + '/auth/v1/user', { headers: conCabeceras() })
      .then(function (respuesta) {
        if (respuesta.status === 401) return refrescarSesion().then(validarSesion);
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        return respuesta.json();
      })
      .then(function (usuario) {
        if (usuario && usuario.email) {
          sesion.email = usuario.email;
          guardarSesion(sesion);
        }
        mostrarPanel();
        return cargarSolicitudes();
      })
      .catch(function () {
        sesion = null;
        borrarSesion();
        mostrarLogin();
      });
  }

  function salir() {
    var token = sesion && sesion.access_token;
    sesion = null;
    borrarSesion();
    solicitudes = [];
    mostrarLogin();
    loginError.hidden = true;
    if (token) {
      window.fetch(BASE + '/auth/v1/logout', {
        method: 'POST',
        headers: { 'apikey': CONFIG.anonKey, 'Authorization': 'Bearer ' + token }
      }).catch(function () { /* cerrar en el cliente alcanza */ });
    }
  }

  /* ---------- Solicitudes ---------- */

  function cargarSolicitudes() {
    if (cargando) return Promise.resolve();
    cargando = true;
    infoEl.textContent = 'Cargando solicitudes…';
    infoEl.classList.remove('admin-info--error');

    return peticionSegura('/rest/v1/solicitudes?select=*&order=creado_en.desc&limit=500')
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error('No pudimos leer las solicitudes (HTTP ' + respuesta.status + ').');
        return respuesta.json();
      })
      .then(function (filas) {
        solicitudes = Array.isArray(filas) ? filas : [];
        render();
        infoEl.textContent = 'Actualizado ' + horaActual() + ' · ' + solicitudes.length + ' solicitud' + (solicitudes.length === 1 ? '' : 'es') + ' en total';
      })
      .catch(function (error) {
        infoEl.textContent = error.message;
        infoEl.classList.add('admin-info--error');
      })
      .finally(function () {
        cargando = false;
      });
  }

  function filtradas() {
    var consulta = buscarEl.value.trim().toLowerCase();
    var estado = filtroEstadoEl.value;
    var servicio = filtroServicioEl.value;

    return solicitudes.filter(function (s) {
      if (estado && s.estado !== estado) return false;
      if (servicio && s.servicio !== servicio) return false;
      if (!consulta) return true;
      var texto = [
        s.nombre, s.contacto, s.descripcion,
        s.tipo_problema, s.tipo_proyecto, s.dispositivo, s.sitio_actual,
        s.motivo_soporte, s.producto_relacionado,
        s.notas_internas
      ].join(' ').toLowerCase();
      return texto.indexOf(consulta) !== -1;
    });
  }

  function agregarStat(valor, etiqueta, clave) {
    var tarjeta = el('div', 'admin-stat' + (clave ? ' admin-stat--' + clave : ''));
    tarjeta.appendChild(el('p', 'admin-stat__valor', String(valor)));
    tarjeta.appendChild(el('p', 'admin-stat__label', etiqueta));
    statsEl.appendChild(tarjeta);
  }

  function renderStats() {
    statsEl.textContent = '';
    var conteo = { nueva: 0, en_revision: 0, respondida: 0, cerrada: 0 };
    solicitudes.forEach(function (s) {
      if (conteo[s.estado] != null) conteo[s.estado]++;
    });
    agregarStat(solicitudes.length, 'Total');
    agregarStat(conteo.nueva, 'Nuevas', 'nueva');
    agregarStat(conteo.en_revision, 'En revisión', 'en_revision');
    agregarStat(conteo.respondida, 'Respondidas', 'respondida');
    agregarStat(conteo.cerrada, 'Cerradas', 'cerrada');
  }

  function crearTarjeta(s) {
    var tarjeta = el('article', 'admin-item');

    var arriba = el('div', 'admin-item__top');
    arriba.appendChild(el('span', 'admin-item__fecha', fechaLegible(s.creado_en)));
    arriba.appendChild(el('span', 'admin-badge admin-badge--' + (ESTADOS[s.estado] ? s.estado : 'nueva'), ESTADOS[s.estado] || s.estado));

    var detalle = s.tipo_problema || s.tipo_proyecto || s.motivo_soporte;
    var meta = (SERVICIOS[s.servicio] || s.servicio) + (detalle ? ' · ' + detalle : '');

    tarjeta.appendChild(arriba);
    tarjeta.appendChild(el('h3', 'admin-item__nombre', s.nombre || 'Sin nombre'));
    tarjeta.appendChild(el('p', 'admin-item__meta', meta));
    if (s.contacto) tarjeta.appendChild(el('p', 'admin-item__contacto', s.contacto));
    tarjeta.appendChild(el('p', 'admin-item__desc', s.descripcion || ''));

    var btn = el('button', 'btn btn--outline btn--sm', 'Ver y editar');
    btn.type = 'button';
    btn.addEventListener('click', function () { abrirDetalle(s); });
    tarjeta.appendChild(btn);

    return tarjeta;
  }

  function render() {
    renderStats();
    listaEl.textContent = '';
    var visibles = filtradas();
    visibles.forEach(function (s) { listaEl.appendChild(crearTarjeta(s)); });
    vacioEl.hidden = visibles.length !== 0;
  }

  /* ---------- Detalle ---------- */

  function filaDetalle(etiqueta, valor) {
    detalleDatos.appendChild(el('dt', '', etiqueta));
    detalleDatos.appendChild(el('dd', '', valor == null || valor === '' ? '—' : valor));
  }

  function abrirDetalle(s) {
    solicitudAbierta = s;
    detalleError.hidden = true;
    detalleDatos.textContent = '';
    detalleEstado.value = s.estado || 'nueva';
    detalleNotas.value = s.notas_internas || '';
    dialogoTitulo.textContent = s.nombre || 'Solicitud';

    filaDetalle('Fecha', fechaLegible(s.creado_en));
    filaDetalle('Servicio', SERVICIOS[s.servicio] || s.servicio);
    filaDetalle('Nombre', s.nombre);
    filaDetalle('Contacto', s.contacto);
  if (s.tipo_problema) filaDetalle('Tipo de problema', s.tipo_problema);
  if (s.dispositivo) filaDetalle('Dispositivo', s.dispositivo);
  if (s.tipo_proyecto) filaDetalle('Tipo de proyecto', s.tipo_proyecto);
  if (s.sitio_actual) filaDetalle('Sitio actual', s.sitio_actual);
  if (s.motivo_soporte) filaDetalle('Motivo', s.motivo_soporte);
  if (s.producto_relacionado) filaDetalle('Producto relacionado', s.producto_relacionado);
    filaDetalle('Descripción', s.descripcion);

    if (typeof dialogo.showModal === 'function') dialogo.showModal();
    else dialogo.setAttribute('open', '');
    detalleEstado.focus();
  }

  function cerrarDetalle() {
    if (typeof dialogo.close === 'function' && dialogo.open) dialogo.close();
    else dialogo.removeAttribute('open');
    solicitudAbierta = null;
  }

  function guardarDetalle() {
    if (!solicitudAbierta) return;
    detalleError.hidden = true;
    btnGuardar.disabled = true;
    btnGuardar.setAttribute('aria-busy', 'true');

    var cambios = {
      estado: detalleEstado.value,
      notas_internas: detalleNotas.value.trim() || null
    };

    peticionSegura('/rest/v1/solicitudes?id=eq.' + encodeURIComponent(solicitudAbierta.id), {
      method: 'PATCH',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify(cambios)
    }).then(function (respuesta) {
      if (!respuesta.ok) throw new Error('No se pudo guardar (HTTP ' + respuesta.status + ').');
      solicitudAbierta.estado = cambios.estado;
      solicitudAbierta.notas_internas = cambios.notas_internas;
      cerrarDetalle();
      render();
      infoEl.textContent = 'Cambios guardados · ' + horaActual();
    }).catch(function (error) {
      detalleError.textContent = error.message;
      detalleError.hidden = false;
    }).finally(function () {
      btnGuardar.disabled = false;
      btnGuardar.setAttribute('aria-busy', 'false');
    });
  }

  /* ---------- Exportación a Excel ---------- */

  var ORDEN_SERVICIOS = ['tecnico', 'web', 'soporte'];
  var COLUMNAS_EXCEL = [
    'Nº', 'Recibida', 'Actualizada', 'Estado', 'Servicio', 'Nombre', 'Contacto',
    'Tipo de problema', 'Dispositivo', 'Tipo de proyecto', 'Sitio actual',
    'Motivo', 'Producto relacionado', 'Descripción', 'Notas internas'
  ];
  var ANCHOS_EXCEL = [5, 17, 17, 15, 17, 24, 24, 32, 24, 28, 24, 24, 26, 46, 30];

  function agruparPorServicio(filas) {
    var grupos = [[], [], []];
    var resto = [];
    filas.forEach(function (s) {
      var posicion = ORDEN_SERVICIOS.indexOf(s.servicio);
      if (posicion === -1) resto.push(s);
      else grupos[posicion].push(s);
    });
    return grupos[0].concat(grupos[1], grupos[2], resto);
  }

  function celdaExcel(s, posicion) {
    return [
      posicion,
      window.Exportacion.fecha(s.creado_en),
      window.Exportacion.fecha(s.actualizado_en),
      ESTADOS[s.estado] || s.estado || '',
      SERVICIOS[s.servicio] || s.servicio || '',
      s.nombre || '',
      s.contacto || '',
      s.tipo_problema || '',
      s.dispositivo || '',
      s.tipo_proyecto || '',
      s.sitio_actual || '',
      s.motivo_soporte || '',
      s.producto_relacionado || '',
      s.descripcion || '',
      s.notas_internas || ''
    ];
  }

  function descripcionFiltros() {
    var partes = [];
    if (filtroEstadoEl.value) partes.push(ESTADOS[filtroEstadoEl.value] || filtroEstadoEl.value);
    if (filtroServicioEl.value) partes.push(SERVICIOS[filtroServicioEl.value] || filtroServicioEl.value);
    var consulta = buscarEl.value.trim();
    if (consulta) partes.push('búsqueda: ' + consulta);
    return partes.length ? partes.join(' · ') : 'Ninguno (todas)';
  }

  function hojaResumen(visibles) {
    var porEstado = { nueva: 0, en_revision: 0, respondida: 0, cerrada: 0 };
    var porServicio = [0, 0, 0];
    var otros = 0;
    visibles.forEach(function (s) {
      if (porEstado[s.estado] != null) porEstado[s.estado]++;
      var posicion = ORDEN_SERVICIOS.indexOf(s.servicio);
      if (posicion === -1) otros++;
      else porServicio[posicion]++;
    });

    var filas = [
      [window.Exportacion.titulo('Resumen de la exportación')],
      ['Generado', window.Exportacion.fecha(new Date().toISOString())],
      ['Solicitudes incluidas', visibles.length],
      ['Filtros aplicados', descripcionFiltros()],
      [],
      [window.Exportacion.titulo('Por estado')],
      [window.Exportacion.encabezado('Estado'), window.Exportacion.encabezado('Cantidad')],
      ['Nueva', porEstado.nueva],
      ['En revisión', porEstado.en_revision],
      ['Respondida', porEstado.respondida],
      ['Cerrada', porEstado.cerrada],
      [],
      [window.Exportacion.titulo('Por servicio')],
      [window.Exportacion.encabezado('Servicio'), window.Exportacion.encabezado('Cantidad')],
      [SERVICIOS.tecnico, porServicio[0]],
      [SERVICIOS.web, porServicio[1]],
      [SERVICIOS.soporte, porServicio[2]]
    ];
    if (otros) filas.push(['Otros', otros]);
    return filas;
  }

  function nombreArchivoExcel() {
    var partes = [];
    if (filtroEstadoEl.value) partes.push(filtroEstadoEl.value);
    if (filtroServicioEl.value) partes.push(filtroServicioEl.value);
    var consulta = buscarEl.value.trim();
    if (consulta) {
      var limpia = consulta.toLowerCase();
      if (limpia.normalize) limpia = limpia.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      limpia = limpia.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
      if (limpia) partes.push('q-' + limpia);
    }
    return 'solicitudes-' + new Date().toISOString().slice(0, 10) +
      (partes.length ? '-' + partes.join('-') : '') + '.xlsx';
  }

  function exportarExcel() {
    if (!window.Exportacion) {
      infoEl.textContent = 'No pudimos generar el archivo Excel (falta js/exportacion.js).';
      return;
    }
    var visibles = filtradas();
    if (!visibles.length) {
      infoEl.textContent = 'No hay solicitudes para exportar con esos filtros.';
      return;
    }

    var filas = [COLUMNAS_EXCEL.map(function (columna) {
      return window.Exportacion.encabezado(columna);
    })];
    agruparPorServicio(visibles).forEach(function (s, i) {
      filas.push(celdaExcel(s, i + 1));
    });

    try {
      var bytes = window.Exportacion.crear([
        { nombre: 'Solicitudes', filas: filas, anchos: ANCHOS_EXCEL },
        { nombre: 'Resumen', filas: hojaResumen(visibles), anchos: [34, 24], congelar: false, filtro: false }
      ]);
      window.Exportacion.descargar(nombreArchivoExcel(), bytes);
      infoEl.textContent = 'Excel exportado con ' + visibles.length + ' solicitud' + (visibles.length === 1 ? '' : 'es') + '.';
    } catch (e) {
      infoEl.textContent = 'No pudimos generar el archivo Excel: ' + e.message;
    }
  }

  /* ---------- Eventos ---------- */

  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = loginEmail.value.trim();
    var password = loginPassword.value;
    if (!email || !password) {
      loginError.textContent = 'Completá el correo y la contraseña.';
      loginError.hidden = false;
      (!email ? loginEmail : loginPassword).focus();
      return;
    }
    iniciarSesion(email, password);
  });

  btnSalir.addEventListener('click', salir);
  btnRecargar.addEventListener('click', cargarSolicitudes);
  btnExcel.addEventListener('click', exportarExcel);

  buscarEl.addEventListener('input', function () {
    window.clearTimeout(esperaBusqueda);
    esperaBusqueda = window.setTimeout(render, 150);
  });

  filtroEstadoEl.addEventListener('change', render);
  filtroServicioEl.addEventListener('change', render);

  btnGuardar.addEventListener('click', guardarDetalle);
  btnCerrarDialogo.addEventListener('click', cerrarDetalle);
  btnCancelarDetalle.addEventListener('click', cerrarDetalle);
  dialogo.addEventListener('click', function (e) {
    if (e.target === dialogo) cerrarDetalle();
  });

  /* ---------- Arranque ---------- */

  if (!configurado) {
    mostrarLogin();
    loginNota.hidden = false;
    loginNota.textContent = 'Todavía no hay proyecto Supabase configurado. Completá js/config.js con la URL y la anon key (paso a paso en supabase/INSTRUCCIONES.md).';
    btnLogin.disabled = true;
  } else {
    sesion = leerSesion();
    validarSesion();
  }
})();
