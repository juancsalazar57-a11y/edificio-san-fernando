/* Memo online: menú, formulario directo a Google Forms (no-cors) y pantallas posteriores. Sin dependencias. */
(function () {
  'use strict';
  var C = window.UPCFG || {};
  var F = C.form || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- menú móvil ---------- */
  var burger = $('.burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- origen (utm_source / utm_campaign / utm_content / f) ---------- */
  var qs = new URLSearchParams(location.search);
  function origen() {
    var parts = [];
    if (qs.get('utm_source')) parts.push('utm_source=' + qs.get('utm_source'));
    if (qs.get('utm_campaign')) parts.push('utm_campaign=' + qs.get('utm_campaign'));
    if (qs.get('utm_content')) parts.push('utm_content=' + qs.get('utm_content'));
    if (qs.get('f')) parts.push('f=' + qs.get('f'));
    return (parts.join(' | ') || 'directo').slice(0, 200);
  }

  /* ---------- botones al formulario y barra fija en celular ---------- */
  var formBox = $('#formulario');
  document.querySelectorAll('a[href="#formulario"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!formBox) return;
      e.preventDefault();
      formBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var n = $('#f-nombre');
      if (n && window.matchMedia('(min-width: 981px)').matches) setTimeout(function () { n.focus({ preventScroll: true }); }, 450);
    });
  });
  var barra = $('#barra-cta'), ctaHero = $('#cta-hero');
  if (barra && ctaHero && formBox && 'IntersectionObserver' in window) {
    var heroVisible = true, formVisible = false;
    var upd = function () { barra.hidden = heroVisible || formVisible; };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; upd(); }).observe(ctaHero);
    new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; upd(); }, { threshold: 0.1 }).observe(formBox);
  }

  var form = $('#form');
  if (!form) return;
  $('#f-origen').value = origen();

  /* obligatoriedad = la del Google Form (config.js) */
  var req = F.required || {};
  Object.keys(req).forEach(function (k) {
    var el = form.elements[k];
    if (el) el.required = !!req[k];
  });

  /* mensajes de validación en español */
  var MSG = {
    nombre: 'Escribe tu nombre completo.',
    celular: 'Escribe un celular colombiano de 10 dígitos, por ejemplo 300 123 4567.',
    correo: 'Escribe un correo válido, por ejemplo nombre@correo.com.',
    compra: 'Elige cómo harías la compra.',
    plazo: 'Elige el plazo.',
    perfil: 'Elige tu perfil.',
    autorizacion: 'Debes autorizar el tratamiento de tus datos para continuar.'
  };
  Array.prototype.forEach.call(form.elements, function (el) {
    if (!el.name || !MSG[el.name]) return;
    el.addEventListener('invalid', function () { el.setCustomValidity(MSG[el.name]); });
    var clear = function () { el.setCustomValidity(''); };
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });

  /* ---------- pantallas posteriores ---------- */
  var COMPRA_FRASE = {
    'De contado': 'de contado',
    'Contado más un inmueble en permuta': 'de contado más un inmueble en permuta',
    'Con crédito o leasing ya aprobado': 'con crédito o leasing ya aprobado'
  };
  var CALIF_COMPRA = Object.keys(COMPRA_FRASE);
  var CALIF_PLAZO = ['En los próximos 3 meses', 'Entre 3 y 6 meses'];

  /* Regla: inmobiliaria primero (el kit es lo que necesita), luego calificado, luego explorando */
  function clasificar(r) {
    if (r.perfil === 'Inmobiliaria o asesor') return 'r';
    if (CALIF_COMPRA.indexOf(r.compra) > -1 && CALIF_PLAZO.indexOf(r.plazo) > -1) return 'c';
    return 'e';
  }
  window.__clasificar = clasificar; /* para pruebas */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(text, href, cls, ext) {
    var a = el('a', cls, text);
    a.href = href;
    if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  function waHref(r) {
    var num = String(C.whatsapp_papa || '').replace(/\D/g, '');
    if (!num) return '';
    var msg = 'Hola, vi el edificio de San Fernando y quiero más información.';
    if (r && COMPRA_FRASE[r.compra] && r.plazo) {
      msg += ' Compraría ' + COMPRA_FRASE[r.compra] + ' ' + r.plazo.charAt(0).toLowerCase() + r.plazo.slice(1) + '.';
    }
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  }

  function pantalla(kind, r) {
    var box = el('div', 'pant');
    box.setAttribute('data-pantalla', kind);
    box.appendChild(el('span', 'eyebrow', 'Venta directa'));
    var h = el('h2');
    var nombre = r && r.nombre ? r.nombre.trim().split(/\s+/)[0] : '';
    if (kind === 'c') {
      h.textContent = (nombre ? 'Listo, ' + nombre + '. ' : 'Listo. ') + 'El propietario te escribe hoy.';
      box.appendChild(h);
      box.appendChild(el('p', null, 'Mientras tanto, revisa el memo con fotos y números.'));
      var wa = waHref(r);
      if (wa) {
        var lw = link('Escríbele por WhatsApp', wa, 'btn', true);
        lw.addEventListener('click', function () { if (window.fbq) window.fbq('track', 'Contact', { content_name: 'whatsapp_propietario' }); });
        box.appendChild(lw);
      }
      box.appendChild(link('Descarga el memo (PDF)', C.memo_pdf || 'assets/memo-inversion.pdf', wa ? 'btn line' : 'btn', true));
    } else if (kind === 'r') {
      h.textContent = 'Gracias. Aquí está el kit para referidoras.';
      box.appendChild(h);
      box.appendChild(link('Descarga el kit (PDF)', C.kit_pdf || 'assets/kit-referidoras.pdf', 'btn', true));
    } else {
      h.textContent = 'Gracias. Aquí está el memo.';
      box.appendChild(h);
      box.appendChild(el('p', null, 'Te escribimos para agendar la visita.'));
      box.appendChild(link('Descarga el memo (PDF)', C.memo_pdf || 'assets/memo-inversion.pdf', 'btn', true));
    }
    return box;
  }

  /* ?f=c|r|e (viene del formulario de Meta): pantalla directa arriba del hero */
  var f = (qs.get('f') || '').toLowerCase();
  if (f === 'c' || f === 'r' || f === 'e') {
    var top = $('#pantalla-top');
    var card = el('div', 'fcard');
    card.appendChild(pantalla(f, null));
    top.appendChild(card);
    top.hidden = false;
  }

  /* ---------- envío ---------- */
  var err = $('#ferr'), btn = $('#fbtn');
  function showErr(t) { err.textContent = t; err.hidden = false; }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    err.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var r = {};
    ['nombre', 'celular', 'correo', 'compra', 'plazo', 'perfil', 'origen'].forEach(function (k) {
      r[k] = (form.elements[k].value || '').trim();
    });
    if (!F.action || !F.entries) {
      console.error('config.js: falta form.action o form.entries');
      showErr('No pudimos enviar tus datos. Inténtalo de nuevo en unos minutos.');
      return;
    }
    var body = new URLSearchParams();
    ['nombre', 'celular', 'correo', 'compra', 'plazo', 'perfil', 'origen'].forEach(function (k) {
      if (F.entries[k] && r[k]) body.append(F.entries[k], r[k]);
    });
    if (form.elements.autorizacion.checked && F.entries.autorizacion) {
      body.append(F.entries.autorizacion, F.autorizacion_valor || 'Autorizo el tratamiento de mis datos para esta venta');
    }
    if (F.pageHistory) body.append('pageHistory', F.pageHistory);

    btn.disabled = true;
    var prev = btn.textContent;
    btn.textContent = 'Enviando...';
    fetch(F.action, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () {
        var kind = clasificar(r);
        /* Meta Pixel: Lead para todo envío y LeadCalificado para compradores calificados. Sin datos personales. */
        if (window.fbq) {
          var evId = 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
          var cat = kind === 'c' ? 'calificado' : (kind === 'r' ? 'inmobiliaria' : 'explorando');
          window.fbq('track', 'Lead', { content_name: 'memo_edificio_san_fernando', content_category: cat }, { eventID: evId });
          if (kind === 'c') window.fbq('trackCustom', 'LeadCalificado', { content_name: 'memo_edificio_san_fernando' }, { eventID: evId + '-c' });
        }
        var pant = $('#fpant');
        pant.innerHTML = '';
        pant.appendChild(pantalla(kind, r));
        $('#fbody').hidden = true;
        pant.hidden = false;
        var a = $('#formulario');
        if (a && a.scrollIntoView && window.matchMedia('(max-width:980px)').matches) a.scrollIntoView({ block: 'start' });
        var c = $('#fcard'); if (c) c.scrollTop = 0;
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = prev;
        showErr('No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.');
      });
  });
})();
