/* ============================================================
   Walgreens Strategic Intelligence Platform — Mock Data
   ============================================================ */

window.WAL = {};

/* ---------- brand colors ---------- */
WAL.CLR = {
  blue:   [0, 115, 198],
  red:    [244, 41, 65],
  white:  [255, 255, 255],
  green:  [34, 197, 94],
  orange: [249, 115, 22],
  yellow: [250, 204, 21],
  purple: [168, 85, 247],
  cyan:   [6, 182, 212],
};

/* ---------- overview problem cards ---------- */
WAL.OVERVIEW = [
  {
    id: 'stores', num: '01', sev: 'CRITICAL', sevClr: 'r',
    title: 'Massive Store Closures',
    desc: 'Walgreens announced 1,200 store closures over three years after admitting its business model is "non-sustainable." Under Sycamore Partners ownership, restructuring has accelerated with further corporate layoffs.',
    impact: '1,200 stores closing — 14% of the US footprint',
    kpi: '1,200', kpiLabel: 'Planned Closures',
    geo: [
      { name: 'Gravity Modeling / Huff Models', desc: 'Predict how customers will redistribute after a closure — which nearby Walgreens captures them vs. which customers defect to competitors.', data: ['Placer.ai Foot Traffic', 'Arity Mobility', 'ACS Census', 'Esri Tapestry Segmentation'] },
      { name: 'Accessibility Impact Analysis', desc: 'Before closing a store, model the change in drive-time/transit-time accessibility for the surrounding population, especially vulnerable groups (elderly, uninsured, mobility-limited).', data: ['Arity Drive-Time Data', 'ArcGIS Network Analyst', 'US Census TIGER/Line', 'RIGRID Risk Grid'] },
      { name: 'Optimal Closure Sequencing', desc: 'Use multi-objective spatial optimization to determine the order and combination of 1,200 closures that minimizes customer loss, maintains geographic coverage, and maximizes cost savings.', data: ['Placer.ai Visit Patterns', 'Arity Trip Frequency', 'CoStar Real Estate', 'ArcGIS Location-Allocation'] },
      { name: 'Site Suitability Scoring', desc: 'Score each remaining location on dozens of spatial variables (population density, income, traffic counts, competitor density, crime, parking) to prioritize capital investment.', data: ['Esri GeoEnrichment', 'RIGRID Hazard Layers', 'Baron Weather Impact Zones', 'SafeGraph POI', 'FBI UCR Crime Data'] },
      { name: 'Regulatory / Political Risk Mapping', desc: 'Some closures trigger "pharmacy desert" designations — geospatial analysis can flag which closures will face regulatory or community pushback.', data: ['HRSA Health Shortage Areas', 'USDA Food Desert Atlas', 'CMS Provider Data', 'RIGRID Vulnerability Index'] },
    ]
  },
  {
    id: 'pharmacy', num: '02', sev: 'CRITICAL', sevClr: 'r',
    title: 'Pharmacy Reimbursement Pressure',
    desc: 'Declining reimbursement rates from PBMs squeeze margins on prescription dispensing — the core revenue stream. Staffing challenges and fluctuating consumer spending compound the pressure.',
    impact: 'Rx margins compressed to historic lows',
    kpi: '-23%', kpiLabel: 'Rx Margin Decline',
    geo: [
      { name: 'Healthcare Desert Mapping', desc: 'Identify areas where Walgreens is the only accessible pharmacy within X miles, strengthening negotiating leverage with PBMs — "close this store and 50,000 people lose access."', data: ['HRSA Shortage Areas', 'CMS National Provider Index', 'ArcGIS Service Areas', 'Arity Drive-Time Isochrones'] },
      { name: 'SDOH Overlays', desc: 'Combine pharmacy dispensing data with spatial SDOH indices (food deserts, transit access, poverty concentration) to demonstrate that Walgreens pharmacies reduce downstream ER visits and hospitalizations.', data: ['CDC PLACES Health Data', 'Esri ACS SDOH Layers', 'USDA Food Desert Atlas', 'EPA EJScreen', 'RIGRID Social Vulnerability'] },
      { name: 'Prescription Adherence Geospatial Modeling', desc: 'Map medication adherence rates spatially to identify where non-adherence clusters, then deploy targeted interventions (delivery, outreach) that create value-based reimbursement opportunities.', data: ['CMS Part D Prescriber Data', 'Baron Weather (Rx demand correlation)', 'Placer.ai Store Visits', 'Arity Patient Travel Patterns'] },
      { name: '340B Program Optimization', desc: 'Spatial analysis to identify which locations serve enough qualifying patients to participate in the 340B Drug Pricing Program, recovering margin on eligible prescriptions.', data: ['HRSA 340B Covered Entities', 'CMS Medicaid Enrollment', 'ACS Poverty Estimates', 'Esri GeoEnrichment Demographics'] },
    ]
  },
  {
    id: 'retail', num: '03', sev: 'HIGH', sevClr: 'o',
    title: 'Retail Business Decline',
    desc: 'Retail sales down 5.3% due to weaker demand in grocery, household, beauty, and wellness. Competition from Amazon, Walmart, and Target continues to erode market position.',
    impact: '-5.3% retail sales — key categories declining',
    kpi: '-5.3%', kpiLabel: 'Retail Sales YoY',
    geo: [
      { name: 'Geodemographic Clustering', desc: 'Classify stores not by region but by the actual demographic/behavioral profile of their surrounding population (income, age, ethnicity, lifestyle) to tailor product assortment per location.', data: ['Esri Tapestry Segmentation', 'ACS Demographics', 'Placer.ai Visitor Profile', 'Dewey Consumer Spending'] },
      { name: 'Competitive Proximity Analysis', desc: 'Map every Amazon locker, Walmart, Target, Dollar General, and independent pharmacy within each store\'s trade area to understand exactly where competitive pressure is highest.', data: ['SafeGraph POI / Places', 'ArcGIS Places API', 'Placer.ai Cross-Shopping', 'Arity Trade Area Trips'] },
      { name: 'Foot Traffic Pattern Mining', desc: 'Use anonymized mobile location data to understand when, how, and why people visit nearby competitors — then design store formats and promotions to intercept those trips.', data: ['Placer.ai Raw Visit Data', 'Near / Unacast Mobility', 'Arity Origin-Destination', 'Baron Weather (weather-driven demand shifts)'] },
      { name: 'Last-Mile Delivery Optimization', desc: 'Spatial network analysis to determine which stores are best positioned as micro-fulfillment hubs based on delivery demand density, road network topology, and last-mile cost.', data: ['ArcGIS Network Analyst', 'Arity Road Segment Speeds', 'US Census LODES (commute flows)', 'Placer.ai Demand Density'] },
    ]
  },
  {
    id: 'health', num: '04', sev: 'HIGH', sevClr: 'o',
    title: 'Failed Healthcare Expansion',
    desc: 'Billions spent acquiring VillageMD, Summit Health, and CityMD never achieved vertical integration. The result: a fragmented collection of assets without coherent strategy.',
    impact: '$6B+ in healthcare write-downs',
    kpi: '$6B+', kpiLabel: 'Healthcare Write-downs',
    geo: [
      { name: 'Service Area Gap Analysis', desc: 'Map where VillageMD/Summit Health clinics overlap with existing healthcare infrastructure vs. where genuine gaps exist — keep locations that fill real gaps, divest redundant ones.', data: ['Definitive Healthcare Provider Data', 'CMS Care Compare', 'ArcGIS Service Areas', 'RIGRID Healthcare Access Index'] },
      { name: 'Patient Origin Studies', desc: 'Use geospatial patient flow data to understand how far people travel for primary care, urgent care, and specialist visits — then position remaining clinics at optimal access points.', data: ['Arity Patient Travel Patterns', 'CMS Claims Origin-Destination', 'Placer.ai Healthcare Visits', 'Esri Drive-Time Trade Areas'] },
      { name: 'Chronic Disease Hotspot Mapping', desc: 'Overlay CDC chronic disease prevalence data (diabetes, hypertension, obesity) with Walgreens pharmacy data to identify neighborhoods where co-located pharmacy + clinic creates the most clinical value.', data: ['CDC PLACES Chronic Disease', 'CDC WONDER Mortality', 'CMS Chronic Conditions Data', 'Baron Weather (seasonal health impact)'] },
      { name: 'Referral Network Optimization', desc: 'Map referral patterns between VillageMD clinics and hospital systems spatially to identify which partnerships generate volume and which don\'t justify the relationship.', data: ['CMS Physician Shared Patient Data', 'Definitive Healthcare Referrals', 'ArcGIS Network Analysis', 'RIGRID Population Health Scores'] },
      { name: 'Payer Mix Spatial Analysis', desc: 'Determine which clinic locations serve populations with favorable insurance mix vs. high uninsured/Medicaid — critical for deciding which to keep under PE cost discipline.', data: ['ACS Health Insurance Coverage', 'CMS Medicare Enrollment', 'Esri GeoEnrichment', 'RIGRID Socioeconomic Layers'] },
    ]
  },
  {
    id: 'stores', num: '05', sev: 'CRITICAL', sevClr: 'r',
    title: 'Financial Collapse',
    desc: 'Market value shrank from ~$100B to ~$10B over a decade — a 91% decline. Growing net losses ($265M in Q1 2025) led to acquisition by Sycamore Partners PE firm.',
    impact: '91% market value destruction in 10 years',
    kpi: '-91%', kpiLabel: 'Value Decline',
    geo: [
      { name: 'Trade Area Analysis', desc: 'Model the true catchment area of every store using mobility data (GPS pings, cell signals) to understand where customers actually come from vs. assumptions.', data: ['Placer.ai True Trade Areas', 'Arity GPS Mobility Data', 'Near / Unacast Visit Attribution', 'Esri GeoEnrichment'] },
      { name: 'Revenue Attribution Modeling', desc: 'Overlay POS data with demographic, foot traffic, and competitor proximity layers to identify which locations have untapped revenue potential vs. which are structurally unprofitable.', data: ['Placer.ai Foot Traffic', 'Dewey Consumer Spending', 'Esri Tapestry Segmentation', 'SafeGraph Brand Affinity'] },
      { name: 'Real Estate Portfolio Valuation', desc: 'Spatial econometric models can estimate property-level ROI incorporating neighborhood trajectory (gentrification, population decline) to inform hold/sell decisions under Sycamore\'s ownership.', data: ['CoStar Commercial Real Estate', 'Zillow / ZTRAX Property Values', 'ACS Demographic Trends', 'RIGRID Property Risk Scores', 'Baron Weather (climate risk)'] },
      { name: 'Cannibalization Detection', desc: 'Identify overlapping trade areas where Walgreens stores compete with each other, quantifying how much revenue is being split rather than generated.', data: ['Placer.ai Cross-Visit Analysis', 'Arity Trip Chains', 'ArcGIS Thiessen Polygons', 'Esri Market Potential Index'] },
    ]
  },
  {
    id: 'strategy', num: '06', sev: 'MEDIUM', sevClr: 'y',
    title: 'PE Restructuring Uncertainty',
    desc: 'Sycamore Partners buyout brings heavy debt and aggressive cost-cutting. Expected moves include Boots UK spin-off and pivot to "micro-fulfillment" model — largely unproven at scale.',
    impact: '$10B buyout with significant debt overhang',
    kpi: '$10B', kpiLabel: 'PE Buyout Price',
    geo: [
      { name: 'Micro-Fulfillment Network Design', desc: 'Spatial optimization of which stores to convert to fulfillment nodes based on delivery demand density, warehouse proximity, road network efficiency, and last-mile cost modeling.', data: ['Placer.ai Demand Density', 'Arity Road Segment Speeds', 'ArcGIS Network Analyst', 'US Census LODES Commute Data'] },
      { name: 'Scenario Planning with Spatial Simulation', desc: 'Agent-based or Monte Carlo spatial simulations to model different restructuring scenarios (close X stores, convert Y to fulfillment, sell Z clinics) and predict market-level outcomes.', data: ['RIGRID Composite Risk Layers', 'Placer.ai Predictive Traffic', 'Arity Mobility Forecasts', 'Baron Weather Climate Projections'] },
      { name: 'Real Estate Monetization', desc: 'Identify high-value Walgreens-owned properties where the land/location is worth more than the retail operation — potential for sale-leaseback or redevelopment.', data: ['CoStar Property Analytics', 'Zillow / ZTRAX Valuations', 'RIGRID Land Use Risk', 'ACS Gentrification Indicators'] },
      { name: 'Demographic Forecasting', desc: 'Use census projections, building permit data, and migration patterns to predict which trade areas will grow or shrink over the next 5-10 years — aligning the store footprint with where demand is heading.', data: ['Esri Updated Demographics', 'Census Population Projections', 'IRS Migration Data', 'Placer.ai Trend Forecasts', 'Baron Weather (climate migration)'] },
      { name: 'Boots UK Divestiture Analysis', desc: 'Geospatial benchmarking of Boots locations against UK competitors (Superdrug, Tesco Pharmacy) to build the strongest possible sale narrative for potential acquirers.', data: ['Ordnance Survey UK POI', 'UK ONS Demographics', 'CACI Acorn Segmentation', 'Geolytix UK Retail Data'] },
    ]
  }
];

