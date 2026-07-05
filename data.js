/* ============================================================
   DATA YOU EDIT — update this block whenever your portfolio changes.
   ============================================================ */

const ASOF = "22 June 2026";

const holdings = [
  { ticker:'SIC',       name:'SIC Insurance Company',      sector:'Insurance',  shares:9291,  avg:1.05,  price:6.15 },
  { ticker:'GCB',       name:'GCB Bank PLC',               sector:'Banking',    shares:993,   avg:17.53, price:36.00 },
  { ticker:'MTNGH',     name:'MTN Ghana',                  sector:'Telecom',    shares:5511,  avg:5.38,  price:6.50 },
  { ticker:'GOIL',      name:'GOIL Company Ltd',           sector:'Energy',     shares:2477,  avg:7.70,  price:7.50 },
  { ticker:'ETI',       name:'Ecobank Transnational Inc.', sector:'Banking',    shares:13931, avg:1.59,  price:2.27 },
  { ticker:'EGH',       name:'Ecobank Ghana PLC',          sector:'Banking',    shares:117,   avg:49.48, price:39.00 },
  { ticker:'RBGH',      name:'Republic Bank Ghana',        sector:'Banking',    shares:907,   avg:5.38,  price:4.82 },
  { ticker:'KASAPREKO', name:'Kasapreko Company PLC',      sector:'Consumer Goods', shares:6666, avg:1.20, price:2.10 },
  { ticker:'CAL',       name:'CalBank PLC',                sector:'Banking',    shares:1181,  avg:0.78,  price:0.80 },
];

const history = [
  { date:'Feb 2025', value:18500  },
  { date:'Apr 2025', value:35200  },
  { date:'Jun 2025', value:58900  },
  { date:'Aug 2025', value:84300  },
  { date:'Oct 2025', value:112600 },
  { date:'Dec 2025', value:138900 },
  { date:'Feb 2026', value:156400 },
  { date:'Apr 2026', value:174800 },
  { date:'Jun 2026', value:192000 },
];

const GOAL = 1000000;

/* ============================================================
   STATIC FALLBACK DATA — all 38 GSE stocks
   Used when the live API is unavailable. Prices as of 22 June 2026.
   The live API (kwayisi GSE-API) will overwrite price/chg/volume
   on pages that call loadLiveData().
   ============================================================ */
