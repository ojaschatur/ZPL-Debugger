import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Proxy Function
 * Forwards HTTP requests from the browser to external APIs,
 * bypassing CORS restrictions securely.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests to the proxy
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { url, method, headers, body } = req.body;

    // Validate required fields
    if (!url || !method) {
        return res.status(400).json({ error: 'Missing required fields: url, method' });
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Set CORS headers for the proxy response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const startTime = Date.now();

    try {
        // Build request options
        const fetchOptions: RequestInit = {
            method: method.toUpperCase(),
            headers: headers || {},
        };

        // Only include body for methods that support it
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        // Make the actual request
        const response = await fetch(url, fetchOptions);
        const responseBody = await response.text();
        const elapsed = Date.now() - startTime;

        // Extract response headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        return res.status(200).json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: responseBody,
            time: elapsed,
            size: new TextEncoder().encode(responseBody).length,
        });
    } catch (error) {
        const elapsed = Date.now() - startTime;
        const message = error instanceof Error ? error.message : 'Unknown error';

        return res.status(200).json({
            status: 0,
            statusText: 'Network Error',
            headers: {},
            body: '',
            time: elapsed,
            size: 0,
            error: message,
        });
    }
}