/* ---------- Walgreens store locations ---------- */
WAL.STORES = [
  { id: 1,  name: 'Walgreens #1001 — Times Square',      lng: -73.9857, lat: 40.7580, rev: 8.2, tier: 'high',   closureRisk: 0.05 },
  { id: 2,  name: 'Walgreens #1042 — Midtown East',       lng: -73.9712, lat: 40.7527, rev: 6.1, tier: 'high',   closureRisk: 0.10 },
  { id: 3,  name: 'Walgreens #1103 — South Bronx',        lng: -73.9185, lat: 40.8176, rev: 2.1, tier: 'low',    closureRisk: 0.85 },
  { id: 4,  name: 'Walgreens #2001 — Magnificent Mile',   lng: -87.6244, lat: 41.8930, rev: 7.4, tier: 'high',   closureRisk: 0.08 },
  { id: 5,  name: 'Walgreens #2015 — Deerfield HQ',       lng: -87.8445, lat: 42.1711, rev: 3.8, tier: 'mid',    closureRisk: 0.30 },
  { id: 6,  name: 'Walgreens #2044 — South Side Chicago', lng: -87.6065, lat: 41.7508, rev: 1.9, tier: 'low',    closureRisk: 0.90 },
  { id: 7,  name: 'Walgreens #3001 — Hollywood Blvd',     lng: -118.3287, lat: 34.1015, rev: 6.8, tier: 'high',  closureRisk: 0.12 },
  { id: 8,  name: 'Walgreens #3022 — East LA',            lng: -118.1670, lat: 34.0239, rev: 2.3, tier: 'low',   closureRisk: 0.82 },
  { id: 9,  name: 'Walgreens #3045 — Santa Monica',       lng: -118.4912, lat: 34.0195, rev: 5.9, tier: 'mid',   closureRisk: 0.20 },
  { id: 10, name: 'Walgreens #4001 — Houston Galleria',   lng: -95.4613, lat: 29.7380, rev: 5.5, tier: 'mid',    closureRisk: 0.25 },
  { id: 11, name: 'Walgreens #4018 — Houston Third Ward', lng: -95.3584, lat: 29.7199, rev: 1.7, tier: 'low',    closureRisk: 0.92 },
  { id: 12, name: 'Walgreens #5001 — Phoenix Camelback',  lng: -112.0188, lat: 33.5092, rev: 4.8, tier: 'mid',   closureRisk: 0.28 },
  { id: 13, name: 'Walgreens #5012 — South Phoenix',      lng: -112.0740, lat: 33.3930, rev: 2.0, tier: 'low',   closureRisk: 0.88 },
  { id: 14, name: 'Walgreens #6001 — Philadelphia CC',    lng: -75.1652, lat: 39.9526, rev: 5.2, tier: 'mid',    closureRisk: 0.22 },
  { id: 15, name: 'Walgreens #6020 — North Philly',       lng: -75.1455, lat: 40.0076, rev: 1.8, tier: 'low',    closureRisk: 0.87 },
  { id: 16, name: 'Walgreens #7001 — Miami Beach',        lng: -80.1300, lat: 25.7907, rev: 6.5, tier: 'high',   closureRisk: 0.09 },
  { id: 17, name: 'Walgreens #7015 — Overtown Miami',     lng: -80.2044, lat: 25.7862, rev: 1.6, tier: 'low',    closureRisk: 0.93 },
  { id: 18, name: 'Walgreens #8001 — Atlanta Buckhead',   lng: -84.3620, lat: 33.8381, rev: 5.8, tier: 'mid',    closureRisk: 0.18 },
  { id: 19, name: 'Walgreens #8030 — SW Atlanta',         lng: -84.4227, lat: 33.7098, rev: 2.2, tier: 'low',    closureRisk: 0.84 },
  { id: 20, name: 'Walgreens #9001 — Downtown Seattle',   lng: -122.3321, lat: 47.6062, rev: 5.1, tier: 'mid',   closureRisk: 0.24 },
  { id: 21, name: 'Walgreens #9018 — Rainier Valley',     lng: -122.2914, lat: 47.5225, rev: 2.4, tier: 'low',   closureRisk: 0.78 },
  { id: 22, name: 'Walgreens #1201 — Boston Back Bay',    lng: -71.0810, lat: 42.3492, rev: 6.0, tier: 'high',   closureRisk: 0.11 },
  { id: 23, name: 'Walgreens #1301 — Denver LoDo',        lng: -104.9962, lat: 39.7530, rev: 4.5, tier: 'mid',   closureRisk: 0.30 },
  { id: 24, name: 'Walgreens #1401 — Detroit Midtown',    lng: -83.0650, lat: 42.3580, rev: 2.5, tier: 'low',    closureRisk: 0.80 },
  { id: 25, name: 'Walgreens #1501 — Las Vegas Strip',    lng: -115.1728, lat: 36.1147, rev: 7.0, tier: 'high',  closureRisk: 0.07 },
];

