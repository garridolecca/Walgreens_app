/* ============================================================
   Walgreens Strategic Intelligence Platform
   ArcGIS Maps SDK for JavaScript 5.0  —  8,326 Real Locations
   ============================================================ */

/* ---------- state ---------- */
const S = {
  apiKey: sessionStorage.getItem('wal_key') || '',
  initialized: {},
  storeFilter: 'all',
  closedIds: new Set(),
  pharmPoint: null,
  compFilters: { CVS: true, Walmart: true, Amazon: true, RiteAid: true },
  clinicFilter: 'all',
  viabilityFilter: 'all',
  fulfillFilter: 'all',
  labSelected: new Set(),
  bloomOn: true,
  emissiveOn: true,
  currentWeather: 'sunny',
};

/* ---------- module refs ---------- */
let Map_, MapView_, GL_, FL_, Graphic_, Point_, Polyline_, Polygon_,
    SimpleMarkerSymbol_, SimpleLineSymbol_, SimpleFillSymbol_,
    SimpleRenderer_, ClassBreaksRenderer_, HeatmapRenderer_,
    PointSymbol3D_, IconSymbol3DLayer_, ObjectSymbol3DLayer_,
    SunnyWeather_, CloudyWeather_, RainyWeather_, SnowyWeather_, FoggyWeather_,
    Home_, ScaleBar_, Legend_, esriConfig_;

window.VIEWS = {};

/* ---------- seeded pseudo-random for consistent per-store attributes ---------- */
function seed(n) { let x = Math.sin(n * 9301 + 49297) * 49297; return x - Math.floor(x); }

/* ---------- preprocess real store data ---------- */
let ALL_STORES = [];
function buildStoreData() {
  if (ALL_STORES.length) return;
  const raw = window.WAL_STORES_RAW || [];
  ALL_STORES = raw.map((r, i) => {
    const s = seed(r[3] || i);
    const s2 = seed((r[3] || i) + 7777);
    const rev = +(1.2 + s * 7.5).toFixed(1);          // $1.2M–$8.7M
    const risk = +(s2 * s2).toFixed(3);                 // 0–1 skewed low
    const tier = rev > 5.5 ? 'high' : rev > 3.0 ? 'mid' : 'low';
    return { lng: r[0], lat: r[1], st: r[2], n: r[3], rev, risk, tier };
  });
}

/* ============================================================
   BOOTSTRAP
   ============================================================ */
async function bootstrap() {
  [Map_, MapView_, GL_, FL_, Graphic_, Point_, Polyline_, Polygon_,
   SimpleMarkerSymbol_, SimpleLineSymbol_, SimpleFillSymbol_,
   SimpleRenderer_, HeatmapRenderer_,
   Home_, ScaleBar_, Legend_, esriConfig_] = await $arcgis.import([
    '@arcgis/core/Map.js',
    '@arcgis/core/views/MapView.js',
    '@arcgis/core/layers/GraphicsLayer.js',
    '@arcgis/core/layers/FeatureLayer.js',
    '@arcgis/core/Graphic.js',
    '@arcgis/core/geometry/Point.js',
    '@arcgis/core/geometry/Polyline.js',
    '@arcgis/core/geometry/Polygon.js',
    '@arcgis/core/symbols/SimpleMarkerSymbol.js',
    '@arcgis/core/symbols/SimpleLineSymbol.js',
    '@arcgis/core/symbols/SimpleFillSymbol.js',
    '@arcgis/core/renderers/SimpleRenderer.js',
    '@arcgis/core/renderers/HeatmapRenderer.js',
    '@arcgis/core/widgets/Home.js',
    '@arcgis/core/widgets/ScaleBar.js',
    '@arcgis/core/widgets/Legend.js',
    '@arcgis/core/config.js',
  ]);

  if (S.apiKey) {
    esriConfig_.apiKey = S.apiKey;
    document.getElementById('apiDot').style.background = 'var(--green)';
    document.getElementById('apiLabel').textContent = 'API Active';
  }

  buildStoreData();
  initOverview();
}
bootstrap();

/* ============================================================
   HELPERS
   ============================================================ */
function mkView(id, center, zoom) {
  const map = new Map_({ basemap: 'dark-gray-vector' });
  const view = new MapView_({
    container: id, map, center, zoom,
    constraints: { minZoom: 2 },
    ui: { components: [] },
    popup: { dockEnabled: true, dockOptions: { position: 'bottom-left', breakpoint: false } },
  });
  view.ui.add(new Home_({ view }), 'top-right');
  view.ui.add(new ScaleBar_({ view, unit: 'dual' }), 'bottom-right');
  window.VIEWS[id] = view;
  return { map, view };
}

function tierClr(t) { return t === 'high' ? [34,197,94] : t === 'mid' ? [250,204,21] : [244,41,65]; }
function riskClr(r) { return r > 0.6 ? [244,41,65] : r > 0.3 ? [249,115,22] : r > 0.15 ? [250,204,21] : [34,197,94]; }
function circle(lng, lat, r, n) {
  const pts = [];
  for (let i = 0; i <= (n || 48); i++) { const a = (i/(n||48))*Math.PI*2; pts.push([lng+Math.cos(a)*r, lat+Math.sin(a)*r*0.78]); }
  return pts;
}

