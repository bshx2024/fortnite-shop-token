/**
 * Edge Bot & GEO Crawler Sniffer Core
 * High-performance, zero-latency detection and real-time alerts for Cloudflare Pages / Workers
 */

export const BOT_RULES = [
  // 1. GEO / AI Live Retrieval & Training Crawlers (Top Priority 🚀)
  { id: 'oai_search', name: 'ChatGPT Search (OAI-SearchBot)', pattern: /OAI-SearchBot/i, category: 'GEO_AI', alert: true, color: 0x9b59b6 },
  { id: 'chatgpt_user', name: 'ChatGPT User (Live Citation)', pattern: /ChatGPT-User/i, category: 'GEO_AI', alert: true, color: 0x9b59b6 },
  { id: 'gptbot', name: 'OpenAI GPTBot', pattern: /GPTBot/i, category: 'GEO_AI', alert: true, color: 0x8e44ad },
  { id: 'perplexity', name: 'Perplexity Bot (Live Search)', pattern: /PerplexityBot/i, category: 'GEO_AI', alert: true, color: 0x1abc9c },
  { id: 'claudebot', name: 'Anthropic ClaudeBot', pattern: /ClaudeBot|Claude-Web|anthropic-ai/i, category: 'GEO_AI', alert: true, color: 0xe67e22 },
  { id: 'google_extended', name: 'Google Gemini (Google-Extended)', pattern: /Google-Extended/i, category: 'GEO_AI', alert: true, color: 0x3498db },
  { id: 'bytespider', name: 'ByteDance ByteSpider (Doubao / TikTok)', pattern: /Bytespider/i, category: 'GEO_AI', alert: true, color: 0x2ecc71 },
  { id: 'applebot_extended', name: 'Apple Intelligence (Applebot-Extended)', pattern: /Applebot-Extended/i, category: 'GEO_AI', alert: true, color: 0xe74c3c },
  { id: 'cohere', name: 'Cohere AI Bot', pattern: /cohere-ai/i, category: 'GEO_AI', alert: true, color: 0x34495e },

  // 2. Search Engine Indexing Spiders (Core SEO 🔍)
  { id: 'googlebot_mobile', name: 'Googlebot Smartphone', pattern: /Googlebot.*Mobile/i, category: 'SEARCH_ENGINE', alert: true, color: 0x4285f4 },
  { id: 'googlebot_desktop', name: 'Googlebot Desktop', pattern: /Googlebot/i, category: 'SEARCH_ENGINE', alert: true, color: 0x4285f4 },
  { id: 'bingbot', name: 'Microsoft Bingbot', pattern: /bingbot/i, category: 'SEARCH_ENGINE', alert: true, color: 0x008373 },
  { id: 'duckduckbot', name: 'DuckDuckBot', pattern: /DuckDuckBot/i, category: 'SEARCH_ENGINE', alert: false, color: 0xde5833 },
  { id: 'baiduspider', name: 'Baiduspider', pattern: /Baiduspider/i, category: 'SEARCH_ENGINE', alert: false, color: 0x2932e1 },
  { id: 'yandexbot', name: 'YandexBot', pattern: /YandexBot/i, category: 'SEARCH_ENGINE', alert: false, color: 0xff0000 },

  // 3. Commercial SEO Auditing & Scrapers (Noise/Analytics 📊)
  { id: 'ahrefs', name: 'AhrefsBot (SEO Scraper)', pattern: /AhrefsBot/i, category: 'SEO_AUDIT', alert: false, color: 0x7f8c8d },
  { id: 'semrush', name: 'SemrushBot (SEO Scraper)', pattern: /SemrushBot/i, category: 'SEO_AUDIT', alert: false, color: 0x7f8c8d },
  { id: 'dotbot', name: 'DotBot (Moz)', pattern: /DotBot/i, category: 'SEO_AUDIT', alert: false, color: 0x7f8c8d },
  { id: 'petalbot', name: 'PetalBot (Huawei)', pattern: /PetalBot/i, category: 'SEO_AUDIT', alert: false, color: 0x7f8c8d },
  { id: 'mj12bot', name: 'MJ12bot (Majestic)', pattern: /MJ12bot/i, category: 'SEO_AUDIT', alert: false, color: 0x7f8c8d }
];

export const PROBE_PATTERNS = [
  /\.env/i, /wp-admin/i, /wp-login/i, /\.git/i, /eval-stdin/i, /actuator/i,
  /telescope/i, /phpinfo/i, /dump\.sql/i, /config\.json/i, /daohang/i
];

// In-memory warm ring buffer for quick diagnostic inspection
const MAX_RECENT_RECORDS = 30;
export const recentCrawls = [];

export function recordCrawl(entry) {
  recentCrawls.unshift(entry);
  if (recentCrawls.length > MAX_RECENT_RECORDS) {
    recentCrawls.pop();
  }
}

/**
 * Detects if the request comes from an AI crawler, Search Engine, or Scraper
 */
export function identifyBot(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return null;
  for (const rule of BOT_RULES) {
    if (rule.pattern.test(userAgent)) {
      return rule;
    }
  }
  return null;
}

/**
 * Checks for malicious vulnerability scanning paths
 */
export function isVulnerabilityProbe(pathname) {
  return PROBE_PATTERNS.some(re => re.test(pathname));
}

/**
 * Country code to emoji flag
 */
export function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Dispatches rich real-time notification to Discord/Telegram/Custom Webhook
 */
