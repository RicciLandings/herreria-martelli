// Arma la página a partir de una configuración (site_config) y las categorías de trabajos.
// La usa index.html (web pública) y el panel (vista previa con ?edit=1).
(function () {
  const DEFAULT = {
    theme: { bg: '#efe9de', bgAlt: '#e2d9c8', text: '#0e0d0a', muted: '#57524a', accent: '#a5461f', dark: '#1c1b17',
             font: 'Archivo', baseSize: 16, headingWeight: 600 },
    sections: [
      { id: 'hero', visible: true, space: 1 },
      { id: 'trabajos', visible: true, space: 1 },
      { id: 'sobre', visible: true, space: 1 },
      { id: 'contacto', visible: true, space: 1 },
    ],
    hero: { images: ['images/pergola-urbana.jpg', 'images/pergola-terraza.jpg'], focus: 'center', height: 100, interval: 7 },
    intro: { enabled: true },
    gallery: { layout: 'grid', columns: 3, ratio: '4/5', gap: 1 },
    contact: { whatsapp: '5491148891662', message: 'Hola! Quisiera un presupuesto para un trabajo de herrería.' },
    texts: {
      brand: 'Herrería Martelli',
      nav_trabajos: 'Trabajos', nav_sobre: 'Sobre el taller', nav_contacto: 'Contacto',
      hero_eyebrow: 'Herrería · Zona Norte',
      hero_title: 'Hierro trabajado\na mano, hecho a medida.',
      hero_text: 'Pérgolas, portones, rejas y aberturas para tu casa o tu negocio. Cada pieza se diseña, se fabrica y se instala a medida del lugar donde va a vivir.',
      hero_cta: 'Pedir presupuesto',
      trabajos_eyebrow: 'Nuestro trabajo', trabajos_title: 'Trabajos',
      trabajos_sub: 'Diseño · Fabricación · Instalación',
      trabajos_hint: 'Tocá una foto para verla en grande.', filter_all: 'Todos',
      sobre_eyebrow: 'El taller', sobre_title: 'Sobre el taller',
      sobre_zona: 'Zona Norte\nVicente López',
      sobre_p1: 'No solo fabricamos: diseñamos y desarrollamos cada proyecto, desde la primera idea hasta la instalación.',
      sobre_p2: 'Prestamos atención a cada detalle para que el hierro se integre al espacio, sea firme y dure en el tiempo.',
      contacto_eyebrow: 'Contacto', contacto_title: 'Hablemos de tu proyecto',
      contacto_lead: 'Contanos qué necesitás —una pérgola, un portón, una reja, una puerta— y te respondemos con un presupuesto.',
      contacto_cta: 'Escribir por WhatsApp →',
      lbl_tel: 'Teléfono', val_tel: '+54 9 11 4889-1662',
      lbl_mail: 'Email', val_mail: 'contacto@herreriamartelli.com',
      lbl_zona: 'Zona', val_zona: 'Zona Norte · Vicente López',
      lbl_ig: 'Instagram', val_ig: '@herreriamartelli',
      footer_left: '© Herrería Martelli', footer_right: 'Hecho a mano en Vicente López',
      wa_float: 'Pedir presupuesto por WhatsApp',
      intro_title: 'Herrería Martelli', intro_btn: 'Ingresar',
    },
    styles: {}, // { clave: {size, weight, spacing, align} }
  };

  // Nombres legibles de cada texto, agrupados por sección (los usa el panel)
  const TEXT_META = [
    ['Pantalla de inicio', [['intro_title', 'Título'], ['intro_btn', 'Botón']]],
    ['Menú', [['brand', 'Nombre'], ['nav_trabajos', 'Link Trabajos'], ['nav_sobre', 'Link Sobre el taller'], ['nav_contacto', 'Link Contacto']]],
    ['Portada', [['hero_eyebrow', 'Volanta'], ['hero_title', 'Título'], ['hero_text', 'Texto'], ['hero_cta', 'Botón']]],
    ['Trabajos', [['trabajos_eyebrow', 'Volanta'], ['trabajos_title', 'Título'], ['trabajos_sub', 'Servicios'], ['filter_all', 'Botón "Todos"'], ['trabajos_hint', 'Ayuda']]],
    ['Sobre el taller', [['sobre_eyebrow', 'Volanta'], ['sobre_title', 'Título'], ['sobre_zona', 'Zona'], ['sobre_p1', 'Párrafo 1'], ['sobre_p2', 'Párrafo 2']]],
    ['Contacto', [['contacto_eyebrow', 'Volanta'], ['contacto_title', 'Título'], ['contacto_lead', 'Texto'], ['contacto_cta', 'Botón'],
      ['lbl_tel', 'Etiqueta teléfono'], ['val_tel', 'Teléfono'], ['lbl_mail', 'Etiqueta email'], ['val_mail', 'Email'],
      ['lbl_zona', 'Etiqueta zona'], ['val_zona', 'Zona'], ['lbl_ig', 'Etiqueta Instagram'], ['val_ig', 'Instagram']]],
    ['Pie y botón flotante', [['footer_left', 'Pie izquierda'], ['footer_right', 'Pie derecha'], ['wa_float', 'Botón flotante']]],
  ];
  const SECTION_NAMES = { hero: 'Portada', trabajos: 'Trabajos', sobre: 'Sobre el taller', contacto: 'Contacto' };
  const FONTS = ['Archivo', 'Inter', 'IBM Plex Sans', 'DM Sans', 'Manrope', 'Helvetica'];
  const FOCUS = { center: '50% 50%', top: '50% 0%', bottom: '50% 100%', left: '0% 50%', right: '100% 50%' };

  const clone = o => JSON.parse(JSON.stringify(o));
  function merge(saved) {
    const c = clone(DEFAULT);
    if (!saved) return c;
    for (const k of ['theme', 'hero', 'intro', 'gallery', 'contact', 'texts', 'styles']) Object.assign(c[k], saved[k] || {});
    // compatibilidad: antes la portada tenía una sola foto
    if (saved.hero && saved.hero.image && !(saved.hero.images && saved.hero.images.length) && saved.hero.image !== 'images/pergola-urbana.jpg') c.hero.images = [saved.hero.image];
    delete c.hero.image;
    if (!c.hero.images.length) c.hero.images = clone(DEFAULT.hero.images);
    if (Array.isArray(saved.sections)) {
      const ids = saved.sections.map(s => s.id).filter(id => SECTION_NAMES[id]);
      c.sections = saved.sections.filter(s => SECTION_NAMES[s.id]).map(s => ({ ...DEFAULT.sections.find(d => d.id === s.id), ...s }))
        .concat(DEFAULT.sections.filter(d => !ids.includes(d.id)));
    }
    return c;
  }

  const loadedFonts = new Set(['Archivo']);
  function fontStack(name) {
    if (name === 'Helvetica') return '"Helvetica Neue", Helvetica, Arial, sans-serif';
    if (!loadedFonts.has(name)) {
      loadedFonts.add(name);
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + name.replace(/ /g, '+') + ':wght@300;400;500;600;700;800&display=swap';
      document.head.appendChild(l);
    }
    return '"' + name + '", "Helvetica Neue", Arial, sans-serif';
  }

  let state = { cfg: merge(null), cats: [], filter: 'all' };
  let edit = null; // handlers del panel cuando está en modo edición

  const waUrl = c => 'https://wa.me/' + c.contact.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(c.contact.message);
  const T = k => `<span data-k="${k}"></span>`;
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  // ---------- secciones ----------
  const SECTIONS = {
    hero: c => `
      <section class="hero" id="inicio" data-sec="hero">
        <div class="hero-media" data-img="hero"></div>
        <div class="hero-content">
          <div class="eyebrow"><span class="grid-mark"><span></span><span></span><span></span><span></span></span>${T('hero_eyebrow')}</div>
          <h1>${T('hero_title')}</h1>
          <p>${T('hero_text')}</p>
          <a class="cta cta-hero wa-link" target="_blank" rel="noopener">${T('hero_cta')}</a>
        </div>
      </section>`,
    trabajos: c => `
      <section class="gallery" id="trabajos" data-sec="trabajos">
        <div class="section-head">
          <span class="eyebrow">${T('trabajos_eyebrow')}</span><div class="rule"></div><h2>${T('trabajos_title')}</h2>
        </div>
        <p class="services-line">${T('trabajos_sub')}</p>
        <div class="filters" id="filtros" role="tablist" aria-label="Filtrar por rubro"></div>
        <div class="gallery-grid ${c.gallery.layout === 'carousel' ? 'carousel' : ''}" id="galeria"></div>
        <p class="gallery-note">${T('trabajos_hint')}</p>
      </section>`,
    sobre: c => `
      <section class="about" id="sobre" data-sec="sobre">
        <div class="section-head full">
          <span class="eyebrow">${T('sobre_eyebrow')}</span><div class="rule"></div><h2>${T('sobre_title')}</h2>
        </div>
        <p class="about-zone">${T('sobre_zona')}</p>
        <div class="about-text"><p>${T('sobre_p1')}</p><p>${T('sobre_p2')}</p></div>
      </section>`,
    contacto: c => `
      <section class="contact" id="contacto" data-sec="contacto">
        <div class="section-head">
          <span class="eyebrow">${T('contacto_eyebrow')}</span><div class="rule"></div><h2>${T('contacto_title')}</h2>
        </div>
        <div class="contact-grid">
          <div>
            <p class="lead">${T('contacto_lead')}</p>
            <a class="cta wa-link" target="_blank" rel="noopener">${T('contacto_cta')}</a>
          </div>
          <ul class="contact-list">
            <li><span class="label">${T('lbl_tel')}</span><a class="tel-link">${T('val_tel')}</a></li>
            <li><span class="label">${T('lbl_mail')}</span><a class="mail-link">${T('val_mail')}</a></li>
            <li><span class="label">${T('lbl_zona')}</span><span>${T('val_zona')}</span></li>
            <li><span class="label">${T('lbl_ig')}</span><a class="ig-link" target="_blank" rel="noopener">${T('val_ig')}</a></li>
          </ul>
        </div>
      </section>`,
  };

  function render(cfg, cats) {
    if (cfg) state.cfg = merge(cfg);
    if (cats) state.cats = cats;
    const c = state.cfg, th = c.theme, root = document.documentElement;
    const y = window.scrollY;

    // Diseño general
    root.style.setProperty('--paper', th.bg);
    root.style.setProperty('--paper-deep', th.bgAlt);
    root.style.setProperty('--ink', th.text);
    root.style.setProperty('--grey', th.muted);
    root.style.setProperty('--ember', th.accent);
    root.style.setProperty('--steel', th.dark);
    root.style.setProperty('--font', fontStack(th.font));
    root.style.setProperty('--hw', th.headingWeight);
    root.style.fontSize = th.baseSize + 'px';
    root.style.setProperty('--cols', c.gallery.columns);
    root.style.setProperty('--ratio', c.gallery.ratio);
    root.style.setProperty('--gap', c.gallery.gap);
    root.style.setProperty('--hero-h', c.hero.height);

    const visible = c.sections.filter(s => s.visible || s.id === 'hero');
    const navIds = visible.map(s => s.id).filter(id => id !== 'hero');
    document.getElementById('app').innerHTML = `
      <header id="site-header">
        <a class="brand" href="#inicio">${T('brand')}</a>
        <button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="mainNav"><span></span><span></span><span></span></button>
        <nav id="mainNav">${navIds.map(id => `<a href="#${id}">${T('nav_' + id)}</a>`).join('')}</nav>
      </header>
      <div class="nav-backdrop" id="navBackdrop"></div>
      ${visible.map(s => SECTIONS[s.id](c)).join('')}
      <footer><span>${T('footer_left')}</span><span>${T('footer_right')}</span></footer>
      <a class="wa-float wa-link" id="waFloat" target="_blank" rel="noopener">${T('wa_float')}</a>`;

    // Espaciado por sección
    visible.forEach(s => { const el = document.querySelector(`[data-sec="${s.id}"]`); if (el) el.style.setProperty('--py', s.space); });

    // Textos y estilos por texto
    document.querySelectorAll('[data-k]').forEach(el => fillText(el));

    // Links
    const wa = waUrl(c);
    document.querySelectorAll('.wa-link').forEach(a => a.href = wa);
    const tel = document.querySelector('.tel-link'); if (tel) tel.href = 'tel:+' + (c.texts.val_tel || '').replace(/\D/g, '');
    const mail = document.querySelector('.mail-link'); if (mail) mail.href = 'mailto:' + (c.texts.val_mail || '').trim();
    const ig = document.querySelector('.ig-link'); if (ig) ig.href = 'https://instagram.com/' + (c.texts.val_ig || '').replace(/^@/, '').trim();

    // Portada (una o varias fotos que cambian solas)
    renderHero();

    // Trabajos con filtros por rubro
    renderGallery();

    bind();
    if (edit) enableEditing(); else reveal();
    window.scrollTo(0, y);
  }

  // Cambio de filtro: salen las fotos actuales y después entran las nuevas
  let switchToken = 0;
  function switchGallery() {
    const g = document.getElementById('galeria');
    const token = ++switchToken;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('#filtros .chip').forEach(c => c.classList.toggle('on', c.dataset.id === state.filter));
    g.style.minHeight = g.offsetHeight + 'px';
    g.querySelectorAll('.work').forEach(f => { f.classList.remove('pop'); f.classList.add('leaving'); });
    setTimeout(() => {
      if (token !== switchToken) return;
      renderGallery(!reduce);
      setTimeout(() => { if (token === switchToken) g.style.minHeight = ''; }, 1600);
    }, reduce ? 0 : 320);
  }

  function renderGallery(animate) {
    const g = document.getElementById('galeria'), fl = document.getElementById('filtros');
    if (!g) return;
    stopCards();
    const cats = state.cats.filter(c => c.fotos.length);
    if (state.filter !== 'all' && !cats.some(c => c.id === state.filter)) state.filter = 'all';
    // botones de rubro
    fl.innerHTML = '';
    const chip = (id, label) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip' + (state.filter === id ? ' on' : ''); b.dataset.id = id;
      b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', state.filter === id);
      if (id === 'all') b.innerHTML = T('filter_all'); else b.textContent = label;
      b.onclick = e => {
        if (edit && e.target.closest('[data-k]')) return;
        if (state.filter === id) return;
        state.filter = id;
        switchGallery();
      };
      fl.appendChild(b);
    };
    chip('all');
    cats.forEach(c => chip(c.id, c.nombre));
    fl.querySelectorAll('[data-k]').forEach(fillText);
    if (edit) fl.querySelectorAll('[data-k]').forEach(makeEditable);
    fl.hidden = cats.length < 2;
    // trabajos: cada foto principal con sus detalles
    const list = [];
    cats.forEach(c => { if (state.filter === 'all' || state.filter === c.id) c.fotos.forEach(f =>
      list.push({ nombre: c.nombre, encuadre: c.encuadre, imgs: [f.path].concat((f.detalles || []).map(d => d.path)) })); });
    g.innerHTML = '';
    list.forEach((it, i) => {
      const f = document.createElement('figure');
      f.className = 'work' + (animate ? ' pop' : '');
      if (animate) f.style.animationDelay = Math.min(i, 10) * 90 + 'ms';
      const multi = it.imgs.length > 1;
      f.innerHTML = `<button type="button" class="frame" aria-label="Ver ${esc(it.nombre)} en grande"><div class="slides"></div>
          ${multi ? '<span class="frame-count"></span>' : ''}</button>
        <figcaption><span class="tag"></span>${multi ? '<div class="thumbs" role="tablist"></div>' : ''}</figcaption>`;
      const track = f.querySelector('.slides');
      it.imgs.forEach((path, j) => {
        const img = document.createElement('img');
        img.alt = it.nombre + (j ? ' — detalle ' + j : '');
        img.loading = 'lazy';
        img.style.objectPosition = FOCUS[it.encuadre] || FOCUS.center;
        img.onload = () => img.classList.add('ld');
        img.src = Store.url(path);
        if (img.complete) img.classList.add('ld');
        track.appendChild(img);
      });
      if (multi) { const loop = track.firstChild.cloneNode(); loop.alt = ''; loop.setAttribute('aria-hidden', 'true'); loop.classList.add('ld'); track.appendChild(loop); }
      f.querySelector('.tag').textContent = it.nombre;
      const card = { el: f, n: it.imgs.length, i: 0, timer: null, user: false };
      if (multi) {
        const th = f.querySelector('.thumbs');
        it.imgs.forEach((path, j) => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'thumb' + (j ? '' : ' on');
          b.setAttribute('aria-label', j ? 'Detalle ' + j : 'Foto principal');
          b.innerHTML = '<img alt="" loading="lazy">';
          b.querySelector('img').src = Store.url(path);
          b.onclick = () => { card.user = true; stopCard(card); goCard(card, j); };
          th.appendChild(b);
        });
        cards.push(card);
        cardObserver().observe(f);
      }
      goCard(card, 0, true);
      f.querySelector('.frame').onclick = () => openLightbox(it.imgs.map(p => ({ path: p, nombre: it.nombre })), card.i);
      g.appendChild(f);
    });
    if (!list.length) g.innerHTML = '<p class="gallery-empty">Pronto vas a ver acá nuestros trabajos.</p>';
    if (!animate && !edit) revealWorks();
  }

  // ---------- tarjetas con detalles: miniaturas y paneo automático ----------
  let cards = [], cardIO = null;
  // j puede valer n (la copia de la primera foto): se anima hasta ahí y después salta sin animación a 0
  function goCard(card, j, instant) {
    const track = card.el.querySelector('.slides');
    clearTimeout(card.wrap);
    if (instant) track.style.transition = 'none';
    track.style.transform = `translate3d(${-j * 100}%, 0, 0)`;
    if (instant) { track.offsetWidth; track.style.transition = ''; }
    card.i = j % card.n;
    if (j === card.n) card.wrap = setTimeout(() => goCard(card, 0, true), 1150);
    card.el.querySelectorAll('.thumb').forEach((t, k) => t.classList.toggle('on', k === card.i));
    const cnt = card.el.querySelector('.frame-count');
    if (cnt) cnt.textContent = (card.i + 1) + ' / ' + card.n;
  }
  function startCard(card) {
    if (card.user || card.timer || edit || reduceMotion()) return;
    // primero se ve la foto principal un rato, después pasan los detalles
    const DUR = 2600;
    const step = () => { goCard(card, card.i + 1); progress(card, DUR); card.timer = setTimeout(step, DUR); };
    progress(card, 1000);
    card.timer = setTimeout(step, 1000);
  }
  // barra que se llena en la miniatura activa: muestra que la foto va a cambiar sola
  function progress(card, ms) {
    card.el.querySelectorAll('.thumb i').forEach(b => b.remove());
    const t = card.el.querySelectorAll('.thumb')[card.i];
    if (!t) return;
    const bar = document.createElement('i');
    bar.style.animationDuration = ms + 'ms';
    t.appendChild(bar);
  }
  function stopCard(card) {
    clearTimeout(card.timer); card.timer = null;
    card.el.querySelectorAll('.thumb i').forEach(b => b.remove());
  }
  function stopCards() { cards.forEach(stopCard); cards = []; if (cardIO) cardIO.disconnect(); }
  function cardObserver() {
    if (cardIO) return cardIO;
    cardIO = new IntersectionObserver(entries => entries.forEach(e => {
      const card = cards.find(c => c.el === e.target);
      if (!card) return;
      if (e.isIntersecting && !introOpen) startCard(card); else stopCard(card);
    }), { threshold: 0.35 });
    return cardIO;
  }

  // ---------- portada con varias fotos ----------
  let heroTimer = null;
  function renderHero() {
    const box = document.querySelector('.hero-media');
    clearInterval(heroTimer);
    if (!box) return;
    const c = state.cfg.hero;
    box.innerHTML = '';
    c.images.forEach((path, i) => {
      const img = document.createElement('img');
      img.className = 'hero-img' + (i === 0 ? ' on' : '');
      img.alt = i === 0 ? 'Trabajo de Herrería Martelli' : '';
      img.style.objectPosition = FOCUS[c.focus] || FOCUS.center;
      if (i > 0) img.loading = 'lazy';
      img.src = Store.url(path);
      box.appendChild(img);
    });
    if (c.images.length < 2 || edit || reduceMotion()) return;
    let i = 0;
    heroTimer = setInterval(() => {
      const imgs = box.querySelectorAll('.hero-img');
      if (!imgs.length) return clearInterval(heroTimer);
      imgs[i].classList.remove('on'); imgs[i].classList.add('off');
      const prev = imgs[i];
      setTimeout(() => prev.classList.remove('off'), 2600);
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('on');
    }, Math.max(4, c.interval) * 1000);
  }

  // ---------- animaciones de entrada ----------
  // Títulos: cada palabra sube desde detrás de una máscara (como en webs editoriales).
  // Textos: aparecen con un fundido corto. Fotos: se descubren de abajo hacia arriba.
  let io = null, introOpen = false;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    let n = 0;
    el.querySelectorAll('[data-k]').forEach(span => {
      const parts = span.textContent.split(/(\s+)/);
      span.textContent = '';
      parts.forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          if (p.includes('\n')) span.appendChild(document.createElement('br'));
          else span.appendChild(document.createTextNode(' '));
          return;
        }
        const w = document.createElement('span'); w.className = 'w';
        const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p;
        wi.style.setProperty('--wi', n++);
        w.appendChild(wi); span.appendChild(w);
      });
    });
  }
  function reveal() {
    if (reduceMotion()) return;
    if (io) io.disconnect();
    document.querySelectorAll('.hero h1, .section-head h2, .about-zone').forEach(splitWords);
    const groups = [
      ['.hero-content .eyebrow, .hero h1, .hero p, .hero .cta', 0.1, [0, 0.12, 0.75, 0.95]],
      ['.gallery .section-head, .services-line, .filters, .gallery-note', 0, 0.12],
      ['.about .section-head, .about-zone, .about-text p', 0, 0.14],
      ['.contact .section-head, .contact .lead, .contact .cta, .contact-list li', 0, 0.08],
    ];
    groups.forEach(([sel, base, step]) => document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (el.querySelector('.w')) el.classList.add('words');
      const d = Array.isArray(step) ? base + (step[i] || 0) : base + i * step;
      el.style.setProperty('--d', d.toFixed(2) + 's');
    }));
    if (!introOpen) observe();
  }
  function revealWorks() {
    if (reduceMotion()) return;
    document.querySelectorAll('.work:not(.pop)').forEach((el, i) => {
      el.classList.add('reveal', 'img-reveal');
      el.style.setProperty('--d', ((i % 3) * 0.12).toFixed(2) + 's');
      if (io && !introOpen) io.observe(el);
    });
  }
  function observe() {
    if (reduceMotion()) return;
    document.documentElement.classList.add('ready');
    io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
    cards.forEach(c => { const r = c.el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) startCard(c); });
  }

  // ---------- pantalla de inicio ----------
  function showIntro(preview) {
    const c = state.cfg;
    let el = document.getElementById('intro');
    if (el) el.remove();
    el = document.createElement('div');
    el.id = 'intro'; el.className = 'intro';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Bienvenida');
    el.innerHTML = `<div class="intro-in">
        <span class="grid-mark"><span></span><span></span><span></span><span></span></span>
        <h1 class="intro-title"></h1><span class="intro-line"></span>
        <button type="button" class="intro-btn"><span></span><i aria-hidden="true">→</i></button>
      </div>`;
    el.querySelector('.intro-title').textContent = c.texts.intro_title || DEFAULT.texts.intro_title;
    el.querySelector('.intro-btn span').textContent = c.texts.intro_btn || DEFAULT.texts.intro_btn;
    document.body.appendChild(el);
    document.body.classList.add('intro-lock');
    if (!preview) introOpen = true;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    const btn = el.querySelector('.intro-btn');
    const close = () => {
      if (el.classList.contains('leave')) return;
      el.classList.add('leave');
      document.body.classList.remove('intro-lock');
      try { sessionStorage.setItem('mh_intro', '1'); } catch {}
      setTimeout(() => { if (introOpen) { introOpen = false; observe(); } }, 450);
      setTimeout(() => el.remove(), 1500);
    };
    btn.onclick = close;
    const onKey = e => { if (e.key === 'Enter' || e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(); } };
    document.addEventListener('keydown', onKey);
  }

  function fillText(el) {
    const k = el.dataset.k, c = state.cfg;
    el.textContent = c.texts[k] != null ? c.texts[k] : (DEFAULT.texts[k] || '');
    const st = c.styles[k] || {};
    el.style.fontSize = st.size && st.size != 1 ? st.size + 'em' : '';
    el.style.fontWeight = st.weight || '';
    el.style.letterSpacing = st.spacing ? st.spacing + 'em' : '';
    const block = el.parentElement;
    if (block) block.style.textAlign = st.align || '';
  }

  // ---------- comportamiento ----------
  function bind() {
    const header = document.getElementById('site-header');
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const setMenu = open => {
      nav.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.onclick = () => setMenu(!nav.classList.contains('open'));
    document.getElementById('navBackdrop').onclick = () => setMenu(false);
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    onScroll();
  }

  let ticking = false, lastY = 0;
  function parallax() {
    ticking = false;
    if (edit || reduceMotion()) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const h = hero.offsetHeight, y = Math.min(window.scrollY, h), p = y / h;
    const hc = hero.querySelector('.hero-content'), media = hero.querySelector('.hero-media');
    // la página baja normal; la foto se mueve más lento (profundidad) y el texto se desvanece
    media.style.transform = `translate3d(0, ${(y * 0.35).toFixed(1)}px, 0)`;
    hc.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
    hc.style.opacity = Math.max(0, 1 - p * 2.2).toFixed(3);
    hero.style.setProperty('--shade', (p * 0.45).toFixed(3));
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    const header = document.getElementById('site-header');
    // el menú se esconde al bajar y vuelve al subir (sólido fuera de la portada)
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('solid', y > 40);
      if (!document.body.classList.contains('menu-open')) header.classList.toggle('away', y > 120 && y > lastY + 2 ? true : y < lastY - 2 ? false : header.classList.contains('away'));
      if (y < 120) header.classList.remove('away');
    }
    lastY = y;
    const wa = document.getElementById('waFloat');
    const contacto = document.getElementById('contacto');
    if (wa) {
      const pastHero = window.scrollY > window.innerHeight * 0.6;
      const atContact = contacto && contacto.getBoundingClientRect().top < window.innerHeight * 0.8;
      wa.classList.toggle('show', pastHero && !atContact);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- visor de fotos ----------
  let lbCat = null;
  function openLightbox(list, index) {
    lbCat = { fotos: list };
    const lb = document.getElementById('lightbox');
    const track = lb.querySelector('.lb-track');
    track.innerHTML = '';
    list.forEach(f => {
      const d = document.createElement('div');
      d.className = 'lb-slide';
      d.innerHTML = '<img alt="">';
      d.querySelector('img').src = Store.url(f.path);
      d.querySelector('img').alt = f.nombre;
      track.appendChild(d);
    });
    lb.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => { track.scrollLeft = index * track.clientWidth; updateCount(); });
  }
  function updateCount() {
    const track = document.querySelector('#lightbox .lb-track');
    const i = Math.round(track.scrollLeft / track.clientWidth);
    document.querySelector('#lightbox .lb-count').textContent = (i + 1) + ' / ' + lbCat.fotos.length;
  }
  function lbStep(d) {
    const track = document.querySelector('#lightbox .lb-track');
    track.scrollBy({ left: d * track.clientWidth, behavior: 'smooth' });
  }
  function closeLightbox() { document.getElementById('lightbox').hidden = true; document.body.classList.remove('modal-open'); }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true">
        <div class="lb-track"></div>
        <button class="lb-btn lb-prev" aria-label="Anterior">‹</button>
        <button class="lb-btn lb-next" aria-label="Siguiente">›</button>
        <button class="lb-close" aria-label="Cerrar">✕</button>
        <div class="lb-count"></div>
      </div>`);
    document.querySelector('.lb-close').onclick = closeLightbox;
    document.querySelector('.lb-prev').onclick = () => lbStep(-1);
    document.querySelector('.lb-next').onclick = () => lbStep(1);
    document.querySelector('.lb-track').addEventListener('scroll', () => lbCat && updateCount(), { passive: true });
    document.addEventListener('keydown', e => {
      const lbOpen = !document.getElementById('lightbox').hidden;
      if (e.key === 'Escape' && lbOpen) closeLightbox();
      if (lbOpen && e.key === 'ArrowRight') lbStep(1);
      if (lbOpen && e.key === 'ArrowLeft') lbStep(-1);
    });
  });

  // ---------- modo edición (lo activa el panel) ----------
  function enableEditing() {
    document.body.classList.add('editing');
    document.querySelectorAll('#app [data-k]').forEach(makeEditable);
    // En edición, los links no navegan (para poder escribir sobre ellos)
    document.querySelectorAll('#app a').forEach(a => a.addEventListener('click', e => {
      if (a.getAttribute('href') && a.getAttribute('href').startsWith('#') && !e.target.closest('[data-k]')) return;
      e.preventDefault();
    }));
    const hm = document.querySelector('.hero-media');
    if (hm) hm.addEventListener('click', () => edit.onImage('hero'));
  }

  function makeEditable(el) {
    if (el.isContentEditable) return;
    {
      el.contentEditable = 'true';
      el.spellcheck = false;
      el.addEventListener('focus', () => edit.onSelect(el.dataset.k));
      el.addEventListener('input', () => {
        // innerText respeta text-transform (mayúsculas); en esos casos usar textContent
        const upper = getComputedStyle(el).textTransform !== 'none' || getComputedStyle(el.parentElement).textTransform !== 'none';
        state.cfg.texts[el.dataset.k] = (upper ? el.textContent : el.innerText).replace(/\n$/, '');
        edit.onText(el.dataset.k, state.cfg.texts[el.dataset.k]);
      });
      el.addEventListener('paste', e => {
        e.preventDefault();
        document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text'));
      });
    }
  }

  window.Site = {
    DEFAULT, TEXT_META, SECTION_NAMES, FONTS, merge, clone, render,
    get config() { return state.cfg; },
    setText(k, v) { state.cfg.texts[k] = v; document.querySelectorAll(`[data-k="${k}"]`).forEach(fillText); },
    enableEdit(handlers) { edit = handlers; },
    focusText(k) { const el = document.querySelector(`[data-k="${k}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
    previewIntro() { showIntro(true); },
    scrollToSection(id) { const el = document.querySelector(`[data-sec="${id}"]`); if (el) el.scrollIntoView({ behavior: 'smooth' }); },
    async load() {
      let cfg = null, cats = [];
      try { [cfg, cats] = await Promise.all([Store.getConfig(), Store.getCategorias()]); } catch (e) { console.warn(e); }
      let seen = false; try { seen = sessionStorage.getItem('mh_intro') === '1'; } catch {}
      introOpen = merge(cfg).intro.enabled && !seen && !/[?&]intro=0/.test(location.search);
      state.cfg = merge(cfg);
      if (introOpen) showIntro();
      render(cfg, cats);
      document.body.classList.add('loaded');
    },
  };
})();