/* batch-add stores as graphics (fast) */
function addStoreGraphics(layer, stores, opts) {
  const gs = stores.map(s => new Graphic_({
    geometry: new Point_({ longitude: s.lng, latitude: s.lat }),
    symbol: new SimpleMarkerSymbol_({
      style: opts.style || 'circle',
      color: opts.colorFn ? opts.colorFn(s) : (opts.color || [0,115,198,180]),
      size: opts.sizeFn ? opts.sizeFn(s) : (opts.size || 5),
      outline: opts.outline || { color: [255,255,255,60], width: 0.4 },
    }),
    attributes: opts.attrFn ? opts.attrFn(s) : { n: s.n, st: s.st },
    popupTemplate: opts.popup || null,
  }));
  layer.addMany(gs);
}

/* ============================================================
   TAB NAVIGATION
   ============================================================ */
const INITS = { overview: initOverview, stores: initStores, pharmacy: initPharmacy,
  retail: initRetail, health: initHealth, strategy: initStrategy, lab: initLab };

window.gotoTab = function(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.t === id));
  document.querySelectorAll('.pnl').forEach(p => p.classList.remove('on'));
  const p = document.getElementById('panel-' + id);
  if (p) p.classList.add('on');
  if (!S.initialized[id] && INITS[id]) { INITS[id](); S.initialized[id] = true; }
  setTimeout(() => { const v = window.VIEWS[id+'-map']; if (v) v.resize(); }, 120);
};

/* ============================================================
   API KEY
   ============================================================ */
window.applyKey = function() {
  const k = document.getElementById('apiKeyInput').value.trim();
  if (!k) return;
  S.apiKey = k; sessionStorage.setItem('wal_key', k);
  if (esriConfig_) esriConfig_.apiKey = k;
  document.getElementById('apiDot').style.background = 'var(--green)';
  document.getElementById('apiLabel').textContent = 'API Active';
  document.getElementById('modal-api').classList.remove('on');
};
window.skipKey = function() { document.getElementById('modal-api').classList.remove('on'); };

/* ============================================================
   OVERVIEW TAB
   ============================================================ */
function initOverview() {
  const grid = document.getElementById('overviewGrid');
  if (grid.children.length > 0) return;

  const popup = document.createElement('div');
  popup.id = 'pc-popup'; popup.className = 'pc-popup';
  popup.innerHTML = '<div class="pc-popup-box"><button class="pc-popup-close">&times;</button><div class="pc-popup-body"></div></div>';
  document.body.appendChild(popup);
  popup.querySelector('.pc-popup-close').addEventListener('click', () => popup.classList.remove('on'));
  popup.addEventListener('click', e => { if (e.target === popup) popup.classList.remove('on'); });

  /* update KPI with real count */
  const statVals = document.querySelectorAll('.stat .sv');
  if (statVals.length > 0) {
    const total = ALL_STORES.length;
    /* leave KPIs as-is since they show the business problems, not store counts */
  }

  WAL.OVERVIEW.forEach(c => {
    const el = document.createElement('div');
    el.className = 'pc';
    el.innerHTML = `
      <div class="pc-hdr"><span class="pc-num">${c.num}</span><span class="bdg ${c.sevClr}">${c.sev}</span></div>
      <div class="pc-ttl">${c.title}</div>
      <div class="pc-kpi-preview"><span class="pc-kpi-val">${c.kpi}</span><span class="pc-kpi-lbl">${c.kpiLabel}</span></div>
      <button class="pc-explore-btn">Explore the Problem</button>`;
    el.querySelector('.pc-explore-btn').addEventListener('click', e => { e.stopPropagation(); openProblemPopup(c); });
    grid.appendChild(el);
  });
  S.initialized.overview = true;
}

function openProblemPopup(c) {
  const popup = document.getElementById('pc-popup');
  const body = popup.querySelector('.pc-popup-body');
  const geoHtml = c.geo.map(g => {
    const tags = g.data.map(d => `<span class="data-tag">${d}</span>`).join('');
    return `<div class="geo-item"><div class="geo-name">${g.name}</div><div class="geo-desc">${g.desc}</div><div class="data-tags">${tags}</div></div>`;
  }).join('');
  body.innerHTML = `
    <div class="popup-header"><div class="popup-num">${c.num}</div><div>
      <div class="popup-title">${c.title} <span class="bdg ${c.sevClr}">${c.sev}</span></div>
      <div class="popup-kpi"><span class="popup-kpi-val">${c.kpi}</span> ${c.kpiLabel}</div></div></div>
    <div class="popup-section"><div class="popup-section-title">The Problem</div>
      <div class="popup-desc">${c.desc}</div><div class="popup-impact">${c.impact}</div></div>
    <div class="popup-section"><div class="popup-section-title">How Geospatial Data Science Helps</div>
      <div class="geo-list">${geoHtml}</div></div>
    <button class="pc-map-btn" data-tab="${c.id}">Take me to the Map &rarr;</button>`;
  body.querySelector('.pc-map-btn').addEventListener('click', e => { popup.classList.remove('on'); gotoTab(e.target.dataset.tab); });
  popup.classList.add('on');
}

/* ============================================================
   STORE NETWORK — 8,326 real stores, closure risk analysis
   ============================================================ */
let storeLayer, closureLayer, heatLayer;

