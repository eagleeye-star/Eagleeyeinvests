<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#D4A537">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="EagleEyE">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
<title>Price Alerts — EagleEyE</title>
<link rel="stylesheet" href="style.css">
<style>
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px;opacity:0;pointer-events:none;transition:opacity .2s;}
.modal-overlay.open{opacity:1;pointer-events:auto;}
.modal{background:var(--panel);border:1px solid var(--border);border-radius:var(--radius);padding:28px;width:100%;max-width:400px;transform:translateY(12px);transition:transform .2s;}
.modal-overlay.open .modal{transform:translateY(0);}
.modal-title{font-family:var(--font-display);font-size:19px;font-weight:600;margin-bottom:4px;}
.modal-sub{font-size:12.5px;color:var(--text-dim);margin-bottom:22px;}
.field{margin-bottom:13px;}
.field label{font-size:11px;color:var(--text-dim);display:block;margin-bottom:5px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;}
.field input,.field select{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px;background:var(--panel-2);color:var(--text);font-family:var(--font-body);}
.field input:focus,.field select:focus{outline:none;border-color:var(--gold-dim);}
.modal-actions{display:flex;gap:10px;margin-top:20px;}
.modal-actions .btn{flex:1;}
.alert-box{padding:10px 13px;border-radius:var(--radius-sm);font-size:12px;display:none;margin-top:10px;}
.alert-box.show{display:block;}
.alert-error{background:var(--red-fill);border:1px solid rgba(217,89,76,0.3);color:var(--red);}
.alert-success{background:var(--green-fill);border:1px solid rgba(47,201,141,0.3);color:var(--green-bright);}
.spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(26,19,0,0.3);border-top-color:#1A1300;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:5px;}
@keyframes spin{to{transform:rotate(360deg)}}
.alert-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--border-soft);flex-wrap:wrap;gap:8px;}
.alert-row:last-child{border-bottom:none;}
.alert-info-col .tk{font-size:14px;}
.alert-info-col .tk-name{font-size:11.5px;color:var(--text-dim);margin-top:2px;}
.alert-detail{font-size:12px;color:var(--text-dim);margin-top:4px;font-family:var(--font-mono);}
.icon-btn{background:none;border:1px solid var(--border);border-radius:6px;color:var(--text-dim);cursor:pointer;padding:5px 10px;font-size:11px;transition:all .12s;font-family:var(--font-body);}
.icon-btn.del:hover{border-color:var(--red);color:var(--red);}
.empty-state{text-align:center;padding:48px 20px;color:var(--text-dim);}
.empty-state .icon{font-size:30px;margin-bottom:12px;opacity:0.4;}
.triggered-note{display:inline-block;font-size:10px;padding:2px 7px;border-radius:10px;background:var(--red-fill);color:var(--red);margin-left:8px;font-family:var(--font-mono);}
</style>
</head>
<body>

<div class="modal-overlay" id="alertModal">
  <div class="modal">
    <div class="modal-title">New price alert</div>
    <div class="modal-sub">Get notified when a stock reaches your target price.</div>
    <div class="field">
      <label>Stock</label>
      <select id="a-ticker">
        <option value="">Select a stock…</option>
      </select>
    </div>
    <div class="field">
      <label>Alert type</label>
      <select id="a-type">
        <option value="above">Price goes above target</option>
        <option value="below">Price falls below target</option>
      </select>
    </div>
    <div class="field">
      <label>Target price (GH₵)</label>
      <input type="number" id="a-price" placeholder="e.g. 8.00" min="0.01" step="0.01">
    </div>
    <div class="alert-box alert-error" id="alert-error"></div>
    <div class="alert-box alert-success" id="alert-success"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-gold" id="alert-save-btn" onclick="saveAlert()">Create alert</button>
    </div>
  </div>
</div>

<div id="chrome-header"></div>
<div class="wrap">
  <div style="margin:28px 0 20px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px;">
    <div>
      <div style="font-family:var(--font-display);font-size:26px;font-weight:600;">Price Alerts</div>
      <div style="font-size:13px;color:var(--text-dim);margin-top:4px;">Get notified when a stock hits your target price</div>
    </div>
    <button class="btn btn-gold btn-sm" onclick="openModal()">+ New alert</button>
  </div>

  <div class="panel mb">
    <div class="panel-head"><div class="panel-title">Active alerts <span class="sub" id="alert-count"></span></div></div>
    <div id="alerts-list"><div style="color:var(--text-faint);font-size:13px;padding:10px 0;">Loading…</div></div>
  </div>

  <div class="panel" style="font-size:12.5px;color:var(--text-dim);line-height:1.7;">
    <strong style="color:var(--text);">How alerts work:</strong> EagleEyE checks the live price feed each time you load a page and compares against your targets. When a stock crosses your target price, the alert is marked as triggered. Full push/email notifications require the premium backend — coming soon.
  </div>
