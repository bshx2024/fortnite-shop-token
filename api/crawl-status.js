/**
 * Vercel Serverless / Edge Function Endpoint: /api/crawl-status
 */
import { handleBotDetection } from '../sniffer-core.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request, event) {
  return handleBotDetection(
    request,
    typeof process !== 'undefined' ? process.env : {},
    event && typeof event.waitUntil === 'function' ? event.waitUntil.bind(event) : null,
    () => new Response('OK')
  );
}

