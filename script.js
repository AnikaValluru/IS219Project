// Sample dataset and interactive UI for the car cost site

const sampleData = {
  years: [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
  wages: [60000,61000,62000,63500,64500,66000,68000,70000,71500,73000],
  insurance: [1200,1250,1300,1350,1400,1500,1600,1700,1800,1900],
  gas: [1600,1650,1700,1750,1600,1700,1800,1900,2000,2100],
  maintenance: [800,820,830,850,870,900,940,980,1000,1050]
};

// build total car cost per year = insurance + gas + maintenance + estimated loan/ownership (approx 4000)
const ownershipBase = [4000,4000,4000,4000,4100,4200,4300,4400,4500,4600];

// Shared model info (price in base units, fuel as l/100km or kWh/100km for EV)
const modelInfo = {
  compact: { label: 'Compact', price: 20000, fuel: 6.0, type: 'gas' },
  sedan:   { label: 'Sedan',   price: 35000, fuel: 7.5, type: 'gas' },
  suv:     { label: 'SUV',     price: 50000, fuel: 9.0, type: 'gas' },
  ev:      { label: 'Electric',price: 40000, fuel: 18.0, type: 'ev' }
};

const dashboardStates = {
  ca: { wage: 1.12, insurance: 1.14, fuel: 1.2, maintenance: 1.04, ownership: 1.08 },
  tx: { wage: 0.98, insurance: 1.02, fuel: 0.92, maintenance: 0.96, ownership: 0.97 },
  ny: { wage: 1.1, insurance: 1.16, fuel: 1.12, maintenance: 1.03, ownership: 1.06 },
  fl: { wage: 0.95, insurance: 1.22, fuel: 1.0, maintenance: 0.97, ownership: 0.99 },
  il: { wage: 1.01, insurance: 1.05, fuel: 1.02, maintenance: 0.99, ownership: 1.0 }
};

const dashboardProfiles = {
  average: { wage: 1.0, insurance: 1.0, fuel: 1.0, maintenance: 1.0, ownership: 1.0 },
  frugal: { wage: 0.94, insurance: 0.88, fuel: 0.78, maintenance: 0.85, ownership: 0.8 },
  commuter: { wage: 1.06, insurance: 1.05, fuel: 1.35, maintenance: 1.18, ownership: 1.12 }
};

const DASHBOARD_MIN_YEAR = 2016;
const DASHBOARD_MAX_YEAR = 2025;

const dashboardCharts = { cost: null, affordability: null, component: null };

function formatShortNumber(value){
  const n = Number(value) || 0;
  if(Math.abs(n) >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if(Math.abs(n) >= 1000) return `${(n/1000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

function buildDashboardData(stateKey, profileKey){
  const state = dashboardStates[stateKey] || dashboardStates.ca;
  const profile = dashboardProfiles[profileKey] || dashboardProfiles.average;
  const apply = (arr, key)=> arr.map((v)=> Math.round(v * state[key] * profile[key]));

  const wages = apply(sampleData.wages, 'wage');
  const insurance = apply(sampleData.insurance, 'insurance');
  const gas = apply(sampleData.gas, 'fuel');
  const maintenance = apply(sampleData.maintenance, 'maintenance');
  const own = apply(ownershipBase, 'ownership');
  const totalCost = sampleData.years.map((_, i)=> insurance[i] + gas[i] + maintenance[i] + own[i]);

  return { years: sampleData.years, wages, insurance, gas, maintenance, ownershipBase: own, totalCost };
}

function clampDashboardYear(value){
  const n = parseInt(value, 10);
  if(!Number.isFinite(n)) return DASHBOARD_MIN_YEAR;
  return Math.max(DASHBOARD_MIN_YEAR, Math.min(DASHBOARD_MAX_YEAR, n));
}

function buildDashboardViewData(dashboardData, startYear, endYear){
  let start = clampDashboardYear(startYear);
  let end = clampDashboardYear(endYear);
  if(start > end){
    const t = start;
    start = end;
    end = t;
  }

  const startIdx = dashboardData.years.indexOf(start);
  const endIdx = dashboardData.years.indexOf(end);
  if(startIdx < 0 || endIdx < 0){
    return {
      data: dashboardData,
      startYear: DASHBOARD_MIN_YEAR,
      endYear: DASHBOARD_MAX_YEAR
    };
  }

  return {
    startYear: start,
    endYear: end,
    data: {
      years: dashboardData.years.slice(startIdx, endIdx + 1),
      wages: dashboardData.wages.slice(startIdx, endIdx + 1),
      insurance: dashboardData.insurance.slice(startIdx, endIdx + 1),
      gas: dashboardData.gas.slice(startIdx, endIdx + 1),
      maintenance: dashboardData.maintenance.slice(startIdx, endIdx + 1),
      ownershipBase: dashboardData.ownershipBase.slice(startIdx, endIdx + 1),
      totalCost: dashboardData.totalCost.slice(startIdx, endIdx + 1)
    }
  };
}

function buildAffordabilityChart(dashboardData){
  const canvas = document.getElementById('affordabilityChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const burdenPct = dashboardData.totalCost.map((cost, i)=> (cost / dashboardData.wages[i]) * 100);

  if(dashboardCharts.affordability) dashboardCharts.affordability.destroy();
  dashboardCharts.affordability = new Chart(ctx, {
    type:'bar',
    data:{
      labels: dashboardData.years,
      datasets:[
        {
          label:'Ownership cost as % of median wage',
          data: burdenPct,
          backgroundColor:'rgba(217,0,27,0.22)',
          borderColor:'#d9001b',
          borderWidth:1
        }
      ]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{labels:{color:'#5f5a57'}},
        tooltip:{
          callbacks:{
            label:(ctx)=> `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%`
          }
        }
      },
      scales:{
        y:{
          beginAtZero:true,
          title:{display:true,text:'Percent of annual wage (%)',color:'#5f5a57'},
          ticks:{color:'#7b7471', callback:(v)=> `${Number(v).toFixed(0)}%`},
          grid:{color:'#ece7e3'}
        },
        x:{
          ticks:{color:'#7b7471'},
          grid:{display:false}
        }
      }
    }
  });
}

function buildComponentChart(dashboardData){
  const canvas = document.getElementById('componentChart');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const i = dashboardData.years.length - 1;

  if(dashboardCharts.component) dashboardCharts.component.destroy();
  dashboardCharts.component = new Chart(ctx, {
    type:'bar',
    data:{
      labels:['Loan','Insurance','Fuel','Maintenance'],
      datasets:[{
        data:[dashboardData.ownershipBase[i], dashboardData.insurance[i], dashboardData.gas[i], dashboardData.maintenance[i]],
        backgroundColor:['#b00020','#f97316','#2563eb','#16a34a'],
        borderColor:['#b00020','#f97316','#2563eb','#16a34a'],
        borderWidth:1,
        borderRadius:6,
        maxBarThickness:54
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{display:false},
        tooltip:{
          callbacks:{
            label:(ctx)=> `USD ${Math.round(ctx.raw).toLocaleString()}`
          }
        }
      },
      scales:{
        y:{
          beginAtZero:true,
          ticks:{color:'#7b7471', callback:(v)=> formatShortNumber(v)},
          grid:{color:'#ece7e3'}
        },
        x:{
          ticks:{color:'#7b7471'},
          grid:{display:false}
        }
      }
    }
  });
}

function populateDashboardKpis(dashboardData){
  const latestCostEl = document.getElementById('kpiLatestCost');
  if(!latestCostEl) return;
  const growthEl = document.getElementById('kpiGrowth');
  const burdenEl = document.getElementById('kpiBurden');
  const yoyEl = document.getElementById('kpiYoY');
  const totals = dashboardData.totalCost;
  if(!totals || !totals.length) return;
  const first = totals[0];
  const latest = totals[totals.length - 1];
  const prev = totals.length > 1 ? totals[totals.length - 2] : latest;
  const latestWage = dashboardData.wages[dashboardData.wages.length - 1];

  const growthPct = ((latest - first) / Math.max(1, first)) * 100;
  const burdenPct = (latest / Math.max(1, latestWage)) * 100;
  const yoyPct = ((latest - prev) / Math.max(1, prev)) * 100;

  latestCostEl.textContent = `USD ${latest.toLocaleString()}`;
  growthEl.textContent = `${growthPct.toFixed(1)}%`;
  burdenEl.textContent = `${burdenPct.toFixed(1)}%`;
  yoyEl.textContent = `${yoyPct.toFixed(1)}%`;
}

function renderDashboard(stateKey, profileKey, startYear, endYear){
  const dashboardData = buildDashboardData(stateKey, profileKey);
  const view = buildDashboardViewData(dashboardData, startYear, endYear);
  const scopedData = view.data;
  const canvas = document.getElementById('costChart');
  if(!canvas) return;

  if(dashboardCharts.cost) dashboardCharts.cost.destroy();
  const ctx = canvas.getContext('2d');
  dashboardCharts.cost = new Chart(ctx, {
    type:'line',
    data:{
      labels: scopedData.years,
      datasets:[
        {
          label:'Car cost (USD)',
          data:scopedData.totalCost,
          borderColor:'#d9001b',
          backgroundColor:'rgba(217,0,27,0.08)',
          pointBackgroundColor:'#d9001b',
          pointRadius:(ctx)=> ctx.dataIndex === (ctx.dataset.data.length - 1) ? 4 : 0,
          pointHoverRadius:4,
          borderWidth:2.5,
          tension:0.25
        },
        {
          label:'Median wage (USD)',
          data:scopedData.wages,
          borderColor:'#2f4858',
          backgroundColor:'rgba(47,72,88,0.06)',
          pointBackgroundColor:'#2f4858',
          pointRadius:(ctx)=> ctx.dataIndex === (ctx.dataset.data.length - 1) ? 4 : 0,
          pointHoverRadius:4,
          borderWidth:2.5,
          tension:0.25
        }
      ]
    },
    options:{
      responsive:true,
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{labels:{color:'#5f5a57'}},
        tooltip:{
          callbacks:{
            label:(ctx)=> `${ctx.dataset.label}: USD ${Math.round(ctx.raw).toLocaleString()}`
          }
        }
      },
      scales:{
        y:{
          type:'linear',
          position:'left',
          title:{display:true,text:'USD',color:'#5f5a57'},
          ticks:{color:'#7b7471', callback:(v)=> formatShortNumber(v)},
          grid:{color:'#ece7e3'}
        },
        x:{
          ticks:{color:'#7b7471'},
          grid:{display:false}
        }
      }
    }
  });

  buildAffordabilityChart(scopedData);
  buildComponentChart(scopedData);
  populateDashboardKpis(scopedData);

  return {
    state: stateKey,
    profile: profileKey,
    startYear: view.startYear,
    endYear: view.endYear
  };
}

// Calculator logic
function annuityPayment(principal, yearlyRate, years){
  if(yearlyRate===0) return principal/(years*12);
  const r = yearlyRate/100/12;
  const n = years*12;
  const payment = principal * r / (1 - Math.pow(1+r, -n));
  return payment; // monthly payment
}

function computeAnnualCosts(inputs){
  // inputs: {location(state code), model, commuteKmPerDay, insuranceCategory, price, down, term, rate, fuelPrice}
  const workDays = 220; // rough
  const kmPerYear = inputs.commuteKmPerDay * workDays;

  // model parameters (from shared modelInfo)
  const m = modelInfo[inputs.model] || modelInfo.compact;

  // loan
  const loanPrincipal = Math.max(0, inputs.price - inputs.down);
  const monthly = annuityPayment(loanPrincipal, inputs.rate, inputs.term);
  const annualLoan = monthly*12;

  // insurance base rates (state-adjusted rough baseline)
  const baseInsurance = {ca:1700,tx:1450,ny:1850,fl:2000,il:1550}[inputs.location] || 1700;
  const insMultiplier = inputs.insuranceCategory==='low' ? 0.85 : (inputs.insuranceCategory==='high' ? 1.4 : 1.0);
  const areaInsuranceMultiplier = { urban: 1.15, suburban: 1.0, rural: 0.9 }[inputs.campusArea] || 1.0;
  const annualInsurance = Math.round(baseInsurance * insMultiplier * areaInsuranceMultiplier);

  // fuel / electricity
  let annualFuelCost = 0;
  if(m.type==='gas'){
    const litersPerYear = (m.fuel/100)*kmPerYear;
    const areaFuelMultiplier = { urban: 1.08, suburban: 1.0, rural: 0.95 }[inputs.campusArea] || 1.0;
    annualFuelCost = litersPerYear * inputs.fuelPrice * areaFuelMultiplier;
  } else {
    const kwhPerYear = (m.fuel/100)*kmPerYear;
    annualFuelCost = kwhPerYear * inputs.fuelPrice; // assume fuelPrice is USD per kWh for EV
  }

  // campus parking/permit cost differs a lot by geography
  const annualParking = { urban: 1200, suburban: 650, rural: 250 }[inputs.campusArea] || 650;

  // maintenance estimate
  let maintenance = Math.max(300, Math.round(0.04 * inputs.price));
  if(inputs.model==='ev') maintenance = Math.max(150, Math.round(0.02 * inputs.price));

  // insurance and taxes already included
  const total = Math.round(annualLoan + annualInsurance + annualFuelCost + maintenance + annualParking);

  return {
    annualLoan: Math.round(annualLoan),
    annualInsurance,
    annualFuel: Math.round(annualFuelCost),
    maintenance,
    annualParking,
    total
  };
}

function estimateTransitAnnualCost(inputs){
  const pass = Math.max(0, inputs.transitPassMonthly * 12);
  const rideshare = Math.max(0, inputs.rideshareMonthly * 12);
  return pass + rideshare;
}

function estimateCommuteTimeHours(inputs){
  const workDays = 220;
  const carMinutesByArea = { urban: 38, suburban: 32, rural: 30 };
  const transitMinutesByArea = { urban: 54, suburban: 68, rural: 82 };
  const area = inputs.campusArea || 'urban';
  const carHours = ((carMinutesByArea[area] || 35) * workDays) / 60;
  const transitHours = ((transitMinutesByArea[area] || 60) * workDays) / 60;
  return { carHours, transitHours };
}

// DOM wiring
document.addEventListener('DOMContentLoaded',()=>{
  // Currency map by state (all pages are US-only now)
  const currencyByLocation = { ca: 'USD', tx: 'USD', ny: 'USD', fl: 'USD', il: 'USD' };

  // helper to update currency labels in the calculator form
  function updateCurrencyLabels(loc){
    const cur = currencyByLocation[loc] || 'USD';
    const priceEl = document.getElementById('priceCurrency');
    const downEl = document.getElementById('downCurrency');
    const fuelEl = document.getElementById('fuelCurrency');
    const incomeEl = document.getElementById('incomeCurrency');
    const essentialsEl = document.getElementById('essentialsCurrency');
    if(priceEl) priceEl.textContent = cur;
    if(downEl) downEl.textContent = cur;
    if(fuelEl) fuelEl.textContent = cur;
    if(incomeEl) incomeEl.textContent = cur;
    if(essentialsEl) essentialsEl.textContent = cur;

    // car-vs-transit labels
    const compareTransitCur = document.getElementById('compareTransitCurrency');
    const compareRideCur = document.getElementById('compareRideCurrency');
    const compareIncomeCur = document.getElementById('compareIncomeCurrency');
    const compareEssentialsCur = document.getElementById('compareEssentialsCurrency');
    const compareFuelCur = document.getElementById('compareFuelCurrency');
    if(compareTransitCur) compareTransitCur.textContent = cur;
    if(compareRideCur) compareRideCur.textContent = cur;
    if(compareIncomeCur) compareIncomeCur.textContent = cur;
    if(compareEssentialsCur) compareEssentialsCur.textContent = cur;
    if(compareFuelCur) compareFuelCur.textContent = cur;

    // also update car model option labels to include currency and price
    const carSelect = document.getElementById('carModel');
    if(carSelect){
      Array.from(carSelect.options).forEach(opt=>{
        const key = opt.value;
        const info = modelInfo[key];
        if(!info) return;
        // format price with thousands separators
        const priceStr = info.price.toLocaleString();
        if(info.type === 'ev'){
          opt.textContent = `${info.label} — ${cur} ${priceStr} / ${info.fuel} kWh/100km`;
        } else {
          opt.textContent = `${info.label} — ${cur} ${priceStr} / ${info.fuel} l/100km`;
        }
      });
    }
  }

  // wire location select to update labels immediately when changed
  const locSelect = document.getElementById('location');
  if(locSelect){
    // initialize labels to current selection
    updateCurrencyLabels(locSelect.value || 'ca');
    locSelect.addEventListener('change', (e)=>{
      updateCurrencyLabels(e.target.value);
    });
  }

  const compareLocation = document.getElementById('compareLocation');
  if(compareLocation){
    updateCurrencyLabels(compareLocation.value || 'ca');
    compareLocation.addEventListener('change', (e)=>{
      updateCurrencyLabels(e.target.value);
    });
  }

  const budgetLocation = document.getElementById('budgetLocation');
  if(budgetLocation){
    updateCurrencyLabels(budgetLocation.value || 'ca');
    budgetLocation.addEventListener('change', (e)=>{
      updateCurrencyLabels(e.target.value);
    });
  }
  // Highlight the active navigation link based on current filename
  try{
    const navLinks = document.querySelectorAll('.main-nav a');
    const currentPage = (location.pathname.split('/').pop() || 'index.html');
    navLinks.forEach(a=>{
      const href = a.getAttribute('href');
      if(!href) return;
      // normalize
      const hrefFile = href.split('/').pop();
      if(hrefFile === currentPage) a.classList.add('active');
      // also treat index and root as equivalent
      if(currentPage === '' && (hrefFile === 'index.html' || hrefFile === './' )) a.classList.add('active');
    });
  }catch(e){/* non-fatal */}
  // build dashboard chart only if the canvas exists on this page
  if(document.getElementById('costChart')){
    const stateSelect = document.getElementById('dashState');
    const profileSelect = document.getElementById('dashProfile');
    const startYearSelect = document.getElementById('dashStartYear');
    const endYearSelect = document.getElementById('dashEndYear');

    const params = new URLSearchParams(window.location.search);
    const urlState = params.get('state') || params.get('region');
    const urlProfile = params.get('profile');
    const urlStartYear = params.get('start');
    const urlEndYear = params.get('end');

    if(stateSelect && urlState && dashboardStates[urlState]){
      stateSelect.value = urlState;
    }
    if(profileSelect && urlProfile && dashboardProfiles[urlProfile]){
      profileSelect.value = urlProfile;
    }
    if(startYearSelect && urlStartYear){
      startYearSelect.value = String(clampDashboardYear(urlStartYear));
    }
    if(endYearSelect && urlEndYear){
      endYearSelect.value = String(clampDashboardYear(urlEndYear));
    }

    const syncDashboardUrl = (state)=>{
      if(!state) return;
      const next = new URLSearchParams(window.location.search);
      next.delete('region');
      next.set('state', state.state);
      next.set('profile', state.profile);
      next.set('start', String(state.startYear));
      next.set('end', String(state.endYear));
      const newUrl = `${window.location.pathname}?${next.toString()}`;
      window.history.replaceState({}, '', newUrl);
    };

    const renderFromFilters = ()=>{
      const stateKey = stateSelect ? stateSelect.value : 'ca';
      const profile = profileSelect ? profileSelect.value : 'average';
      const startYear = startYearSelect ? startYearSelect.value : DASHBOARD_MIN_YEAR;
      const endYear = endYearSelect ? endYearSelect.value : DASHBOARD_MAX_YEAR;
      const state = renderDashboard(stateKey, profile, startYear, endYear);
      syncDashboardUrl(state);
    };

    renderFromFilters();
    if(stateSelect) stateSelect.addEventListener('change', renderFromFilters);
    if(profileSelect) profileSelect.addEventListener('change', renderFromFilters);
    if(startYearSelect) startYearSelect.addEventListener('change', renderFromFilters);
    if(endYearSelect) endYearSelect.addEventListener('change', renderFromFilters);
  }

  // wire calculator only if the calculator button exists on this page
  const calcBtn = document.getElementById('calcBtn');
  if(calcBtn){
    const CALC_STORAGE_KEY = 'calcFormData';
    const calcFieldIds = [
      'location','carModel','commute','insurance','campusArea',
      'price','down','studentIncome','monthlyEssentials','term','rate','fuelPrice'
    ];

    // Restore saved form values on page load
    try {
      const saved = JSON.parse(localStorage.getItem(CALC_STORAGE_KEY) || 'null');
      if(saved && typeof saved === 'object'){
        calcFieldIds.forEach(id => {
          const el = document.getElementById(id);
          if(el && saved[id] != null) el.value = saved[id];
        });
        // Trigger currency label update after restoring location
        const locationEl = document.getElementById('location');
        if(locationEl) locationEl.dispatchEvent(new Event('change'));
      }
    } catch(e){ /* ignore quota/parse issues */ }

    calcBtn.addEventListener('click',()=>{
    // Persist current form values before computing
    try {
      const snap = {};
      calcFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) snap[id] = el.value;
      });
      localStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(snap));
    } catch(e){ /* ignore quota issues */ }

    const inputs = {
      location: document.getElementById('location').value,
      model: document.getElementById('carModel').value.split(' ')[0],
      commuteKmPerDay: parseFloat(document.getElementById('commute').value) || 0,
      insuranceCategory: document.getElementById('insurance').value,
      campusArea: document.getElementById('campusArea').value,
      price: parseFloat(document.getElementById('price').value) || 0,
      down: parseFloat(document.getElementById('down').value) || 0,
      term: parseFloat(document.getElementById('term').value) || 5,
      rate: parseFloat(document.getElementById('rate').value) || 0,
      fuelPrice: parseFloat(document.getElementById('fuelPrice').value) || 1.8,
      studentIncomeMonthly: parseFloat(document.getElementById('studentIncome').value) || 0,
      monthlyEssentials: parseFloat(document.getElementById('monthlyEssentials').value) || 0
    };

    // adjust model key parsing: carModel select value may include type label; normalize
    if(['compact','sedan','suv','ev'].includes(document.getElementById('carModel').value)){
      inputs.model = document.getElementById('carModel').value;
    } else {
      // fallback: parse first token from label used in select
      const full = document.getElementById('carModel').value;
      inputs.model = full.split(' ')[0].toLowerCase();
    }

  // For EV assume fuelPrice is USD per kWh; clamp obvious per-liter defaults when too high
    if(inputs.model==='ev' && inputs.fuelPrice>5) inputs.fuelPrice = 0.20;

    const out = computeAnnualCosts(inputs);
    const results = document.getElementById('results');
    const breakdown = document.getElementById('breakdown');
    const affordability = document.getElementById('affordability');
    const verdict = document.getElementById('verdict');
    breakdown.innerHTML = '';
    affordability.innerHTML = '';
    // choose currency based on selected state
    const currencyByLocationLocal = { ca: 'USD', tx: 'USD', ny: 'USD', fl: 'USD', il: 'USD' };
    const cur = currencyByLocationLocal[inputs.location] || 'USD';
    [['Loan (annual)',out.annualLoan],['Insurance',out.annualInsurance],['Fuel / Energy',out.annualFuel],['Maintenance',out.maintenance],['Parking / permit',out.annualParking]].forEach(([k,v])=>{
      const li = document.createElement('li');
      li.textContent = `${k}: ${cur} ${v.toLocaleString()}`;
      breakdown.appendChild(li);
    });
    document.getElementById('total').textContent = `Estimated total annual cost: ${cur} ${out.total.toLocaleString()}`;

    const annualIncome = Math.max(0, inputs.studentIncomeMonthly * 12);
    const annualEssentials = Math.max(0, inputs.monthlyEssentials * 12);
    const discretionary = Math.max(0, annualIncome - annualEssentials);
    const costVsIncomePct = annualIncome > 0 ? (out.total / annualIncome) * 100 : 0;
    const costVsDiscretionaryPct = discretionary > 0 ? (out.total / discretionary) * 100 : 0;
    const postCarRemainder = annualIncome - annualEssentials - out.total;

    [
      `Annual take-home income: ${cur} ${annualIncome.toLocaleString()}`,
      `Annual essentials: ${cur} ${annualEssentials.toLocaleString()}`,
      `Car cost as % of total income: ${costVsIncomePct.toFixed(1)}%`,
      `Car cost as % of discretionary budget: ${discretionary > 0 ? `${costVsDiscretionaryPct.toFixed(1)}%` : 'N/A'}`,
      `Money left after essentials + car: ${cur} ${postCarRemainder.toLocaleString()}`
    ].forEach((line)=>{
      const li = document.createElement('li');
      li.textContent = line;
      affordability.appendChild(li);
    });

    if(annualIncome === 0){
      verdict.textContent = 'Add your monthly take-home income for a clearer student affordability verdict.';
    } else if(postCarRemainder < 0 || costVsIncomePct > 35){
      verdict.textContent = 'Verdict: likely not worth it right now for a typical student budget. Consider cheaper model choices or alternatives.';
    } else if(costVsIncomePct > 20){
      verdict.textContent = 'Verdict: borderline. Ownership may work, but it will consume a large share of your student budget.';
    } else {
      verdict.textContent = 'Verdict: more manageable for a student budget, assuming these income and essentials estimates are realistic.';
    }

    results.classList.remove('hidden');
    });
  }

  const compareBtn = document.getElementById('compareBtn');
  if(compareBtn){
    const CVT_STORAGE_KEY = 'cvtFormData';
    const cvtFieldIds = [
      'compareLocation','compareCampusArea','compareCarModel','compareCommute',
      'transitPass','rideshare','compareIncome','compareEssentials','compareFuelPrice'
    ];

    // Restore saved form values on page load
    try {
      const saved = JSON.parse(localStorage.getItem(CVT_STORAGE_KEY) || 'null');
      if(saved && typeof saved === 'object'){
        cvtFieldIds.forEach(id => {
          const el = document.getElementById(id);
          if(el && saved[id] != null) el.value = saved[id];
        });
        // Trigger currency label update after restoring location
        const locationEl = document.getElementById('compareLocation');
        if(locationEl) locationEl.dispatchEvent(new Event('change'));
      }
    } catch(e){ /* ignore quota/parse issues */ }

    compareBtn.addEventListener('click',()=>{
      // Persist current form values before computing
      try {
        const snap = {};
        cvtFieldIds.forEach(id => {
          const el = document.getElementById(id);
          if(el) snap[id] = el.value;
        });
        localStorage.setItem(CVT_STORAGE_KEY, JSON.stringify(snap));
      } catch(e){ /* ignore quota issues */ }

      const location = document.getElementById('compareLocation').value;
      const campusArea = document.getElementById('compareCampusArea').value;
      const model = document.getElementById('compareCarModel').value;
      const commuteKmPerDay = parseFloat(document.getElementById('compareCommute').value) || 0;
      const transitPassMonthly = parseFloat(document.getElementById('transitPass').value) || 0;
      const rideshareMonthly = parseFloat(document.getElementById('rideshare').value) || 0;
      const monthlyIncome = parseFloat(document.getElementById('compareIncome').value) || 0;
      const monthlyEssentials = parseFloat(document.getElementById('compareEssentials').value) || 0;
      const fuelPrice = parseFloat(document.getElementById('compareFuelPrice').value) || 1.8;

      const modelPrice = (modelInfo[model] || modelInfo.sedan).price;
      const carCost = computeAnnualCosts({
        location,
        model,
        commuteKmPerDay,
        insuranceCategory: 'medium',
        campusArea,
        price: modelPrice,
        down: Math.round(modelPrice * 0.12),
        term: 5,
        rate: 5.2,
        fuelPrice
      }).total;

      const transitAnnual = Math.round(estimateTransitAnnualCost({ transitPassMonthly, rideshareMonthly }));
      const { carHours, transitHours } = estimateCommuteTimeHours({ campusArea });
      const annualIncome = monthlyIncome * 12;
      const annualEssentials = monthlyEssentials * 12;

      const results = document.getElementById('compareResults');
      const winner = document.getElementById('compareWinner');
      const currencyByLocationLocal = { ca: 'USD', tx: 'USD', ny: 'USD', fl: 'USD', il: 'USD' };
      const cur = currencyByLocationLocal[location] || 'USD';

      const diff = Math.abs(carCost - transitAnnual);
      const carIsCheaper = carCost <= transitAnnual;
      const annualIncomeFull = monthlyIncome * 12;
      const carPct = annualIncomeFull > 0 ? (carCost / annualIncomeFull * 100).toFixed(1) + '%' : 'N/A';
      const transitPct = annualIncomeFull > 0 ? (transitAnnual / annualIncomeFull * 100).toFixed(1) + '%' : 'N/A';
      const postCar = annualIncome - annualEssentials - carCost;
      const postTransit = annualIncome - annualEssentials - transitAnnual;

      // populate table cells
      document.getElementById('tblCarCost').textContent = `${cur} ${carCost.toLocaleString()}`;
      document.getElementById('tblTransitCost').textContent = `${cur} ${transitAnnual.toLocaleString()}`;
      document.getElementById('tblCarSaving').textContent = carIsCheaper ? `${cur} ${diff.toLocaleString()} cheaper` : '—';
      document.getElementById('tblTransitSaving').textContent = !carIsCheaper ? `${cur} ${diff.toLocaleString()} cheaper` : '—';
      document.getElementById('tblCarPct').textContent = carPct;
      document.getElementById('tblTransitPct').textContent = transitPct;
      document.getElementById('tblCarTime').textContent = `${carHours.toFixed(0)} hrs/yr`;
      document.getElementById('tblTransitTime').textContent = `${transitHours.toFixed(0)} hrs/yr`;
      document.getElementById('tblCarRemainder').textContent = `${cur} ${postCar.toLocaleString()}`;
      document.getElementById('tblTransitRemainder').textContent = `${cur} ${postTransit.toLocaleString()}`;

      // clear previous highlights, then highlight winning column
      document.querySelectorAll('.compare-table .col-winner').forEach(el=>el.classList.remove('col-winner'));
      const winnerCol = carIsCheaper ? 2 : 3;
      document.querySelectorAll('.compare-table tbody tr').forEach(row=>{
        row.querySelector(`td:nth-child(${winnerCol})`).classList.add('col-winner');
      });

      if(carIsCheaper){
        winner.textContent = 'Result: Car ownership is projected to be cheaper annually in this scenario.';
      } else {
        winner.textContent = 'Result: Transit is projected to be cheaper annually in this scenario.';
      }

      results.classList.remove('hidden');
    });
  }

  const budgetBtn = document.getElementById('budgetBtn');
  if(budgetBtn){
    budgetBtn.addEventListener('click',()=>{
      const location = document.getElementById('budgetLocation').value;
      const income = parseFloat(document.getElementById('budgetIncome').value) || 0;
      const transport = parseFloat(document.getElementById('budgetTransport').value) || 0;
      const rent = parseFloat(document.getElementById('budgetRent').value) || 0;
      const food = parseFloat(document.getElementById('budgetFood').value) || 0;
      const tuition = parseFloat(document.getElementById('budgetTuition').value) || 0;
      const utilities = parseFloat(document.getElementById('budgetUtilities').value) || 0;
      const other = parseFloat(document.getElementById('budgetOther').value) || 0;
      const savingsGoal = parseFloat(document.getElementById('budgetSavingsGoal').value) || 0;

      const essentials = rent + food + tuition + utilities + other;
      const totalOut = essentials + transport + savingsGoal;
      const remainder = income - totalOut;
      const savingsRate = income > 0 ? (savingsGoal / income) * 100 : 0;

      const currencyByLocationLocal = { ca: 'USD', tx: 'USD', ny: 'USD', fl: 'USD', il: 'USD' };
      const cur = currencyByLocationLocal[location] || 'USD';
      const results = document.getElementById('budgetResults');
      const breakdown = document.getElementById('budgetBreakdown');
      const health = document.getElementById('budgetHealth');
      const advice = document.getElementById('budgetAdvice');

      breakdown.innerHTML = '';
      [
        `Income: ${cur} ${income.toLocaleString()}`,
        `Total essentials: ${cur} ${essentials.toLocaleString()}`,
        `Transport budget: ${cur} ${transport.toLocaleString()}`,
        `Savings goal: ${cur} ${savingsGoal.toLocaleString()} (${savingsRate.toFixed(1)}% of income)`,
        `Remainder after all planned spending: ${cur} ${remainder.toLocaleString()}`
      ].forEach((line)=>{
        const li = document.createElement('li');
        li.textContent = line;
        breakdown.appendChild(li);
      });

      if(remainder < 0){
        health.textContent = 'Budget health: Deficit';
        advice.textContent = 'You are over budget. Reduce transport spending or lower non-essential costs before committing to car ownership.';
      } else if(remainder < 100){
        health.textContent = 'Budget health: Tight';
        advice.textContent = 'You can cover costs, but with little buffer. Keep emergency cash and avoid locking into high fixed car expenses.';
      } else {
        health.textContent = 'Budget health: Stable';
        advice.textContent = 'Your budget has some room. You can test higher transport costs and compare if a car still fits without hurting savings.';
      }

      results.classList.remove('hidden');
    });
  }
});