// shares: shares outstanding in millions — sourced from GSE Monthly Equity Reports
// mktCap is now calculated dynamically from live price × shares outstanding
const gseStocks = [
  { ticker:'ACC',      name:'Access Bank Ghana PLC',        sector:'Banking',       price:31.90, chg:0.00,  shares:75.00,   yield:3.2, volume:0 },
  { ticker:'ADB',      name:'Agricultural Dev. Bank',       sector:'Banking',       price:5.30,  chg:0.00,  shares:207.00,  yield:2.1, volume:0 },
  { ticker:'ALLGH',    name:'Aluworks Ltd',                 sector:'Manufacturing', price:0.10,  chg:0.00,  shares:236.69,  yield:0.0, volume:0 },
  { ticker:'AGA',      name:'AngloGold Ashanti (Ord.)',     sector:'Mining',        price:37.00, chg:0.00,  shares:403.36,  yield:1.8, volume:0 },
  { ticker:'BOPP',     name:'Benso Oil Palm Plantation',    sector:'Agriculture',   price:85.50, chg:0.00,  shares:5.51,    yield:5.2, volume:0 },
  { ticker:'CAL',      name:'CalBank PLC',                  sector:'Banking',       price:0.73,  chg:0.00,  shares:622.46,  yield:4.0, volume:0 },
  { ticker:'CMLT',     name:'Camelot Ghana Ltd',            sector:'Consumer Goods',price:0.14,  chg:0.00,  shares:57.00,   yield:0.0, volume:0 },
  { ticker:'CLYD',     name:'Clydestone (Ghana) Ltd',       sector:'Technology',    price:2.04,  chg:0.00,  shares:32.40,   yield:0.0, volume:0 },
  { ticker:'CPC',      name:'Cocoa Processing Company',     sector:'Consumer Goods',price:0.12,  chg:0.00,  shares:2000.00, yield:0.0, volume:0 },
  { ticker:'DASPHARMA',name:'Dannex Ayrton Starwin Ltd',    sector:'Healthcare',    price:0.41,  chg:0.00,  shares:280.00,  yield:0.0, volume:0 },
  { ticker:'EGH',      name:'Ecobank Ghana Ltd',            sector:'Banking',       price:48.00, chg:0.00,  shares:322.55,  yield:7.0, volume:0 },
  { ticker:'ETI',      name:'Ecobank Transnational Inc.',   sector:'Banking',       price:2.27,  chg:-0.44, shares:24067.75,yield:2.0, volume:0 },
  { ticker:'EGL',      name:'Enterprise Group Ltd',         sector:'Insurance',     price:10.00, chg:0.00,  shares:170.89,  yield:5.5, volume:0 },
  { ticker:'FML',      name:'Fan Milk Ltd',                 sector:'Consumer Goods',price:13.32, chg:0.00,  shares:116.21,  yield:3.5, volume:0 },
  { ticker:'FAB',      name:'First Atlantic Bank Ltd',      sector:'Banking',       price:8.40,  chg:0.00,  shares:57.14,   yield:2.8, volume:0 },
  { ticker:'GCB',      name:'GCB Bank Ltd',                 sector:'Banking',       price:35.25, chg:0.00,  shares:265.00,  yield:8.0, volume:0 },
  { ticker:'GOIL',     name:'GOIL Company Ltd',             sector:'Energy',        price:7.93,  chg:0.00,  shares:391.86,  yield:5.0, volume:0 },
  { ticker:'GLD',      name:'Gold Fields Ghana GDR',        sector:'Mining',        price:462.00,chg:0.00,  shares:12.57,   yield:2.2, volume:0 },
  { ticker:'GGBL',     name:'Guinness Ghana Breweries',     sector:'Consumer Goods',price:14.75, chg:0.00,  shares:307.59,  yield:4.8, volume:0 },
  { ticker:'HORDS',    name:'Hords Ltd',                    sector:'Real Estate',   price:0.11,  chg:0.00,  shares:90.00,   yield:0.0, volume:0 },
  { ticker:'IIL',      name:'Intravenous Infusions Ltd',    sector:'Healthcare',    price:0.13,  chg:0.00,  shares:30.00,   yield:0.0, volume:0 },
  { ticker:'KPLC',     name:'Kasapreko Company PLC',        sector:'Consumer Goods',price:2.10,  chg:9.95,  shares:3762.15, yield:0.0, volume:15800000 },
  { ticker:'MAC',      name:'Mechanical Lloyd Company',     sector:'Distribution',  price:5.20,  chg:0.00,  shares:9.95,    yield:1.5, volume:0 },
  { ticker:'MMH',      name:'MHL Holdings Ltd',             sector:'Distribution',  price:0.10,  chg:0.00,  shares:90.00,   yield:0.0, volume:0 },
  { ticker:'MTNGH',    name:'MTN Ghana Ltd',                sector:'Telecom',       price:6.53,  chg:1.40,  shares:13236.18,yield:6.0, volume:0 },
  { ticker:'RBGH',     name:'Republic Bank Ghana Ltd',      sector:'Banking',       price:0.76,  chg:0.00,  shares:851.97,  yield:3.0, volume:0 },
  { ticker:'SAMBA',    name:'Samba Foods Ltd',              sector:'Consumer Goods',price:0.55,  chg:0.00,  shares:63.00,   yield:0.0, volume:0 },
  { ticker:'SIC',      name:'SIC Insurance Company Ltd',    sector:'Insurance',     price:5.60,  chg:9.80,  shares:195.65,  yield:4.0, volume:0 },
  { ticker:'SOGEGH',   name:'Société Générale Ghana Ltd',   sector:'Banking',       price:6.79,  chg:0.00,  shares:45.57,   yield:3.8, volume:0 },
  { ticker:'SCB',      name:'Standard Chartered Bank Gh.',  sector:'Banking',       price:71.37, chg:0.00,  shares:134.76,  yield:6.5, volume:0 },
  { ticker:'TOTAL',    name:'TotalEnergies Marketing Gh.',  sector:'Energy',        price:40.29, chg:-0.02, shares:9.68,    yield:5.8, volume:0 },
  { ticker:'UNIL',     name:'Unilever Ghana Ltd',           sector:'Consumer Goods',price:15.20, chg:0.00,  shares:99.00,   yield:4.2, volume:0 },
  { ticker:'UTB',      name:'UT Bank Ltd',                  sector:'Banking',       price:0.09,  chg:0.00,  shares:167.00,  yield:0.0, volume:0 },
  { ticker:'ZEN',      name:'ZEN Petroleum Holdings',       sector:'Oil & Gas',     price:9.68,  chg:5.10,  shares:320.00,  yield:0.0, volume:0 },
  { ticker:'PBC',      name:'Produce Buying Company Ltd',   sector:'Agriculture',   price:0.02,  chg:0.00,  shares:480.00,  yield:0.0, volume:0 },
  { ticker:'DIGICUT',  name:'Digicut Ghana Ltd',            sector:'Technology',    price:0.09,  chg:0.00,  shares:70.00,   yield:0.0, volume:0 },
  { ticker:'MEGA',     name:'Mega African Capital',         sector:'Banking',       price:5.20,  chg:0.00,  shares:9.95,    yield:1.2, volume:0 },
  { ticker:'MMH2',     name:'Meridian-Marshalls Holdings',  sector:'Distribution',  price:0.10,  chg:0.00,  shares:90.00,   yield:0.0, volume:0 },
];