/* ---------- pharmacy desert zones ---------- */
WAL.DESERTS = [
  { id: 1, name: 'South Side Chicago',     lng: -87.6065, lat: 41.7508, pop: 310000, pharmacies: 4,  risk: 'critical', medianIncome: 28400, adherence: 0.52 },
  { id: 2, name: 'East Los Angeles',        lng: -118.1670, lat: 34.0239, pop: 265000, pharmacies: 5,  risk: 'critical', medianIncome: 31200, adherence: 0.55 },
  { id: 3, name: 'South Bronx',             lng: -73.9185, lat: 40.8176, pop: 420000, pharmacies: 6,  risk: 'critical', medianIncome: 26800, adherence: 0.48 },
  { id: 4, name: 'Rural Mississippi Delta', lng: -90.8968, lat: 33.4504, pop: 85000,  pharmacies: 1,  risk: 'critical', medianIncome: 22100, adherence: 0.44 },
  { id: 5, name: 'Appalachian Kentucky',    lng: -83.7600, lat: 37.5200, pop: 62000,  pharmacies: 1,  risk: 'high',     medianIncome: 24500, adherence: 0.50 },
  { id: 6, name: 'North Philadelphia',      lng: -75.1455, lat: 40.0076, pop: 195000, pharmacies: 3,  risk: 'high',     medianIncome: 27300, adherence: 0.51 },
  { id: 7, name: 'Detroit Inner City',      lng: -83.0650, lat: 42.3580, pop: 180000, pharmacies: 3,  risk: 'high',     medianIncome: 29100, adherence: 0.53 },
  { id: 8, name: 'Pine Ridge Reservation',  lng: -102.5563,lat: 43.0055, pop: 28000,  pharmacies: 0,  risk: 'critical', medianIncome: 18700, adherence: 0.38 },
  { id: 9, name: 'Overtown Miami',          lng: -80.2044, lat: 25.7862, pop: 145000, pharmacies: 2,  risk: 'high',     medianIncome: 25600, adherence: 0.49 },
  { id: 10,name: 'Rural Alabama Black Belt',lng: -87.5300, lat: 32.3600, pop: 55000,  pharmacies: 1,  risk: 'critical', medianIncome: 21400, adherence: 0.42 },
];

