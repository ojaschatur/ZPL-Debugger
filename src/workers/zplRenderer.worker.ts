// ZPL Renderer Web Worker
// Uses zpl-renderer-js WASM to convert ZPL to PNG images

import type { RenderRequest, RenderResponse, WorkerReadyMessage } from '../types';

let api: {
    zplToBase64Async: (zpl: string, widthMm: number, heightMm: number, dpmm: number) => Promise<string>;
} | null = null;

// Initialize the renderer
async function initialize() {
    try {
        // Dynamic import of zpl-renderer-js
        const { ready } = await import('zpl-renderer-js');
        api = await ready();

        // Notify main thread that we're ready
        const readyMessage: WorkerReadyMessage = { type: 'ready' };
        self.postMessage(readyMessage);
    } catch (error) {
        const errorMessage: RenderResponse = {
            type: 'render-result',
            success: false,
            error: `Failed to initialize ZPL renderer: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
        self.postMessage(errorMessage);
    }
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<RenderRequest>) => {
    const { type, zpl, widthMm, heightMm, dpmm } = event.data;

    if (type !== 'render') {
        return;
    }

    if (!api) {
        const response: RenderResponse = {
            type: 'render-result',
            success: false,
            error: 'Renderer not initialized. Please wait for initialization to complete.'
        };
        self.postMessage(response);
        return;
    }

    try {
        // Render ZPL to base64 PNG
        const base64Image = await api.zplToBase64Async(zpl, widthMm, heightMm, dpmm);

        const response: RenderResponse = {
            type: 'render-result',
            success: true,
            image: `data:image/png;base64,${base64Image}`
        };
        self.postMessage(response);
    } catch (error) {
        const response: RenderResponse = {
            type: 'render-result',
            success: false,
            error: `Render failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
        self.postMessage(response);
    }
};

// Start initialization
initialize();
