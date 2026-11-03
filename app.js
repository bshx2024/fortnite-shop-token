/**
 * Fortnite Shop Token Odds & Drop Chance Calculator
 * High-precision mathematical modeling, interactive simulation, and viral share card generator.
 */

// Core Constants & Probabilities
const ODDS_SOLO = 1 / 700000;      // 0.000142857%
const ODDS_SQUAD = 1 / 175000;     // 0.000571428%

// 50% Median Milestone calculation: ln(0.5) / ln(1 - p)
const MEDIAN_SOLO = 485203;
const MEDIAN_SQUAD = 121301;

// State
let currentMode = 'solo'; // 'solo' | 'squad'
let chestsCount = 0;
let isSimulating = false;

// DOM Elements
const soloModeBtn = document.getElementById('soloModeBtn');
const squadModeBtn = document.getElementById('squadModeBtn');
const chestInput = document.getElementById('chestInput');
const calculateBtn = document.getElementById('calculateBtn');
const simulateBtn = document.getElementById('simulateBtn');
const shareBtn = document.getElementById('shareBtn');
const toastEl = document.getElementById('toast');

// Result Display Elements
const oddsPercentEl = document.getElementById('oddsPercent');
const percentileEl = document.getElementById('percentile');
const remainingMedianEl = document.getElementById('remainingMedian');
const rankTitleEl = document.getElementById('rankTitle');
const rankDescEl = document.getElementById('rankDesc');
const rankBadgeEl = document.getElementById('rankBadge');

// Simulation Elements
const simBoxEl = document.getElementById('simulationBox');
const simProgressFillEl = document.getElementById('simProgressFill');
const simCountEl = document.getElementById('simCount');
const simLogEl = document.getElementById('simLog');

// Web Audio API Synthesizer (Zero external audio assets needed!)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio optional fallback
  }
}

function playChestLootSound() {
  playTone(440, 'triangle', 0.06, 0.08);
  setTimeout(() => playTone(660, 'triangle', 0.08, 0.08), 50);
}

function playJackpotSound() {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => playTone(freq, 'square', 0.3, 0.2), idx * 120);
  });
}

// Binomial Distribution Calculation: P = 1 - (1 - p)^n
function calculateCumulativeProbability(n, p) {
  if (n <= 0) return 0;
  // Use log1p for numerical stability with extremely tiny probabilities
  return -Math.expm1(n * Math.log1p(-p));
}

// Calculate All Metrics and Update UI
function updateCalculation() {
  const n = Math.max(0, parseInt(chestInput.value, 10) || 0);
  chestsCount = n;
  const p = currentMode === 'solo' ? ODDS_SOLO : ODDS_SQUAD;
  const medianThreshold = currentMode === 'solo' ? MEDIAN_SOLO : MEDIAN_SQUAD;

  const cumProb = calculateCumulativeProbability(n, p);
  const probPercent = (cumProb * 100);

  // 1. Cumulative Odds Display
  if (n === 0) {
    oddsPercentEl.textContent = '0.0000%';
  } else if (probPercent < 0.0001) {
    oddsPercentEl.textContent = '< 0.0001%';
  } else if (probPercent < 1) {
    oddsPercentEl.textContent = probPercent.toFixed(4) + '%';
  } else {
    oddsPercentEl.textContent = probPercent.toFixed(2) + '%';
  }

  // 2. Unlucky Percentile
  // Out of all players who opened N chests, cumProb of them hit the token.
  if (n === 0) {
    percentileEl.textContent = '0.0%';
  } else {
    // You are unluckier than the players who found it before N
    const unluckiness = Math.min(99.99, probPercent).toFixed(2);
    percentileEl.textContent = `${unluckiness}%`;
  }

  // 3. Remaining to 50% Median
  const remaining = Math.max(0, medianThreshold - n);
  remainingMedianEl.textContent = remaining.toLocaleString();

  // 4. Rank & Flavor Text
  updateRank(n);
}