// Dynamic market cap calculation: price × shares outstanding (millions)
// Returns formatted string e.g. "GHS 9.3B"
function calcMktCap(stock){
  const val = stock.price * stock.shares; // in millions GHS
  if(val >= 1000)  return 'GHS '+fmt(val/1000,1)+'B';
  if(val >= 1)     return 'GHS '+fmt(val,0)+'M';
  return 'GHS '+fmt(val*1000,0)+'K';
}

// Add computed mktCap to each stock on load and after price updates
gseStocks.forEach(s => { s.mktCap = calcMktCap(s); });

// GSE-CI approximation: market-cap weighted index
// Uses base period total market cap to produce an index value
// This moves proportionally with the real GSE-CI
function calcGSECI(){
  const totalMktCap = gseStocks.reduce((sum, s) => sum + (s.price * s.shares), 0);
  // Scale to approximate GSE-CI range (base ~289B GHS = 14,647 points as of Jun 2026)
  const BASE_MKTCAP = 289200; // million GHS
  const BASE_INDEX  = 14647;
  return Math.round((totalMktCap / BASE_MKTCAP) * BASE_INDEX);
}

function calcTotalMktCap(){
  const total = gseStocks.reduce((sum, s) => sum + (s.price * s.shares), 0);
  return 'GHS '+fmt(total/1000,1)+'B';
}

/* ============================================================
   END OF EDITABLE DATA
   ============================================================ */

const secColors = {
  'Banking':'#1E9E6F','Insurance':'#4C8FD1','Telecom':'#D9924C',
  'Energy':'#D9594C','Consumer Goods':'#9B7FD4','Oil & Gas':'#E8C158',
  'Mining':'#7EC8E3','Agriculture':'#6BCB77','Manufacturing':'#A0522D',
  'Technology':'#FF69B4','Healthcare':'#20B2AA','Distribution':'#DDA0DD',
  'Real Estate':'#87CEEB','Other':'#5A5D57'
};

function fmt(n,d=2){ return Number(n).toLocaleString('en-GH',{minimumFractionDigits:d,maximumFractionDigits:d}); }
function seedFrom(str){ let h=0; for(let i=0;i<str.length;i++){ h=(h*31+str.charCodeAt(i))%9973; } return h; }

let totalValue=0, totalCost=0;
holdings.forEach(h=>{
  h.value=h.shares*h.price; h.cost=h.shares*h.avg;
  h.pnl=((h.price-h.avg)/h.avg)*100; h.pnlAbs=h.value-h.cost;
  totalValue+=h.value; totalCost+=h.cost;
});
const totalPnlPct = totalCost ? ((totalValue-totalCost)/totalCost*100) : 0;
const goalPct = Math.min((totalValue/GOAL)*100,100);