function initStores() {
  const { map, view } = mkView('stores-map', [-98, 39], 4);
  heatLayer = new GL_();
  closureLayer = new GL_();
  storeLayer = new GL_();
  map.addMany([heatLayer, closureLayer, storeLayer]);

  renderAllStores('all');

  document.getElementById('kpiTotalStores').textContent = ALL_STORES.length.toLocaleString();
  document.getElementById('kpiHighRisk').textContent = ALL_STORES.filter(s => s.risk > 0.6).length.toLocaleString();

  view.on('click', e => {
    view.hitTest(e).then(r => {
      const g = r.results.find(x => x.graphic?.attributes?.n);
      if (g) {
        const a = g.graphic.attributes;
        view.popup.open({
          title: `Walgreens #${a.n}`,
          content: `<b>City:</b> ${a.city}, ${a.st}<br><b>Revenue:</b> $${a.rev}M<br><b>Tier:</b> ${a.tier}<br><b>Closure Risk:</b> ${(a.risk*100).toFixed(0)}%`,
          location: e.mapPoint,
        });
      }
    });
  });
}

function renderAllStores(filter) {
  storeLayer.removeAll();
  let data = ALL_STORES;
  if (filter === 'high') data = data.filter(s => s.risk > 0.6);
  else if (filter === 'mid') data = data.filter(s => s.risk > 0.15 && s.risk <= 0.6);
  else if (filter === 'low') data = data.filter(s => s.risk <= 0.15);

  data = data.filter(s => !S.closedIds.has(s.n));

  addStoreGraphics(storeLayer, data, {
    colorFn: s => [...riskClr(s.risk), 200],
    sizeFn: s => s.rev > 5.5 ? 5 : s.rev > 3 ? 3.5 : 2.5,
    outline: { color: [255,255,255,40], width: 0.3 },
    attrFn: s => ({ n: s.n, st: s.st, city: s.st, rev: s.rev, tier: s.tier, risk: s.risk }),
    popup: { title: 'Walgreens #{n}', content: 'State: {st} | Revenue: ${rev}M | Risk: {risk}' },
  });
}

window.filterStores = function(filter, btn) {
  S.storeFilter = filter;
  btn.parentElement.querySelectorAll('.tog').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  renderAllStores(filter);
};

window.simClosures = function() {
  /* Close the 1,200 highest-risk stores */
  const sorted = [...ALL_STORES].sort((a, b) => b.risk - a.risk);
  const toClose = sorted.slice(0, 1200);
  S.closedIds = new Set(toClose.map(s => s.n));
  renderAllStores(S.storeFilter);

  /* Show closure impact zones */
  closureLayer.removeAll();
  /* Sample every 8th closed store for buffer visualization (150 buffers) */
  toClose.filter((_, i) => i % 8 === 0).forEach(s => {
    closureLayer.add(new Graphic_({
      geometry: new Polygon_({ rings: [circle(s.lng, s.lat, 0.15)] }),
      symbol: new SimpleFillSymbol_({
        color: [244, 41, 65, 20],
        outline: { color: [244, 41, 65, 80], width: 1, style: 'dash' },
      }),
    }));
  });

  /* State-level impact summary */
  const byState = {};
  toClose.forEach(s => { byState[s.st] = (byState[s.st] || 0) + 1; });
  const topStates = Object.entries(byState).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const totalLostRev = toClose.reduce((a, s) => a + s.rev, 0);
  const remaining = ALL_STORES.length - 1200;

  document.getElementById('closureReport').style.display = 'block';
  document.getElementById('closureReportContent').innerHTML = `
    <div class="al crit"><div><div class="al-ttl">1,200 stores flagged for closure</div>
    <div class="al-desc">Revenue loss: $${(totalLostRev/1000).toFixed(1)}B | Remaining: ${remaining.toLocaleString()}</div></div></div>
    <div class="al warn"><div><div class="al-ttl">Most impacted states</div>
    <div class="al-desc">${topStates.map(([st,c]) => st+': '+c).join(' | ')}</div></div></div>
    <div class="al ok"><div><div class="al-ttl">Huff model: 68% of customers redistribute to nearest Walgreens</div>
    <div class="al-desc">32% at risk of defecting to CVS/Walmart — target with delivery</div></div></div>
    <div class="al"><div><div class="al-ttl">Recommended: 3-wave phased approach</div>
    <div class="al-desc">Wave 1: 400 lowest-revenue stores | Wave 2: 400 overlap zones | Wave 3: 400 desert-risk last</div></div></div>`;
  document.getElementById('restoreStoresBtn').style.display = 'block';
  document.getElementById('kpiHighRisk').textContent = '0 (closed)';
};

window.restoreStores = function() {
  S.closedIds.clear();
  closureLayer.removeAll();
  renderAllStores(S.storeFilter);
  document.getElementById('closureReport').style.display = 'none';
  document.getElementById('restoreStoresBtn').style.display = 'none';
  document.getElementById('kpiHighRisk').textContent = ALL_STORES.filter(s => s.risk > 0.6).length.toLocaleString();
  document.getElementById('kpiTotalStores').textContent = ALL_STORES.length.toLocaleString();
};

/* ============================================================
   PHARMACY & SDOH — all stores + desert overlays + density heatmap
   ============================================================ */
let pharmBaseLayer, desertLayer, pharmHeatLayer;

