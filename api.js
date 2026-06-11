// ============================================================
// api.js — Capa de comunicación con Google Apps Script
// ============================================================

const API = {
  // GET: para lecturas (payload pequeño, sin cambios en servidor)
  async call(action, params = {}) {
    const token = Auth.getToken();
    try {
      const url = CONFIG.GAS_URL
        + '?action=' + encodeURIComponent(action)
        + '&token=' + encodeURIComponent(token || '')
        + '&data=' + encodeURIComponent(JSON.stringify(params));

      const res = await fetch(url);
      const data = await res.json();

      if (!data.ok) {
        if (data.error === 'No autorizado') {
          Auth.clear();
          window.location.href = 'index.html';
        }
        throw new Error(data.error || 'Error desconocido');
      }
      return data;
    } catch (err) {
      console.error('API GET error:', err);
      throw err;
    }
  },

  // POST con Content-Type: text/plain — no activa preflight CORS, soporta payloads grandes
  async post(action, params = {}) {
    const token = Auth.getToken();
    try {
      const body = JSON.stringify({ action, token: token || '', ...params });
      const res = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'text/plain' },
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.error === 'No autorizado') {
          Auth.clear();
          window.location.href = 'index.html';
        }
        throw new Error(data.error || 'Error desconocido');
      }
      return data;
    } catch (err) {
      console.error('API POST error:', err);
      throw err;
    }
  },

  logout() {
    return this.post('logout');
  },

  // Lecturas → GET
  getEstructura()      { return this.call('getEstructura'); },
  getResumenMes(a, m)  { return this.call('getResumenMes', { anio: a, mes: m }); },
  getProduccion(a, m)  { return this.call('getProduccion', { anio: a, mes: m }); },
  getEjecutado(fecha)  { return this.call('getEjecutado', { fecha }); },
  getCultivos()        { return this.call('getCultivos'); },
  getUsuarios()        { return this.call('getUsuarios'); },

  // Escrituras → POST (soporta datos grandes, evita límite de URL)
  saveProyectado(anio, mes, items)     { return this.post('saveProyectado', { anio, mes, items }); },
  saveProduccionProy(anio, mes, filas) { return this.post('saveProduccionProy', { anio, mes, filas }); },
  saveProduccionReal(d)                { return this.post('saveProduccionReal', d); },
  saveEjecutado(fecha, items)          { return this.post('saveEjecutado', { fecha, items }); },
  saveUsuario(data)                    { return this.post('saveUsuario', data); },
};

// ----------------------------------------------------------
// Helpers de UI compartidos
// ----------------------------------------------------------
function mostrarToast(msg, tipo = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + tipo;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

function fmtMoneda(n) {
  if (n === null || n === undefined || n === '') return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  return '$' + num.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtNum(n, dec = 0) {
  if (n === null || n === undefined || n === '') return '—';
  const num = parseFloat(n);
  if (isNaN(num)) return '—';
  return num.toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtPct(n) {
  if (!n && n !== 0) return '—';
  return parseFloat(n).toFixed(1) + '%';
}

function diasEnMes(anio, mes) {
  return new Date(anio, mes, 0).getDate();
}

function fechaISO(anio, mes, dia) {
  return `${anio}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
