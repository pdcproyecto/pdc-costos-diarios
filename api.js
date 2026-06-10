// ============================================================
// api.js — Capa de comunicación con Google Apps Script
// ============================================================

const API = {
  async call(action, params = {}, method = 'POST') {
    const token = Auth.getToken();
    const payload = { action, token, ...params };

    try {
      let url = CONFIG.GAS_URL;
      let opts;

      if (method === 'GET') {
        const qs = new URLSearchParams(payload).toString();
        url += '?' + qs;
        opts = { method: 'GET' };
      } else {
        opts = {
          method: 'POST',
          body: JSON.stringify(payload),
        };
      }

      const res = await fetch(url, opts);
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
      console.error('API error:', err);
      throw err;
    }
  },

  // Auth
  async login(email, passwordHash) {
    const res = await fetch(CONFIG.GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password: passwordHash }),
    });
    return res.json();
  },

  logout() {
    return this.call('logout');
  },

  // Data
  getEstructura()              { return this.call('getEstructura', {}, 'GET'); },
  getResumenMes(anio, mes)     { return this.call('getResumenMes', { anio, mes }, 'GET'); },
  saveProyectado(anio, mes, items) { return this.call('saveProyectado', { anio, mes, items }); },
  getProduccion(anio, mes)     { return this.call('getProduccion', { anio, mes }, 'GET'); },
  saveProduccionProy(anio, mes, filas) { return this.call('saveProduccionProy', { anio, mes, filas }); },
  saveProduccionReal(d)        { return this.call('saveProduccionReal', d); },
  getEjecutado(fecha)          { return this.call('getEjecutado', { fecha }, 'GET'); },
  saveEjecutado(fecha, items)  { return this.call('saveEjecutado', { fecha, items }); },
  getCultivos()                { return this.call('getCultivos', {}, 'GET'); },
  getUsuarios()                { return this.call('getUsuarios', {}, 'GET'); },
  saveUsuario(data)            { return this.call('saveUsuario', data); },
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
