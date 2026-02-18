import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import type { Plugin } from 'vite'

/**
 * Vite plugin that acts as the API proxy during local development.
 * This replaces the need for `vercel dev` — requests to /api/proxy
 * are handled directly by the dev server.
 */
function devProxyPlugin(): Plugin {
  return {
    name: 'dev-api-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req, res) => {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
          return;
        }

        // Read request body
        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        let parsed: { url: string; method: string; headers?: Record<string, string>; body?: string };
        try {
          parsed = JSON.parse(body);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          return;
        }

        const { url, method, headers: targetHeaders, body: targetBody } = parsed;

        if (!url || !method) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing required fields: url, method' }));
          return;
        }

        // Validate URL
        try {
          new URL(url);
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: `Invalid URL: ${url}` }));
          return;
        }

        // Build fetch options
        const fetchOptions: RequestInit = {
          method: method.toUpperCase(),
          headers: {},
        };

        // Copy headers (skip host/origin to avoid conflicts)
        if (targetHeaders && typeof targetHeaders === 'object') {
          const skipHeaders = ['host', 'origin', 'referer'];
          const cleanHeaders: Record<string, string> = {};
          for (const [key, value] of Object.entries(targetHeaders)) {
            if (!skipHeaders.includes(key.toLowerCase())) {
              cleanHeaders[key] = value;
            }
          }
          fetchOptions.headers = cleanHeaders;
        }

        if (targetBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
          fetchOptions.body = targetBody;
        }

        const startTime = Date.now();

        try {
          const response = await fetch(url, fetchOptions);
          const elapsed = Date.now() - startTime;
          const responseBody = await response.text();

          // Collect response headers
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          res.end(JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: responseBody,
            time: elapsed,
            size: new TextEncoder().encode(responseBody).length,
          }));
        } catch (fetchError) {
          const elapsed = Date.now() - startTime;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200; // Return 200 so our client can read the error
          res.end(JSON.stringify({
            status: 0,
            statusText: 'Network Error',
            headers: {},
            body: '',
            time: elapsed,
            size: 0,
            error: `NetworkError: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
          }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    devProxyPlugin(),
  ],
  worker: {
    plugins: () => [
      wasm(),
      topLevelAwait()
    ]
  },
  optimizeDeps: {
    exclude: ['zpl-renderer-js']
  },
  // GitHub Pages deploys to /ZPL-Debugger/
  base: '/ZPL-Debugger/',
}))