/* ============================================================
   LIVE API INTEGRATION — kwayisi GSE-API (free, no key needed)
   Endpoint: https://dev.kwayisi.org/apis/gse/live
   Returns: [{name:"TICKER", price:X, change:Y, volume:Z}, ...]
   
   This function fetches live prices and merges them into gseStocks.
   It also updates your holdings prices automatically.
   
   IMPORTANT: This only works when the site is hosted online (Netlify,
   Vercel, etc.) — it will NOT work from a local file on your computer
   due to browser CORS restrictions on file:// URLs.
   Call loadLiveData() on any page that needs live prices.
   ============================================================ */

let liveDataLoaded = false;
let liveDataTimestamp = null;

async function loadLiveData(onSuccess) {
  const API_URL = 'https://dev.kwayisi.org/apis/gse/live';

  // Show loading indicator if element exists
  const statusEl = document.getElementById('liveStatus');
  if (statusEl) {
    statusEl.innerHTML = `<span class="live-dot" style="width:6px;height:6px;border-radius:50%;background:var(--gold-bright);animation:pulse 1s ease-in-out infinite;display:inline-block;margin-right:5px;"></span> Fetching live prices…`;
    statusEl.style.color = 'var(--gold-bright)';
  }

  try {
    const res = await fetch(API_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const apiData = await res.json();

    // Build a quick lookup map: TICKER -> {price, change, volume}
    const liveMap = {};
    apiData.forEach(item => {
      const t = item.name.toUpperCase();
      liveMap[t] = { price: item.price??0, chg: item.change??0, volume: item.volume??0 };
    });
    // Ticker aliases — API may use different names
    if(liveMap['KASAPREKO'] && !liveMap['KPLC']) liveMap['KPLC'] = liveMap['KASAPREKO'];
    if(liveMap['KPLC'] && !liveMap['KASAPREKO']) liveMap['KASAPREKO'] = liveMap['KPLC'];

    // Merge live prices into gseStocks
    let updatedCount = 0;
    gseStocks.forEach(stock => {
      const live = liveMap[stock.ticker.toUpperCase()];
      if (live && live.price > 0) {
        stock.price  = live.price;
        stock.chg    = live.chg;
        stock.volume = live.volume;
        updatedCount++;
      }
      // Recalculate market cap dynamically with updated price
      stock.mktCap = calcMktCap(stock);
    });

    // Update snapshot strip with live GSE-CI and market cap
    const gseci = calcGSECI();
    const totalMktCap = calcTotalMktCap();
    const gseCIEl = document.getElementById('snap-gseci');
    const mktCapEl = document.getElementById('snap-mktcap');
    if(gseCIEl) gseCIEl.textContent = gseci.toLocaleString();
    if(mktCapEl) mktCapEl.textContent = totalMktCap;

    // Also update portfolio holding prices live
    holdings.forEach(h => {
      const live = liveMap[h.ticker.toUpperCase()];
      if (live && live.price > 0) {
        h.price  = live.price;
        h.value  = h.shares * h.price;
        h.pnl    = ((h.price - h.avg) / h.avg) * 100;
        h.pnlAbs = h.value - h.cost;
      }
    });

    // Recalculate portfolio totals with live prices
    totalValue = holdings.reduce((s, h) => s + h.value, 0);

    liveDataLoaded = true;
    liveDataTimestamp = new Date();
    const timeStr = liveDataTimestamp.toLocaleTimeString('en-GH', { hour:'2-digit', minute:'2-digit' });

    if (statusEl) {
      statusEl.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green-bright);margin-right:5px;vertical-align:middle;"></span> Live · ${updatedCount} stocks updated · ${timeStr}`;
      statusEl.style.color = 'var(--green-bright)';
    }

    // Rebuild ticker strip with live data
    buildTicker();

    // Call the page's refresh function if provided
    if (typeof onSuccess === 'function') onSuccess();

  } catch (err) {
    console.warn('EagleEyE: Live API unavailable, using static data.', err.message);
    if (statusEl) {
      statusEl.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--red);margin-right:5px;vertical-align:middle;"></span> API offline — showing last saved prices`;
      statusEl.style.color = 'var(--text-faint)';
    }
    // Still call onSuccess so page renders with static data
    if (typeof onSuccess === 'function') onSuccess();
  }
}

