import { onRequest } from 'firebase-functions/v2/https';

export const proxy = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }

    const { url, method, headers: targetHeaders, body: targetBody } = req.body;

    if (!url || !method) {
        res.status(400).json({ error: 'Missing required fields: url, method' });
        return;
    }

    // Validate URL
    try {
        new URL(url);
    } catch {
        res.status(400).json({ error: `Invalid URL: ${url}` });
        return;
    }

    // Build fetch options
    const fetchOptions = {
        method: method.toUpperCase(),
        headers: {},
    };

    if (targetHeaders && typeof targetHeaders === 'object') {
        const skipHeaders = ['host', 'origin', 'referer'];
        const cleanHeaders = {};
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

        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: responseBody,
            time: elapsed,
            size: new TextEncoder().encode(responseBody).length,
        });
    } catch (fetchError) {
        const elapsed = Date.now() - startTime;
        res.json({
            status: 0,
            statusText: 'Network Error',
            headers: {},
            body: '',
            time: elapsed,
            size: 0,
            error: `NetworkError: ${fetchError.message || String(fetchError)}`,
        });
    }
});
