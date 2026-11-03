/**
 * Cloudflare Worker Entrypoint (Static Assets Mode)
 * Used when deploying via `wrangler deploy`
 */
import { handleBotDetection } from './sniffer-core.js';

export default {
  async fetch(request, env, ctx) {
    return handleBotDetection(
      request,
      env,
      ctx && typeof ctx.waitUntil === 'function' ? ctx.waitUntil.bind(ctx) : null,
      () => {
        if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
          return env.ASSETS.fetch(request);
        }
        return fetch(request);
      }
    );
  }
};