/* ---- Eagle logo SVG ---- */
const EAGLE_SVG = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3C7 5 4 9 2 12c2 3 5 7 10 9 5-2 8-6 10-9-2-3-5-7-10-9z" stroke="#1A1300" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="#1A1300"/></svg>`;

/* ---- Navigation ---- */
const NAV_ITEMS = [
  {href:'index.html',      label:'Home'},
  {href:'dashboard.html',  label:'Portfolio'},
  {href:'watchlist.html',  label:'Watchlist'},
  {href:'research.html',   label:'Eagle Research'},
  {href:'dividends.html',  label:'Dividends'},
  {href:'market.html',     label:'Market'},
  {href:'companies.html',  label:'Companies'},
  {href:'screener.html',   label:'Screener'},
  {href:'news.html',       label:'News'},
  {href:'alerts.html',     label:'Alerts'},
  {href:'pricing.html',    label:'Pricing'},
];

function buildHeader(activePage){
  const navHtml = NAV_ITEMS.map(i=>`<a href="${i.href}" class="${i.href===activePage?'active':''}">${i.label}</a>`).join('');
  // Check if user is logged in
  const token = localStorage.getItem('ee_access_token');
  const profile = token ? JSON.parse(localStorage.getItem('ee_profile')||'null') : null;
  const authHtml = profile
    ? `<span style="font-size:12px;color:var(--text-dim);font-family:var(--font-mono);padding:0 4px;">
        ${profile.plan==='premium'?'<span style="color:var(--gold-bright);">⭑ Premium</span> · ':''}${profile.firstName||''}
       </span>
       <a href="dashboard.html" class="btn btn-ghost btn-sm">Dashboard</a>
       <button class="btn btn-ghost btn-sm" onclick="localStorage.clear();window.location.href='index.html'">Log out</button>`
    : `<a href="login.html" class="btn btn-ghost btn-sm">Log in</a>
       <a href="signup.html" class="btn btn-gold btn-sm">Get started free</a>`;
  const ms = getMarketStatus();
  const msBadge = `<span style="display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:11px;
    padding:2px 9px;border-radius:10px;background:${ms.bg};border:1px solid ${ms.border};color:${ms.color};margin-left:10px;">
    <span style="width:5px;height:5px;border-radius:50%;background:${ms.color};display:inline-block;${ms.isOpen?'animation:pulse 1.8s ease-in-out infinite;':''}"></span>
    ${ms.label} · ${ms.countdown}
  </span>`;
  return `
  <div class="demo-banner">
    EagleEyE · <span id="liveStatus" style="font-family:var(--font-mono);">Fetching live GSE prices…</span>${msBadge}
  </div>
  <div class="ticker-strip"><div class="ticker-track" id="tickerTrack"></div></div>
  <div class="wrap">
    <header class="site">
      <a href="index.html" class="brand">
        <div class="brand-mark">${EAGLE_SVG}</div>
        <div class="brand-text">
          <div class="name">EagleEyE</div>
          <div class="tag">Ghana's investor intelligence platform</div>
        </div>
      </a>
      <nav class="main" id="mainNav">${navHtml}</nav>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="header-actions">${authHtml}</div>
        <button class="theme-toggle" onclick="toggleTheme()" id="themeToggleBtn" title="Switch theme" aria-label="Toggle light/dark theme">☀️</button>
        <button class="hamburger" id="hamburgerBtn" onclick="toggleMobileNav()" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  </div>
  <div class="nav-overlay" id="navOverlay" onclick="toggleMobileNav()"></div>`;
}