function updateRank(n) {
  let title = 'Casual Dreamer';
  let desc = 'You just started searching. Still blissfully unaware of the 1/700,000 statistical prison.';
  let badge = '🌱';

  if (n > 5000) {
    title = 'Clown of the Island 🤡';
    desc = 'Over 5,000 chests opened with zero token. You have officially ascended to legendary bad-luck status.';
    badge = '🎪';
  } else if (n > 2000) {
    title = 'Chest Obliterator';
    desc = 'You have ransacked more chests than a pirate armada. Epic Games owes you emotional compensation.';
    badge = '⚔️';
  } else if (n > 800) {
    title = 'Certified Non-Lucker';
    desc = 'Approaching 1,000 chests. You have spent hours jumping into matches just to open 3 chests and leave.';
    badge = '💀';
  } else if (n > 200) {
    title = 'Grinder in Training';
    desc = 'The excitement is fading and reality is starting to kick in. Welcome to the statistical desert.';
    badge = '🧭';
  } else if (n > 0) {
    title = 'Hopeful Sailor';
    desc = 'You saw that Reddit post where a guy got it in his 1st chest and believed it could be you.';
    badge = '⛵';
  }

  rankTitleEl.textContent = title;
  rankDescEl.textContent = desc;
  rankBadgeEl.textContent = badge;
}

// Mode Switcher Handler
function setMode(mode) {
  currentMode = mode;
  if (mode === 'solo') {
    soloModeBtn.classList.add('active');
    squadModeBtn.classList.remove('active');
  } else {
    squadModeBtn.classList.add('active');
    soloModeBtn.classList.remove('active');
  }
  playTone(350, 'sine', 0.05);
  updateCalculation();
}

// Simulation Engine (Simulate Opening 100 Chests)
const COMMON_LOOT = [
  'Common Assault Rifle + 30 Light Ammo',
  'Common Pump Shotgun + 4 Shells',
  '3x Small Shield Potions',
  '1x Medkit + 30 Medium Ammo',
  'Uncommon Submachine Gun',
  'Rare Heavy Sniper Rifle',
  '3x Bandages + Wood Planks'
];

async function simulate100Chests() {
  if (isSimulating) return;
  isSimulating = true;
  simulateBtn.disabled = true;
  simBoxEl.style.display = 'block';
  simLogEl.innerHTML = '';
  simProgressFillEl.style.width = '0%';

  const p = currentMode === 'solo' ? ODDS_SOLO : ODDS_SQUAD;
  const batchSize = 100;
  let wonJackpot = false;

  for (let i = 1; i <= batchSize; i++) {
    // Roll the dice
    const roll = Math.random();
    const hit = roll < p;

    // Update progress
    simProgressFillEl.style.width = `${i}%`;
    simCountEl.textContent = `Opening Chest ${i} of ${batchSize}...`;

    if (hit) {
      wonJackpot = true;
      playJackpotSound();
      const jackpotItem = document.createElement('div');
      jackpotItem.className = 'sim-log-item jackpot';
      jackpotItem.innerHTML = `<span>🎉 CHEST #${i}:</span> <span>*** YOU FOUND PIRATE SHOP ACCESS! ***</span>`;
      simLogEl.prepend(jackpotItem);
      break;
    } else {
      if (i % 5 === 0 || i === batchSize) {
        playChestLootSound();
        const randLoot = COMMON_LOOT[Math.floor(Math.random() * COMMON_LOOT.length)];
        const logItem = document.createElement('div');
        logItem.className = 'sim-log-item';
        logItem.innerHTML = `<span>Chest #${i}:</span> <span>${randLoot} (No Token)</span>`;
        simLogEl.prepend(logItem);
      }
    }

    // Fast pace delay
    await new Promise(r => setTimeout(r, 18));
  }

  // Update total input
  chestInput.value = (parseInt(chestInput.value, 10) || 0) + batchSize;
  updateCalculation();

  if (!wonJackpot) {
    const summary = document.createElement('div');
    summary.className = 'sim-log-item';
    summary.style.color = '#ff4757';
    summary.style.fontWeight = 'bold';
    summary.innerHTML = `<span>Batch Summary:</span> <span>100 Chests opened. 0 Shop Tokens. Reality check confirmed.</span>`;
    simLogEl.prepend(summary);
  }

  simCountEl.textContent = wonJackpot ? '🚨 UNBELIEVABLE! JACKPOT HIT! 🚨' : 'Batch Complete (100 Chests Opened)';
  isSimulating = false;
  simulateBtn.disabled = false;
}