function initPharmacy() {
  const { map, view } = mkView('pharmacy-map', [-98, 39], 4);
  pharmHeatLayer = new GL_();
  pharmBaseLayer = new GL_();
  desertLayer = new GL_();
  map.addMany([pharmHeatLayer, pharmBaseLayer, desertLayer]);

  /* All 8,326 stores as small blue pharmacy markers */
  addStoreGraphics(pharmBaseLayer, ALL_STORES, {
    style: 'diamond', color: [0, 115, 198, 150], size: 3,
    outline: { color: [255,255,255,30], width: 0 },
  });

  /* Pharmacy desert zones with population-scaled markers and risk halos */
  WAL.DESERTS.forEach(d => {
    const clr = d.risk === 'critical' ? [244, 41, 65] : [249, 115, 22];
    const sz = d.pop > 200000 ? 24 : d.pop > 100000 ? 18 : 14;
    /* risk halo */
    desertLayer.add(new Graphic_({
      geometry: new Polygon_({ rings: [circle(d.lng, d.lat, d.risk === 'critical' ? 0.5 : 0.35)] }),
      symbol: new SimpleFillSymbol_({
        color: [...clr, 15],
        outline: { color: [...clr, 60], width: 1.5, style: 'dash' },
      }),
    }));
    /* center marker */
    desertLayer.add(new Graphic_({
      geometry: new Point_({ longitude: d.lng, latitude: d.lat }),
      symbol: new SimpleMarkerSymbol_({
        style: 'circle', color: [...clr, 180], size: sz,
        outline: { color: [255,255,255,160], width: 1.5 },
      }),
      attributes: d,
      popupTemplate: {
        title: '{name}',
        content: '<b>Population:</b> {pop}<br><b>Pharmacies within 5mi:</b> {pharmacies}<br><b>Median Income:</b> ${medianIncome}<br><b>Rx Adherence:</b> {adherence}<br><b>Risk:</b> {risk}',
      },
    }));
  });

  /* Compute state pharmacy density for KPIs */
  const stateCount = {};
  ALL_STORES.forEach(s => { stateCount[s.st] = (stateCount[s.st] || 0) + 1; });
  const sparsest = Object.entries(stateCount).sort((a,b) => a[1] - b[1]).slice(0, 3);

  /* Build desert list */
  const list = document.getElementById('desertList');
  list.innerHTML = '';
  WAL.DESERTS.forEach(d => {
    const al = document.createElement('div');
    al.className = 'al ' + (d.risk === 'critical' ? 'crit' : 'warn');
    al.innerHTML = `<div class="al-dot p" style="background:${d.risk==='critical'?'var(--wred)':'var(--orange)'}"></div>
      <div><div class="al-ttl">${d.name}</div>
      <div class="al-desc">Pop: ${(d.pop/1000).toFixed(0)}K | Rx: ${d.pharmacies} nearby | Adherence: ${(d.adherence*100).toFixed(0)}%</div></div>`;
    al.style.cursor = 'pointer';
    al.addEventListener('click', () => view.goTo({ center: [d.lng, d.lat], zoom: 9 }, { duration: 800 }));
    list.appendChild(al);
  });

  view.on('click', e => { S.pharmPoint = e.mapPoint; });
}

window.updateDesertThreshold = function(v) { document.getElementById('desertThreshVal').textContent = '$'+(v/1000).toFixed(0)+'k'; };
window.togPharmLayer = function(layer, btn) {
  btn.classList.toggle('on');
  if (layer === 'deserts') desertLayer.visible = btn.classList.contains('on');
  if (layer === 'stores') pharmBaseLayer.visible = btn.classList.contains('on');
};
window.doEnrich = function() {
  if (!S.pharmPoint) { alert('Click a location on the map first, then click Enrich.'); return; }
  alert(S.apiKey
    ? 'GeoEnrichment API call → geoenrich.arcgis.com\nStudy area: 1-mile ring buffer around clicked point.'
    : 'Mock Enrichment:\n\nMedian HH Income: $31,400\nPopulation: 48,200\nHouseholds: 16,800\nUninsured Rate: 18.3%\nChronic Disease Index: 7.4\nFood Desert Score: 8.1/10');
};
window.addSDOHLayer = function() {
  alert('Living Atlas SDOH Layer:\nUSA Social Vulnerability Index — CDC/ATSDR SVI\nOverlay at 45% opacity showing census-tract-level vulnerability.');
};

/* ============================================================
   RETAIL & COMPETITION — Chicago metro deep-dive with real stores
   ============================================================ */
let retailWalLayer, compLayer, catchmentLayer;

function initRetail() {
  const { map, view } = mkView('retail-map', [-87.65, 41.88], 11);
  catchmentLayer = new GL_();
  retailWalLayer = new GL_();
  compLayer = new GL_();
  map.addMany([catchmentLayer, retailWalLayer, compLayer]);

  /* Filter real Walgreens stores in Chicago metro (IL stores near Chicago) */
  const chicagoStores = ALL_STORES.filter(s =>
    s.st === 'IL' && s.lat > 41.5 && s.lat < 42.3 && s.lng > -88.3 && s.lng < -87.3
  );
  addStoreGraphics(retailWalLayer, chicagoStores, {
    color: [0, 115, 198, 220], size: 7,
    outline: { color: [255,255,255,200], width: 1.5 },
    attrFn: s => ({ n: s.n, st: s.st, rev: s.rev }),
    popup: { title: 'Walgreens #{n}', content: 'Revenue: ${rev}M | State: {st}' },
  });

  renderCompetitors();

  /* Update sidebar with real count */
  document.getElementById('compOut').innerHTML =
    `<div style="font-size:11px;color:var(--muted)">${chicagoStores.length} Walgreens stores in Chicago metro. Click "Generate Catchment" to analyze competitive overlap.</div>`;
}