/* ---- GSE Market Status ----
   GSE trades Mon-Fri, 10:00-15:00 GMT (Ghana is GMT+0, no DST)
*/
function getMarketStatus(){
  const now = new Date();
  const dayUTC = now.getUTCDay(); // 0=Sun, 1=Mon ... 5=Fri, 6=Sat
  const hourUTC = now.getUTCHours();
  const minUTC = now.getUTCMinutes();
  const timeDecimal = hourUTC + minUTC/60;

  const isWeekday = dayUTC >= 1 && dayUTC <= 5;
  const isOpen = isWeekday && timeDecimal >= 10.0 && timeDecimal < 15.0;
  const isPreMarket = isWeekday && timeDecimal >= 9.0 && timeDecimal < 10.0;
  const isAfterHours = isWeekday && timeDecimal >= 15.0 && timeDecimal < 20.0;

  // Time until open or close
  let countdown = '';
  if(isOpen){
    const minsLeft = Math.round((15.0 - timeDecimal)*60);
    const h = Math.floor(minsLeft/60), m = minsLeft%60;
    countdown = `Closes in ${h>0?h+'h ':''}${m}m`;
  } else if(isPreMarket){
    const minsLeft = Math.round((10.0 - timeDecimal)*60);
    countdown = `Opens in ${minsLeft}m`;
  } else if(isWeekday && timeDecimal < 10.0){
    const minsLeft = Math.round((10.0 - timeDecimal)*60);
    const h = Math.floor(minsLeft/60), m = minsLeft%60;
    countdown = `Opens in ${h>0?h+'h ':''}${m}m`;
  } else {
    // Calculate next open
    let daysUntil = 0;
    let checkDay = dayUTC;
    for(let i=1;i<=7;i++){
      checkDay = (dayUTC+i)%7;
      if(checkDay>=1&&checkDay<=5){ daysUntil=i; break; }
    }
    countdown = daysUntil===1?'Opens tomorrow at 10:00 GMT':`Opens in ${daysUntil} days`;
  }

  return {
    isOpen,
    isPreMarket,
    isAfterHours,
    label: isOpen ? 'Market Open' : isPreMarket ? 'Pre-Market' : 'Market Closed',
    color: isOpen ? 'var(--green-bright)' : isPreMarket ? 'var(--gold-bright)' : 'var(--red)',
    bg: isOpen ? 'var(--green-fill)' : isPreMarket ? 'rgba(212,165,55,0.10)' : 'var(--red-fill)',
    border: isOpen ? 'rgba(47,201,141,0.25)' : isPreMarket ? 'rgba(212,165,55,0.25)' : 'rgba(217,89,76,0.25)',
    countdown,
    session: isWeekday ? `${isOpen?'Trading':'Regular'} session: 10:00–15:00 GMT` : 'Weekend — market closed',
  };
}

function buildFooter(){
  return `<div class="wrap">
    <footer class="site">
      <div>
        <div style="font-family:var(--font-display);font-size:15px;font-weight:600;margin-bottom:4px;">EagleEyE</div>
        <div style="font-size:11px;color:var(--text-faint);">Ghana's investor intelligence platform. Not investment advice.</div>
      </div>
      <div class="foot-links">
        ${NAV_ITEMS.map(i=>`<a href="${i.href}">${i.label}</a>`).join('')}
      </div>
    </footer>
  </div>`;
}

function mountChrome(activePage){
  const hSlot = document.getElementById('chrome-header');
  if(hSlot){ hSlot.outerHTML = buildHeader(activePage); buildTicker(); }
  const fSlot = document.getElementById('chrome-footer');
  if(fSlot) fSlot.outerHTML = buildFooter();
  // Apply saved theme immediately
  applyTheme(localStorage.getItem('ee_theme')||'dark');
  // Mount feedback widget on every page
  mountFeedbackWidget(activePage);
  // Show trial banner if applicable (injected after header)
  setTimeout(mountTrialBanner, 100);
}

function buildTicker(){
  const el = document.getElementById('tickerTrack');
  if(!el) return;
  // Prioritise stocks that moved today, then fill with others
  const movers = gseStocks.filter(s=>s.chg!==0);
  const flat    = gseStocks.filter(s=>s.chg===0);
  const strip   = [...movers, ...flat].slice(0, 18);
  let html = '';
  [...strip, ...strip].forEach(d => {
    const up = d.chg > 0, flat = d.chg === 0;
    html += `<span class="ticker-item"><b>${d.ticker}</b> GH₵${fmt(d.price,2)} <span class="${up?'t-up':flat?'':'t-down'}">${up?'▲ +':flat?'—':' ▼ '}${flat?'':fmt(Math.abs(d.chg),2)+'%'}</span></span>`;
  });
  el.innerHTML = html;
}

