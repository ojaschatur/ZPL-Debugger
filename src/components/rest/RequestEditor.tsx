import { useState, useMemo } from 'react';
import type { HoppRequest, HttpMethod, HoppAuth, HoppBody, KeyValuePair } from '../../types/restTypes';
import { METHOD_COLORS } from '../../types/restTypes';
import { KeyValueEditor } from './KeyValueEditor';
import { BodyEditor } from './BodyEditor';
import { AuthEditor } from './AuthEditor';

interface RequestEditorProps {
    request: HoppRequest | null;
    onRequestChange: (updates: Partial<HoppRequest>) => void;
    onSend: () => void;
    isLoading: boolean;
}

type RequestTab = 'params' | 'headers' | 'body' | 'auth';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export function RequestEditor({ request, onRequestChange, onSend, isLoading }: RequestEditorProps) {
    const [activeTab, setActiveTab] = useState<RequestTab>('params');
    const [showMethodDropdown, setShowMethodDropdown] = useState(false);

    // Detect if running on static hosting (no proxy available)
    const isProxyUnavailable = useMemo(() => {
        const host = window.location.hostname;
        return host.includes('github.io') || host.includes('pages.dev') || host.includes('netlify.app');
    }, []);

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Select a request</p>
                <p className="text-xs mt-1">Choose from the sidebar or create a new one</p>
            </div>
        );
    }

    const tabs: { id: RequestTab; label: string; count?: number }[] = [
        { id: 'params', label: 'Params', count: request.params.filter(p => p.active && p.key).length },
        { id: 'headers', label: 'Headers', count: request.headers.filter(h => h.active && h.key).length },
        { id: 'body', label: 'Body' },
        { id: 'auth', label: 'Auth' },
    ];

    return (
        <div className="space-y-4">
            {/* Request Name */}
            <input
                type="text"
                value={request.name}
                onChange={e => onRequestChange({ name: e.target.value })}
                className="text-lg font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none w-full"
                placeholder="Request name"
            />

            {/* URL Bar */}
            <div className="flex gap-2">
                {/* Method Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                        className="h-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] font-bold text-sm transition-all hover:border-[var(--accent-primary)] flex items-center gap-1.5 min-w-[100px] justify-center"
                        style={{ color: METHOD_COLORS[request.method] }}
                    >
                        {request.method}
                        <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showMethodDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-[var(--glass-border)] py-1 z-20 min-w-[120px] animate-fade-in">
                            {HTTP_METHODS.map(method => (
                                <button
                                    key={method}
                                    onClick={() => {
                                        onRequestChange({ method });
                                        setShowMethodDropdown(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-sm font-bold hover:bg-gray-50 transition-colors ${request.method === method ? 'bg-gray-50' : ''
                                        }`}
                                    style={{ color: METHOD_COLORS[method] }}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* URL Input */}
                <input
                    type="text"
                    value={request.endpoint}
                    onChange={e => onRequestChange({ endpoint: e.target.value })}
                    placeholder="Enter request URL..."
                    className="flex-1 px-4 py-2.5 text-sm font-mono rounded-xl border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    onKeyDown={e => {
                        if (e.key === 'Enter') onSend();
                    }}
                />

                {/* Send Button */}
                <button
                    onClick={onSend}
                    disabled={isLoading || !request.endpoint}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Send
                        </>
                    )}
                </button>
            </div>

            {/* Proxy Unavailable Warning */}
            {isProxyUnavailable && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-xs">
                        <strong>Proxy not available.</strong> Send requests won't work on static hosting. Run <code className="bg-amber-100 px-1 rounded">npm run dev</code> locally for full functionality.
                    </p>
                </div>
            )}

            {/* Request Tabs */}
            <div className="flex gap-1 bg-white/30 rounded-xl p-1 border border-[var(--glass-border)]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white shadow-sm text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50'
                            }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
                {activeTab === 'params' && (
                    <KeyValueEditor
                        pairs={request.params}
                        onChange={(params: KeyValuePair[]) => onRequestChange({ params })}
                        keyPlaceholder="Parameter"
                        valuePlaceholder="Value"
                        title="Query Parameters"
                    />
                )}

                {activeTab === 'headers' && (
                    <KeyValueEditor
                        pairs={request.headers}
                        onChange={(headers: KeyValuePair[]) => onRequestChange({ headers })}
                        keyPlaceholder="Header"
                        valuePlaceholder="Value"
                        title="Headers"
                    />
                )}

                {activeTab === 'body' && (
                    <BodyEditor
                        body={request.body}
                        onChange={(body: HoppBody) => onRequestChange({ body })}
                    />
                )}

                {activeTab === 'auth' && (
                    <AuthEditor
                        auth={request.auth}
                        onChange={(auth: HoppAuth) => onRequestChange({ auth })}
                    />
                )}
            </div>
        </div>
    );
}
