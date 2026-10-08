/* Havenwell — JavaScript mínimo: menú móvil, lightbox de la galería y año del footer.
   Las preguntas frecuentes usan <details> nativo, así que funcionan sin JavaScript. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;

  /* Año del footer */
  var year = String(new Date().getFullYear());
  doc.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });

  /* Menú móvil a pantalla completa */
  var toggle = doc.querySelector('.nav-toggle');
  var menu = doc.getElementById('menu');
  if (toggle && menu) {
    var closeBtn = menu.querySelector('.nav-close');
    var desktop = window.matchMedia('(min-width: 1080px)');
    var isOpen = false;
    var focusables = function () {
      return Array.prototype.filter.call(menu.querySelectorAll('a[href], button'), function (el) {
        return el.offsetParent !== null;
      });
    };
    var setOpen = function (open, restoreFocus) {
      isOpen = open;
      menu.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { (closeBtn || focusables()[0]).focus(); }
      else if (restoreFocus) { toggle.focus(); }
    };
    toggle.addEventListener('click', function () { setOpen(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false, true); });
    menu.addEventListener('click', function (e) {
      if (isOpen && e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { setOpen(false, true); return; }
      if (e.key !== 'Tab') return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var onBreakpoint = function (e) { if (e.matches && isOpen) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else desktop.addListener(onBreakpoint);
  }

  /* Lightbox de la galería (sin JS, cada foto abre la imagen grande) */
  var links = Array.prototype.slice.call(doc.querySelectorAll('[data-lightbox]'));
  if (links.length && typeof HTMLDialogElement === 'function') {
    var icon = function (id) { return '<svg class="i" aria-hidden="true"><use href="#' + id + '"></use></svg>'; };
    var dlg = doc.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Fotos de la clínica');
    dlg.innerHTML =
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__caption"></figcaption></figure>' +
      '<p class="lightbox__count" aria-live="polite"></p>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Foto anterior">' + icon('i-chevron-left') + '</button>' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Foto siguiente">' + icon('i-chevron-right') + '</button>' +
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Cerrar">' + icon('i-x') + '</button>';
    doc.body.appendChild(dlg);

    var img = dlg.querySelector('.lightbox__img');
    var caption = dlg.querySelector('.lightbox__caption');
    var count = dlg.querySelector('.lightbox__count');
    var current = 0;

    var show = function (n) {
      current = (n + links.length) % links.length;
      var link = links[current];
      var thumb = link.querySelector('img');
      var fig = link.closest('figure');
      var cap = fig ? fig.querySelector('figcaption') : null;
      img.src = link.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      caption.textContent = cap ? cap.textContent : '';
      count.textContent = (current + 1) + ' / ' + links.length;
    };

    links.forEach(function (link, n) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        show(n);
        dlg.showModal();
      });
    });
    dlg.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    dlg.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    dlg.querySelector('.lightbox__close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'ArrowLeft') show(current - 1);
    });
    var startX = null;
    dlg.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });
    dlg.addEventListener('close', function () { links[current].focus(); });
  }

  /* Formulario de contacto: abre WhatsApp con el mensaje armado (no hay backend) */
  var form = doc.querySelector('[data-wa-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var el = form.elements;
      var pet = form.querySelector('input[name="mascota"]:checked');
      var lines = [
        'Hola, soy ' + el.nombre.value.trim() + '.',
        'Mascota: ' + (pet ? pet.value : ''),
        'Motivo: ' + el.motivo.value,
        'Mi WhatsApp: ' + el.whatsapp.value.trim()
      ];
      var note = el.mensaje.value.trim();
      if (note) lines.push('Mensaje: ' + note);
      var url = 'https://wa.me/5217295753528?text=' + encodeURIComponent(lines.join('\n'));
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    });
  }
})();
