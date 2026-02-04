import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { PageTabs, type PageType } from './components/navigation/PageTabs';
import { RequestPage } from './components/pages/RequestPage';
import { PreviewPage } from './components/pages/PreviewPage';
import { ToastContainer } from './components/feedback/Toast';
import { useZplRenderer } from './hooks/useZplRenderer';
import { extractZplFromXml } from './parsers/parseXmlResponse';
import { validateZpl } from './utils/zplValidator';
import type { InputMode, RenderSettings, ToastMessage, ZplError } from './types';

function App() {
    // Page navigation
    const [activePage, setActivePage] = useState<PageType>('request');

    // Input mode state
    const [activeMode, setActiveMode] = useState<InputMode>('paste');
    const [rawResponse, setRawResponse] = useState('');

    // Editor state
    const [zplCode, setZplCode] = useState('');
    const [renderSettings, setRenderSettings] = useState<RenderSettings>({
        dpmm: 8,
        widthMm: 101.6,
        heightMm: 152.4,
        unit: 'mm',
        rotation: 0
    });

    // Preview state
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [autoRender, setAutoRender] = useState(true);

    // Error handling
    const [errors, setErrors] = useState<ZplError[]>([]);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Renderer hook
    const { renderZpl, isRendering, isReady } = useZplRenderer();

    // Toast helpers
    const addToast = useCallback((type: ToastMessage['type'], message: string) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Error helpers
    const addError = useCallback((type: ZplError['type'], message: string, line?: number) => {
        const id = `error-${Date.now()}-${Math.random()}`;
        setErrors(prev => [...prev, { id, type, message, line, timestamp: new Date() }]);
    }, []);

    const clearErrors = useCallback(() => {
        setErrors([]);
    }, []);

    // Auto-render effect with debounce
    useEffect(() => {
        if (!autoRender || !zplCode.trim() || !isReady) return;

        const timer = setTimeout(() => {
            handleRender();
        }, 1500); // Wait 1.5 seconds after user stops typing

        return () => clearTimeout(timer);
    }, [zplCode, autoRender, isReady]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle response received from API
    const handleResponseReceived = useCallback((response: string) => {
        setRawResponse(response);
        addToast('success', 'Response received! Click "Extract & Decode ZPL" to continue.');
    }, [addToast]);

    // Handle XML extraction and navigate to preview
    const handleExtractZpl = useCallback((xml: string) => {
        clearErrors();
        setPreviewImage(null);
        setPreviewError(null);

        const result = extractZplFromXml(xml);

        if (result.success && result.labelData) {
            setZplCode(result.labelData);
            setActivePage('preview'); // Navigate to preview page
            addToast('success', 'ZPL extracted and decoded! Switched to Preview tab.');
        } else {
            addError('syntax', result.error || 'Failed to extract ZPL from XML');
            addToast('error', result.error || 'Failed to extract ZPL');
        }
    }, [addToast, addError, clearErrors]);

    // Handle render
    const handleRender = useCallback(async () => {
        if (!zplCode.trim()) {
            addToast('warning', 'Please enter ZPL code before rendering');
            return;
        }

        setPreviewError(null);
        clearErrors();

        // Validate ZPL before rendering
        const validationResult = validateZpl(zplCode);
        if (!validationResult.valid || validationResult.errors.length > 0) {
            // Add validation errors to error panel
            validationResult.errors.forEach(err => {
                addError('syntax', err.message, err.line);
            });

            // If there are critical errors, don't attempt to render
            if (!validationResult.valid) {
                addToast('error', 'ZPL validation failed - fix errors before rendering');
                return;
            }

            // If only warnings, show toast but continue rendering
            addToast('warning', 'ZPL has warnings - rendering anyway');
        }

        try {
            const image = await renderZpl(
                zplCode,
                renderSettings.widthMm,
                renderSettings.heightMm,
                renderSettings.dpmm
            );
            setPreviewImage(image);
            addToast('success', 'Label rendered successfully!');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown render error';
            setPreviewError(message);
            addError('rendering', message);
            addToast('error', 'Failed to render label');
        }
    }, [zplCode, renderSettings, renderZpl, addToast, addError, clearErrors]);

    // Handle error from child components
    const handleError = useCallback((error: string) => {
        addToast('error', error);
    }, [addToast]);

    return (
        <div className="min-h-screen">
            <Header />

            <main className="px-8 pb-8">
                {/* Page Navigation */}
                <div className="max-w-md mx-auto mb-8">
                    <PageTabs activePage={activePage} onPageChange={setActivePage} />
                </div>

                {/* Page Content */}
                {activePage === 'request' ? (
                    <RequestPage
                        activeMode={activeMode}
                        onModeChange={setActiveMode}
                        rawResponse={rawResponse}
                        onResponseReceived={handleResponseReceived}
                        onExtractZpl={handleExtractZpl}
                        onError={handleError}
                    />
                ) : (
                    <PreviewPage
                        zplCode={zplCode}
                        onZplChange={setZplCode}
                        renderSettings={renderSettings}
                        onSettingsChange={setRenderSettings}
                        onRender={handleRender}
                        isRendering={isRendering}
                        isReady={isReady}
                        previewImage={previewImage}
                        previewError={previewError}
                        errors={errors}
                        onClearErrors={clearErrors}
                        autoRender={autoRender}
                        onAutoRenderChange={setAutoRender}
                    />
                )}
            </main>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}

export default App;
