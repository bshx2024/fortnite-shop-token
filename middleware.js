/**
 * Vercel Edge Middleware Entrypoint
 * Automatically executed on every incoming request across Vercel's Edge Network
 */
import { handleBotDetection } from './sniffer-core.js';

export const config = {
  matcher: ['/:path*'],
};

export default async function middleware(request, event) {
  return handleBotDetection(
    request,
    typeof process !== 'undefined' ? process.env : {},
    event && typeof event.waitUntil === 'function' ? event.waitUntil.bind(event) : null,
    () => fetch(request)
  );
}

