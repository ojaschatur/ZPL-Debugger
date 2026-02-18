import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// ===== API Proxy Endpoint =====
app.post('/api/proxy', async (req, res) => {
    const { url, method, headers: targetHeaders, body: targetBody } = req.body;

    if (!url || !method) {
        return res.status(400).json({ error: 'Missing required fields: url, method' });
    }

    // Validate URL
    try {
        new URL(url);
    } catch {
        return res.status(400).json({ error: `Invalid URL: ${url}` });
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

// ===== Serve Static Files =====
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — all unmatched routes serve index.html
app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ ZPL Debugger running on port ${PORT}`);
});