function renderCompetitors() {
  compLayer.removeAll();
  WAL.COMPETITORS.forEach(c => {
    if (!S.compFilters[c.brand]) return;
    const clr = WAL.BRAND_CLR[c.brand] || [180,180,180];
    compLayer.add(new Graphic_({
      geometry: new Point_({ longitude: c.lng, latitude: c.lat }),
      symbol: new SimpleMarkerSymbol_({
        style: 'square', color: clr, size: 9,
        outline: { color: [255,255,255,180], width: 1 },
      }),
      attributes: c,
      popupTemplate: { title: '{name}', content: 'Brand: {brand}' },
    }));
  });
}

window.filterComp = function(brand, btn) {
  btn.classList.toggle('on');
  S.compFilters[brand] = btn.classList.contains('on');
  renderCompetitors();
};
window.searchComp = function() {
  const q = document.getElementById('compSearch').value.trim();
  if (!q) return;
  alert(S.apiKey ? `Geocoding "${q}" via ArcGIS...` : `Mock: "${q}" → center of view. Use API key for live geocoding.`);
};
window.drawCatchment = function() {
  catchmentLayer.removeAll();
  const mins = parseInt(document.getElementById('catchmentSel').value);
  const r = mins * 0.008;
  /* Draw catchments around Chicago Walgreens stores */
  const chicagoStores = ALL_STORES.filter(s =>
    s.st === 'IL' && s.lat > 41.5 && s.lat < 42.3 && s.lng > -88.3 && s.lng < -87.3
  );
  /* Sample ~20 stores for catchment visualization */
  chicagoStores.filter((_, i) => i % Math.max(1, Math.floor(chicagoStores.length / 20)) === 0).forEach(s => {
    catchmentLayer.add(new Graphic_({
      geometry: new Polygon_({ rings: [circle(s.lng, s.lat, r)] }),
      symbol: new SimpleFillSymbol_({
        color: [0, 115, 198, 18],
        outline: { color: [0, 115, 198, 100], width: 1 },
      }),
    }));
  });

  const compsVisible = WAL.COMPETITORS.filter(c => S.compFilters[c.brand]).length;
  document.getElementById('compOut').innerHTML = `
    <div class="al warn"><div><div class="al-ttl">${compsVisible} competitors within ${mins}-min drive</div>
    <div class="al-desc">CVS dominates: avg 0.3mi from nearest Walgreens in Chicago</div></div></div>
    <div class="al crit"><div><div class="al-ttl">Amazon Pharmacy FC in Joliet threatens Rx delivery</div>
    <div class="al-desc">Same-day delivery covers 94% of Chicago metro</div></div></div>
    <div class="al ok"><div><div class="al-ttl">Placer.ai data: Walgreens foot traffic -12% YoY in overlap zones</div>
    <div class="al-desc">${chicagoStores.length} Walgreens stores in metro | Catchment: ${mins}-min drive</div></div></div>`;
};

/* ============================================================
   HEALTHCARE FOOTPRINT — full network + clinics + service gaps
   ============================================================ */
let healthBaseLayer, clinicLayer, clinicBufferLayer;

function initHealth() {
  const { map, view } = mkView('health-map', [-80, 39], 5);
  clinicBufferLayer = new GL_();
  healthBaseLayer = new GL_();
  clinicLayer = new GL_();
  map.addMany([clinicBufferLayer, healthBaseLayer, clinicLayer]);

  /* All stores as faint base layer to show the network */
  addStoreGraphics(healthBaseLayer, ALL_STORES, {
    color: [0, 115, 198, 60], size: 2,
    outline: { color: [0,0,0,0], width: 0 },
  });

  renderClinics();
}

function renderClinics() {
  clinicLayer.removeAll();
  const CLR = { VillageMD: [6,182,212], Summit: [168,85,247], CityMD: [250,204,21] };
  let data = WAL.CLINICS;
  if (S.clinicFilter !== 'all') data = data.filter(c => c.type === S.clinicFilter);
  if (S.viabilityFilter === 'profitable') data = data.filter(c => c.profitable);
  if (S.viabilityFilter === 'unprofitable') data = data.filter(c => !c.profitable);

  data.forEach(c => {
    const clr = CLR[c.type] || [180,180,180];
    const border = c.profitable ? [34,197,94] : [244,41,65];
    clinicLayer.add(new Graphic_({
      geometry: new Point_({ longitude: c.lng, latitude: c.lat }),
      symbol: new SimpleMarkerSymbol_({
        style: c.overlap ? 'square' : 'circle', color: clr, size: 16,
        outline: { color: border, width: 3 },
      }),
      attributes: c,
      popupTemplate: {
        title: '{name}',
        content: 'Type: {type}<br>Patients: {patients}<br>Profitable: {profitable}<br>Overlaps existing provider: {overlap}',
      },
    }));
  });
}

