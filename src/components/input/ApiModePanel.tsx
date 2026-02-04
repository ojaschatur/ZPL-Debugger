import { useState } from 'react';
import { GlassCard } from '../layout/GlassCard';
import type { ApiResponse } from '../../types';
import { MOCK_XML_RESPONSE } from '../../mocks/mockXmlResponse';

interface ApiModePanelProps {
    onResponseReceived: (response: string) => void;
    onError: (error: string) => void;
}

export function ApiModePanel({ onResponseReceived, onError }: ApiModePanelProps) {
    const [url, setUrl] = useState('https://api.example.com/shipment/manifest');
    const [headers, setHeaders] = useState('Content-Type: application/xml\nAuthorization: Bearer your-token-here');
    const [body, setBody] = useState('<soapenv:Envelope>...</soapenv:Envelope>');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<ApiResponse | null>(null);

    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // For now, always return mocked response
            // In the future, this will make actual API calls
            const mockResponse: ApiResponse = {
                success: true,
                data: MOCK_XML_RESPONSE,
                status: 200
            };

            setResponse(mockResponse);
            onResponseReceived(MOCK_XML_RESPONSE);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Request failed';
            setResponse({
                success: false,
                error: errorMessage,
                status: 500
            });
            onError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* URL Input */}
            <div>
                <label className="label">Request URL</label>
                <input
                    type="text"
                    className="input-field"
                    placeholder="https://api.example.com/shipment"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>

            {/* Headers */}
            <div>
                <label className="label">Headers (one per line: Key: Value)</label>
                <textarea
                    className="textarea-field"
                    placeholder="Content-Type: application/xml"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    rows={3}
                />
            </div>

            {/* Body */}
            <div>
                <label className="label">Request Body (XML)</label>
                <textarea
                    className="textarea-field"
                    placeholder="<soapenv:Envelope>...</soapenv:Envelope>"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                />
            </div>

            {/* Send Button */}
            <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={handleSendRequest}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Send Request
                    </>
                )}
            </button>

            {/* Response Display */}
            {response && (
                <GlassCard hover={false} padding="sm" className="animate-slide-up">
                    <div className="flex items-center justify-between mb-3">
                        <span className="label mb-0">Response</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${response.success
                                ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                                : 'bg-[var(--error-bg)] text-[var(--error-text)]'
                            }`}>
                            {response.status || 'Error'}
                        </span>
                    </div>

                    {response.success && response.data ? (
                        <div className="bg-white/50 rounded-lg p-3 max-h-48 overflow-auto">
                            <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap break-all">
                                {response.data.substring(0, 500)}...
                            </pre>
                        </div>
                    ) : (
                        <div className="error-panel">
                            <div className="error-panel-title">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Request Failed
                            </div>
                            <p className="text-sm">{response.error}</p>
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Mock Notice */}
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-white/30 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Currently using mocked response. Real API integration coming soon.</span>
            </div>
        </div>
    );
}
