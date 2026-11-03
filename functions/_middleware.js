/**
 * Cloudflare Pages Middleware Entrypoint
 * Automatically executed on every incoming request in Cloudflare Pages
 */
import { handleBotDetection } from '../sniffer-core.js';

export async function onRequest(context) {
  const { request, env, waitUntil, next } = context;
  return handleBotDetection(
    request,
    env,
    typeof waitUntil === 'function' ? waitUntil.bind(context) : null,
    () => next()
  );
}