</div>
<div id="chrome-footer"></div>

<script src="auth.js"></script>
<script src="auth-guard.js"></script>
<script src="data.js"></script>
<script src="premium-gate.js"></script>
<script>
mountChrome('alerts.html');
if(!requirePremium('Price Alerts')) throw new Error('not premium');

const tickerSel=document.getElementById('a-ticker');
gseStocks.forEach(s=>{ tickerSel.innerHTML+=`<option value="${s.ticker}">${s.ticker} — ${s.name}</option>`; });

function openModal(){
  tickerSel.value=''; document.getElementById('a-type').value='above'; document.getElementById('a-price').value='';
  document.getElementById('alert-error').classList.remove('show'); document.getElementById('alert-success').classList.remove('show');
  document.getElementById('alertModal').classList.add('open');
}
function closeModal(){ document.getElementById('alertModal').classList.remove('open'); }
document.getElementById('alertModal').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeModal(); });

async function loadAlerts(){
  const token=localStorage.getItem('ee_access_token');
  try{
    const res=await fetch('/api/alerts',{headers:{'Authorization':`Bearer ${token}`}});
    const data=await res.json();
    renderAlerts(res.ok?data.alerts:[]);
  }catch{ renderAlerts([]); }
}

// Build a price map from live data to check triggers
const priceMap={};
gseStocks.forEach(s=>{ priceMap[s.ticker]=s.price; });

function renderAlerts(alerts){
  document.getElementById('alert-count').textContent='('+alerts.length+')';
  const el=document.getElementById('alerts-list');
  if(alerts.length===0){
    el.innerHTML=`<div class="empty-state"><div class="icon">⚑</div>No alerts yet — click "+ New alert" to set your first price target.</div>`;
    return;
  }
  el.innerHTML='';
  alerts.forEach(a=>{
    const currentPrice=priceMap[a.ticker]||0;
    const isTriggered=a.alert_type==='above'?currentPrice>=a.target_price:currentPrice<=a.target_price;
    const dirLabel=a.alert_type==='above'?'Price above':'Price below';
    const chipClass=isTriggered?'chip-up':'chip-neu';
    el.innerHTML+=`<div class="alert-row">
      <div class="alert-info-col">
        <div style="display:flex;align-items:center;">
          <span class="tk">${a.ticker}</span>
          ${isTriggered?'<span class="triggered-note">⚡ Triggered</span>':''}
        </div>
        <div class="alert-detail">${dirLabel} GH₵${fmt(a.target_price,2)}</div>
        <div class="alert-detail" style="margin-top:2px;">Current price: <span style="color:var(--text);">GH₵${fmt(currentPrice,2)}</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="chip ${chipClass}" style="font-size:11px;">${isTriggered?'✓ Hit target':'Watching'}</span>
        <button class="icon-btn del" onclick="deleteAlert('${a.id}')">✕ Remove</button>
      </div>
    </div>`;
  });
}

async function saveAlert(){
  const ticker=tickerSel.value, type=document.getElementById('a-type').value, price=document.getElementById('a-price').value;
  const errEl=document.getElementById('alert-error'), sucEl=document.getElementById('alert-success');
  errEl.classList.remove('show'); sucEl.classList.remove('show');
  if(!ticker){errEl.textContent='Please select a stock.';errEl.classList.add('show');return;}
  if(!price||parseFloat(price)<=0){errEl.textContent='Enter a valid target price.';errEl.classList.add('show');return;}
  const btn=document.getElementById('alert-save-btn');
  btn.disabled=true; btn.innerHTML='<span class="spinner"></span>Saving…';
  const token=localStorage.getItem('ee_access_token');
  try{
    const res=await fetch('/api/alerts',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({ticker,alert_type:type,target_price:parseFloat(price)})});
    const data=await res.json();
    if(!res.ok){errEl.textContent=data.error||'Could not create alert.';errEl.classList.add('show');}
    else{sucEl.textContent='Alert created!';sucEl.classList.add('show');setTimeout(()=>{closeModal();loadAlerts();},900);}
  }catch{errEl.textContent='Network error.';errEl.classList.add('show');}
  btn.disabled=false; btn.textContent='Create alert';
}

async function deleteAlert(id){
  const token=localStorage.getItem('ee_access_token');
  await fetch('/api/alerts',{method:'DELETE',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({alert_id:id})});
  loadAlerts();
}

loadAlerts();
loadLiveData(loadAlerts);
</script>
  <script>
    if('serviceWorker' in navigator){
      window.addEventListener('load', ()=>{
        navigator.serviceWorker.register('/sw.js')
          .then(r=>console.log('[PWA] SW registered:', r.scope))
          .catch(e=>console.log('[PWA] SW error:', e));
      });
    }
  </script>
</body></html>