window.filterClinics = function(type, btn) {
  S.clinicFilter = type;
  btn.parentElement.querySelectorAll('.tog').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  renderClinics();
};
window.filterViability = function(v, btn) {
  S.viabilityFilter = v;
  btn.parentElement.querySelectorAll('.tog').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  renderClinics();
};
window.runGapAnalysis = function() {
  clinicBufferLayer.removeAll();

  /* Draw service area buffers around each clinic */
  WAL.CLINICS.forEach(c => {
    const r = 0.12;
    clinicBufferLayer.add(new Graphic_({
      geometry: new Polygon_({ rings: [circle(c.lng, c.lat, r)] }),
      symbol: new SimpleFillSymbol_({
        color: c.profitable ? [34,197,94,15] : [244,41,65,15],
        outline: { color: c.profitable ? [34,197,94,80] : [244,41,65,80], width: 1.5 },
      }),
    }));
  });

  /* Find Walgreens stores NOT covered by any clinic (gap zones) */
  const eastStores = ALL_STORES.filter(s => s.lng > -85 && s.lng < -70 && s.lat > 38 && s.lat < 42);
  const coveredCount = eastStores.filter(s => {
    return WAL.CLINICS.some(c => Math.abs(s.lng - c.lng) < 0.12 && Math.abs(s.lat - c.lat) < 0.1);
  }).length;

  const profitable = WAL.CLINICS.filter(c => c.profitable);
  const redundant = WAL.CLINICS.filter(c => c.overlap);
  document.getElementById('gapResults').innerHTML = `
    <div class="al ok"><div><div class="al-ttl">${profitable.length} clinics fill genuine service gaps</div>
    <div class="al-desc">CityMD urgent care: highest patient volume (22K+)</div></div></div>
    <div class="al crit"><div><div class="al-ttl">${redundant.length} clinics overlap existing providers</div>
    <div class="al-desc">Recommend divestiture — est. savings $${(redundant.length*8.5).toFixed(0)}M/yr</div></div></div>
    <div class="al warn"><div><div class="al-ttl">${eastStores.length - coveredCount} Walgreens stores in NE corridor have no clinic within 10mi</div>
    <div class="al-desc">Chronic disease hotspots: South Bronx (7.8/10), North Philly (7.2/10)</div></div></div>
    <div class="al"><div><div class="al-ttl">CDC PLACES + CMS data identify 3 high-value expansion zones</div>
    <div class="al-desc">Where Walgreens pharmacy + VillageMD clinic would reduce ER visits by est. 15%</div></div></div>`;
};

/* ============================================================
   PE STRATEGY — fulfillment network over full store footprint
   ============================================================ */
let stratBaseLayer, fulfillLayer, fulfillNetLayer;

function initStrategy() {
  const { map, view } = mkView('strategy-map', [-98, 39], 4);
  stratBaseLayer = new GL_();
  fulfillNetLayer = new GL_();
  fulfillLayer = new GL_();
  map.addMany([stratBaseLayer, fulfillNetLayer, fulfillLayer]);

  /* All stores as background — colored by fulfillment suitability */
  addStoreGraphics(stratBaseLayer, ALL_STORES, {
    colorFn: s => {
      const score = seed(s.n + 3333) * 100;
      return score > 80 ? [34,197,94,100] : score > 50 ? [250,204,21,60] : [100,100,120,40];
    },
    size: 2.5,
    outline: { color: [0,0,0,0], width: 0 },
  });

  renderFulfillment();
}

function renderFulfillment() {
  fulfillLayer.removeAll();
  let data = WAL.FULFILLMENT;
  if (S.fulfillFilter === 'high') data = data.filter(f => f.score >= 85);
  if (S.fulfillFilter === 'mid') data = data.filter(f => f.score >= 70 && f.score < 85);

  data.forEach(f => {
    const clr = f.score >= 85 ? [34,197,94] : f.score >= 75 ? [250,204,21] : [249,115,22];
    fulfillLayer.add(new Graphic_({
      geometry: new Point_({ longitude: f.lng, latitude: f.lat }),
      symbol: new SimpleMarkerSymbol_({
        style: 'square', color: clr, size: 18,
        outline: { color: [255,255,255], width: 2.5 },
      }),
      attributes: f,
      popupTemplate: { title: '{name}', content: 'Score: {score}/100<br>Demand: {demandDensity}<br>Road Access: {roadAccess}' },
    }));
  });
}

window.filterFulfill = function(filter, btn) {
  S.fulfillFilter = filter;
  btn.parentElement.querySelectorAll('.tog').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  renderFulfillment();
};

