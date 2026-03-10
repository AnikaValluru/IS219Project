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

function buildChart(){
  const ctx = document.getElementById('costChart').getContext('2d');
  const years = sampleData.years;
  const totalCost = years.map((_,i)=> sampleData.insurance[i]+sampleData.gas[i]+sampleData.maintenance[i]+ownershipBase[i]);

  const chart = new Chart(ctx,{
    type:'line',
    data:{
      labels: years,
      datasets:[
  {label:'Median wage (USD)',data:sampleData.wages,borderColor:'#333',backgroundColor:'rgba(0,0,0,0.03)',yAxisID:'y1',tension:0.25},
  {label:'Total car cost (USD)',data:totalCost,borderColor:'#d9001b',backgroundColor:'rgba(217,0,27,0.08)',fill:true,tension:0.25},
        {label:'Insurance',data:sampleData.insurance,borderColor:'#ffa07a',backgroundColor:'rgba(255,160,122,0.06)',fill:'+1'},
        {label:'Gas',data:sampleData.gas,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.06)',fill:'+1'},
        {label:'Maintenance',data:sampleData.maintenance,borderColor:'#10b981',backgroundColor:'rgba(16,185,129,0.06)',fill:'+1'}
      ]
    },
    options:{
      responsive:true,
      interaction:{mode:'index',intersect:false},
      stacked:false,
      scales:{
        y:{type:'linear',position:'left',title:{display:true,text:'USD'}},
        y1:{type:'linear',position:'right',grid:{display:false},title:{display:true,text:'Wage (USD)'}}
      }
    }
  });
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
  // inputs: {location, model, commuteKmPerDay, insuranceCategory, price, down, term, rate, fuelPrice}
  const workDays = 220; // rough
  const kmPerYear = inputs.commuteKmPerDay * workDays;

  // model parameters (from shared modelInfo)
  const m = modelInfo[inputs.model] || modelInfo.compact;

  // loan
  const loanPrincipal = Math.max(0, inputs.price - inputs.down);
  const monthly = annuityPayment(loanPrincipal, inputs.rate, inputs.term);
  const annualLoan = monthly*12;

  // insurance base rates (location-adjusted roughly)
  const baseInsurance = {ch:1200,de:900,us:1500,fr:1000}[inputs.location] || 1200;
  const insMultiplier = inputs.insuranceCategory==='low' ? 0.85 : (inputs.insuranceCategory==='high' ? 1.4 : 1.0);
  const annualInsurance = Math.round(baseInsurance * insMultiplier);

  // fuel / electricity
  let annualFuelCost = 0;
  if(m.type==='gas'){
    const litersPerYear = (m.fuel/100)*kmPerYear;
    annualFuelCost = litersPerYear * inputs.fuelPrice;
  } else {
    const kwhPerYear = (m.fuel/100)*kmPerYear;
    annualFuelCost = kwhPerYear * inputs.fuelPrice; // assume fuelPrice is USD per kWh for EV
  }

  // maintenance estimate
  let maintenance = Math.max(300, Math.round(0.04 * inputs.price));
  if(inputs.model==='ev') maintenance = Math.max(150, Math.round(0.02 * inputs.price));

  // insurance and taxes already included
  const total = Math.round(annualLoan + annualInsurance + annualFuelCost + maintenance);

  return {
    annualLoan: Math.round(annualLoan),
    annualInsurance,
    annualFuel: Math.round(annualFuelCost),
    maintenance,
    total
  };
}

// DOM wiring
document.addEventListener('DOMContentLoaded',()=>{
  // Currency map by location
  const currencyByLocation = { ch: 'CHF', de: 'EUR', fr: 'EUR', us: 'USD' };

  // helper to update currency labels in the calculator form
  function updateCurrencyLabels(loc){
    const cur = currencyByLocation[loc] || 'USD';
    const priceEl = document.getElementById('priceCurrency');
    const downEl = document.getElementById('downCurrency');
    const fuelEl = document.getElementById('fuelCurrency');
    if(priceEl) priceEl.textContent = cur;
    if(downEl) downEl.textContent = cur;
    if(fuelEl) fuelEl.textContent = cur;
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
    updateCurrencyLabels(locSelect.value || 'us');
    locSelect.addEventListener('change', (e)=>{
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
    buildChart();
  }

  // wire calculator only if the calculator button exists on this page
  const calcBtn = document.getElementById('calcBtn');
  if(calcBtn){
    calcBtn.addEventListener('click',()=>{
    const inputs = {
      location: document.getElementById('location').value,
      model: document.getElementById('carModel').value.split(' ')[0],
      commuteKmPerDay: parseFloat(document.getElementById('commute').value) || 0,
      insuranceCategory: document.getElementById('insurance').value,
      price: parseFloat(document.getElementById('price').value) || 0,
      down: parseFloat(document.getElementById('down').value) || 0,
      term: parseFloat(document.getElementById('term').value) || 5,
      rate: parseFloat(document.getElementById('rate').value) || 0,
      fuelPrice: parseFloat(document.getElementById('fuelPrice').value) || 1.8
    };

    // adjust model key parsing: carModel select value may include type label; normalize
    if(['compact','sedan','suv','ev'].includes(document.getElementById('carModel').value)){
      inputs.model = document.getElementById('carModel').value;
    } else {
      // fallback: parse first token from label used in select
      const full = document.getElementById('carModel').value;
      inputs.model = full.split(' ')[0].toLowerCase();
    }

  // For EV assume fuelPrice is USD per kWh; if location US and EV, override to ~0.20 USD/kWh default if user left default high
    if(inputs.model==='ev' && inputs.fuelPrice>5) inputs.fuelPrice = 0.20;

    const out = computeAnnualCosts(inputs);
    const results = document.getElementById('results');
    const breakdown = document.getElementById('breakdown');
    breakdown.innerHTML = '';
    // choose currency based on selected location
    const currencyByLocationLocal = { ch: 'CHF', de: 'EUR', fr: 'EUR', us: 'USD' };
    const cur = currencyByLocationLocal[inputs.location] || 'USD';
    [['Loan (annual)',out.annualLoan],['Insurance',out.annualInsurance],['Fuel / Energy',out.annualFuel],['Maintenance',out.maintenance]].forEach(([k,v])=>{
      const li = document.createElement('li');
      li.textContent = `${k}: ${cur} ${v.toLocaleString()}`;
      breakdown.appendChild(li);
    });
    document.getElementById('total').textContent = `Estimated total annual cost: ${cur} ${out.total.toLocaleString()}`;

    results.classList.remove('hidden');
    });
  }
});