/* ---------- competitors ---------- */
WAL.COMPETITORS = [
  { id: 1,  name: 'CVS #4201',         brand: 'CVS',     lng: -73.9790, lat: 40.7614 },
  { id: 2,  name: 'CVS #4305',         brand: 'CVS',     lng: -87.6298, lat: 41.8827 },
  { id: 3,  name: 'CVS #4410',         brand: 'CVS',     lng: -118.3530,lat: 34.0522 },
  { id: 4,  name: 'CVS #4512',         brand: 'CVS',     lng: -95.3698, lat: 29.7604 },
  { id: 5,  name: 'Walmart Pharmacy',  brand: 'Walmart', lng: -87.6500, lat: 41.8400 },
  { id: 6,  name: 'Walmart Pharmacy',  brand: 'Walmart', lng: -118.2800,lat: 34.0400 },
  { id: 7,  name: 'Walmart Pharmacy',  brand: 'Walmart', lng: -95.4200, lat: 29.7500 },
  { id: 8,  name: 'Amazon Pharmacy FC',brand: 'Amazon',  lng: -87.9200, lat: 41.9700 },
  { id: 9,  name: 'Amazon Pharmacy FC',brand: 'Amazon',  lng: -118.1500,lat: 33.8900 },
  { id: 10, name: 'Amazon Pharmacy FC',brand: 'Amazon',  lng: -95.5000, lat: 29.8000 },
  { id: 11, name: 'Rite Aid #812',     brand: 'RiteAid', lng: -73.9500, lat: 40.7700 },
  { id: 12, name: 'Rite Aid #920',     brand: 'RiteAid', lng: -75.1700, lat: 39.9500 },
];

