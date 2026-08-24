/* ============================================================
   EagleEyE — auth.js
   Manages session tokens with automatic refresh.
   Supabase tokens expire after 1 hour — this refreshes
   them automatically so users never get JWT expired errors.
============================================================ */

const SUPABASE_URL  = 'https://jyhamtniuhlsbwcdfspa.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0';

const EE_AUTH = {

  saveSession(data) {
    localStorage.setItem('ee_access_token',  data.access_token);
    localStorage.setItem('ee_refresh_token', data.refresh_token || '');
    localStorage.setItem('ee_user',    JSON.stringify(data.user));
    localStorage.setItem('ee_profile', JSON.stringify(data.profile));
    // Save expiry time — Supabase tokens last 1 hour
    const expiresAt = Date.now() + (55 * 60 * 1000); // 55 min (5 min buffer)
    localStorage.setItem('ee_token_expires', expiresAt.toString());
  },

  clearSession() {
    ['ee_access_token','ee_refresh_token','ee_user','ee_profile','ee_token_expires'].forEach(k=>localStorage.removeItem(k));
  },

  getToken() {
    return localStorage.getItem('ee_access_token');
  },

  getProfile() {
    const p = localStorage.getItem('ee_profile');
    return p ? JSON.parse(p) : null;
  },

  getUser() {
    const u = localStorage.getItem('ee_user');
    return u ? JSON.parse(u) : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  isTokenExpired() {
    const exp = localStorage.getItem('ee_token_expires');
    if (!exp) return true;
    return Date.now() > parseInt(exp);
  },

  // Refresh the access token using the refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem('ee_refresh_token');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        this.clearSession();
        return false;
      }
      const data = await res.json();
      if (data.access_token) {
        // Update tokens without clearing profile
        localStorage.setItem('ee_access_token', data.access_token);
        localStorage.setItem('ee_refresh_token', data.refresh_token || refreshToken);
        const expiresAt = Date.now() + (55 * 60 * 1000);
        localStorage.setItem('ee_token_expires', expiresAt.toString());
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  // Start auto-refresh — checks every 10 minutes and refreshes if within 15 min of expiry
  startAutoRefresh() {
    // Clear any existing interval
    if (window._eeRefreshInterval) clearInterval(window._eeRefreshInterval);
    window._eeRefreshInterval = setInterval(async () => {
      const exp = localStorage.getItem('ee_token_expires');
      if (!exp) return;
      const timeLeft = parseInt(exp) - Date.now();
      // Refresh if less than 15 minutes remaining
      if (timeLeft < 15 * 60 * 1000 && timeLeft > 0) {
        await this.refreshToken();
      }
      // Token already expired — try refresh immediately
      if (timeLeft <= 0) {
        const ok = await this.refreshToken();
        if (!ok) {
          clearInterval(window._eeRefreshInterval);
        }
      }
    }, 10 * 60 * 1000); // check every 10 minutes
  },
  async getValidToken() {
    if (!this.getToken()) return null;
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        window.location.href = 'login.html';
        return null;
      }
    }
    return this.getToken();
  },

  async verifySession() {
    const token = await this.getValidToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/get-user', {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        // Try refresh once more
        const refreshed = await this.refreshToken();
        if (!refreshed) { this.clearSession(); return null; }
        return null;
      }
      const data = await res.json();
      if (data.profile) {
        localStorage.setItem('ee_profile', JSON.stringify(data.profile));
      }
      return data;
    } catch {
      return null;
    }
  },

  async requireAuth(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    // Auto-refresh if expired before checking
    if (this.isTokenExpired()) {
      const ok = await this.refreshToken();
      if (!ok) { window.location.href = redirectTo; return false; }
    }
    return true;
  },

  redirectIfLoggedIn(to = 'dashboard.html') {
    if (this.isLoggedIn()) window.location.href = to;
  },

  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },

  updateNav() {
    const profile = this.getProfile();
    const actionsEl = document.querySelector('.header-actions');
    if (!actionsEl) return;
    if (profile) {
      actionsEl.innerHTML = `
        <span style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);">
          ${profile.plan==='premium'?'<span style="color:var(--gold-bright);">⭑ Premium</span>':''} ${profile.firstName||''}
        </span>
        <a href="dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>
        <a href="profile.html" class="btn btn-ghost btn-sm">Profile</a>
        <button class="btn btn-ghost btn-sm" onclick="EE_AUTH.logout()">Log out</button>`;
    }
  },
};

// Start smart auto-refresh when page loads
if (EE_AUTH.isLoggedIn()) {
  EE_AUTH.startAutoRefresh();
  // Also refresh immediately if token is expired or close to expiry
  const exp = localStorage.getItem('ee_token_expires');
  if (exp && (parseInt(exp) - Date.now()) < 15 * 60 * 1000) {
    EE_AUTH.refreshToken();
  }
}
