// Full-site chatbot experience with built-in calculators and guidance.
(function () {
  'use strict';

  const sampleData = {
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    wages: [60000, 61000, 62000, 63500, 64500, 66000, 68000, 70000, 71500, 73000],
    insurance: [1200, 1250, 1300, 1350, 1400, 1500, 1600, 1700, 1800, 1900],
    gas: [1600, 1650, 1700, 1750, 1600, 1700, 1800, 1900, 2000, 2100],
    maintenance: [800, 820, 830, 850, 870, 900, 940, 980, 1000, 1050]
  };

  const ownershipBase = [4000, 4000, 4000, 4000, 4100, 4200, 4300, 4400, 4500, 4600];

  const modelInfo = {
    compact: { label: 'Compact', price: 20000, fuel: 6.0, type: 'gas' },
    sedan: { label: 'Sedan', price: 35000, fuel: 7.5, type: 'gas' },
    suv: { label: 'SUV', price: 50000, fuel: 9.0, type: 'gas' },
    ev: { label: 'Electric', price: 40000, fuel: 18.0, type: 'ev' }
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

  const currencyByLocation = { ca: 'USD', tx: 'USD', ny: 'USD', fl: 'USD', il: 'USD' };

  const alternatives = [
    'Public transit: USD 1,200-2,400/yr',
    'Biking: USD 200-600/yr',
    'E-bike: USD 400-1,200/yr',
    'Car sharing: USD 600-3,000/yr',
    'Micromobility scooter: USD 150-800/yr',
    'Carpooling: USD 300-1,500/yr'
  ];

  const tips = [
    'Shop insurance rates every year.',
    'Batch errands to reduce annual mileage.',
    'Get a pre-purchase inspection for used cars.',
    'Compare financing offers before dealership loans.',
    'Track parking and maintenance costs monthly.',
    'Use car sharing if you drive infrequently.'
  ];

  function getPageContext(currentPage, isHome) {
    if (isHome) {
      return {
        title: 'Car Cost Assistant',
        helper: 'Explore costs, affordability, and alternatives.',
        placeholder: 'Example: run calculator, dashboard ca frugal, compare transit',
        welcome: 'Welcome. This is now a chat-first version of your site.<br>Type `help` or use quick actions to run calculator, comparisons, dashboard snapshots, budget planning, what-if simulation, alternatives, and tips.',
        actions: [
          { action: 'dashboard', label: 'Data Dashboard' },
          { action: 'calc', label: 'Cost Calculator' },
          { action: 'compare', label: 'Car vs Transit' },
          { action: 'whatif', label: 'What-If Fuel +10%' },
          { action: 'alternatives', label: 'Alternatives' },
          { action: 'tips', label: 'Actionable Tips' },
          { action: 'reset', label: 'Reset Chat' }
        ]
      };
    }

    const contexts = {
      'dashboard.html': {
        title: 'Dashboard Assistant',
        helper: 'Ask about trends, filters, or what the charts mean.',
        placeholder: 'Ask about trends, charts, or affordability...',
        welcome: 'You are on the <strong>Data Dashboard</strong>. I can explain the charts, compare trends, or run a dashboard snapshot in chat.',
        actions: [
          { action: 'dashboard', label: 'Run Snapshot' },
          { action: 'compare', label: 'Compare Transit' },
          { action: 'tips', label: 'Savings Tips' }
        ]
      },
      'calculator.html': {
        title: 'Calculator Assistant',
        helper: 'Ask about inputs, affordability, or ownership costs.',
        placeholder: 'Ask about price, commute, fuel, or affordability...',
        welcome: 'You are on the <strong>Cost Calculator</strong>. I can help you think through inputs, affordability, and car ownership tradeoffs before you run the form.',
        actions: [
          { action: 'calc', label: 'Run Calculator' },
          { action: 'whatif', label: 'Fuel What-If' },
          { action: 'compare', label: 'Compare Transit' },
          { action: 'tips', label: 'Savings Tips' }
        ]
      },
      'car-vs-transit.html': {
        title: 'Transit Comparison Assistant',
        helper: 'Ask which option is cheaper for a student budget.',
        placeholder: 'Ask about transit, commute, or budget tradeoffs...',
        welcome: 'You are on <strong>Car vs Transit</strong>. I can compare commute options, estimate budget impact, and help you decide which mode is more realistic.',
        actions: [
          { action: 'compare', label: 'Compare Options' },
          { action: 'calc', label: 'Cost Calculator' },
          { action: 'tips', label: 'Savings Tips' }
        ]
      },
      'alternatives.html': {
        title: 'Alternatives Assistant',
        helper: 'Ask about lower-cost transport options and fit.',
        placeholder: 'Ask about biking, transit, sharing, or lower-cost options...',
        welcome: 'You are on <strong>Alternatives</strong>. I can surface cheaper transport modes and point you to the best next comparison for your situation.',
        actions: [
          { action: 'alternatives', label: 'Top Alternatives' },
          { action: 'compare', label: 'Compare Transit' },
          { action: 'tips', label: 'Actionable Tips' }
        ]
      },
      'tips.html': {
        title: 'Tips Assistant',
        helper: 'Ask how to lower costs or what to do next.',
        placeholder: 'Ask how to cut insurance, fuel, or total costs...',
        welcome: 'You are on <strong>Actionable Tips</strong>. I can recommend the most relevant cost-saving actions and send you to the right calculator or comparison next.',
        actions: [
          { action: 'tips', label: 'Show Tips' },
          { action: 'calc', label: 'Run Calculator' },
          { action: 'alternatives', label: 'Alternatives' },
          { action: 'compare', label: 'Compare Transit' }
        ]
      }
    };

    return contexts[currentPage] || {
      title: 'Car Cost Assistant',
      helper: 'Ask about costs, alternatives, or affordability.',
      placeholder: 'Ask about costs, calculator, or transit...',
      welcome: 'Hi. Ask me anything about ownership costs, calculator inputs, dashboard trends, transit comparison, alternatives, or tips.',
      actions: [
        { action: 'dashboard', label: 'Data Dashboard' },
        { action: 'calc', label: 'Cost Calculator' },
        { action: 'compare', label: 'Car vs Transit' },
        { action: 'tips', label: 'Actionable Tips' }
      ]
    };
  }

  function annuityPayment(principal, yearlyRate, years) {
    if (yearlyRate === 0) return principal / (years * 12);
    const r = yearlyRate / 100 / 12;
    const n = years * 12;
    return principal * r / (1 - Math.pow(1 + r, -n));
  }

  function computeAnnualCosts(inputs) {
    const workDays = 220;
    const kmPerYear = inputs.commuteKmPerDay * workDays;
    const m = modelInfo[inputs.model] || modelInfo.compact;

    const loanPrincipal = Math.max(0, inputs.price - inputs.down);
    const monthly = annuityPayment(loanPrincipal, inputs.rate, inputs.term);
    const annualLoan = monthly * 12;

    const baseInsurance = { ca: 1700, tx: 1450, ny: 1850, fl: 2000, il: 1550 }[inputs.location] || 1700;
    const insMultiplier = inputs.insuranceCategory === 'low' ? 0.85 : (inputs.insuranceCategory === 'high' ? 1.4 : 1.0);
    const areaInsuranceMultiplier = { urban: 1.15, suburban: 1.0, rural: 0.9 }[inputs.campusArea] || 1.0;
    const annualInsurance = Math.round(baseInsurance * insMultiplier * areaInsuranceMultiplier);

    let annualFuelCost = 0;
    if (m.type === 'gas') {
      const litersPerYear = (m.fuel / 100) * kmPerYear;
      const areaFuelMultiplier = { urban: 1.08, suburban: 1.0, rural: 0.95 }[inputs.campusArea] || 1.0;
      annualFuelCost = litersPerYear * inputs.fuelPrice * areaFuelMultiplier;
    } else {
      const kwhPerYear = (m.fuel / 100) * kmPerYear;
      annualFuelCost = kwhPerYear * inputs.fuelPrice;
    }

    const annualParking = { urban: 1200, suburban: 650, rural: 250 }[inputs.campusArea] || 650;
    let maintenance = Math.max(300, Math.round(0.04 * inputs.price));
    if (inputs.model === 'ev') maintenance = Math.max(150, Math.round(0.02 * inputs.price));

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

  function estimateTransitAnnualCost(inputs) {
    const pass = Math.max(0, inputs.transitPassMonthly * 12);
    const rideshare = Math.max(0, inputs.rideshareMonthly * 12);
    return pass + rideshare;
  }

  function estimateCommuteTimeHours(inputs) {
    const workDays = 220;
    const carMinutesByArea = { urban: 38, suburban: 32, rural: 30 };
    const transitMinutesByArea = { urban: 54, suburban: 68, rural: 82 };
    const area = inputs.campusArea || 'urban';
    return {
      carHours: ((carMinutesByArea[area] || 35) * workDays) / 60,
      transitHours: ((transitMinutesByArea[area] || 60) * workDays) / 60
    };
  }

  function buildDashboardData(stateKey, profileKey) {
    const state = dashboardStates[stateKey] || dashboardStates.ca;
    const profile = dashboardProfiles[profileKey] || dashboardProfiles.average;
    const apply = (arr, key) => arr.map((v) => Math.round(v * state[key] * profile[key]));

    const wages = apply(sampleData.wages, 'wage');
    const insurance = apply(sampleData.insurance, 'insurance');
    const gas = apply(sampleData.gas, 'fuel');
    const maintenance = apply(sampleData.maintenance, 'maintenance');
    const own = apply(ownershipBase, 'ownership');
    const totalCost = sampleData.years.map((_, i) => insurance[i] + gas[i] + maintenance[i] + own[i]);

    return { years: sampleData.years, wages, insurance, gas, maintenance, ownershipBase: own, totalCost };
  }

  function formatCurrency(cur, value) {
    return cur + ' ' + Math.round(value).toLocaleString();
  }

  function formatShortNumber(value) {
    const n = Number(value) || 0;
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
    return Math.round(n).toString();
  }

  function renderLineChartSvg(seriesA, seriesB, options) {
    options = options || {};
    const href = options.href || 'dashboard.html';
    const title = options.title || 'Dashboard trend preview';
    const labels = Array.isArray(options.labels) ? options.labels : [];
    const w = 360;
    const h = 168;
    const px = 38;
    const py = 24;
    const vals = seriesA.concat(seriesB);
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const span = Math.max(1, max - min);

    function toPoints(arr) {
      return arr.map(function (v, i) {
        const x = px + (i * (w - px * 2)) / Math.max(1, arr.length - 1);
        const y = h - py - ((v - min) / span) * (h - py * 2);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
    }

    function pointAt(arr, idx) {
      const x = px + (idx * (w - px * 2)) / Math.max(1, arr.length - 1);
      const y = h - py - ((arr[idx] - min) / span) * (h - py * 2);
      return { x: x, y: y };
    }

    const tickVals = [min, min + span / 2, max];
    const yTicks = tickVals.map(function (v) {
      const y = h - py - ((v - min) / span) * (h - py * 2);
      return {
        y: y,
        text: formatShortNumber(v)
      };
    });

    const xTickIndexes = [0, Math.floor((seriesA.length - 1) / 2), Math.max(0, seriesA.length - 1)];
    const xTicks = xTickIndexes.map(function (idx) {
      const x = px + (idx * (w - px * 2)) / Math.max(1, seriesA.length - 1);
      return {
        x: x,
        text: String(labels[idx] || idx + 1)
      };
    });

    const pointsA = toPoints(seriesA);
    const pointsB = toPoints(seriesB);
    const lastIndex = Math.max(0, seriesA.length - 1);
    const lastA = pointAt(seriesA, lastIndex);
    const lastB = pointAt(seriesB, lastIndex);
    const growthA = seriesA.length > 1 ? ((seriesA[lastIndex] - seriesA[0]) / Math.max(1, seriesA[0])) * 100 : 0;
    const growthB = seriesB.length > 1 ? ((seriesB[lastIndex] - seriesB[0]) / Math.max(1, seriesB[0])) * 100 : 0;

    return [
      '<div class="chat-chart chat-chart-clickable" role="button" tabindex="0" data-href="' + href + '" aria-label="' + title + '">',
      '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Dashboard trend chart">',
      yTicks.map(function (t) {
        return '<line x1="' + px + '" y1="' + t.y.toFixed(1) + '" x2="' + (w - px) + '" y2="' + t.y.toFixed(1) + '" stroke="#ece7e3" stroke-width="1"/>';
      }).join(''),
      '<line x1="' + px + '" y1="' + py + '" x2="' + px + '" y2="' + (h - py) + '" stroke="#cabfb9" stroke-width="1"/>',
      '<line x1="' + px + '" y1="' + (h - py) + '" x2="' + (w - px) + '" y2="' + (h - py) + '" stroke="#cabfb9" stroke-width="1"/>',
      '<polyline fill="none" stroke="#d9001b" stroke-width="2.5" points="' + pointsA + '"/>',
      '<polyline fill="none" stroke="#2f4858" stroke-width="2.5" points="' + pointsB + '"/>',
      '<circle cx="' + lastA.x.toFixed(1) + '" cy="' + lastA.y.toFixed(1) + '" r="3.5" fill="#d9001b"/>',
      '<circle cx="' + lastB.x.toFixed(1) + '" cy="' + lastB.y.toFixed(1) + '" r="3.5" fill="#2f4858"/>',
      '<text x="' + (lastA.x - 2).toFixed(1) + '" y="' + (lastA.y - 8).toFixed(1) + '" font-size="9" fill="#d9001b" text-anchor="end">' + formatShortNumber(seriesA[lastIndex]) + '</text>',
      '<text x="' + (lastB.x + 4).toFixed(1) + '" y="' + (lastB.y - 8).toFixed(1) + '" font-size="9" fill="#2f4858">' + formatShortNumber(seriesB[lastIndex]) + '</text>',
      yTicks.map(function (t) {
        return '<text x="' + (px - 6) + '" y="' + (t.y + 3).toFixed(1) + '" font-size="9" fill="#7b7471" text-anchor="end">' + t.text + '</text>';
      }).join(''),
      xTicks.map(function (t) {
        return '<text x="' + t.x.toFixed(1) + '" y="' + (h - 6) + '" font-size="9" fill="#7b7471" text-anchor="middle">' + t.text + '</text>';
      }).join(''),
      '<text x="' + px + '" y="14" font-size="10" fill="#5f5a57">Red: Car Cost (' + growthA.toFixed(1) + '%)</text>',
      '<text x="' + (w - 130) + '" y="14" font-size="10" fill="#5f5a57">Blue: Wage (' + growthB.toFixed(1) + '%)</text>',
      '</svg>',
      '<div class="chat-chart-hint">Click to open chart page</div>',
      '</div>'
    ].join('');
  }

  function renderBarChartSvg(items, options) {
    options = options || {};
    const href = options.href || 'dashboard.html';
    const title = options.title || 'Chart preview';
    const w = 360;
    const h = 168;
    const p = 28;
    const max = Math.max.apply(null, items.map(function (x) { return x.value; }).concat([1]));
    const colW = (w - p * 2) / items.length;
    const bars = items.map(function (item, i) {
      const barH = Math.max(2, (item.value / max) * (h - p * 2 - 30));
      const x = p + i * colW + 6;
      const y = h - p - barH - 16;
      const labelY = h - 6;
      const shortLabel = item.label.length > 8 ? item.label.slice(0, 8) : item.label;
      return [
        '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (colW - 12).toFixed(1) + '" height="' + barH.toFixed(1) + '" fill="' + item.color + '" rx="4"/>',
        '<text x="' + (x + (colW - 12) / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" font-size="9" fill="#3f3836" text-anchor="middle">' + formatShortNumber(item.value) + '</text>',
        '<text x="' + (x + (colW - 12) / 2).toFixed(1) + '" y="' + labelY + '" font-size="9" fill="#5f5a57" text-anchor="middle">' + shortLabel + '</text>'
      ].join('');
    }).join('');

    const tickVals = [0, max / 2, max];
    const yTicks = tickVals.map(function (v) {
      const y = (h - p - 16) - (v / Math.max(1, max)) * (h - p * 2 - 30);
      return {
        y: y,
        text: formatShortNumber(v)
      };
    });

    const total = items.reduce(function (acc, x) { return acc + (x.value || 0); }, 0);

    return [
      '<div class="chat-chart chat-chart-clickable" role="button" tabindex="0" data-href="' + href + '" aria-label="' + title + '">',
      '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Chat bar chart">',
      yTicks.map(function (t) {
        return '<line x1="' + p + '" y1="' + t.y.toFixed(1) + '" x2="' + (w - p) + '" y2="' + t.y.toFixed(1) + '" stroke="#ece7e3" stroke-width="1"/>';
      }).join(''),
      '<line x1="' + p + '" y1="' + (h - p - 16) + '" x2="' + (w - p) + '" y2="' + (h - p - 16) + '" stroke="#cabfb9" stroke-width="1"/>',
      yTicks.map(function (t) {
        return '<text x="' + (p - 6) + '" y="' + (t.y + 3).toFixed(1) + '" font-size="9" fill="#7b7471" text-anchor="end">' + t.text + '</text>';
      }).join(''),
      bars,
      '<text x="' + (w - p) + '" y="14" font-size="10" fill="#5f5a57" text-anchor="end">Total: ' + formatShortNumber(total) + '</text>',
      '</svg>',
      '<div class="chat-chart-hint">Click to open chart page</div>',
      '</div>'
    ].join('');
  }

  function openChartLink(href) {
    if (!href) return;
    const next = String(href).trim();
    if (!next) return;
    const win = window.open(next, '_blank');
    if (win) {
      win.opener = null;
      return;
    }
    window.location.href = next;
  }

  function openChartViewer(chart) {
    if (!chart) return;
    const svg = chart.querySelector('svg');
    if (!svg) return;

    const payload = {
      title: chart.getAttribute('aria-label') || 'Chart preview',
      targetHref: chart.getAttribute('data-href') || 'index.html',
      svg: svg.outerHTML
    };

    const key = 'chatChart:' + Date.now() + ':' + Math.random().toString(16).slice(2);
    let viewerUrl = 'chart-view.html';

    try {
      sessionStorage.setItem(key, JSON.stringify(payload));
      viewerUrl += '?chartKey=' + encodeURIComponent(key);
    } catch (error) {
      const fallback = [
        'title=' + encodeURIComponent(payload.title),
        'target=' + encodeURIComponent(payload.targetHref),
        'svg=' + encodeURIComponent(payload.svg)
      ].join('&');
      viewerUrl += '?' + fallback;
    }

    openChartLink(viewerUrl);
  }

  function attachChartInteractions(messagesEl) {
    if (!messagesEl) return;

    messagesEl.addEventListener('click', function (event) {
      const chart = event.target && event.target.closest ? event.target.closest('.chat-chart[data-href]') : null;
      if (!chart) return;
      openChartViewer(chart);
    });

    messagesEl.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const chart = event.target && event.target.closest ? event.target.closest('.chat-chart[data-href]') : null;
      if (!chart) return;
      event.preventDefault();
      openChartViewer(chart);
    });
  }

  function mountUI(pageContext) {
    const main = document.querySelector('main');
    if (!main) return null;

    const currentState = getCurrentPageState();
    const titleWithState = currentState 
      ? pageContext.title + ' <span style="font-size:0.8em; opacity:0.7;">(' + currentState.toUpperCase() + ')</span>' 
      : pageContext.title;

    main.innerHTML = [
      '<section class="container panel chatbot-shell">',
      '  <div class="chatbot-top">',
      '    <h2 class="chatbot-title">' + titleWithState + '</h2>',
      '    <p class="muted" style="font-size:.95rem; margin:6px 0 4px;">Is car ownership still worth it in 2026?</p>',
      '    <p class="chatbot-sub">' + pageContext.helper + '</p>',
      '  </div>',
      '  <div id="fullChat" class="full-chat">',
      '    <div id="fullChatMessages" class="full-chat-messages" aria-live="polite"></div>',
      '    <div class="full-chat-actions">',
      pageContext.actions.map(function (item) {
        return '      <button class="full-action" data-action="' + item.action + '">' + item.label + '</button>';
      }).join(''),
      '    </div>',
      '    <div class="full-chat-input">',
      '      <input id="fullChatInput" type="text" maxlength="320" placeholder="' + pageContext.placeholder + '" />',
      '      <button id="fullChatSend" type="button">Send</button>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('');

    return {
      messages: document.getElementById('fullChatMessages'),
      input: document.getElementById('fullChatInput'),
      send: document.getElementById('fullChatSend'),
      actionButtons: Array.from(document.querySelectorAll('.full-action'))
    };
  }

  function mountWidgetUI(pageContext) {
    const widget = document.createElement('div');
    widget.id = 'cb-widget';
    
    const currentState = getCurrentPageState();
    const titleDisplay = currentState 
      ? pageContext.title + ' <span style="font-size:0.85em; opacity:0.7;">(' + currentState.toUpperCase() + ')</span>' 
      : pageContext.title;

    widget.innerHTML = [
      '<button id="cb-toggle" aria-label="Open chat assistant" title="Chat with Assistant">',
      '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      '  </svg>',
      '  <span id="cb-badge" class="cb-badge" style="display:none">1</span>',
      '</button>',
      '<div id="cb-window" aria-hidden="true">',
      '  <div id="cb-header">',
      '    <div class="cb-header-copy">',
      '      <span>' + titleDisplay + '</span>',
      '      <small>' + pageContext.helper + '</small>',
      '    </div>',
      '    <button id="cb-close" aria-label="Close chat">x</button>',
      '  </div>',
      '  <div id="cb-messages" aria-live="polite"></div>',
      '  <div id="cb-suggestions">',
      pageContext.actions.map(function (item) {
        return '    <button class="cb-suggestion cb-action" data-action="' + item.action + '">' + item.label + '</button>';
      }).join(''),
      '  </div>',
      '  <div id="cb-input-row">',
      '    <input id="cb-input" type="text" maxlength="320" placeholder="' + pageContext.placeholder + '" />',
      '    <button id="cb-send" type="button">Send</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(widget);

    const toggle = document.getElementById('cb-toggle');
    const win = document.getElementById('cb-window');
    const close = document.getElementById('cb-close');
    const badge = document.getElementById('cb-badge');
    let greeted = false;

    function openWidget() {
      win.classList.add('cb-open');
      win.setAttribute('aria-hidden', 'false');
      toggle.classList.remove('cb-pulse');
      if (badge) badge.style.display = 'none';
      if (!greeted) {
        greeted = true;
        const messages = document.getElementById('cb-messages');
        if (messages) {
          addBubble(messages, 'bot', pageContext.welcome);
        }
      }
    }

    function closeWidget() {
      win.classList.remove('cb-open');
      win.setAttribute('aria-hidden', 'true');
    }

    toggle.addEventListener('click', function () {
      if (win.classList.contains('cb-open')) closeWidget();
      else openWidget();
    });
    close.addEventListener('click', closeWidget);

    // Invite interaction when the user has not opened chat yet.
    setTimeout(function () {
      if (!win.classList.contains('cb-open')) {
        toggle.classList.add('cb-pulse');
        if (badge) badge.style.display = 'flex';
      }
    }, 2200);

    return {
      messages: document.getElementById('cb-messages'),
      input: document.getElementById('cb-input'),
      send: document.getElementById('cb-send'),
      actionButtons: Array.from(document.querySelectorAll('.cb-action'))
    };
  }

  function addBubble(container, who, text) {
    const el = document.createElement('div');
    el.className = who === 'user' ? 'full-bubble full-bubble-user' : 'full-bubble full-bubble-bot';
    if (who === 'bot') {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function stepPrompt(flow, step) {
    if (flow === 'dashboard') {
      const prompts = [
        'Dashboard step 1/4: state (`ca`, `tx`, `ny`, `fl`, `il`).',
        'Dashboard step 2/4: profile (`average`, `frugal`, `commuter`).',
        'Dashboard step 3/4: start year (2016-2025).',
        'Dashboard step 4/4: end year (2016-2025).'
      ];
      return prompts[step] || '';
    }

    if (flow === 'calc') {
      const prompts = [
        'Calculator step 1/12: state (`ca`, `tx`, `ny`, `fl`, `il`).',
        'Calculator step 2/12: model (`compact`, `sedan`, `suv`, `ev`).',
        'Calculator step 3/12: commute distance in km (roundtrip/workday).',
        'Calculator step 4/12: insurance category (`low`, `medium`, `high`).',
        'Calculator step 5/12: campus area (`urban`, `suburban`, `rural`).',
        'Calculator step 6/12: purchase price (number).',
        'Calculator step 7/12: down payment (number).',
        'Calculator step 8/12: loan term in years (number).',
        'Calculator step 9/12: APR interest rate (number, percent).',
        'Calculator step 10/12: fuel or electricity price per unit (number).',
        'Calculator step 11/12: monthly student take-home income (number).',
        'Calculator step 12/12: monthly essentials budget (number).'
      ];
      return prompts[step] || '';
    }

    if (flow === 'budget') {
      const prompts = [
        'Budget step 1/5: monthly take-home income (number).',
        'Budget step 2/5: monthly essentials (rent, food, bills).',
        'Budget step 3/5: monthly savings goal.',
        'Budget step 4/5: monthly debt payments.',
        'Budget step 5/5: transport choice (`car`, `transit`, `flex`).'
      ];
      return prompts[step] || '';
    }

    const prompts = [
      'Compare step 1/9: state (`ca`, `tx`, `ny`, `fl`, `il`).',
      'Compare step 2/9: campus area (`urban`, `suburban`, `rural`).',
      'Compare step 3/9: model (`compact`, `sedan`, `suv`, `ev`).',
      'Compare step 4/9: commute distance in km (roundtrip/workday).',
      'Compare step 5/9: monthly transit pass cost.',
      'Compare step 6/9: monthly rideshare/taxi backup cost.',
      'Compare step 7/9: monthly student take-home income.',
      'Compare step 8/9: monthly essentials spending.',
      'Compare step 9/9: fuel or electricity price per unit.'
    ];
    return prompts[step] || '';
  }

  function normalizeEnum(value, allowed, fallback) {
    const v = String(value || '').trim().toLowerCase();
    if (allowed.indexOf(v) >= 0) return v;
    return fallback;
  }

  function parseNumber(value, fallback) {
    const n = parseFloat(value);
    if (Number.isFinite(n)) return n;
    return fallback;
  }

  function readSavedJson(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (error) {
      // Ignore unavailable storage or malformed JSON.
    }
    return null;
  }

  function getCurrentPageState() {
    // Returns the currently selected state from the form, or null if not on a form page or no state is selected
    const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    let stateSelectId;
    
    if (current === 'dashboard.html') {
      stateSelectId = 'dashState';
    } else if (current === 'calculator.html') {
      stateSelectId = 'location';
    } else if (current === 'car-vs-transit.html') {
      stateSelectId = 'compareLocation';
    } else {
      return null;
    }
    
    const stateSelect = document.getElementById(stateSelectId);
    if (!stateSelect) return null;
    
    const selectedState = stateSelect.value;
    return (selectedState && selectedState !== '') ? selectedState : null;
  }

  function getSavedCalculatorInputs() {
    const saved = readSavedJson('calcFormData');
    if (!saved) return null;

    return {
      location: normalizeEnum(saved.location, ['ca', 'tx', 'ny', 'fl', 'il'], 'ca'),
      model: normalizeEnum(saved.carModel, ['compact', 'sedan', 'suv', 'ev'], 'sedan'),
      commuteKmPerDay: Math.max(0, parseNumber(saved.commute, 20)),
      insuranceCategory: normalizeEnum(saved.insurance, ['low', 'medium', 'high'], 'medium'),
      campusArea: normalizeEnum(saved.campusArea, ['urban', 'suburban', 'rural'], 'urban'),
      price: Math.max(0, parseNumber(saved.price, 35000)),
      down: Math.max(0, parseNumber(saved.down, 5000)),
      term: Math.max(1, parseNumber(saved.term, 5)),
      rate: Math.max(0, parseNumber(saved.rate, 3.5)),
      fuelPrice: Math.max(0, parseNumber(saved.fuelPrice, 1.8)),
      studentIncomeMonthly: Math.max(0, parseNumber(saved.studentIncome, 1400)),
      monthlyEssentials: Math.max(0, parseNumber(saved.monthlyEssentials, 1000))
    };
  }

  function getSavedCompareInputs() {
    const saved = readSavedJson('cvtFormData');
    if (!saved) return null;

    return {
      location: normalizeEnum(saved.compareLocation, ['ca', 'tx', 'ny', 'fl', 'il'], 'ca'),
      campusArea: normalizeEnum(saved.compareCampusArea, ['urban', 'suburban', 'rural'], 'urban'),
      model: normalizeEnum(saved.compareCarModel, ['compact', 'sedan', 'suv', 'ev'], 'sedan'),
      commuteKmPerDay: Math.max(0, parseNumber(saved.compareCommute, 20)),
      transitPassMonthly: Math.max(0, parseNumber(saved.transitPass, 95)),
      rideshareMonthly: Math.max(0, parseNumber(saved.rideshare, 40)),
      monthlyIncome: Math.max(0, parseNumber(saved.compareIncome, 1400)),
      monthlyEssentials: Math.max(0, parseNumber(saved.compareEssentials, 1000)),
      fuelPrice: Math.max(0, parseNumber(saved.compareFuelPrice, 1.8))
    };
  }

  function buildDashboardHref(stateCode, profile, startYear, endYear) {
    const query = [
      'state=' + encodeURIComponent(stateCode || 'ca'),
      'profile=' + encodeURIComponent(profile || 'average'),
      'start=' + encodeURIComponent(String(startYear || 2016)),
      'end=' + encodeURIComponent(String(endYear || 2025))
    ].join('&');
    return 'dashboard.html?' + query;
  }

  function buildDashboardReply(stateCode, profile) {
    const data = buildDashboardData(stateCode, profile);
    const dashboardHref = buildDashboardHref(stateCode, profile, 2016, 2025);
    const first = data.totalCost[0];
    const latest = data.totalCost[data.totalCost.length - 1];
    const latestWage = data.wages[data.wages.length - 1];
    const growthPct = ((latest - first) / first) * 100;
    const burdenPct = (latest / latestWage) * 100;
    const i = data.totalCost.length - 1;
    const components = [
      ['Loan/ownership', data.ownershipBase[i]],
      ['Insurance', data.insurance[i]],
      ['Fuel/energy', data.gas[i]],
      ['Maintenance', data.maintenance[i]]
    ].sort((a, b) => b[1] - a[1]);
    const top = components[0];
    const trendChart = renderLineChartSvg(data.totalCost, data.wages, {
      href: dashboardHref,
      title: 'Open dashboard page for trend details',
      labels: data.years
    });
    const componentChart = renderBarChartSvg([
      { label: 'Loan', value: data.ownershipBase[i], color: '#d9001b' },
      { label: 'Ins', value: data.insurance[i], color: '#f97316' },
      { label: 'Fuel', value: data.gas[i], color: '#3b82f6' },
      { label: 'Maint', value: data.maintenance[i], color: '#16a34a' }
    ], {
      href: dashboardHref,
      title: 'Open dashboard page for component details'
    });

    return [
      '<strong>Dashboard snapshot</strong>',
      'State: ' + stateCode.toUpperCase() + ' | Profile: ' + profile,
      'Latest annual ownership cost: <strong>' + formatCurrency('USD', latest) + '</strong>',
      'Cost growth since 2016: <strong>' + growthPct.toFixed(1) + '%</strong>',
      'Cost as share of median wage: <strong>' + burdenPct.toFixed(1) + '%</strong>',
      'Largest current component: <strong>' + top[0] + ' (' + formatCurrency('USD', top[1]) + ')</strong>',
      trendChart,
      componentChart
    ].join('<br>');
  }

  function buildDashboardReplyRange(stateCode, profile, startYear, endYear) {
    const data = buildDashboardData(stateCode, profile);
    let start = Math.max(2016, Math.min(2025, Math.round(startYear)));
    let end = Math.max(2016, Math.min(2025, Math.round(endYear)));
    if (start > end) {
      const t = start;
      start = end;
      end = t;
    }

    const startIdx = data.years.indexOf(start);
    const endIdx = data.years.indexOf(end);
    if (startIdx < 0 || endIdx < 0) {
      return buildDashboardReply(stateCode, profile);
    }

    const sliceYears = data.years.slice(startIdx, endIdx + 1);
    const sliceTotal = data.totalCost.slice(startIdx, endIdx + 1);
    const sliceWages = data.wages.slice(startIdx, endIdx + 1);
    const first = sliceTotal[0];
    const latest = sliceTotal[sliceTotal.length - 1];
    const latestWage = sliceWages[sliceWages.length - 1];
    const growthPct = ((latest - first) / Math.max(1, first)) * 100;
    const burdenPct = (latest / Math.max(1, latestWage)) * 100;

    const latestIndex = endIdx;
    const dashboardHref = buildDashboardHref(stateCode, profile, start, end);
    const componentChart = renderBarChartSvg([
      { label: 'Loan', value: data.ownershipBase[latestIndex], color: '#d9001b' },
      { label: 'Ins', value: data.insurance[latestIndex], color: '#f97316' },
      { label: 'Fuel', value: data.gas[latestIndex], color: '#3b82f6' },
      { label: 'Maint', value: data.maintenance[latestIndex], color: '#16a34a' }
    ], {
      href: dashboardHref,
      title: 'Open dashboard page for component details'
    });
    const trendChart = renderLineChartSvg(sliceTotal, sliceWages, {
      href: dashboardHref,
      title: 'Open dashboard page for trend details',
      labels: sliceYears
    });

    return [
      '<strong>Dashboard snapshot</strong>',
      'State: ' + stateCode.toUpperCase() + ' | Profile: ' + profile,
      'Range: ' + start + ' to ' + end,
      'Latest annual ownership cost: <strong>' + formatCurrency('USD', latest) + '</strong>',
      'Cost growth in selected range: <strong>' + growthPct.toFixed(1) + '%</strong>',
      'Latest cost as share of wage: <strong>' + burdenPct.toFixed(1) + '%</strong>',
      trendChart,
      componentChart
    ].join('<br>');
  }

  function botHelp() {
    return [
      'I can run your entire site features in chat:',
      '- Type <strong>dashboard</strong> for trend summary.',
      '- Type <strong>run calculator</strong> for full annual cost breakdown.',
      '- Type <strong>compare transit</strong> for car vs transit verdict.',
      '- Type <strong>budget planner</strong> for monthly affordability.',
      '- Type <strong>what-if +10%</strong> to simulate fuel/energy shock.',
      '- Type <strong>history</strong> to recap your recent analyses.',
      '- Type <strong>alternatives</strong> for low-cost options.',
      '- Type <strong>tips</strong> for savings actions.',
      '- Type <strong>cancel</strong> to stop a flow anytime.'
    ].join('<br>');
  }

  function init() {
    // Only turn the site into a full-page chatbot on the first page (Home).
    // Other tabs should keep their original content and behavior.
    const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const isHome = current === '' || current === 'index.html';
    const pageContext = getPageContext(current, isHome);
    if (isHome) document.body.classList.add('chat-home');

    const ui = isHome ? mountUI(pageContext) : mountWidgetUI(pageContext);
    if (!ui) return;

    const state = {
      flow: null,
      step: 0,
      data: {},
      lastCalculator: null,
      lastCompare: null,
      history: [],
      skipSavedCalcOnce: false,
      skipSavedCompareOnce: false
    };

    const calcKeys = [
      'location', 'model', 'commuteKmPerDay', 'insuranceCategory', 'campusArea',
      'price', 'down', 'term', 'rate', 'fuelPrice', 'studentIncomeMonthly', 'monthlyEssentials'
    ];

    const compareKeys = [
      'location', 'campusArea', 'model', 'commuteKmPerDay', 'transitPassMonthly',
      'rideshareMonthly', 'monthlyIncome', 'monthlyEssentials', 'fuelPrice'
    ];

    const dashboardKeys = ['state', 'profile', 'startYear', 'endYear'];
    const budgetKeys = ['incomeMonthly', 'essentialsMonthly', 'savingsMonthly', 'debtMonthly', 'transportChoice'];

    function pushHistory(label, summary) {
      state.history.unshift({ label: label, summary: summary });
      state.history = state.history.slice(0, 5);
    }

    function resetFlow() {
      state.flow = null;
      state.step = 0;
      state.data = {};
    }

    function resetChatSession() {
      resetFlow();
      state.skipSavedCalcOnce = true;
      state.skipSavedCompareOnce = true;
      ui.messages.innerHTML = '';
      addBubble(ui.messages, 'bot', 'Chat reset. Saved form data will be ignored once for calculator/compare so you can enter values manually. Type `help` to start again.');
    }

    function getPreselectedStateForFlow(flowName) {
      // Check if we're on the corresponding page and if a state is already selected in the form
      const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
      
      let expectedPage, stateSelectId;
      if (flowName === 'dashboard') {
        expectedPage = 'dashboard.html';
        stateSelectId = 'dashState';
      } else if (flowName === 'calc') {
        expectedPage = 'calculator.html';
        stateSelectId = 'location';
      } else if (flowName === 'compare') {
        expectedPage = 'car-vs-transit.html';
        stateSelectId = 'compareLocation';
      } else {
        return null;
      }
      
      if (current !== expectedPage) return null;
      
      const stateSelect = document.getElementById(stateSelectId);
      if (!stateSelect) return null;
      
      const selectedState = stateSelect.value;
      if (!selectedState || selectedState === '') return null;
      
      return selectedState;
    }

    function startFlow(flowName) {
      state.flow = flowName;
      state.step = 0;
      state.data = {};
      let flowLabel = flowName === 'calc' ? 'Cost Calculator' : (flowName === 'compare' ? 'Car vs Transit' : 'Dashboard');
      if (flowName === 'budget') flowLabel = 'Budget Planner';
      addBubble(ui.messages, 'bot',
        'Starting ' + flowLabel +
        '. Reply with one value per step. Type <strong>cancel</strong> to stop.');
      
      // For dashboard, calc, and compare flows, check if state is already selected in the form
      if (flowName === 'dashboard' || flowName === 'calc' || flowName === 'compare') {
        const preselectedState = getPreselectedStateForFlow(flowName);
        if (preselectedState) {
          state.data.location = preselectedState; // Both calc and compare use 'location' key; dashboard uses 'state'
          if (flowName === 'dashboard') {
            state.data.state = preselectedState;
            state.data.location = undefined;
            state.step = 1; // Skip state step, move to profile
            addBubble(ui.messages, 'bot', 'I found your state: <strong>' + preselectedState.toUpperCase() + '</strong>. Now ' + stepPrompt(flowName, state.step));
            return;
          } else if (flowName === 'calc' || flowName === 'compare') {
            state.step = 1; // Skip state step, move to next step
            addBubble(ui.messages, 'bot', 'I found your state: <strong>' + preselectedState.toUpperCase() + '</strong>. Now ' + stepPrompt(flowName, state.step));
            return;
          }
        }
      }
      
      addBubble(ui.messages, 'bot', stepPrompt(flowName, state.step));
    }

    function completeBudget() {
      const d = state.data;
      const income = Math.max(0, parseNumber(d.incomeMonthly, 1400));
      const essentials = Math.max(0, parseNumber(d.essentialsMonthly, 900));
      const savings = Math.max(0, parseNumber(d.savingsMonthly, 150));
      const debt = Math.max(0, parseNumber(d.debtMonthly, 100));
      const choice = normalizeEnum(d.transportChoice, ['car', 'transit', 'flex'], 'flex');

      const baselineCarMonthly = state.lastCalculator ? (state.lastCalculator.total / 12) : 900;
      const baselineTransitMonthly = state.lastCompare ? (state.lastCompare.transitAnnual / 12) : 180;
      const baselineFlexMonthly = Math.round((baselineCarMonthly * 0.35 + baselineTransitMonthly * 0.65) * 100) / 100;

      const transportMonthly = choice === 'car' ? baselineCarMonthly : (choice === 'transit' ? baselineTransitMonthly : baselineFlexMonthly);
      const remaining = income - essentials - savings - debt - transportMonthly;
      const transportShare = income > 0 ? (transportMonthly / income) * 100 : 0;
      const recommendedMax = income * 0.2;

      let verdict = 'Needs tightening. Transport is likely squeezing your monthly goals.';
      if (remaining >= 0 && transportShare <= 20) verdict = 'Healthy. This transport choice appears affordable for your monthly plan.';
      else if (remaining >= 0 && transportShare <= 28) verdict = 'Manageable but tight. Monitor spending and keep a buffer.';

      addBubble(ui.messages, 'bot', [
        '<strong>Budget planner result</strong>',
        'Income: ' + formatCurrency('USD', income),
        'Essentials: ' + formatCurrency('USD', essentials),
        'Savings goal: ' + formatCurrency('USD', savings),
        'Debt payments: ' + formatCurrency('USD', debt),
        'Transport (' + choice + '): ' + formatCurrency('USD', transportMonthly),
        'Transport share of income: <strong>' + transportShare.toFixed(1) + '%</strong>',
        'Recommended transport cap (20%): ' + formatCurrency('USD', recommendedMax),
        '<strong>Money left monthly: ' + formatCurrency('USD', remaining) + '</strong>',
        '<strong>Verdict:</strong> ' + verdict
      ].join('<br>'));

      pushHistory('Budget', 'Choice ' + choice + ', left ' + formatCurrency('USD', remaining) + '/mo');
      resetFlow();
    }

    function completeDashboard() {
      const d = state.data;
      const stateCode = normalizeEnum(d.state, ['ca', 'tx', 'ny', 'fl', 'il'], 'ca');
      const profile = normalizeEnum(d.profile, ['average', 'frugal', 'commuter'], 'average');
      const startYear = parseNumber(d.startYear, 2016);
      const endYear = parseNumber(d.endYear, 2025);
      addBubble(ui.messages, 'bot', buildDashboardReplyRange(stateCode, profile, startYear, endYear));
      resetFlow();
    }

    function completeCalculator() {
      const d = state.data;
      const out = computeAnnualCosts(d);
      const cur = currencyByLocation[d.location] || 'USD';

      const annualIncome = Math.max(0, d.studentIncomeMonthly * 12);
      const annualEssentials = Math.max(0, d.monthlyEssentials * 12);
      const discretionary = Math.max(0, annualIncome - annualEssentials);
      const costVsIncomePct = annualIncome > 0 ? (out.total / annualIncome) * 100 : 0;
      const costVsDiscretionaryPct = discretionary > 0 ? (out.total / discretionary) * 100 : 0;
      const postCarRemainder = annualIncome - annualEssentials - out.total;

      let verdict = 'Add income for a clearer affordability verdict.';
      if (annualIncome > 0) {
        if (postCarRemainder < 0 || costVsIncomePct > 35) {
          verdict = 'Likely not worth it right now for a typical student budget.';
        } else if (costVsIncomePct > 20) {
          verdict = 'Borderline: ownership may work but consumes a large budget share.';
        } else {
          verdict = 'More manageable for a student budget based on these assumptions.';
        }
      }

      const calcChart = renderBarChartSvg([
        { label: 'Loan', value: out.annualLoan, color: '#d9001b' },
        { label: 'Ins', value: out.annualInsurance, color: '#f97316' },
        { label: 'Fuel', value: out.annualFuel, color: '#3b82f6' },
        { label: 'Maint', value: out.maintenance, color: '#16a34a' },
        { label: 'Park', value: out.annualParking, color: '#8b5cf6' }
      ], {
        href: 'calculator.html',
        title: 'Open calculator page for detailed inputs'
      });

      addBubble(ui.messages, 'bot', [
        '<strong>Calculator result</strong>',
        'State: ' + (d.location || 'ca').toUpperCase(),
        'Loan: ' + formatCurrency(cur, out.annualLoan),
        'Insurance: ' + formatCurrency(cur, out.annualInsurance),
        'Fuel/Energy: ' + formatCurrency(cur, out.annualFuel),
        'Maintenance: ' + formatCurrency(cur, out.maintenance),
        'Parking: ' + formatCurrency(cur, out.annualParking),
        '<strong>Total annual cost: ' + formatCurrency(cur, out.total) + '</strong>',
        'Cost as % income: ' + costVsIncomePct.toFixed(1) + '%',
        'Cost as % discretionary budget: ' + (discretionary > 0 ? costVsDiscretionaryPct.toFixed(1) + '%' : 'N/A'),
        'Money left after essentials + car: ' + formatCurrency(cur, postCarRemainder),
        calcChart,
        '<strong>Verdict:</strong> ' + verdict
      ].join('<br>'));

      state.lastCalculator = {
        location: d.location,
        total: out.total,
        fuel: out.annualFuel,
        model: d.model
      };
      pushHistory('Calculator', 'Total ' + formatCurrency(cur, out.total) + '/yr (' + d.model + ')');

      resetFlow();
    }

    function completeCompare() {
      const d = state.data;
      const modelPrice = (modelInfo[d.model] || modelInfo.sedan).price;
      const carCost = computeAnnualCosts({
        location: d.location,
        model: d.model,
        commuteKmPerDay: d.commuteKmPerDay,
        insuranceCategory: 'medium',
        campusArea: d.campusArea,
        price: modelPrice,
        down: Math.round(modelPrice * 0.12),
        term: 5,
        rate: 5.2,
        fuelPrice: d.fuelPrice
      }).total;

      const transitAnnual = Math.round(estimateTransitAnnualCost({
        transitPassMonthly: d.transitPassMonthly,
        rideshareMonthly: d.rideshareMonthly
      }));

      const annualIncome = d.monthlyIncome * 12;
      const annualEssentials = d.monthlyEssentials * 12;
      const postCar = annualIncome - annualEssentials - carCost;
      const postTransit = annualIncome - annualEssentials - transitAnnual;

      const carPct = annualIncome > 0 ? (carCost / annualIncome) * 100 : 0;
      const transitPct = annualIncome > 0 ? (transitAnnual / annualIncome) * 100 : 0;
      const diff = Math.abs(carCost - transitAnnual);
      const carIsCheaper = carCost <= transitAnnual;
      const time = estimateCommuteTimeHours({ campusArea: d.campusArea });
      const cur = currencyByLocation[d.location] || 'USD';
      const compareChart = renderBarChartSvg([
        { label: 'Car', value: carCost, color: '#d9001b' },
        { label: 'Transit', value: transitAnnual, color: '#2f4858' }
      ], {
        href: 'car-vs-transit.html',
        title: 'Open car vs transit page for detailed comparison'
      });

      addBubble(ui.messages, 'bot', [
        '<strong>Car vs Transit result</strong>',
        'State: ' + (d.location || 'ca').toUpperCase(),
        'Car annual cost: ' + formatCurrency(cur, carCost),
        'Transit annual cost: ' + formatCurrency(cur, transitAnnual),
        '<strong>Cheaper option: ' + (carIsCheaper ? 'Car' : 'Transit') + '</strong> (' + formatCurrency(cur, diff) + ' difference)',
        'Car cost as % income: ' + carPct.toFixed(1) + '%',
        'Transit cost as % income: ' + transitPct.toFixed(1) + '%',
        'Estimated commute time (car): ' + time.carHours.toFixed(0) + ' hrs/yr',
        'Estimated commute time (transit): ' + time.transitHours.toFixed(0) + ' hrs/yr',
        'Remaining money after essentials + car: ' + formatCurrency(cur, postCar),
        'Remaining money after essentials + transit: ' + formatCurrency(cur, postTransit),
        compareChart
      ].join('<br>'));

      state.lastCompare = {
        location: d.location,
        carCost: carCost,
        transitAnnual: transitAnnual,
        cheaper: carIsCheaper ? 'car' : 'transit'
      };
      pushHistory('Compare', 'Cheaper: ' + (carIsCheaper ? 'Car' : 'Transit') + ' (' + formatCurrency(cur, diff) + ')');

      resetFlow();
    }

    function runWhatIf(percentChange) {
      const change = parseNumber(percentChange, 10);
      const pct = Math.max(-80, Math.min(200, change));

      const baseAnnual = state.lastCalculator ? state.lastCalculator.total : (state.lastCompare ? state.lastCompare.carCost : 0);
      const baseFuelAnnual = state.lastCalculator ? state.lastCalculator.fuel : Math.round(baseAnnual * 0.22);
      if (!baseAnnual || !baseFuelAnnual) {
        addBubble(ui.messages, 'bot', 'Run <strong>calculator</strong> first so I can build a personalized what-if simulation.');
        return;
      }

      const adjustedFuel = baseFuelAnnual * (1 + pct / 100);
      const adjustedTotal = baseAnnual - baseFuelAnnual + adjustedFuel;
      const delta = adjustedTotal - baseAnnual;
      const sign = delta >= 0 ? '+' : '-';

      addBubble(ui.messages, 'bot', [
        '<strong>What-if simulation</strong>',
        'Scenario: fuel/energy price change <strong>' + pct.toFixed(1) + '%</strong>',
        'Baseline annual total: ' + formatCurrency('USD', baseAnnual),
        'New projected annual total: <strong>' + formatCurrency('USD', adjustedTotal) + '</strong>',
        'Impact: <strong>' + sign + formatCurrency('USD', Math.abs(delta)) + '</strong>'
      ].join('<br>'));

      pushHistory('What-If', 'Fuel ' + pct.toFixed(1) + '%, impact ' + sign + formatCurrency('USD', Math.abs(delta)) + '/yr');
    }

    function setFlowValue(raw) {
      const val = String(raw || '').trim();

      if (state.flow === 'dashboard') {
        const key = dashboardKeys[state.step];
        if (key === 'state') state.data[key] = normalizeEnum(val, ['ca', 'tx', 'ny', 'fl', 'il'], 'ca');
        if (key === 'profile') state.data[key] = normalizeEnum(val, ['average', 'frugal', 'commuter'], 'average');
        if (key === 'startYear') state.data[key] = Math.max(2016, Math.min(2025, parseNumber(val, 2016)));
        if (key === 'endYear') state.data[key] = Math.max(2016, Math.min(2025, parseNumber(val, 2025)));

        state.step += 1;
        if (state.step >= dashboardKeys.length) {
          completeDashboard();
        } else {
          addBubble(ui.messages, 'bot', stepPrompt('dashboard', state.step));
        }
        return;
      }

      if (state.flow === 'calc') {
        const key = calcKeys[state.step];
        if (key === 'location') state.data[key] = normalizeEnum(val, ['ca', 'tx', 'ny', 'fl', 'il'], 'ca');
        if (key === 'model') state.data[key] = normalizeEnum(val, ['compact', 'sedan', 'suv', 'ev'], 'sedan');
        if (key === 'commuteKmPerDay') state.data[key] = Math.max(0, parseNumber(val, 20));
        if (key === 'insuranceCategory') state.data[key] = normalizeEnum(val, ['low', 'medium', 'high'], 'medium');
        if (key === 'campusArea') state.data[key] = normalizeEnum(val, ['urban', 'suburban', 'rural'], 'urban');
        if (key === 'price') state.data[key] = Math.max(0, parseNumber(val, modelInfo[state.data.model || 'sedan'].price));
        if (key === 'down') state.data[key] = Math.max(0, parseNumber(val, 4000));
        if (key === 'term') state.data[key] = Math.max(1, parseNumber(val, 5));
        if (key === 'rate') state.data[key] = Math.max(0, parseNumber(val, 5.2));
        if (key === 'fuelPrice') state.data[key] = Math.max(0, parseNumber(val, state.data.model === 'ev' ? 0.2 : 1.8));
        if (key === 'studentIncomeMonthly') state.data[key] = Math.max(0, parseNumber(val, 1400));
        if (key === 'monthlyEssentials') state.data[key] = Math.max(0, parseNumber(val, 900));

        state.step += 1;
        if (state.step >= calcKeys.length) {
          completeCalculator();
        } else {
          addBubble(ui.messages, 'bot', stepPrompt('calc', state.step));
        }
        return;
      }

      if (state.flow === 'budget') {
        const key = budgetKeys[state.step];
        if (key === 'incomeMonthly') state.data[key] = Math.max(0, parseNumber(val, 1400));
        if (key === 'essentialsMonthly') state.data[key] = Math.max(0, parseNumber(val, 900));
        if (key === 'savingsMonthly') state.data[key] = Math.max(0, parseNumber(val, 150));
        if (key === 'debtMonthly') state.data[key] = Math.max(0, parseNumber(val, 100));
        if (key === 'transportChoice') state.data[key] = normalizeEnum(val, ['car', 'transit', 'flex'], 'flex');

        state.step += 1;
        if (state.step >= budgetKeys.length) {
          completeBudget();
        } else {
          addBubble(ui.messages, 'bot', stepPrompt('budget', state.step));
        }
        return;
      }

      if (state.flow === 'compare') {
        const key = compareKeys[state.step];
        if (key === 'location') state.data[key] = normalizeEnum(val, ['ca', 'tx', 'ny', 'fl', 'il'], 'ca');
        if (key === 'campusArea') state.data[key] = normalizeEnum(val, ['urban', 'suburban', 'rural'], 'urban');
        if (key === 'model') state.data[key] = normalizeEnum(val, ['compact', 'sedan', 'suv', 'ev'], 'sedan');
        if (key === 'commuteKmPerDay') state.data[key] = Math.max(0, parseNumber(val, 20));
        if (key === 'transitPassMonthly') state.data[key] = Math.max(0, parseNumber(val, 95));
        if (key === 'rideshareMonthly') state.data[key] = Math.max(0, parseNumber(val, 40));
        if (key === 'monthlyIncome') state.data[key] = Math.max(0, parseNumber(val, 1400));
        if (key === 'monthlyEssentials') state.data[key] = Math.max(0, parseNumber(val, 900));
        if (key === 'fuelPrice') state.data[key] = Math.max(0, parseNumber(val, state.data.model === 'ev' ? 0.2 : 1.8));

        state.step += 1;
        if (state.step >= compareKeys.length) {
          completeCompare();
        } else {
          addBubble(ui.messages, 'bot', stepPrompt('compare', state.step));
        }
      }
    }

    function parseCommandIntent(low) {
      if (low.indexOf('dashboard') >= 0 || low.indexOf('trend') >= 0) return { type: 'dashboard' };
      if (low.indexOf('calculator') >= 0 || low.indexOf('calc') >= 0) return { type: 'calc' };
      if (low.indexOf('compare') >= 0 || low.indexOf('transit') >= 0) return { type: 'compare' };
      if (low.indexOf('budget') >= 0 || low.indexOf('planner') >= 0) return { type: 'budget' };
      if (low.indexOf('what-if') >= 0 || low.indexOf('what if') >= 0 || low.indexOf('scenario') >= 0) {
        const match = low.match(/(-?\d+(?:\.\d+)?)\s*%/);
        return { type: 'whatif', pct: match ? parseFloat(match[1]) : 10 };
      }
      if (low === 'history' || low.indexOf('summary') >= 0 || low.indexOf('recap') >= 0) return { type: 'history' };
      if (low.indexOf('alternatives') >= 0 || low.indexOf('option') >= 0) return { type: 'alternatives' };
      if (low.indexOf('tips') >= 0 || low.indexOf('save') >= 0) return { type: 'tips' };
      if (low.indexOf('help') >= 0 || low.indexOf('start') >= 0 || low.indexOf('what can you') >= 0) return { type: 'help' };
      return null;
    }

    function executeCommandIntent(intent) {
      if (!intent) return false;

      if (intent.type === 'dashboard') {
        startFlow('dashboard');
        return true;
      }
      if (intent.type === 'calc') {
        const savedCalc = state.skipSavedCalcOnce ? null : getSavedCalculatorInputs();
        if (state.skipSavedCalcOnce) state.skipSavedCalcOnce = false;
        if (savedCalc) {
          addBubble(ui.messages, 'bot', 'Using your <strong>saved Cost Calculator inputs</strong> from the form page. Type `reset` then `run calculator` if you want to re-enter values step by step.');
          state.data = savedCalc;
          completeCalculator();
          return true;
        }
        startFlow('calc');
        return true;
      }
      if (intent.type === 'compare') {
        const savedCompare = state.skipSavedCompareOnce ? null : getSavedCompareInputs();
        if (state.skipSavedCompareOnce) state.skipSavedCompareOnce = false;
        if (savedCompare) {
          addBubble(ui.messages, 'bot', 'Using your <strong>saved Car vs Transit inputs</strong> from the form page. Type `reset` then `compare transit` if you want to re-enter values step by step.');
          state.data = savedCompare;
          completeCompare();
          return true;
        }
        startFlow('compare');
        return true;
      }
      if (intent.type === 'budget') {
        startFlow('budget');
        return true;
      }
      if (intent.type === 'whatif') {
        runWhatIf(intent.pct);
        return true;
      }
      if (intent.type === 'history') {
        if (!state.history.length) {
          addBubble(ui.messages, 'bot', 'No analysis history yet. Run <strong>calculator</strong>, <strong>compare</strong>, <strong>budget</strong>, or <strong>what-if</strong> first.');
          return true;
        }
        const lines = state.history.map(function (h, i) {
          return (i + 1) + '. <strong>' + h.label + ':</strong> ' + h.summary;
        });
        addBubble(ui.messages, 'bot', '<strong>Recent chat analysis</strong><br>' + lines.join('<br>'));
        return true;
      }
      if (intent.type === 'alternatives') {
        addBubble(ui.messages, 'bot', '<strong>Top alternatives</strong><br>' + alternatives.join('<br>'));
        return true;
      }
      if (intent.type === 'tips') {
        addBubble(ui.messages, 'bot', '<strong>Actionable tips</strong><br>' + tips.join('<br>'));
        return true;
      }
      if (intent.type === 'help') {
        addBubble(ui.messages, 'bot', botHelp());
        return true;
      }

      return false;
    }

    function handleIntent(raw) {
      const text = String(raw || '').trim();
      const low = text.toLowerCase();
      const commandIntent = parseCommandIntent(low);

      if (!text) return;

      if (low === 'reset') {
        resetChatSession();
        return;
      }

      if (low === 'cancel') {
        resetFlow();
        addBubble(ui.messages, 'bot', 'Flow canceled. You can type `run calculator`, `compare transit`, `dashboard`, `alternatives`, or `tips`.');
        return;
      }

      // Allow explicit commands or quick-action labels to interrupt active flows.
      if (state.flow && commandIntent) {
        const previous = state.flow;
        resetFlow();
        addBubble(ui.messages, 'bot', 'Switched from <strong>' + previous + '</strong> to a new request.');
        executeCommandIntent(commandIntent);
        return;
      }

      if (state.flow) {
        setFlowValue(text);
        return;
      }

      if (executeCommandIntent(commandIntent)) {
        return;
      }

      addBubble(ui.messages, 'bot', 'I did not catch that. Type `help` to see available commands.');
    }

    function sendCurrent() {
      const text = ui.input.value.trim();
      if (!text) return;
      ui.input.value = '';
      addBubble(ui.messages, 'user', text);
      handleIntent(text);
    }

    ui.send.addEventListener('click', sendCurrent);
    ui.input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendCurrent();
    });
    attachChartInteractions(ui.messages);

    ui.actionButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const action = btn.getAttribute('data-action');
        if (action === 'dashboard') {
          addBubble(ui.messages, 'user', 'dashboard');
          handleIntent('dashboard');
        }
        if (action === 'calc') {
          addBubble(ui.messages, 'user', 'run calculator');
          handleIntent('run calculator');
        }
        if (action === 'compare') {
          addBubble(ui.messages, 'user', 'compare transit');
          handleIntent('compare transit');
        }
        if (action === 'budget') {
          addBubble(ui.messages, 'user', 'budget planner');
          handleIntent('budget planner');
        }
        if (action === 'whatif') {
          addBubble(ui.messages, 'user', 'what-if +10%');
          handleIntent('what-if +10%');
        }
        if (action === 'alternatives') {
          addBubble(ui.messages, 'user', 'alternatives');
          handleIntent('alternatives');
        }
        if (action === 'tips') {
          addBubble(ui.messages, 'user', 'tips');
          handleIntent('tips');
        }
        if (action === 'reset') {
          addBubble(ui.messages, 'user', 'reset');
          handleIntent('reset');
        }
      });
    });

    // Add listener for state dropdown changes to update header display
    var stateSelectId = 
      current === 'dashboard.html' ? 'dashState' : 
      current === 'calculator.html' ? 'location' : 
      current === 'car-vs-transit.html' ? 'compareLocation' : null;

    if (stateSelectId) {
      var stateSelect = document.getElementById(stateSelectId);
      if (stateSelect) {
        stateSelect.addEventListener('change', function() {
          var titleEl = isHome 
            ? document.querySelector('.chatbot-title') 
            : document.querySelector('.cb-header-copy span');
          
          if (titleEl) {
            var newState = getCurrentPageState();
            var baseTitle = pageContext.title;
            var newText = newState 
              ? baseTitle + ' <span style="font-size:0.8em; opacity:0.7;">(' + newState.toUpperCase() + ')</span>'
              : baseTitle;
            titleEl.innerHTML = newText;
          }
        });
      }
    }

    addBubble(ui.messages, 'bot', pageContext.welcome);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
