/**
 * HTTP Client for making API requests through the Vercel proxy.
 */

import type { HoppRequest, RestResponse } from '../types/restTypes';

const PROXY_URL = '/api/proxy';

/**
 * Send an HTTP request through the proxy.
 * In production (Vercel), this calls the serverless function.
 * In development, Vite proxies to localhost:3000.
 */
export async function sendRequest(request: HoppRequest): Promise<RestResponse> {
    // Build URL with query params
    let url = request.endpoint;
    const activeParams = request.params.filter(p => p.active && p.key);
    if (activeParams.length > 0) {
        const searchParams = new URLSearchParams();
        activeParams.forEach(p => searchParams.append(p.key, p.value));
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}${searchParams.toString()}`;
    }

    // Build headers
    const headers: Record<string, string> = {};
    const activeHeaders = request.headers.filter(h => h.active && h.key);
    activeHeaders.forEach(h => {
        headers[h.key] = h.value;
    });

    // Add auth headers
    if (request.auth.authActive) {
        switch (request.auth.authType) {
            case 'bearer':
                if (request.auth.token) {
                    headers['Authorization'] = `Bearer ${request.auth.token}`;
                }
                break;
            case 'basic':
                if (request.auth.username) {
                    const encoded = btoa(`${request.auth.username}:${request.auth.password}`);
                    headers['Authorization'] = `Basic ${encoded}`;
                }
                break;
            case 'oauth-2':
                if (request.auth.grantTypeInfo.token) {
                    headers['Authorization'] = `Bearer ${request.auth.grantTypeInfo.token}`;
                }
                break;
        }
    }

    // Add content-type if body is present
    if (request.body.contentType !== 'none' && request.body.body) {
        if (!headers['Content-Type'] && !headers['content-type']) {
            headers['Content-Type'] = request.body.contentType;
        }
    }

    // Build body
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body.contentType !== 'none') {
        body = request.body.body;
    }

    try {
        const proxyResponse = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url,
                method: request.method,
                headers,
                body,
            }),
        });

        if (!proxyResponse.ok) {
            return {
                status: 0,
                statusText: 'Proxy Error',
                headers: {},
                body: '',
                time: 0,
                size: 0,
                error: `Proxy returned ${proxyResponse.status}: ${proxyResponse.statusText}. Make sure the proxy is running.`,
            };
        }

        const result = await proxyResponse.json();
        return {
            status: result.status,
            statusText: result.statusText,
            headers: result.headers || {},
            body: result.body || '',
            time: result.time || 0,
            size: result.size || 0,
            error: result.error,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        return {
            status: 0,
            statusText: 'Network Error',
            headers: {},
            body: '',
            time: 0,
            size: 0,
            error: `Failed to reach proxy: ${message}. If running locally, make sure the dev proxy is configured.`,
        };
    }
}

/**
 * Get an OAuth2 token using client credentials grant.
 */
export async function getOAuth2Token(
    tokenEndpoint: string,
    clientId: string,
    clientSecret: string,
    scopes: string
): Promise<{ token?: string; error?: string }> {
    try {
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: scopes,
        }).toString();

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: tokenEndpoint,
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
            }),
        });

        const result = await response.json();

        // Proxy-level network error
        if (result.error) {
            return { error: result.error };
        }

        // Non-2xx from the token endpoint
        if (result.status && (result.status < 200 || result.status >= 300)) {
            const preview = (result.body || '').substring(0, 200);
            return { error: `Token endpoint returned ${result.status}: ${preview}` };
        }

        // Try to parse the response body as JSON
        try {
            const tokenResponse = JSON.parse(result.body);

            if (tokenResponse.access_token) {
                return { token: tokenResponse.access_token };
            }

            // Server returned JSON but no access_token (e.g. {"error":"invalid_client"})
            if (tokenResponse.error) {
                const desc = tokenResponse.error_description || tokenResponse.error;
                return { error: `Auth server error: ${desc}` };
            }

            return { error: `No access_token in response. Keys: ${Object.keys(tokenResponse).join(', ')}` };
        } catch {
            // Response is not JSON (probably HTML from wrong endpoint)
            const preview = (result.body || '').substring(0, 150);
            return { error: `Token endpoint returned non-JSON. Check the URL is correct. Response: ${preview}...` };
        }
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Token request failed' };
    }
}
