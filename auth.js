// ============================================================
// auth.js — Manejo de sesión y autenticación
// ============================================================

const Auth = {
  getToken:  () => sessionStorage.getItem('token'),
  getNombre: () => sessionStorage.getItem('nombre'),
  getRol:    () => sessionStorage.getItem('rol'),

  isLoggedIn() { return !!this.getToken(); },

  save(token, nombre, rol) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('nombre', nombre);
    sessionStorage.setItem('rol', rol);
  },

  clear() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('rol');
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  // SHA-256 para el password en el cliente
  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};
