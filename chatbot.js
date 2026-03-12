// Car Cost Assistant — rule-based chatbot widget
(function () {
  'use strict';

  // ── Knowledge base ──────────────────────────────────────────────────────────
  const KB = [
    {
      patterns: [/\bhello\b|\bhi\b|\bhey\b|\bgreet/i],
      reply: "Hi there! 👋 I'm the Car Cost Assistant. Ask me anything about car ownership costs, the calculator, transit alternatives, or tips to save money."
    },
    {
      patterns: [/\bwhat (is|does) (this site|it) (do|about|cover)\b|\babout this\b|\bwhat can you\b|\bhelp\b/i],
      reply: "This site helps you figure out whether owning a car is worth it in 2026. You can:\n• Run a personalised <a href='calculator.html'>Cost Calculator</a>\n• Explore the <a href='dashboard.html'>Data Dashboard</a>\n• Compare <a href='car-vs-transit.html'>Car vs Transit</a>\n• Browse <a href='alternatives.html'>Alternatives</a> and <a href='tips.html'>Actionable Tips</a>"
    },
    {
      patterns: [/how much.*cost|annual cost|total cost|ownership cost|cost of (a |owning )?car/i],
      reply: "Annual car ownership in the US averages around <strong>$9,500–$11,000</strong> when you add up:\n• Loan/depreciation (~$4,500)\n• Insurance (~$1,900)\n• Fuel (~$2,100)\n• Maintenance (~$1,050)\n\nUse the <a href='calculator.html'>Cost Calculator</a> to get a personalised estimate."
    },
    {
      patterns: [/calculator|calculate|estimate|how much (will|would) i (pay|spend)/i],
      reply: "Head to the <a href='calculator.html'>Cost Calculator</a> — enter your car model, commute distance, location, and insurance level to get a detailed annual breakdown with a chart."
    },
    {
      patterns: [/insurance/i],
      reply: "Insurance is one of the biggest variable costs. In our dataset it ranges from <strong>~$1,200 to $1,900/year</strong> in the US and has grown about 58% since 2016. Shop annually and look for multi-policy / safe-driver discounts. Check the <a href='tips.html'>Tips page</a> for more."
    },
    {
      patterns: [/fuel|gas|petrol|energy cost/i],
      reply: "Fuel costs average <strong>~$2,100/year</strong> for a typical US gas car (based on ~15,000 km/yr). Electric vehicles cut this to roughly <strong>$700–$900/year</strong> in energy costs. Use the <a href='calculator.html'>Calculator</a> to compare models."
    },
    {
      patterns: [/maintenance|repair|service/i],
      reply: "Maintenance costs average <strong>~$1,050/year</strong> for a typical car. Electric vehicles tend to have lower maintenance costs (~30% less) since they have fewer moving parts. Always budget for unexpected repairs on top of routine servicing."
    },
    {
      patterns: [/electric|ev\b|tesla|hybrid/i],
      reply: "EVs have lower running costs (energy + maintenance) but a higher purchase price. In the calculator, select the <strong>Electric</strong> model to see the full comparison. Federal and state incentives can reduce upfront costs — check the <a href='tips.html'>Tips page</a> for details on EV incentives."
    },
    {
      patterns: [/transit|bus|train|subway|public transport/i],
      reply: "Public transit averages <strong>$1,200–$2,400/year</strong> with a season pass — far less than car ownership. Use the <a href='car-vs-transit.html'>Car vs Transit</a> page to enter your specific situation and see a direct comparison."
    },
    {
      patterns: [/car.?vs.?transit|compare.*transit|transit.*compare/i],
      reply: "The <a href='car-vs-transit.html'>Car vs Transit</a> page lets you enter your commute, transit pass cost, and income to get a personalised recommendation on which option makes financial sense for you."
    },
    {
      patterns: [/alternative|other option|instead of (a )?car|without (a )?car/i],
      reply: "Some popular alternatives and their typical annual costs:\n• 🚌 Public transit — $1,200–$2,400\n• 🚲 Biking — $200–$600\n• ⚡ E-bike — $400–$1,200\n• 🚗 Car sharing — $600–$3,000\n• 🛴 E-scooter — $150–$800\n\nSee the full breakdown on the <a href='alternatives.html'>Alternatives page</a>."
    },
    {
      patterns: [/tip|save money|reduce cost|cheap|afford/i],
      reply: "Quick tips to cut car costs:\n• Shop insurance every year\n• Batch errands to reduce mileage\n• Consider EVs and check incentives\n• Get a pre-purchase inspection on used cars\n• Try car sharing if you drive infrequently\n\nSee all tips on the <a href='tips.html'>Actionable Tips page</a>."
    },
    {
      patterns: [/dashboard|data|trend|chart|wage|affordab/i],
      reply: "The <a href='dashboard.html'>Data Dashboard</a> shows how ownership costs have grown vs wages since 2016. You can filter by region (US, EU, Switzerland) and student profile. Car costs have outpaced wage growth in most regions."
    },
    {
      patterns: [/depreciation|value.*drop|resale/i],
      reply: "Depreciation is the largest hidden cost of car ownership — a new car typically loses <strong>15–20% of its value in year one</strong> and ~50% over five years. This is factored into the loan/ownership base in the calculator."
    },
    {
      patterns: [/loan|finance|interest|down payment/i],
      reply: "Auto loan rates in 2026 average <strong>6–8% APR</strong> for new cars. Negotiate with your bank or credit union before accepting dealer financing. The <a href='calculator.html'>Calculator</a> lets you adjust loan term and down payment. Small rate differences add up significantly over a 5-year loan."
    },
    {
      patterns: [/parking/i],
      reply: "Parking is a commonly overlooked cost — urban monthly parking can add <strong>$1,200–$3,600/year</strong> to your total. The <a href='calculator.html'>Calculator</a> includes a parking field so you can factor this in."
    },
    {
      patterns: [/student|university|college|campus/i],
      reply: "For students, the key question is whether a car's flexibility justifies the ~$9,000+ annual cost. The <a href='car-vs-transit.html'>Car vs Transit</a> tool is built specifically for students and compares annual costs versus your take-home income."
    },
    {
      patterns: [/switzerland|swiss|europe|eu\b|germany/i],
      reply: "The <a href='dashboard.html'>Data Dashboard</a> and <a href='calculator.html'>Calculator</a> support US, EU, and Switzerland. Fuel and insurance costs vary — Switzerland tends to run highest due to fuel taxes, while the EU averages slightly lower than the US."
    },
    {
      patterns: [/thank|thanks|thx|cheers/i],
      reply: "You're welcome! Let me know if you have any other questions about car costs. 🚗"
    },
    {
      patterns: [/bye|goodbye|see you|cya/i],
      reply: "Goodbye! Drive (or ride) safe! 🚗"
    }
  ];

  const FALLBACK = "I'm not sure about that one. Try asking about car ownership costs, the calculator, insurance, fuel, transit alternatives, or money-saving tips!";

  function getReply(input) {
    const text = input.trim();
    if (!text) return null;
    for (const entry of KB) {
      if (entry.patterns.some(p => p.test(text))) return entry.reply;
    }
    return FALLBACK;
  }

  // ── DOM injection ────────────────────────────────────────────────────────────
  function buildWidget() {
    const widget = document.createElement('div');
    widget.id = 'cb-widget';
    widget.innerHTML = `
      <button id="cb-toggle" aria-label="Open chat assistant" title="Chat with Assistant">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span id="cb-badge" class="cb-badge" aria-hidden="true" style="display:none">1</span>
      </button>
      <div id="cb-window" role="dialog" aria-label="Car Cost Assistant" aria-hidden="true">
        <div id="cb-header">
          <span>🚗 Car Cost Assistant</span>
          <button id="cb-close" aria-label="Close chat">✕</button>
        </div>
        <div id="cb-messages" aria-live="polite"></div>
        <div id="cb-suggestions"></div>
        <div id="cb-input-row">
          <input id="cb-input" type="text" placeholder="Ask a question…" autocomplete="off" maxlength="300" aria-label="Chat message"/>
          <button id="cb-send" aria-label="Send message">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
  }

  const SUGGESTIONS = [
    'How much does car ownership cost?',
    'What are alternatives to a car?',
    'How do I use the calculator?',
    'Tips to save money'
  ];

  function renderSuggestions(container) {
    container.innerHTML = '';
    SUGGESTIONS.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'cb-suggestion';
      btn.textContent = s;
      btn.addEventListener('click', () => {
        sendMessage(s);
        container.innerHTML = '';
      });
      container.appendChild(btn);
    });
  }

  function addMessage(role, html, messagesEl) {
    const div = document.createElement('div');
    div.className = `cb-msg cb-msg--${role}`;
    if (role === 'bot') {
      // bot replies may contain safe internal anchor links — allow that subset only
      div.innerHTML = html;
    } else {
      div.textContent = html; // user input always plain text
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addTypingIndicator(messagesEl) {
    const div = document.createElement('div');
    div.className = 'cb-msg cb-msg--bot cb-typing';
    div.id = 'cb-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  let sendMessage;

  function init() {
    buildWidget();

    const toggle = document.getElementById('cb-toggle');
    const close = document.getElementById('cb-close');
    const win = document.getElementById('cb-window');
    const input = document.getElementById('cb-input');
    const sendBtn = document.getElementById('cb-send');
    const messages = document.getElementById('cb-messages');
    const suggestions = document.getElementById('cb-suggestions');
    const badge = document.getElementById('cb-badge');

    let opened = false;

    function openChat() {
      win.classList.add('cb-open');
      win.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      badge.style.display = 'none';
      opened = true;
      input.focus();
    }

    function closeChat() {
      win.classList.remove('cb-open');
      win.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => win.classList.contains('cb-open') ? closeChat() : openChat());
    close.addEventListener('click', closeChat);

    // Greet on first open
    let greeted = false;
    toggle.addEventListener('click', () => {
      if (!greeted && win.classList.contains('cb-open')) {
        greeted = true;
        addMessage('bot', "Hi! 👋 I'm the <strong>Car Cost Assistant</strong>. Ask me about car ownership costs, the calculator, transit alternatives, or tips to save money.", messages);
        renderSuggestions(suggestions);
      }
    });

    sendMessage = function (text) {
      const trimmed = (text || input.value).trim();
      if (!trimmed) return;
      input.value = '';
      suggestions.innerHTML = '';

      addMessage('user', trimmed, messages);

      const typing = addTypingIndicator(messages);

      setTimeout(() => {
        typing.remove();
        const reply = getReply(trimmed);
        if (reply) addMessage('bot', reply, messages);
      }, 450 + Math.random() * 300);
    };

    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });

    // Show badge dot after 3s to invite engagement
    setTimeout(() => {
      if (!opened) {
        badge.style.display = 'flex';
      }
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