WAL.BRAND_CLR = {
  CVS:     [204, 0, 0],
  Walmart: [0, 120, 215],
  Amazon:  [255, 153, 0],
  RiteAid: [0, 75, 150],
};

/* ---------- VillageMD / Summit Health clinics ---------- */
WAL.CLINICS = [
  { id: 1,  name: 'VillageMD — Lincoln Park',     lng: -87.6500, lat: 41.9200, type: 'VillageMD',  patients: 12400, profitable: true,  overlap: false },
  { id: 2,  name: 'VillageMD — Schaumburg',        lng: -88.0834, lat: 42.0334, type: 'VillageMD',  patients: 8200,  profitable: false, overlap: true },
  { id: 3,  name: 'Summit Health — Midtown NYC',   lng: -73.9800, lat: 40.7550, type: 'Summit',     patients: 18500, profitable: true,  overlap: false },
  { id: 4,  name: 'Summit Health — Jersey City',   lng: -74.0431, lat: 40.7178, type: 'Summit',     patients: 9100,  profitable: false, overlap: true },
  { id: 5,  name: 'VillageMD — Houston Heights',   lng: -95.3950, lat: 29.7870, type: 'VillageMD',  patients: 7600,  profitable: false, overlap: true },
  { id: 6,  name: 'CityMD — Brooklyn',             lng: -73.9442, lat: 40.6782, type: 'CityMD',     patients: 22000, profitable: true,  overlap: false },
  { id: 7,  name: 'VillageMD — Phoenix Arcadia',   lng: -111.9820,lat: 33.5000, type: 'VillageMD',  patients: 6800,  profitable: false, overlap: true },
  { id: 8,  name: 'Summit Health — Short Hills NJ', lng: -74.3265,lat: 40.7440, type: 'Summit',     patients: 11200, profitable: true,  overlap: false },
  { id: 9,  name: 'VillageMD — Atlanta Decatur',   lng: -84.2963, lat: 33.7748, type: 'VillageMD',  patients: 5400,  profitable: false, overlap: true },
  { id: 10, name: 'CityMD — Queens',               lng: -73.7949, lat: 40.7282, type: 'CityMD',     patients: 15800, profitable: true,  overlap: false },
];

