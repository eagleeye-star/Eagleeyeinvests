/* EagleEyE — auth-guard.js
   Include on all protected pages BEFORE data.js
   Redirects to login if not authenticated.
   Auto-refreshes expired tokens before redirecting.
*/
(async function() {
  const token = localStorage.getItem('ee_access_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  // Check if token is expired and try to refresh
  const exp = localStorage.getItem('ee_token_expires');
  if (exp && Date.now() > parseInt(exp)) {
    const refreshToken = localStorage.getItem('ee_refresh_token');
    if (refreshToken) {
      try {
        const res = await fetch('https://jyhamtniuhlsbwcdfspa.supabase.co/auth/v1/token?grant_type=refresh_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            localStorage.setItem('ee_access_token', data.access_token);
            localStorage.setItem('ee_refresh_token', data.refresh_token || refreshToken);
            localStorage.setItem('ee_token_expires', (Date.now() + 55*60*1000).toString());
            return; // Token refreshed, continue loading page
          }
        }
      } catch(e) {}
    }
    // Refresh failed — redirect to login
    ['ee_access_token','ee_refresh_token','ee_user','ee_profile','ee_token_expires'].forEach(k=>localStorage.removeItem(k));
    window.location.href = 'login.html';
  }
})();