export async function sendWebhookAlert(webhookUrl, record) {
  if (!webhookUrl) return;

  const isDiscord = webhookUrl.includes('discord.com/api/webhooks');
  const nowIso = new Date().toISOString();

  try {
    if (isDiscord) {
      const isGeo = record.category === 'GEO_AI';
      const flag = countryFlag(record.country);
      const isTargetAsset = record.path === '/llms.txt' || record.path === '/robots.txt';

      const payload = {
        username: 'Fortnite Token GEO Radar',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/8649/8649595.png',
        embeds: [
          {
            title: `${isGeo ? '🚨 [GEO Live Crawl]' : '🔍 [Search Engine Crawl]'} ${record.botName}`,
            description: isTargetAsset
              ? `🎯 **Hit High-Priority AI Asset**: \`${record.path}\`\nThis directly feeds Generative Engine citations!`
              : `Requested: \`${record.path}\` (HTTP ${record.status})`,
            color: record.color || (isGeo ? 0x9b59b6 : 0x3498db),
            fields: [
              { name: 'Path', value: `\`${record.path}\``, inline: true },
              { name: 'Status', value: `\`${record.status}\``, inline: true },
              { name: 'Location', value: `${flag} \`${record.country || 'Unknown'}\``, inline: true },
              { name: 'IP / Network', value: `\`${record.ip}\` (${record.asn || 'AS unknown'})`, inline: false },
              { name: 'User-Agent', value: `\`\`\`${record.userAgent.slice(0, 150)}\`\`\``, inline: false }
            ],
            footer: { text: 'Fortnite Shop Token • Cloudflare Edge Real-Time Sniffer' },
            timestamp: nowIso
          }
        ]
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Standard Generic Webhook (JSON)
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    }
  } catch (err) {
    console.error('Webhook dispatch error:', err.message);
  }
}

/**
 * Main request interceptor & sniffer handler
 */
export async function handleBotDetection(request, env, waitUntil, nextHandler) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             '127.0.0.1';
  const country = request.headers.get('cf-ipcountry') || 
                  request.headers.get('x-vercel-ip-country') || 
                  'XX';
  const platform = request.headers.get('x-vercel-id') || request.headers.get('x-vercel-ip-country') 
    ? 'Vercel Edge Network' 
    : 'Cloudflare Pages / Workers';
  const asn = request.cf?.asOrganization || request.cf?.asn 
    ? `AS${request.cf.asn}` 
    : (request.headers.get('x-vercel-ip-city') || '');

  // Resolve Webhook URL from either Cloudflare env or Vercel process.env
  const webhookUrl = env?.NOTIFY_WEBHOOK_URL || 
                     env?.DISCORD_WEBHOOK_URL || 
                     (typeof process !== 'undefined' ? (process.env?.NOTIFY_WEBHOOK_URL || process.env?.DISCORD_WEBHOOK_URL) : undefined);

  // 1. Intercept diagnostic status endpoint: /api/crawl-status
  if (pathname === '/api/crawl-status') {
    const webhookConfigured = Boolean(webhookUrl);
    return new Response(JSON.stringify({
      status: 'active',
      service: 'Fortnite Shop Token - Real-Time GEO & Bot Radar',
      edgePlatform: platform,
      webhookConfigured,
      monitoredBotsCount: BOT_RULES.length,
      currentClient: {
        ip,
        country,
        flag: countryFlag(country),
        asn,
        detectedAs: identifyBot(userAgent)?.name || 'Human / Unclassified Browser',
        userAgent
      },
      recentCrawlsSample: recentCrawls.slice(0, 15),
      simulationGuide: 'Test via: curl -A "PerplexityBot/1.0" https://<your-domain>/llms.txt'
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  // 2. Block vulnerability probes at edge
  if (isVulnerabilityProbe(pathname)) {
    console.warn(`🛡️ [PROBE BLOCKED] Path: ${pathname} | IP: ${ip} | UA: ${userAgent}`);
    return new Response('Access Denied (Edge Security Filter)', { status: 403 });
  }

  // 3. Process the static asset or downstream route
  const response = await nextHandler();

  // 4. Check if request is from a targeted Bot
  const matchedBot = identifyBot(userAgent);
  if (matchedBot) {
    const isTargetAsset = pathname === '/llms.txt' || pathname === '/robots.txt';
    const flag = countryFlag(country);

    // High-visibility Edge Console Log
    console.log(`🤖 [${matchedBot.category}] ${matchedBot.name} -> ${pathname} | Status: ${response.status} | IP: ${ip} (${flag} ${country})`);

    const record = {
      botId: matchedBot.id,
      botName: matchedBot.name,
      category: matchedBot.category,
      path: pathname,
      status: response.status,
      ip,
      country,
      asn,
      userAgent,
      color: matchedBot.color,
      timestamp: new Date().toISOString()
    };

    recordCrawl(record);

    // If webhook is configured and this bot qualifies for instant push
    if (webhookUrl && (matchedBot.alert || isTargetAsset)) {
      if (typeof waitUntil === 'function') {
        waitUntil(sendWebhookAlert(webhookUrl, record));
      } else {
        // Fallback non-blocking dispatch
        sendWebhookAlert(webhookUrl, record).catch(() => {});
      }
    }

    // Clone response to add diagnostic transparency headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Bot-Detected', `${matchedBot.category}/${matchedBot.name}`);
    newHeaders.set('X-GEO-Asset', isTargetAsset ? 'target_verified' : 'standard');
    newHeaders.set('X-Radar-Node', 'Cloudflare-Edge');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  return response;
}