/* ---------- micro-fulfillment candidates ---------- */
WAL.FULFILLMENT = [
  { id: 1,  name: 'Walgreens #2001 — Chicago',   lng: -87.6244, lat: 41.8930, score: 92, demandDensity: 'high',   roadAccess: 'A' },
  { id: 2,  name: 'Walgreens #1001 — NYC',        lng: -73.9857, lat: 40.7580, score: 95, demandDensity: 'high',   roadAccess: 'A' },
  { id: 3,  name: 'Walgreens #3001 — LA',         lng: -118.3287,lat: 34.1015, score: 88, demandDensity: 'high',   roadAccess: 'B' },
  { id: 4,  name: 'Walgreens #4001 — Houston',    lng: -95.4613, lat: 29.7380, score: 82, demandDensity: 'mid',    roadAccess: 'A' },
  { id: 5,  name: 'Walgreens #7001 — Miami',      lng: -80.1300, lat: 25.7907, score: 79, demandDensity: 'mid',    roadAccess: 'B' },
  { id: 6,  name: 'Walgreens #8001 — Atlanta',    lng: -84.3620, lat: 33.8381, score: 76, demandDensity: 'mid',    roadAccess: 'A' },
  { id: 7,  name: 'Walgreens #1201 — Boston',     lng: -71.0810, lat: 42.3492, score: 85, demandDensity: 'high',   roadAccess: 'B' },
  { id: 8,  name: 'Walgreens #9001 — Seattle',    lng: -122.3321,lat: 47.6062, score: 74, demandDensity: 'mid',    roadAccess: 'A' },
];

