/* ============================================================
   EagleEyE — premium-gate.js
   Include on premium-only pages AFTER auth-guard.js and data.js
   <script src="auth-guard.js"></script>
   <script src="data.js"></script>
   <script src="premium-gate.js"></script>
   ============================================================ */

const VAPID_PUBLIC_KEY = 'BClG3T8fnCWZrUJ5qD4OXIydCmEcDk1cSPq_WZxe_nn-sO6VIW3aIi9N8YJwODpLSWs1BHKEs3QywojPta82FYI';

/* ---- Check if current user is Premium or on active trial ---- */
function isPremium(){
  const profile = JSON.parse(localStorage.getItem('ee_profile') || 'null');
  if(!profile) return false;
  if(profile.plan === 'premium') return true;
  // Check active trial
  if(profile.trialEndsAt && new Date(profile.trialEndsAt) > new Date()) return true;
  return false;
}

/* ---- Get trial info (days remaining, expired, etc.) ---- */
function getTrialInfo(){
  const profile = JSON.parse(localStorage.getItem('ee_profile') || 'null');
  if(!profile || !profile.trialEndsAt) return null;
  if(profile.plan === 'premium') return null; // already paid

  const ends = new Date(profile.trialEndsAt);
  const now  = new Date();
  const msLeft = ends - now;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const isActive = msLeft > 0;

  return { isActive, daysLeft: Math.max(0, daysLeft), endsAt: ends };
}

/* ---- Show premium upgrade wall over a page element ---- */
function showPremiumWall(containerId, featureName){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';

  const wall = document.createElement('div');
  wall.innerHTML = `
    <div style="
      position:absolute;inset:0;z-index:10;
      background:linear-gradient(to bottom, transparent 0%, var(--bg) 40%);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
      padding:32px 24px 40px;text-align:center;
    ">
      <div style="width:52px;height:52px;border-radius:50%;background:var(--gold-glow);border:1px solid rgba(212,165,55,0.3);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px;">⭑</div>
      <div style="font-family:var(--font-display);font-size:20px;font-weight:600;margin-bottom:8px;">Premium feature</div>
      <div style="font-size:13px;color:var(--text-dim);line-height:1.6;max-width:320px;margin-bottom:22px;">
        <strong>${featureName}</strong> is available on the Premium plan. Upgrade to unlock Eagle Research, Screener, Alerts, Dividend forecasting and more.
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
        <a href="pricing.html" class="btn btn-gold">Upgrade to Premium — GH₵35/month</a>
        <a href="dashboard.html" class="btn btn-ghost">Back to dashboard</a>
      </div>
    </div>`;
  el.appendChild(wall);
}

/* ---- Gate an entire page ---- */
function requirePremium(featureName){
  if(!isPremium()){
    // Replace page body with upgrade wall
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;background:var(--bg);">
        <div style="width:60px;height:60px;border-radius:50%;background:var(--gold-glow);border:1px solid rgba(212,165,55,0.3);display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:20px;">⭑</div>
        <div style="font-family:var(--font-display);font-size:26px;font-weight:600;color:var(--text);margin-bottom:10px;">Premium feature</div>
        <div style="font-size:14px;color:var(--text-dim);line-height:1.65;max-width:400px;margin-bottom:28px;">
          <strong>${featureName}</strong> is available on the EagleEyE Premium plan. Free users get Portfolio tracking, Market Centre, and News.
        </div>
        <div style="background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:24px 28px;max-width:380px;width:100%;margin-bottom:24px;">
          <div style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px;">What you get with Premium</div>
          <div style="text-align:left;font-size:13px;color:var(--text-dim);line-height:2;">
            ⭑ Eagle Research — real stock scores & analyst notes<br>
            ⭑ Stock Screener — advanced filters<br>
            ⭑ Price Alerts — get notified when stocks move<br>
            ⭑ Dividend forecasting<br>
            ⭑ Portfolio export (PDF/CSV)<br>
            ⭑ Unlimited holdings<br>
            ⭑ Push notifications
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
          <a href="pricing.html" style="display:inline-flex;align-items:center;justify-content:center;padding:13px 24px;border-radius:10px;background:linear-gradient(150deg,var(--gold-bright),var(--gold));color:#1A1300;font-weight:700;font-size:14px;text-decoration:none;">Upgrade — from GH₵35/month</a>
          <a href="dashboard.html" style="display:inline-flex;align-items:center;justify-content:center;padding:13px 20px;border-radius:10px;border:1px solid var(--border);color:var(--text-dim);font-size:13px;text-decoration:none;">← Back to dashboard</a>
        </div>
      </div>`;
    return false;
  }
  return true;
}

/* ============================================================
   PUSH NOTIFICATIONS
   ============================================================ */

/* Register service worker and subscribe to push */
async function enablePushNotifications(){
  if(!('serviceWorker' in navigator) || !('PushManager' in window)){
    return { success: false, error: 'Push notifications not supported on this browser.' };
  }

  try{
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if(permission !== 'granted'){
      return { success: false, error: 'Notification permission denied.' };
    }

    // Subscribe to push
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const subJson = sub.toJSON();
    const token = localStorage.getItem('ee_access_token');

    // Save subscription to server
    const res = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        p256dh:   subJson.keys.p256dh,
        auth:     subJson.keys.auth,
      }),
    });

    if(!res.ok) return { success: false, error: 'Could not save subscription.' };
    localStorage.setItem('ee_push_enabled', 'true');
    return { success: true };

  } catch(err){
    return { success: false, error: err.message };
  }
}

/* Disable push notifications */
async function disablePushNotifications(){
  try{
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if(!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if(!sub) return;
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    const token = localStorage.getItem('ee_access_token');
    await fetch('/api/push-subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ endpoint }),
    });
    localStorage.removeItem('ee_push_enabled');
  } catch(e){}
}

/* Check if push is currently enabled */
async function isPushEnabled(){
  if(!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try{
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if(!reg) return false;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  }catch{ return false; }
}

/* Helper to convert VAPID key */
function urlBase64ToUint8Array(base64String){
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}