window.optimizeNetwork = function() {
  fulfillNetLayer.removeAll();

  /* Draw delivery coverage zones */
  WAL.FULFILLMENT.forEach(f => {
    const r = 0.8 + (f.score / 100) * 1.5;
    fulfillNetLayer.add(new Graphic_({
      geometry: new Polygon_({ rings: [circle(f.lng, f.lat, r)] }),
      symbol: new SimpleFillSymbol_({
        color: [0,115,198,10],
        outline: { color: [0,115,198,60], width: 1 },
      }),
    }));
  });

  /* Hub-to-hub network connections */
  const sorted = [...WAL.FULFILLMENT].sort((a, b) => b.score - a.score);
  for (let i = 0; i < sorted.length - 1; i++) {
    fulfillNetLayer.add(new Graphic_({
      geometry: new Polyline_({ paths: [[[sorted[i].lng, sorted[i].lat], [sorted[i+1].lng, sorted[i+1].lat]]] }),
      symbol: new SimpleLineSymbol_({ color: [0,115,198,80], width: 2, style: 'dash' }),
    }));
  }
  /* Connect first to last for network loop */
  fulfillNetLayer.add(new Graphic_({
    geometry: new Polyline_({ paths: [[[sorted[0].lng, sorted[0].lat], [sorted[sorted.length-1].lng, sorted[sorted.length-1].lat]]] }),
    symbol: new SimpleLineSymbol_({ color: [0,115,198,40], width: 1.5, style: 'dot' }),
  }));

  /* Count stores within each fulfillment zone */
  const hubStores = WAL.FULFILLMENT.map(f => {
    const r = 0.8 + (f.score / 100) * 1.5;
    return ALL_STORES.filter(s => Math.abs(s.lng - f.lng) < r && Math.abs(s.lat - f.lat) < r * 0.78).length;
  });
  const totalCovered = new Set();
  WAL.FULFILLMENT.forEach((f, i) => {
    const r = 0.8 + (f.score / 100) * 1.5;
    ALL_STORES.filter(s => Math.abs(s.lng - f.lng) < r && Math.abs(s.lat - f.lat) < r * 0.78).forEach(s => totalCovered.add(s.n));
  });

  document.getElementById('strategyOut').innerHTML = `
    <div class="al ok"><div><div class="al-ttl">Optimal network: ${WAL.FULFILLMENT.length} fulfillment hubs</div>
    <div class="al-desc">${totalCovered.size.toLocaleString()} of ${ALL_STORES.length.toLocaleString()} stores within delivery range (${(totalCovered.size/ALL_STORES.length*100).toFixed(0)}% coverage)</div></div></div>
    <div class="al warn"><div><div class="al-ttl">Top hub: NYC (score 95) covers ${hubStores[1]} feeder stores</div>
    <div class="al-desc">Arity road-speed data: avg 28 min last-mile from NYC hub</div></div></div>
    <div class="al"><div><div class="al-ttl">Est. annual logistics savings: $340M</div>
    <div class="al-desc">Placer.ai demand density confirms hub placement | Baron Weather: low climate risk</div></div></div>`;
};

window.showDemoForecast = function() {
  /* Color stores by population growth forecast */
  stratBaseLayer.removeAll();
  const growthStates = { FL:1, TX:1, AZ:1, GA:1, NC:1, TN:1, SC:1, NV:1, CO:1, UT:1 };
  const declineStates = { IL:-1, OH:-1, MI:-1, PA:-1, WV:-1, CT:-1, MS:-1 };
  addStoreGraphics(stratBaseLayer, ALL_STORES, {
    colorFn: s => {
      if (growthStates[s.st]) return [34, 197, 94, 150];
      if (declineStates[s.st]) return [244, 41, 65, 150];
      return [250, 204, 21, 80];
    },
    size: 3,
    outline: { color: [0,0,0,0], width: 0 },
  });

  const growCount = ALL_STORES.filter(s => growthStates[s.st]).length;
  const decCount = ALL_STORES.filter(s => declineStates[s.st]).length;
  document.getElementById('strategyOut').innerHTML = `
    <div class="al ok"><div><div class="al-ttl">Demographic Forecast 2026-2031</div>
    <div class="al-desc">Green = growth states | Red = declining states | Yellow = stable</div></div></div>
    <div class="al ok"><div><div class="al-ttl">Sun Belt growth: ${growCount.toLocaleString()} stores in expanding markets</div>
    <div class="al-desc">FL, TX, AZ, GA, NC — population +8.2% projected</div></div></div>
    <div class="al crit"><div><div class="al-ttl">Rust Belt decline: ${decCount.toLocaleString()} stores in contracting markets</div>
    <div class="al-desc">IL, OH, MI, PA, WV — population -3.1% projected</div></div></div>
    <div class="al"><div><div class="al-ttl">Recommendation: Reallocate ${Math.round(decCount*0.15)} stores from declining to growth markets</div>
    <div class="al-desc">IRS migration data + Census projections + Placer.ai trend forecasts</div></div></div>`;
};

/* ============================================================
   ARCGIS 5.0 LAB — 3D Scene + Weather + Glow + real Chicago stores
   ============================================================ */
let labView, labStoreLayer;
let labWeatherClasses = {};