/* ---- Mock toast ---- */
function mockAction(e, label){
  if(e) e.preventDefault();
  let toast = document.getElementById('mockToast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'mockToast';
    toast.className = 'mock-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<strong>${label}</strong> — this feature needs a live backend (Bubble.io or a developer). This is a demo of the platform design. <a href="https://bubble.io" target="_blank" style="color:var(--gold-bright);">Learn about Bubble →</a>`;
  toast.classList.add('show');
  clearTimeout(window._mockTimer);
  window._mockTimer = setTimeout(()=>toast.classList.remove('show'), 4500);
}

/* ---- Feedback Widget ---- */
function mountFeedbackWidget(currentPage){
  // Don't show on admin page
  if(currentPage==='admin.html') return;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <!-- Floating feedback button -->
    <button class="feedback-fab" onclick="toggleFeedback()" id="feedbackFab" aria-label="Send feedback">
      💬
      <span class="fab-label">Send feedback</span>
    </button>

    <!-- Feedback drawer -->
    <div class="feedback-drawer" id="feedbackDrawer">
      <div class="feedback-drawer-head">
        <h3>Share your feedback</h3>
        <button class="feedback-close" onclick="toggleFeedback()" aria-label="Close">✕</button>
      </div>
      <div class="feedback-body" id="feedbackBody">
        <div class="star-row" id="starRow">
          ${[1,2,3,4,5].map(n=>`<button class="star-btn" data-val="${n}" onclick="setRating(${n})" title="${n} star${n>1?'s':''}">★</button>`).join('')}
        </div>
        <div class="fb-field">
          <label>Category</label>
          <select id="fbCat">
            <option value="General">General</option>
            <option value="Bug">Bug / Something broken</option>
            <option value="Feature request">Feature request</option>
            <option value="Data issue">Data issue (wrong price / info)</option>
            <option value="Design">Design / Usability</option>
            <option value="Performance">Speed / Performance</option>
          </select>
        </div>
        <div class="fb-field">
          <label>Your feedback</label>
          <textarea id="fbMessage" placeholder="Tell us what you think, what's missing, or what could be better…"></textarea>
        </div>
        <div class="fb-field">
          <label>Email (optional — if you want a reply)</label>
          <input type="email" id="fbEmail" placeholder="your@email.com">
        </div>
        <div class="fb-error" id="fbError"></div>
        <button class="fb-submit" id="fbSubmit" onclick="submitFeedback()">Send feedback</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  window._feedbackPage = currentPage;
  window._feedbackRating = 0;
}

function toggleFeedback(){
  const drawer = document.getElementById('feedbackDrawer');
  drawer.classList.toggle('open');
}

function setRating(val){
  window._feedbackRating = val;
  document.querySelectorAll('.star-btn').forEach(btn=>{
    btn.classList.toggle('active', parseInt(btn.dataset.val) <= val);
  });
}

async function submitFeedback(){
  const message = document.getElementById('fbMessage').value.trim();
  const category = document.getElementById('fbCat').value;
  const email = document.getElementById('fbEmail').value.trim();
  const errEl = document.getElementById('fbError');
  errEl.classList.remove('show');

  if(!message){ errEl.textContent='Please enter a message before submitting.'; errEl.classList.add('show'); return; }

  const btn = document.getElementById('fbSubmit');
  btn.disabled=true; btn.textContent='Sending…';

  const token = localStorage.getItem('ee_access_token') || '';
  const SB_URL  = 'https://jyhamtniuhlsbwcdfspa.supabase.co';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0';

  try{
    const res = await fetch(`${SB_URL}/rest/v1/feedback`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey': SB_ANON,
        ...(token?{'Authorization':`Bearer ${token}`}:{'Authorization':`Bearer ${SB_ANON}`}),
        'Prefer':'return=minimal',
      },
      body:JSON.stringify({
        rating:   window._feedbackRating || null,
        category,
        message,
        email:    email || null,
        page:     window._feedbackPage || 'unknown',
      }),
    });
    if(!res.ok){
      const d = await res.json().catch(()=>({}));
      errEl.textContent=d.message||d.error||'Could not send. Try again.';
      errEl.classList.add('show'); btn.disabled=false; btn.textContent='Send feedback'; return;
    }
    document.getElementById('feedbackBody').innerHTML=`
      <div class="fb-success">
        <div class="icon">🙏</div>
        <p><strong>Thank you!</strong><br>Your feedback helps make EagleEyE better for every Ghanaian investor.</p>
        <button class="fb-submit" style="margin-top:16px;" onclick="toggleFeedback()">Close</button>
      </div>`;
  }catch(e){
    errEl.textContent='Network error. Please try again.'; errEl.classList.add('show');
    btn.disabled=false; btn.textContent='Send feedback';
  }
}

