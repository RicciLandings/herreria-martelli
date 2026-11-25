// Arma la página a partir de una configuración (site_config) y las categorías de trabajos.
// La usa index.html (web pública) y el panel (vista previa con ?edit=1).
(function () {
  const DEFAULT = {
    theme: { bg: '#ece6da', bgAlt: '#dfd7c6', text: '#15140f', muted: '#6f6a5c', accent: '#a8512b', dark: '#2b2a26',
             font: 'Archivo', baseSize: 16, headingWeight: 600 },
    sections: [
      { id: 'hero', visible: true, space: 1 },
      { id: 'trabajos', visible: true, space: 1 },
      { id: 'sobre', visible: true, space: 1 },
      { id: 'contacto', visible: true, space: 1 },
    ],
    hero: { image: 'images/pergola-urbana.jpg', focus: 'center', height: 100 },
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
    },
    styles: {}, // { clave: {size, weight, spacing, align} }
  };

  // Nombres legibles de cada texto, agrupados por sección (los usa el panel)
  const TEXT_META = [
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
    for (const k of ['theme', 'hero', 'gallery', 'contact', 'texts', 'styles']) Object.assign(c[k], saved[k] || {});
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
  const panes = '<span></span>'.repeat(12);

  // ---------- secciones ----------
  const SECTIONS = {
    hero: c => `
      <section class="hero" id="inicio" data-sec="hero">
        <img class="hero-img" data-img="hero" alt="">
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

    // Portada
    const hi = document.querySelector('.hero-img');
    if (hi) { hi.src = Store.url(c.hero.image); hi.style.objectPosition = FOCUS[c.hero.focus] || FOCUS.center; }

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
    }, reduce ? 0 : 520);
  }

  function renderGallery(animate) {
    const g = document.getElementById('galeria'), fl = document.getElementById('filtros');
    if (!g) return;
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
    // fotos
    const list = [];
    cats.forEach(c => { if (state.filter === 'all' || state.filter === c.id) c.fotos.forEach(f => list.push({ path: f.path, nombre: c.nombre, encuadre: c.encuadre })); });
    g.innerHTML = '';
    list.forEach((it, i) => {
      const f = document.createElement('figure');
      f.className = 'work' + (animate ? ' pop' : '');
      if (animate) f.style.animationDelay = Math.min(i, 10) * 130 + 'ms';
      f.tabIndex = 0;
      f.innerHTML = `<div class="frame"><img loading="lazy" alt=""><div class="panes">${panes}</div></div><figcaption><span class="tag"></span></figcaption>`;
      const img = f.querySelector('img');
      img.src = Store.url(it.path); img.alt = it.nombre;
      img.style.objectPosition = FOCUS[it.encuadre] || FOCUS.center;
      f.querySelector('.tag').textContent = it.nombre;
      const open = () => openLightbox(list, i);
      f.onclick = open;
      f.onkeydown = e => { if (e.key === 'Enter') open(); };
      g.appendChild(f);
    });
    if (!list.length) g.innerHTML = '<p class="gallery-empty">Pronto vas a ver acá nuestros trabajos.</p>';
  }

  // Animación suave de entrada de textos
  let io = null;
  function reveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (io) io.disconnect();
    io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const groups = ['.hero-content > *', '.gallery .section-head, .services-line, .filters, .gallery-note',
      '.about .section-head, .about-zone, .about-text p', '.contact .section-head, .contact .lead, .contact .cta, .contact-list li'];
    groups.forEach((sel, gi) => document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--d', (gi === 0 ? 0.35 + i * 0.22 : i * 0.12) + 's');
      io.observe(el);
    }));
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
    header.classList.toggle('solid', window.scrollY > 40);
  }

  function onScroll() {
    const header = document.getElementById('site-header');
    if (header) header.classList.toggle('solid', window.scrollY > 40);
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
    const hi = document.querySelector('.hero-img');
    if (hi) hi.addEventListener('click', () => edit.onImage('hero'));
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
    scrollToSection(id) { const el = document.querySelector(`[data-sec="${id}"]`); if (el) el.scrollIntoView({ behavior: 'smooth' }); },
    async load() {
      let cfg = null, cats = [];
      try { [cfg, cats] = await Promise.all([Store.getConfig(), Store.getCategorias()]); } catch (e) { console.warn(e); }
      render(cfg, cats);
    },
  };
})();
