// Capa de datos compartida por la web (index.html) y el panel (admin.html).
// Sin Supabase configurado en config.js => modo demo (guarda en este navegador).
(function () {
  const cfg = window.MARTELLI_CONFIG || {};
  const DEMO = !cfg.supabaseUrl || !cfg.supabaseKey;
  const BUCKET = 'trabajos';
  const LS_CFG = 'mh_site_config', LS_CATS = 'mh_categorias';

  const DEMO_CATS = [
    { id: 'c1', nombre: 'Pérgolas', orden: 0, portada: 'images/pergola-terraza.jpg', encuadre: 'center',
      fotos: [{ id: 'f1', path: 'images/pergola-terraza.jpg', orden: 0 }, { id: 'f2', path: 'images/pergola-urbana.jpg', orden: 1 }] },
    { id: 'c2', nombre: 'Aberturas', orden: 1, portada: 'images/puerta-vidrio.jpg', encuadre: 'center',
      fotos: [{ id: 'f3', path: 'images/puerta-vidrio.jpg', orden: 0 }] },
  ];

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const ls = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); }
      catch { throw new Error('Modo demo: se llenó el espacio del navegador. Borrá algunas fotos de prueba.'); }
    },
  };
  const toDataURL = blob => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });

  // URL pública de una imagen guardada (ruta del bucket, ruta local o data:)
  function url(path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:|images\/)/.test(path)) return path;
    return cfg.supabaseUrl + '/storage/v1/object/public/' + BUCKET + '/' + path.split('/').map(encodeURIComponent).join('/');
  }

  async function rest(q) {
    const r = await fetch(cfg.supabaseUrl + '/rest/v1/' + q, { headers: { apikey: cfg.supabaseKey, Authorization: 'Bearer ' + cfg.supabaseKey } });
    if (!r.ok) throw new Error('Error ' + r.status);
    return r.json();
  }
  const sortCats = cats => cats.sort((a, b) => a.orden - b.orden).map(c => ({ ...c, fotos: (c.fotos || []).sort((a, b) => a.orden - b.orden) }));

  const Store = {
    DEMO, url, client: null,

    // ---------- lectura (web pública y panel) ----------
    async getConfig() {
      if (DEMO) return ls.get(LS_CFG, null);
      const rows = await rest('site_config?select=data&id=eq.1');
      return rows[0] ? rows[0].data : null;
    },
    async getCategorias() {
      if (DEMO) return sortCats(ls.get(LS_CATS, DEMO_CATS));
      const rows = await rest('categorias?select=id,nombre,orden,portada_path,encuadre,fotos(id,path,orden)&order=orden');
      return sortCats(rows.map(r => ({ id: r.id, nombre: r.nombre, orden: r.orden, portada: r.portada_path, encuadre: r.encuadre, fotos: r.fotos })));
    },

    // ---------- escritura (solo panel; en real requiere Store.client logueado) ----------
    async saveConfig(data) {
      if (DEMO) return ls.set(LS_CFG, data);
      const { error } = await this.client.from('site_config').upsert({ id: 1, data, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async uploadImage(blob) { // devuelve la ruta a guardar
      if (DEMO) return toDataURL(blob);
      const path = uid() + '.jpg';
      const { error } = await this.client.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
      if (error) throw error;
      return path;
    },
    async removeImage(path) {
      if (DEMO || !path || /^(images\/|data:|https?:)/.test(path)) return;
      await this.client.storage.from(BUCKET).remove([path]);
    },
    async addCategoria(nombre, orden) {
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); c.push({ id: uid(), nombre, orden, portada: null, encuadre: 'center', fotos: [] }); return ls.set(LS_CATS, c); }
      const { error } = await this.client.from('categorias').insert({ nombre, orden });
      if (error) throw error;
    },
    async updateCategoria(id, patch) { // patch: {nombre, orden, portada, encuadre}
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); Object.assign(c.find(x => x.id === id), patch); return ls.set(LS_CATS, c); }
      const p = { ...patch }; if ('portada' in p) { p.portada_path = p.portada; delete p.portada; }
      const { error } = await this.client.from('categorias').update(p).eq('id', id);
      if (error) throw error;
    },
    async deleteCategoria(cat) {
      if (DEMO) return ls.set(LS_CATS, ls.get(LS_CATS, DEMO_CATS).filter(x => x.id !== cat.id));
      const { error } = await this.client.from('categorias').delete().eq('id', cat.id);
      if (error) throw error;
      for (const f of cat.fotos) await this.removeImage(f.path);
    },
    async addFoto(catId, blob, orden) {
      const path = await this.uploadImage(blob);
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); c.find(x => x.id === catId).fotos.push({ id: uid(), path, orden }); return ls.set(LS_CATS, c); }
      const { error } = await this.client.from('fotos').insert({ categoria_id: catId, path, orden });
      if (error) throw error;
    },
    async updateFoto(catId, id, patch) {
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); Object.assign(c.find(x => x.id === catId).fotos.find(f => f.id === id), patch); return ls.set(LS_CATS, c); }
      const { error } = await this.client.from('fotos').update(patch).eq('id', id);
      if (error) throw error;
    },
    async deleteFoto(catId, foto) {
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); const cat = c.find(x => x.id === catId); cat.fotos = cat.fotos.filter(f => f.id !== foto.id); if (cat.portada === foto.path) cat.portada = null; return ls.set(LS_CATS, c); }
      const { error } = await this.client.from('fotos').delete().eq('id', foto.id);
      if (error) throw error;
      await this.removeImage(foto.path);
    },
    resetDemo() { try { localStorage.removeItem(LS_CFG); localStorage.removeItem(LS_CATS); } catch {} },
  };
  window.Store = Store;
})();
