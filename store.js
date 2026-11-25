// Capa de datos compartida por la web (index.html) y el panel (admin.html).
// Sin Supabase configurado en config.js => modo demo (guarda en este navegador).
(function () {
  const cfg = window.MARTELLI_CONFIG || {};
  const DEMO = !cfg.supabaseUrl || !cfg.supabaseKey;
  const BUCKET = 'trabajos';
  const LS_CFG = 'mh_site_config', LS_CATS = 'mh_categorias_v2';

  const DEMO_CATS = [
    { id: 'c1', nombre: 'Pérgolas', orden: 0, portada: 'images/pergola-terraza.jpg', encuadre: 'center',
      fotos: [{ id: 'f1', path: 'images/pergola-terraza.jpg', orden: 0, detalles: [{ id: 'd3', path: 'images/pergola-terraza-detalle-1.jpg', orden: 0 }] },
              { id: 'f2', path: 'images/pergola-urbana.jpg', orden: 1 }] },
    { id: 'c2', nombre: 'Aberturas', orden: 1, portada: 'images/puerta-vidrio.jpg', encuadre: 'center',
      fotos: [{ id: 'f3', path: 'images/puerta-vidrio.jpg', orden: 0,
                detalles: [{ id: 'd1', path: 'images/puerta-vidrio-detalle-1.jpg', orden: 0 }, { id: 'd2', path: 'images/puerta-vidrio-detalle-2.jpg', orden: 1 }] }] },
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
  const byOrden = (a, b) => a.orden - b.orden;
  // Cada foto principal puede tener fotos de detalle (detalles)
  const sortCats = cats => cats.sort(byOrden).map(c => ({
    ...c, fotos: (c.fotos || []).sort(byOrden).map(f => ({ ...f, detalles: (f.detalles || []).sort(byOrden) })),
  }));
  const nest = fotos => {
    const main = fotos.filter(f => !f.parent_id).map(f => ({ id: f.id, path: f.path, orden: f.orden, detalles: [] }));
    fotos.filter(f => f.parent_id).forEach(d => { const m = main.find(x => x.id === d.parent_id); if (m) m.detalles.push({ id: d.id, path: d.path, orden: d.orden }); });
    return main;
  };
  // En demo: busca la lista donde vive una foto (principal o detalle)
  const demoList = (cats, catId, parentId) => {
    const cat = cats.find(x => x.id === catId);
    if (!parentId) return cat.fotos;
    const m = cat.fotos.find(f => f.id === parentId);
    m.detalles = m.detalles || [];
    return m.detalles;
  };

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
      const rows = await rest('categorias?select=id,nombre,orden,portada_path,encuadre,fotos(id,path,orden,parent_id)&order=orden');
      return sortCats(rows.map(r => ({ id: r.id, nombre: r.nombre, orden: r.orden, portada: r.portada_path, encuadre: r.encuadre, fotos: nest(r.fotos || []) })));
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
      for (const f of cat.fotos) { await this.removeImage(f.path); for (const d of f.detalles || []) await this.removeImage(d.path); }
    },
    // parentId: si se pasa, la foto es un detalle de esa foto principal
    async addFoto(catId, blob, orden, parentId) {
      const path = await this.uploadImage(blob);
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); demoList(c, catId, parentId).push({ id: uid(), path, orden, ...(parentId ? {} : { detalles: [] }) }); return ls.set(LS_CATS, c); }
      const { error } = await this.client.from('fotos').insert({ categoria_id: catId, path, orden, parent_id: parentId || null });
      if (error) throw error;
    },
    async updateFoto(catId, id, patch, parentId) {
      if (DEMO) { const c = ls.get(LS_CATS, DEMO_CATS); Object.assign(demoList(c, catId, parentId).find(f => f.id === id), patch); return ls.set(LS_CATS, c); }
      const { error } = await this.client.from('fotos').update(patch).eq('id', id);
      if (error) throw error;
    },
    async deleteFoto(catId, foto, parentId) {
      if (DEMO) {
        const c = ls.get(LS_CATS, DEMO_CATS); const list = demoList(c, catId, parentId);
        list.splice(list.findIndex(f => f.id === foto.id), 1);
        const cat = c.find(x => x.id === catId); if (cat.portada === foto.path) cat.portada = null;
        return ls.set(LS_CATS, c);
      }
      const { error } = await this.client.from('fotos').delete().eq('id', foto.id); // los detalles se borran en cascada
      if (error) throw error;
      await this.removeImage(foto.path);
      for (const d of foto.detalles || []) await this.removeImage(d.path);
    },
    resetDemo() { try { localStorage.removeItem(LS_CFG); localStorage.removeItem(LS_CATS); } catch {} },
  };
  window.Store = Store;
})();
