import { GlassCard } from '../layout/GlassCard';
import { ModeTabs } from '../input/ModeTabs';
import { ApiModePanel } from '../input/ApiModePanel';
import { PasteModePanel } from '../input/PasteModePanel';
import type { InputMode } from '../../types';

interface RequestPageProps {
    activeMode: InputMode;
    onModeChange: (mode: InputMode) => void;
    rawResponse: string;
    onResponseReceived: (response: string) => void;
    onExtractZpl: (xml: string) => void;
    onError: (error: string) => void;
}

export function RequestPage({
    activeMode,
    onModeChange,
    rawResponse,
    onResponseReceived,
    onExtractZpl,
    onError
}: RequestPageProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Mode Selection Card */}
            <GlassCard hover={false} padding="lg">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Select Input Mode
                </h2>
                <ModeTabs activeMode={activeMode} onModeChange={onModeChange} />

                <div className="mt-6">
                    {activeMode === 'api' ? (
                        <ApiModePanel
                            onResponseReceived={onResponseReceived}
                            onError={onError}
                        />
                    ) : (
                        <PasteModePanel
                            onXmlPasted={onExtractZpl}
                            onError={onError}
                        />
                    )}
                </div>
            </GlassCard>

            {/* Raw Response (for API mode) */}
            {activeMode === 'api' && rawResponse && (
                <GlassCard hover={false} padding="lg" className="animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Raw Response
                        </h2>
                        <button
                            className="btn-primary text-sm py-2"
                            onClick={() => onExtractZpl(rawResponse)}
                        >
                            Extract & Decode ZPL →
                        </button>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4 max-h-64 overflow-auto">
                        <pre className="text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap">
                            {rawResponse.substring(0, 2000)}
                            {rawResponse.length > 2000 && '...'}
                        </pre>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                        {rawResponse.length.toLocaleString()} characters
                    </p>
                </GlassCard>
            )}

            {/* Helper Card */}
            <GlassCard hover={false} padding="md" className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-[var(--text-primary)]">How it works</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            Use <strong>API Mode</strong> to call your shipment API, or <strong>Paste Mode</strong> to
                            paste a SOAP XML response directly. The ZPL code will be extracted from the
                            <code className="mx-1 px-1 py-0.5 bg-white/60 rounded text-xs">&lt;LabelData&gt;</code>
                            element and decoded from Base64.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
