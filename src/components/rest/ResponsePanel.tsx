import { useState } from 'react';
import type { RestResponse } from '../../types/restTypes';

interface ResponsePanelProps {
    response: RestResponse | null;
    isLoading: boolean;
    onExtractLabels?: (responseBody: string) => void;
}

export function ResponsePanel({ response, isLoading, onExtractLabels }: ResponsePanelProps) {
    const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
    const [pastedResponse, setPastedResponse] = useState('');
    const [showPasteMode, setShowPasteMode] = useState(false);

    // Use pasted response if in paste mode, otherwise use the API response
    const effectiveBody = showPasteMode ? pastedResponse : response?.body || '';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48 bg-white/20 rounded-xl border border-[var(--glass-border)]">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium">Sending request...</span>
                </div>
            </div>
        );
    }

    // Show empty state only when no response AND not in paste mode
    if (!response && !showPasteMode) {
        return (
            <div className="flex flex-col items-center justify-center h-48 bg-white/20 rounded-xl border border-dashed border-[var(--glass-border)]">
                <svg className="w-10 h-10 text-[var(--text-muted)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-[var(--text-muted)]">Send a request to see the response</span>
                <button
                    onClick={() => setShowPasteMode(true)}
                    className="mt-3 px-4 py-2 text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 rounded-lg transition-colors flex items-center gap-1.5"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Paste Response
                </button>
            </div>
        );
    }

    const statusColor = response?.error ? 'text-red-500 bg-red-50' :
        response && response.status >= 200 && response.status < 300 ? 'text-emerald-600 bg-emerald-50' :
            response && response.status >= 400 && response.status < 500 ? 'text-amber-600 bg-amber-50' :
                response && response.status >= 500 ? 'text-red-600 bg-red-50' :
                    'text-gray-600 bg-gray-50';

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatBody = (body: string): string => {
        try {
            return JSON.stringify(JSON.parse(body), null, 2);
        } catch {
            return body;
        }
    };

    return (
        <div className="space-y-3">
            {/* Status Bar */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Mode toggle */}
                <div className="flex gap-0.5 bg-white/30 rounded-lg p-0.5">
                    <button
                        onClick={() => setShowPasteMode(false)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${!showPasteMode
                                ? 'bg-white shadow-sm text-[var(--text-primary)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            }`}
                    >
                        Response
                    </button>
                    <button
                        onClick={() => setShowPasteMode(true)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${showPasteMode
                                ? 'bg-white shadow-sm text-[var(--text-primary)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            }`}
                    >
                        📋 Paste
                    </button>
                </div>

                {/* Status badges (only for API response mode) */}
                {!showPasteMode && response && (
                    <>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                            {response.error ? 'ERROR' : `${response.status} ${response.statusText}`}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {response.time}ms
                        </span>
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            {formatSize(response.size)}
                        </span>
                    </>
                )}

                {/* Paste mode indicator */}
                {showPasteMode && pastedResponse && (
                    <span className="text-xs text-[var(--text-muted)]">
                        {new TextEncoder().encode(pastedResponse).length > 1024
                            ? `${(new TextEncoder().encode(pastedResponse).length / 1024).toFixed(1)} KB pasted`
                            : `${new TextEncoder().encode(pastedResponse).length} B pasted`}
                    </span>
                )}

                <div className="flex-1" />

                {/* Copy & Extract buttons */}
                {effectiveBody && (
                    <>
                        <button
                            onClick={() => navigator.clipboard.writeText(effectiveBody)}
                            className="px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50 rounded-md transition-colors"
                            title="Copy response"
                        >
                            Copy
                        </button>
                        {onExtractLabels && (
                            <button
                                onClick={() => onExtractLabels(effectiveBody)}
                                className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Extract Labels → Preview
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Error Message */}
            {!showPasteMode && response?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700 font-medium">{response.error}</p>
                    {response.error.includes('NetworkError') || response.error.includes('Failed to fetch') ? (
                        <p className="text-xs text-red-500 mt-1">
                            This may be a CORS error. The request is being proxied — make sure you&apos;re deployed or running the dev proxy.
                        </p>
                    ) : null}
                </div>
            )}

            {/* ===== Paste Mode ===== */}
            {showPasteMode && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                            Paste JSON or XML response from Hoppscotch, Postman, or any API tool
                        </span>
                        {pastedResponse && (
                            <button
                                onClick={() => setPastedResponse('')}
                                className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <textarea
                        value={pastedResponse}
                        onChange={e => setPastedResponse(e.target.value)}
                        placeholder={'Paste your API response here...\n\nSupports:\n• JSON with base64-encoded ZPL\n• XML with <LabelData> tags\n• Raw ZPL (^XA ... ^XZ)\n• Raw base64-encoded ZPL'}
                        className="w-full h-64 px-4 py-3 text-xs font-mono rounded-xl bg-[#1e1e2e] text-[#cdd6f4] border border-[var(--glass-border)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors resize-y placeholder:text-[#45475a]"
                    />
                </div>
            )}

            {/* ===== API Response Mode ===== */}
            {!showPasteMode && response && !response.error && (
                <>
                    <div className="flex gap-1 bg-white/30 rounded-lg p-0.5 w-fit">
                        <button
                            onClick={() => setActiveTab('body')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'body'
                                ? 'bg-white shadow-sm text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            Body
                        </button>
                        <button
                            onClick={() => setActiveTab('headers')}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'headers'
                                ? 'bg-white shadow-sm text-[var(--text-primary)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            Headers ({Object.keys(response.headers).length})
                        </button>
                    </div>

                    {/* Body */}
                    {activeTab === 'body' && (
                        <div className="relative">
                            <pre className="w-full max-h-96 overflow-auto px-4 py-3 text-xs font-mono rounded-xl bg-[#1e1e2e] text-[#cdd6f4] border border-[var(--glass-border)]">
                                {formatBody(response.body)}
                            </pre>
                        </div>
                    )}

                    {/* Headers */}
                    {activeTab === 'headers' && (
                        <div className="overflow-hidden rounded-xl border border-[var(--glass-border)]">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-white/40">
                                        <th className="text-left px-3 py-2 font-semibold text-[var(--text-secondary)]">Header</th>
                                        <th className="text-left px-3 py-2 font-semibold text-[var(--text-secondary)]">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(response.headers).map(([key, value]) => (
                                        <tr key={key} className="border-t border-[var(--glass-border)] hover:bg-white/20">
                                            <td className="px-3 py-2 font-mono font-medium text-[var(--accent-primary)]">{key}</td>
                                            <td className="px-3 py-2 font-mono text-[var(--text-secondary)] break-all">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