// Share Card Generator (Virality Engine for Reddit & Discord)
function generateShareCard() {
  const n = parseInt(chestInput.value, 10) || 0;
  const modeText = currentMode === 'solo' ? 'Solo (1 in 700k)' : 'Squad (1 in 175k)';
  const prob = oddsPercentEl.textContent;
  const rank = rankTitleEl.textContent;
  const currentHost = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://fortniteshoptoken.gg';
  
  // Dynamic viral tracking parameter with chest streak preset
  const shareUrl = `${currentHost}?ref=share_card&from=social&chests=${n}&mode=${currentMode}`;

  const cardText = 
`🏴‍☠️ [Fortnite Pirate Shop Token Odds Report]
📦 Chests Opened: ${n.toLocaleString()}
🎯 Mode: ${modeText}
📉 Cumulative Chance: ${prob}
🤡 Bad-Luck Rank: ${rank}
💀 Status: Still searching. Calculate your odds: ${shareUrl}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cardText).then(() => {
      showToast('Copied Bad-Luck Report to clipboard! Ready to paste into Reddit or Discord!');
      playTone(880, 'sine', 0.1);
    }).catch(() => {
      fallbackCopy(cardText);
    });
  } else {
    fallbackCopy(cardText);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('Copied to clipboard!');
  } catch (err) {
    alert('Unable to copy. Please manually copy from results.');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3500);
}

// ==========================================
// Lightweight Channel Attribution Engine (Inspired by APIVALE)
// Zero-backend, adblock-resilient first-party touchpoint tracking
// ==========================================
const Attribution = {
  STORAGE_FT_KEY: 'fn_attr_first_touch',
  STORAGE_LT_KEY: 'fn_attr_last_touch',

  init() {
    try {
      const traffic = this.parseTrafficSource();
      const now = Math.floor(Date.now() / 1000);
      const landing = `${window.location.pathname}${window.location.search}`;

      // 1. First Touch (Persistent in localStorage, non-destructive)
      const existingFT = this.getStoredTouch(this.STORAGE_FT_KEY);
      if (!existingFT && traffic.source) {
        const ft = {
          source: traffic.source,
          medium: traffic.medium,
          campaign: traffic.campaign,
          referrer: traffic.referrer,
          landing,
          timestamp: now
        };
        this.saveTouch(this.STORAGE_FT_KEY, ft);
      }

      // 2. Last Touch (Updates on explicit campaign or new external source)
      if (traffic.hasExplicitMarketing || (traffic.source && traffic.source !== 'direct')) {
        const lt = {
          source: traffic.source,
          medium: traffic.medium,
          campaign: traffic.campaign,
          referrer: traffic.referrer,
          landing,
          timestamp: now
        };
        this.saveTouch(this.STORAGE_LT_KEY, lt);
      }

      // 3. Decorate Outbound Affiliate Links
      this.decorateOutboundLinks();
    } catch (e) {
      // Attribution fallback safe
    }
  },

  parseTrafficSource() {
    if (typeof window === 'undefined') return { source: 'direct', medium: 'none', campaign: '', referrer: '', hasExplicitMarketing: false };

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source')?.trim();
    const utmMedium = params.get('utm_medium')?.trim();
    const utmCampaign = params.get('utm_campaign')?.trim();
    const refParam = params.get('ref')?.trim();
    const fromParam = params.get('from')?.trim();
    const sourceParam = params.get('source')?.trim();

    let source = utmSource || refParam || fromParam || sourceParam || '';
    let medium = utmMedium || '';
    let campaign = utmCampaign || '';
    let hasExplicitMarketing = false;

    if (source || medium || campaign) {
      hasExplicitMarketing = true;
      if (!medium) medium = refParam === 'share_card' ? 'viral_share' : 'campaign';
      return {
        source,
        medium,
        campaign,
        referrer: document.referrer || '',
        hasExplicitMarketing
      };
    }

    // Parse Referrer if no explicit query parameters
    const rawReferrer = document.referrer ? document.referrer.trim() : '';
    if (!rawReferrer) {
      return { source: 'direct', medium: 'none', campaign: '', referrer: '', hasExplicitMarketing: false };
    }

    try {
      const refUrl = new URL(rawReferrer);
      const currentHost = window.location.hostname;
      if (refUrl.hostname === currentHost || refUrl.hostname.endsWith(`.${currentHost}`)) {
        return { source: 'internal', medium: 'internal', campaign: '', referrer: rawReferrer, hasExplicitMarketing: false };
      }

      const host = refUrl.hostname.toLowerCase();
      if (host.includes('reddit.')) {
        source = 'reddit';
        medium = 'social';
      } else if (host.includes('google.')) {
        source = 'google';
        medium = 'organic';
      } else if (host.includes('t.co') || host.includes('twitter.') || host.includes('x.com')) {
        source = 'twitter';
        medium = 'social';
      } else if (host.includes('discord.')) {
        source = 'discord';
        medium = 'chat';
      } else if (host.includes('youtube.')) {
        source = 'youtube';
        medium = 'video';
      } else if (host.includes('tiktok.')) {
        source = 'tiktok';
        medium = 'social';
      } else if (host.includes('bing.')) {
        source = 'bing';
        medium = 'organic';
      } else if (host.includes('duckduckgo.')) {
        source = 'duckduckgo';
        medium = 'organic';
      } else {
        source = refUrl.hostname;
        medium = 'referral';
      }

      return { source, medium, campaign: '', referrer: rawReferrer, hasExplicitMarketing: true };
    } catch (e) {
      return { source: 'referral', medium: 'referral', campaign: '', referrer: rawReferrer, hasExplicitMarketing: false };
    }
  },

  saveTouch(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  },

  getStoredTouch(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  },

  getEffectiveAttribution() {
    const lt = this.getStoredTouch(this.STORAGE_LT_KEY);
    const ft = this.getStoredTouch(this.STORAGE_FT_KEY);
    return {
      firstSource: ft?.source || 'direct',
      firstMedium: ft?.medium || 'none',
      lastSource: lt?.source || ft?.source || 'direct',
      lastMedium: lt?.medium || ft?.medium || 'none',
      campaign: lt?.campaign || ft?.campaign || ''
    };
  },

  // Dynamically decorate Eneba & monetization links with sub-tracking IDs
  decorateOutboundLinks() {
    const attr = this.getEffectiveAttribution();
    document.querySelectorAll('.btn-vbucks').forEach(el => {
      try {
        const url = new URL(el.href);
        url.searchParams.set('af_sub1', attr.lastSource);
        url.searchParams.set('af_sub2', 'shop_token_calc');
        url.searchParams.set('af_sub3', `${currentMode}_${chestsCount}`);
        el.href = url.toString();
      } catch (e) {}
    });
  },

  // Apply viral incoming link presets (e.g. ?chests=2500&mode=squad)
  handleUrlPresets() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlChests = params.get('chests') || params.get('c');
      const urlMode = params.get('mode');

      let applied = false;
      if (urlMode === 'solo' || urlMode === 'squad') {
        setMode(urlMode);
      }
      if (urlChests && !isNaN(parseInt(urlChests, 10))) {
        const count = Math.max(0, parseInt(urlChests, 10));
        chestInput.value = count;
        updateCalculation();
        applied = true;
      }

      if (applied && params.get('ref') === 'share_card') {
        setTimeout(() => {
          showToast(`🎯 Loaded shared streak: ${parseInt(urlChests, 10).toLocaleString()} chests! Testing your luck...`);
        }, 600);
      }
    } catch (e) {}
  }
};

// Track affiliate link clicks with attribution metadata
function initAffiliateListeners() {
  document.querySelectorAll('.btn-vbucks').forEach(el => {
    el.addEventListener('click', () => {
      Attribution.decorateOutboundLinks();
      const attr = Attribution.getEffectiveAttribution();
      sendGAEvent('affiliate_click', {
        destination: 'eneba_vbucks',
        attr_source: attr.lastSource,
        attr_medium: attr.lastMedium,
        chests_at_click: chestsCount,
        mode: currentMode
      });
    });
  });

  document.querySelectorAll('.btn-coffee').forEach(el => {
    el.addEventListener('click', () => {
      const attr = Attribution.getEffectiveAttribution();
      sendGAEvent('donate_click', {
        destination: 'buymeacoffee',
        attr_source: attr.lastSource
      });
    });
  });
}

// Setup Event Listeners
function initEventListeners() {
  soloModeBtn.addEventListener('click', () => {
    setMode('solo');
    Attribution.decorateOutboundLinks();
  });
  squadModeBtn.addEventListener('click', () => {
    setMode('squad');
    Attribution.decorateOutboundLinks();
  });

  chestInput.addEventListener('input', () => {
    updateCalculation();
    Attribution.decorateOutboundLinks();
  });

  calculateBtn.addEventListener('click', () => {
    playTone(550, 'sine', 0.08);
    updateCalculation();
    Attribution.decorateOutboundLinks();
    sendGAEvent('calculate_odds', { chest_count: parseInt(chestInput.value, 10) || 0, mode: currentMode });
  });

  simulateBtn.addEventListener('click', () => {
    simulate100Chests();
    sendGAEvent('simulate_100_chests', { mode: currentMode });
  });

  shareBtn.addEventListener('click', () => {
    generateShareCard();
    sendGAEvent('copy_share_report', { chest_count: parseInt(chestInput.value, 10) || 0 });
  });

  initAffiliateListeners();

  // Stepper Buttons (+50, +250, +1000, Reset)
  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.dataset.step;
      if (step === 'reset') {
        chestInput.value = 0;
      } else {
        const current = parseInt(chestInput.value, 10) || 0;
        chestInput.value = current + parseInt(step, 10);
      }
      playTone(400, 'sine', 0.05);
      updateCalculation();
      Attribution.decorateOutboundLinks();
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all others
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
        playTone(320, 'sine', 0.04);
        sendGAEvent('faq_expand', { question: btn.textContent.trim().slice(0, 50) });
      }
    });
  });
}

// GA4 Custom Event Dispatcher with auto-enriched Attribution dimensions
function sendGAEvent(eventName, params = {}) {
  try {
    if (typeof window.gtag === 'function') {
      const attr = Attribution.getEffectiveAttribution();
      const enrichedParams = {
        traffic_source: attr.lastSource,
        traffic_medium: attr.lastMedium,
        traffic_first_source: attr.firstSource,
        ...params
      };
      window.gtag('event', eventName, enrichedParams);
    }
  } catch (e) {
    // Analytics fallback
  }
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  chestInput.value = 250; // Default illustrative seed
  updateCalculation();
  initEventListeners();

  // Initialize attribution and URL presets
  Attribution.init();
  Attribution.handleUrlPresets();
});
