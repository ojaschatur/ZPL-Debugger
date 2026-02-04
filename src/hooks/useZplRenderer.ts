import { useState, useCallback, useRef, useEffect } from 'react';

interface UseZplRendererReturn {
    renderZpl: (zpl: string, widthMm: number, heightMm: number, dpmm: number) => Promise<string>;
    isRendering: boolean;
    isReady: boolean;
    error: string | null;
}

// Type for the ZPL API
interface ZplApi {
    Render: (zpl: string, widthMm?: number, heightMm?: number, dpmm?: number) => string;
}

// We'll lazy-load the renderer API
let rendererApi: ZplApi | null = null;
let initPromise: Promise<void> | null = null;

async function initializeRenderer(): Promise<void> {
    if (rendererApi) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log('[ZPL Renderer] Starting initialization...');

            // Add a timeout to prevent indefinite waiting
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Initialization timed out after 30 seconds')), 30000);
            });

            const initProcess = (async () => {
                // Import the module
                const module = await import('zpl-renderer-js');
                console.log('[ZPL Renderer] Module loaded...');

                // ready is a Promise<{ api: ZplApi }>, not a function
                const result = await module.ready;
                console.log('[ZPL Renderer] WASM ready!');
                return result.api;
            })();

            rendererApi = await Promise.race([initProcess, timeoutPromise]);
            console.log('[ZPL Renderer] Initialization complete!');
        } catch (error) {
            console.error('[ZPL Renderer] Initialization failed:', error);
            initPromise = null; // Allow retry
            throw error;
        }
    })();

    return initPromise;
}

export function useZplRenderer(): UseZplRendererReturn {
    const [isRendering, setIsRendering] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initAttemptedRef = useRef(false);

    useEffect(() => {
        if (initAttemptedRef.current) return;
        initAttemptedRef.current = true;

        initializeRenderer()
            .then(() => {
                setIsReady(true);
                setError(null);
            })
            .catch((err) => {
                setError(`Failed to initialize renderer: ${err instanceof Error ? err.message : 'Unknown error'}`);
                setIsReady(false);
            });
    }, []);

    const renderZpl = useCallback(async (
        zpl: string,
        widthMm: number,
        heightMm: number,
        dpmm: number
    ): Promise<string> => {
        if (!rendererApi) {
            // Try to initialize if not ready
            await initializeRenderer();
            if (!rendererApi) {
                throw new Error('Renderer not initialized');
            }
        }

        setError(null);
        setIsRendering(true);

        try {
            // Note: Render is synchronous, returning base64 string directly
            const base64Image = rendererApi.Render(zpl, widthMm, heightMm, dpmm);
            return `data:image/png;base64,${base64Image}`;
        } catch (err) {
            throw new Error(`Render failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsRendering(false);
        }
    }, []);

    return {
        renderZpl,
        isRendering,
        isReady,
        error
    };
}