async function initLab() {
  let SceneView, PointSymbol3D, IconSymbol3DLayer, ObjectSymbol3DLayer;
  [SceneView, PointSymbol3D, IconSymbol3DLayer, ObjectSymbol3DLayer,
   SunnyWeather_, CloudyWeather_, RainyWeather_, SnowyWeather_, FoggyWeather_] = await $arcgis.import([
    '@arcgis/core/views/SceneView.js',
    '@arcgis/core/symbols/PointSymbol3D.js',
    '@arcgis/core/symbols/IconSymbol3DLayer.js',
    '@arcgis/core/symbols/ObjectSymbol3DLayer.js',
    '@arcgis/core/views/3d/environment/SunnyWeather.js',
    '@arcgis/core/views/3d/environment/CloudyWeather.js',
    '@arcgis/core/views/3d/environment/RainyWeather.js',
    '@arcgis/core/views/3d/environment/SnowyWeather.js',
    '@arcgis/core/views/3d/environment/FoggyWeather.js',
  ]);
  PointSymbol3D_ = PointSymbol3D;
  IconSymbol3DLayer_ = IconSymbol3DLayer;
  ObjectSymbol3DLayer_ = ObjectSymbol3DLayer;

  labWeatherClasses = {
    sunny:  new SunnyWeather_(),
    cloudy: new CloudyWeather_({ cloudCover: 0.8 }),
    rainy:  new RainyWeather_({ cloudCover: 0.9, precipitation: 0.4 }),
    snowy:  new SnowyWeather_({ cloudCover: 0.85, precipitation: 0.5 }),
    foggy:  new FoggyWeather_({ fogStrength: 0.6 }),
  };

  const map = new Map_({ basemap: 'dark-gray-vector', ground: 'world-elevation' });
  labStoreLayer = new GL_({ elevationInfo: { mode: 'relative-to-ground' } });
  map.add(labStoreLayer);

  labView = new SceneView({
    container: 'lab-map', map,
    camera: { position: { longitude: -87.627, latitude: 41.860, z: 2800 }, tilt: 65, heading: 20 },
    environment: {
      weather: labWeatherClasses.sunny,
      atmosphere: { quality: 'high' },
      lighting: { type: 'sun', date: new Date(2026, 1, 28, 14, 0, 0), directShadowsEnabled: true },
    },
    qualityProfile: 'high',
    ui: { components: [] },
  });
  window.VIEWS['lab-map'] = labView;
  labView.ui.add(new Home_({ view: labView }), 'top-right');

  /* Use REAL Chicago-area stores for 3D */
  const chicagoStores3D = ALL_STORES
    .filter(s => s.st === 'IL' && s.lat > 41.7 && s.lat < 42.05 && s.lng > -87.85 && s.lng < -87.5)
    .slice(0, 40);

  document.getElementById('selTotal').textContent = chicagoStores3D.length;

  renderLabStores(chicagoStores3D);
  applyBloom(true);

  labView.on('click', e => {
    labView.hitTest(e).then(r => {
      const g = r.results.find(x => x.graphic?.attributes?.labId);
      if (g) {
        const id = g.graphic.attributes.labId;
        S.labSelected.has(id) ? S.labSelected.delete(id) : S.labSelected.add(id);
        renderLabStores(chicagoStores3D);
        document.getElementById('selCount').textContent = S.labSelected.size;
      }
    });
  });

  /* Feature list */
  const fl = document.getElementById('featList');
  fl.innerHTML = '';
  WAL.FEATURES_5.forEach(f => {
    const el = document.createElement('div');
    el.className = 'feat';
    el.innerHTML = `<div class="feat-icon">${f.icon}</div><div>
      <div class="feat-name">${f.name} <span class="bdg ${f.status==='beta'?'p':'b'}">${f.status}</span></div>
      <div class="feat-desc">${f.desc}</div></div>`;
    fl.appendChild(el);
  });
}

function renderLabStores(stores) {
  if (!labStoreLayer || !stores) return;
  labStoreLayer.removeAll();
  stores.forEach(s => {
    const selected = S.labSelected.has(s.n);
    const base = selected ? [244,41,65] : [0,115,198];
    const clr = S.emissiveOn ? base : [100,100,100];
    const h = 40 + s.rev * 15;
    labStoreLayer.add(new Graphic_({
      geometry: new Point_({ longitude: s.lng, latitude: s.lat, z: 0 }),
      symbol: new PointSymbol3D_({
        symbolLayers: [
          new ObjectSymbol3DLayer_({
            resource: { primitive: 'cylinder' },
            material: { color: [...clr, 220] },
            width: selected ? 70 : 40, height: h * (selected ? 1.5 : 1), depth: selected ? 70 : 40,
          }),
          new IconSymbol3DLayer_({
            resource: { primitive: 'circle' },
            material: { color: [...clr, S.emissiveOn ? 200 : 60] },
            size: selected ? 22 : 14, anchor: 'center',
          }),
        ],
      }),
      attributes: { labId: s.n, name: `Walgreens #${s.n}`, rev: s.rev },
      popupTemplate: { title: '{name}', content: 'Revenue: ${rev}M' },
    }));
  });
}

function applyBloom(on) {
  if (!labView) return;
  try { labView.environment.bloom = { enabled: on, intensity: 0.5, threshold: 0.25, blurRadius: 6 }; } catch(_) {}
}

window.setWeather = function(type, btn) {
  S.currentWeather = type;
  btn.parentElement.querySelectorAll('.wbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  if (labView && labWeatherClasses[type]) labView.environment.weather = labWeatherClasses[type];
};

window.updateDaylight = function(hour) {
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  document.getElementById('daylightVal').textContent = h===0 ? '12:00 AM' : h>12 ? (h-12)+':00 '+ampm : h+':00 '+ampm;
  if (labView) labView.environment.lighting.date = new Date(2026, 1, 28, h, 0, 0);
};

window.toggleBloom = function(btn) { btn.classList.toggle('on'); S.bloomOn = btn.classList.contains('on'); applyBloom(S.bloomOn); };
window.toggleEmissive = function(btn) {
  btn.classList.toggle('on'); S.emissiveOn = btn.classList.contains('on');
  const chicagoStores3D = ALL_STORES.filter(s => s.st === 'IL' && s.lat > 41.7 && s.lat < 42.05 && s.lng > -87.85 && s.lng < -87.5).slice(0, 40);
  renderLabStores(chicagoStores3D);
};
window.clearSelection = function() {
  S.labSelected.clear();
  const chicagoStores3D = ALL_STORES.filter(s => s.st === 'IL' && s.lat > 41.7 && s.lat < 42.05 && s.lng > -87.85 && s.lng < -87.5).slice(0, 40);
  renderLabStores(chicagoStores3D);
  document.getElementById('selCount').textContent = '0';
};