/* ---------- SDOH overlay data ---------- */
WAL.SDOH = [
  { metric: 'Food Desert Index',       zones: 847,  avgScore: 7.2, trend: 'worsening' },
  { metric: 'Transit Access Score',    zones: 1203, avgScore: 4.8, trend: 'stable' },
  { metric: 'Poverty Concentration',   zones: 632,  avgScore: 8.1, trend: 'worsening' },
  { metric: 'Uninsured Rate',          zones: 1540, avgScore: 6.5, trend: 'improving' },
  { metric: 'Chronic Disease Burden',  zones: 920,  avgScore: 7.8, trend: 'worsening' },
];

/* ---------- 3D lab store locations (Chicago area) ---------- */
WAL.LAB_STORES = [
  { id: 1, name: 'Walgreens — Michigan Ave',    lng: -87.6244, lat: 41.8930, height: 120 },
  { id: 2, name: 'Walgreens — State Street',    lng: -87.6278, lat: 41.8819, height: 90 },
  { id: 3, name: 'Walgreens — Wicker Park',     lng: -87.6795, lat: 41.9088, height: 60 },
  { id: 4, name: 'Walgreens — Lincoln Park',    lng: -87.6500, lat: 41.9200, height: 75 },
  { id: 5, name: 'Walgreens — Loop Adams',      lng: -87.6315, lat: 41.8793, height: 100 },
  { id: 6, name: 'Walgreens — River North',     lng: -87.6350, lat: 41.8920, height: 85 },
  { id: 7, name: 'Walgreens — Old Town',        lng: -87.6380, lat: 41.9110, height: 55 },
  { id: 8, name: 'Walgreens — Lakeview',        lng: -87.6530, lat: 41.9430, height: 65 },
  { id: 9, name: 'Walgreens — Hyde Park',       lng: -87.5930, lat: 41.7940, height: 50 },
  { id: 10,name: 'Walgreens — Pilsen',          lng: -87.6560, lat: 41.8560, height: 45 },
];

/* ---------- ArcGIS 5.0 feature showcase data ---------- */
WAL.FEATURES_5 = [
  { name: 'Weather Effects',        status: 'stable', icon: '\u2601', desc: 'Real-time weather simulation — rain, snow, fog, clouds in 3D scenes.' },
  { name: 'Emissive Materials',     status: 'stable', icon: '\u2728', desc: 'Light-emitting 3D symbols for nighttime visualization and visual emphasis.' },
  { name: 'Bloom / Glow Effect',    status: 'stable', icon: '\uD83D\uDD06', desc: 'Global glow effect making emissive symbols radiate light in 3D.' },
  { name: 'Selection Manager',      status: 'beta',   icon: '\uD83D\uDDF9', desc: 'Centralized feature selection synced across layers and tables.' },
  { name: 'AI Components',          status: 'beta',   icon: '\uD83E\uDD16', desc: 'Natural language interface for agentic map exploration and analysis.' },
  { name: 'Volume Measurement',     status: 'beta',   icon: '\uD83D\uDCD0', desc: 'Precise volumetric measurements with improved accuracy heuristics.' },
  { name: 'Component Architecture', status: 'stable', icon: '\u2699',  desc: 'All widgets deprecated — native web components are the path forward.' },
  { name: 'Common Components',      status: 'stable', icon: '\uD83D\uDCCA', desc: 'Reusable Slider, Histogram, and Ticks components for custom UI.' },
  { name: 'Gaussian Splat Layer',   status: 'stable', icon: '\uD83C\uDF10', desc: 'Photorealistic 3D visualization of complex environments.' },
  { name: 'Segment-Based Drawing',  status: 'stable', icon: '\u270F',  desc: 'Switch between line, freehand, and curve tools while drawing.' },
];
