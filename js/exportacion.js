(function () {
  'use strict';

  var EPOCA_EXCEL = Date.UTC(1899, 11, 30);
  var LIMITE_CELDA = 32767;
  var ESTILO_NORMAL = 0;
  var ESTILO_TITULO = 1;
  var ESTILO_FECHA = 2;
  var ESTILO_CABECERA = 3;

  var TABLA_CRC = (function () {
    var tabla = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var bit = n;
      for (var k = 0; k < 8; k++) bit = bit & 1 ? 0xEDB88320 ^ (bit >>> 1) : bit >>> 1;
      tabla[n] = bit >>> 0;
    }
    return tabla;
  })();

  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) crc = TABLA_CRC[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function aUtf8(texto) {
    var salida = [];
    for (var i = 0; i < texto.length; i++) {
      var codigo = texto.charCodeAt(i);
      if (codigo < 0x80) {
        salida.push(codigo);
      } else if (codigo < 0x800) {
        salida.push(0xC0 | (codigo >> 6), 0x80 | (codigo & 0x3F));
      } else if (codigo >= 0xD800 && codigo <= 0xDBFF && i + 1 < texto.length) {
        var siguiente = texto.charCodeAt(i + 1);
        if (siguiente >= 0xDC00 && siguiente <= 0xDFFF) {
          var punto = 0x10000 + ((codigo - 0xD800) << 10) + (siguiente - 0xDC00);
          salida.push(0xF0 | (punto >> 18), 0x80 | ((punto >> 12) & 0x3F), 0x80 | ((punto >> 6) & 0x3F), 0x80 | (punto & 0x3F));
          i++;
        } else {
          salida.push(0xEF, 0xBF, 0xBD);
        }
      } else if (codigo >= 0xDC00 && codigo <= 0xDFFF) {
        salida.push(0xEF, 0xBF, 0xBD);
      } else {
        salida.push(0xE0 | (codigo >> 12), 0x80 | ((codigo >> 6) & 0x3F), 0x80 | (codigo & 0x3F));
      }
    }
    return new Uint8Array(salida);
  }

  function limpiarXml(texto) {
    return texto.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  }

  function escaparXml(texto) {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function serialFecha(fecha) {
    var marca = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(),
      fecha.getHours(), fecha.getMinutes(), fecha.getSeconds());
    return Math.round(((marca - EPOCA_EXCEL) / 86400000) * 1e10) / 1e10;
  }

  function refCelda(fila, columna) {
    var letras = '';
    var indice = columna;
    while (indice >= 0) {
      letras = String.fromCharCode(65 + (indice % 26)) + letras;
      indice = Math.floor(indice / 26) - 1;
    }
    return letras + (fila + 1);
  }

  function celdaXml(ref, celda) {
    if (celda == null) return '';
    var valor = celda.v !== undefined ? celda.v : celda;
    var conEstilo = celda.s != null;
    var prefijo = conEstilo ? ' s="' + celda.s + '"' : '';
    if (valor == null || valor === '') {
      return conEstilo ? '<c r="' + ref + '"' + prefijo + '/>' : '';
    }
    if (valor instanceof Date) {
      if (isNaN(valor.getTime())) return conEstilo ? '<c r="' + ref + '"' + prefijo + '/>' : '';
      var estiloFecha = conEstilo ? celda.s : ESTILO_FECHA;
      return '<c r="' + ref + '" s="' + estiloFecha + '"><v>' + serialFecha(valor) + '</v></c>';
    }
    if (typeof valor === 'number') {
      if (!isFinite(valor)) return '';
      return '<c r="' + ref + '"' + prefijo + '><v>' + valor + '</v></c>';
    }
    var texto = escaparXml(limpiarXml(String(valor).slice(0, LIMITE_CELDA)));
    if (!texto) return conEstilo ? '<c r="' + ref + '"' + prefijo + '/>' : '';
    return '<c r="' + ref + '"' + prefijo + ' t="inlineStr"><is><t xml:space="preserve">' + texto + '</t></is></c>';
  }

  function hojaXml(hoja) {
    var filas = hoja.filas || [];
    var filasXml = [];
    var ultimaColumna = 0;

    filas.forEach(function (fila, i) {
      var celdas = '';
      fila.forEach(function (celda, j) {
        if (j + 1 > ultimaColumna) ultimaColumna = j + 1;
        celdas += celdaXml(refCelda(i, j), celda);
      });
      filasXml.push('<row r="' + (i + 1) + '">' + celdas + '</row>');
    });

    var dimension = 'A1:' + refCelda(Math.max(filas.length - 1, 0), Math.max(ultimaColumna - 1, 0));
    var congelar = hoja.congelar !== false && filas.length > 1;
    var vistas = congelar
      ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'
      : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';

    var columnas = '';
    (hoja.anchos || []).forEach(function (ancho, i) {
      columnas += '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + ancho + '" customWidth="1"/>';
    });

    var filtro = (hoja.filtro !== false && filas.length > 1)
      ? '<autoFilter ref="' + dimension + '"/>'
      : '';

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<dimension ref="' + dimension + '"/>' +
      vistas +
      '<sheetFormatPr defaultRowHeight="15"/>' +
      (columnas ? '<cols>' + columnas + '</cols>' : '') +
      '<sheetData>' + filasXml.join('') + '</sheetData>' +
      filtro +
      '</worksheet>';
  }

  function contenidoTipos(cantidad) {
    var hojas = '';
    for (var i = 1; i <= cantidad; i++) {
      hojas += '<Override PartName="/xl/worksheets/sheet' + i + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      hojas +
      '</Types>';
  }

  function relsRaiz() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>';
  }

  function libroXml(hojas) {
    var hojasXml = '';
    hojas.forEach(function (hoja, i) {
      var nombre = String(hoja.nombre || ('Hoja ' + (i + 1))).slice(0, 31).replace(/[\[\]\*\?\/\\:]/g, ' ');
      hojasXml += '<sheet name="' + escaparXml(nombre) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>';
    });
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets>' + hojasXml + '</sheets>' +
      '</workbook>';
  }

  function relsLibro(cantidad) {
    var relaciones = '';
    for (var i = 1; i <= cantidad; i++) {
      relaciones += '<Relationship Id="rId' + i + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + i + '.xml"/>';
    }
    relaciones += '<Relationship Id="rId' + (cantidad + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>';
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      relaciones +
      '</Relationships>';
  }

  function estilosXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy hh:mm"/></numFmts>' +
      '<fonts count="3">' +
      '<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
      '<font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
      '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>' +
      '</fonts>' +
      '<fills count="3">' +
      '<fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/><bgColor indexed="64"/></patternFill></fill>' +
      '</fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="4">' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
      '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
      '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      '</styleSheet>';
  }

  function marcasDos() {
    var ahora = new Date();
    return {
      hora: (ahora.getHours() << 11) | (ahora.getMinutes() << 5) | Math.floor(ahora.getSeconds() / 2),
      fecha: ((ahora.getFullYear() - 1980) << 9) | ((ahora.getMonth() + 1) << 5) | ahora.getDate()
    };
  }

  function concatenar(partes) {
    var total = 0;
    partes.forEach(function (parte) { total += parte.length; });
    var salida = new Uint8Array(total);
    var offset = 0;
    partes.forEach(function (parte) {
      salida.set(parte, offset);
      offset += parte.length;
    });
    return salida;
  }

  function empaquetar(entradas) {
    var marcas = marcasDos();
    var locales = [];
    var centrales = [];
    var desplazamiento = 0;
    var totalCentral = 0;

    entradas.forEach(function (entrada) {
      var nombre = aUtf8(entrada.nombre);
      var datos = entrada.datos;
      var crc = crc32(datos);

      var local = new Uint8Array(30 + nombre.length);
      var vistaLocal = new DataView(local.buffer);
      vistaLocal.setUint32(0, 0x04034b50, true);
      vistaLocal.setUint16(4, 20, true);
      vistaLocal.setUint16(6, 0x0800, true);
      vistaLocal.setUint16(8, 0, true);
      vistaLocal.setUint16(10, marcas.hora, true);
      vistaLocal.setUint16(12, marcas.fecha, true);
      vistaLocal.setUint32(14, crc, true);
      vistaLocal.setUint32(18, datos.length, true);
      vistaLocal.setUint32(22, datos.length, true);
      vistaLocal.setUint16(26, nombre.length, true);
      vistaLocal.setUint16(28, 0, true);
      local.set(nombre, 30);
      locales.push(local, datos);

      var central = new Uint8Array(46 + nombre.length);
      var vistaCentral = new DataView(central.buffer);
      vistaCentral.setUint32(0, 0x02014b50, true);
      vistaCentral.setUint16(4, 20, true);
      vistaCentral.setUint16(6, 20, true);
      vistaCentral.setUint16(8, 0x0800, true);
      vistaCentral.setUint16(10, 0, true);
      vistaCentral.setUint16(12, marcas.hora, true);
      vistaCentral.setUint16(14, marcas.fecha, true);
      vistaCentral.setUint32(16, crc, true);
      vistaCentral.setUint32(20, datos.length, true);
      vistaCentral.setUint32(24, datos.length, true);
      vistaCentral.setUint16(28, nombre.length, true);
      vistaCentral.setUint16(30, 0, true);
      vistaCentral.setUint16(32, 0, true);
      vistaCentral.setUint16(34, 0, true);
      vistaCentral.setUint16(36, 0, true);
      vistaCentral.setUint32(38, 0, true);
      vistaCentral.setUint32(42, desplazamiento, true);
      central.set(nombre, 46);
      centrales.push(central);

      desplazamiento += local.length + datos.length;
      totalCentral += central.length;
    });

    var final = new Uint8Array(22);
    var vistaFinal = new DataView(final.buffer);
    vistaFinal.setUint32(0, 0x06054b50, true);
    vistaFinal.setUint16(4, 0, true);
    vistaFinal.setUint16(6, 0, true);
    vistaFinal.setUint16(8, entradas.length, true);
    vistaFinal.setUint16(10, entradas.length, true);
    vistaFinal.setUint32(12, totalCentral, true);
    vistaFinal.setUint32(16, desplazamiento, true);
    vistaFinal.setUint16(20, 0, true);

    return concatenar(locales.concat(centrales, [final]));
  }

  function crear(hojas) {
    var partes = [
      { nombre: '[Content_Types].xml', datos: aUtf8(contenidoTipos(hojas.length)) },
      { nombre: '_rels/.rels', datos: aUtf8(relsRaiz()) },
      { nombre: 'xl/workbook.xml', datos: aUtf8(libroXml(hojas)) },
      { nombre: 'xl/_rels/workbook.xml.rels', datos: aUtf8(relsLibro(hojas.length)) },
      { nombre: 'xl/styles.xml', datos: aUtf8(estilosXml()) }
    ];
    hojas.forEach(function (hoja, i) {
      partes.push({
        nombre: 'xl/worksheets/sheet' + (i + 1) + '.xml',
        datos: aUtf8(hojaXml(hoja))
      });
    });
    return empaquetar(partes);
  }

  function descargar(nombre, bytes) {
    var blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    var url = URL.createObjectURL(blob);
    var enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  window.Exportacion = {
    titulo: function (valor) { return { v: String(valor), s: ESTILO_TITULO }; },
    encabezado: function (valor) { return { v: String(valor), s: ESTILO_CABECERA }; },
    fecha: function (iso) {
      if (!iso) return null;
      var fecha = new Date(iso);
      if (isNaN(fecha.getTime())) return null;
      return { v: fecha, s: ESTILO_FECHA };
    },
    texto: function (valor) { return { v: valor == null ? '' : String(valor), s: ESTILO_NORMAL }; },
    crear: crear,
    descargar: descargar
  };
})();
