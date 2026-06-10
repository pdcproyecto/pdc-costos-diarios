// ============================================================
// api.js — Capa de comunicación con Google Apps Script
// ============================================================

const API = {
  // Todas las llamadas usan GET para evitar problemas de CORS con GAS
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
      console.error('API error:', err);
      throw err;
    }
  },

  logout() {
    return this.call('logout');
  },

  // Data
  getEstructura()                      { return this.call('getEstructura'); },
  getResumenMes(anio, mes)             { return this.call('getResumenMes', { anio, mes }); },
  saveProyectado(anio, mes, items)     { return this.call('saveProyectado', { anio, mes, items }); },
  getProduccion(anio, mes)             { return this.call('getProduccion', { anio, mes }); },
  saveProduccionProy(anio, mes, filas) { return this.call('saveProduccionProy', { anio, mes, filas }); },
  saveProduccionReal(d)                { return this.call('saveProduccionReal', d); },
  getEjecutado(fecha)                  { return this.call('getEjecutado', { fecha }); },
  saveEjecutado(fecha, items)          { return this.call('saveEjecutado', { fecha, items }); },
  getCultivos()                        { return this.call('getCultivos'); },
  getUsuarios()                        { return this.call('getUsuarios'); },
  saveUsuario(data)                    { return this.call('saveUsuario', data); },
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