/* ---- Mobile Nav Toggle ---- */
function toggleMobileNav(){
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('hamburgerBtn');
  const overlay = document.getElementById('navOverlay');
  if(!nav) return;
  nav.classList.toggle('open');
  btn?.classList.toggle('open');
  overlay?.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
}

/* ---- Theme Toggle ---- */
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  // Update toggle button icon
  const btn = document.getElementById('themeToggleBtn');
  if(btn) btn.textContent = theme==='dark' ? '☀️' : '🌙';
  // Update toggle button title
  if(btn) btn.title = theme==='dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

function toggleTheme(){
  const current = localStorage.getItem('ee_theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('ee_theme', next);
  applyTheme(next);
}

// Apply theme immediately on script load to prevent flash
(function(){
  const saved = localStorage.getItem('ee_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* ---- Trial Banner ---- */
function mountTrialBanner(){
  const profile = JSON.parse(localStorage.getItem('ee_profile')||'null');
  if(!profile || profile.plan==='premium') return;
  if(!profile.trialEndsAt) return;

  const ends = new Date(profile.trialEndsAt);
  const now  = new Date();
  const msLeft = ends - now;
  const daysLeft = Math.ceil(msLeft / (1000*60*60*24));

  // Don't show banner if trial has long time left (> 7 days) to avoid fatigue
  // Always show if <= 7 days remaining or expired
  if(msLeft > 0 && daysLeft > 7) return;

  const isExpired = msLeft <= 0;
  const bg    = isExpired ? 'var(--red-fill)'         : 'rgba(212,165,55,0.10)';
  const border= isExpired ? 'rgba(217,82,72,0.3)'     : 'rgba(212,165,55,0.25)';
  const color = isExpired ? 'var(--red)'               : 'var(--gold-bright)';
  const msg   = isExpired
    ? '⏰ Your free trial has ended. Upgrade to keep access to Premium features.'
    : `⭑ Free trial — <strong>${daysLeft} day${daysLeft===1?'':'s'} left</strong>. Upgrade to keep your Premium access after the trial ends.`;

  // Remove existing banner if any
  document.getElementById('trial-banner')?.remove();

  const banner = document.createElement('div');
  banner.id = 'trial-banner';
  banner.style.cssText = `
    background:${bg};border-bottom:1px solid ${border};
    padding:9px 20px;display:flex;align-items:center;
    justify-content:space-between;flex-wrap:wrap;gap:8px;
    font-size:12.5px;color:${color};
  `;
  banner.innerHTML = `
    <span>${msg}</span>
    <a href="pricing.html" style="
      font-size:12px;font-weight:700;padding:5px 13px;
      border-radius:7px;background:${isExpired?'var(--red)':'var(--gold)'};
      color:${isExpired?'#fff':'#1A1300'};text-decoration:none;flex-shrink:0;
    ">Upgrade now →</a>
  `;

  // Insert after the demo-banner (first child of body)
  const demoBanner = document.querySelector('.demo-banner');
  if(demoBanner && demoBanner.parentNode){
    demoBanner.parentNode.insertBefore(banner, demoBanner.nextSibling);
  } else {
    document.body.prepend(banner);
  }

  // Auto-dismiss after 4 seconds (only for non-expired banners)
  if(!isExpired){
    setTimeout(()=>{
      banner.style.transition = 'max-height .5s ease, opacity .5s ease, padding .5s ease';
      banner.style.opacity = '0';
      banner.style.maxHeight = '0';
      banner.style.padding = '0';
      setTimeout(()=>{ banner.remove(); }, 520);
    }, 4000);
  }
}
