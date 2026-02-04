import { GlassCard } from '../layout/GlassCard';
import { ZplEditor } from '../editor/ZplEditor';
import { RenderControls } from '../editor/RenderControls';
import { PreviewPanel } from '../preview/PreviewPanel';
import { ErrorPanel } from '../feedback/ErrorPanel';
import type { RenderSettings, ZplError } from '../../types';

interface PreviewPageProps {
    zplCode: string;
    onZplChange: (code: string) => void;
    renderSettings: RenderSettings;
    onSettingsChange: (settings: RenderSettings) => void;
    onRender: () => void;
    isRendering: boolean;
    isReady: boolean;
    previewImage: string | null;
    previewError: string | null;
    errors: ZplError[];
    onClearErrors: () => void;
    autoRender: boolean;
    onAutoRenderChange: (enabled: boolean) => void;
}

export function PreviewPage({
    zplCode,
    onZplChange,
    renderSettings,
    onSettingsChange,
    onRender,
    isRendering,
    isReady,
    previewImage,
    previewError,
    errors,
    onClearErrors,
    autoRender,
    onAutoRenderChange
}: PreviewPageProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Left Column - ZPL Editor */}
            <div className="space-y-4">
                <GlassCard hover={false} padding="lg">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            ZPL Editor
                        </h2>
                        {!isReady && (
                            <span className="text-xs text-[var(--warning-text)] flex items-center gap-1">
                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Initializing renderer...
                            </span>
                        )}
                        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={autoRender}
                                onChange={(e) => onAutoRenderChange(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                            />
                            Auto-render
                        </label>
                    </div>

                    <RenderControls
                        settings={renderSettings}
                        onSettingsChange={onSettingsChange}
                        onRender={onRender}
                        isRendering={isRendering}
                        disabled={!zplCode.trim() || !isReady}
                    />

                    <div className="mt-4 h-[400px]">
                        <ZplEditor
                            value={zplCode}
                            onChange={onZplChange}
                        />
                    </div>
                </GlassCard>

                {/* Quick Paste Helper */}
                {!zplCode && (
                    <GlassCard hover={false} padding="md" className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-[var(--text-primary)]">Paste ZPL directly</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    You can paste raw ZPL code directly into the editor above, or use the
                                    <strong> Request</strong> tab to extract it from an API response.
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Right Column - Preview & Errors */}
            <div className="space-y-4">
                {/* Preview Panel */}
                <GlassCard hover={false} padding="none">
                    <PreviewPanel
                        image={previewImage}
                        isLoading={isRendering}
                        error={previewError}
                        rotation={renderSettings.rotation}
                    />
                </GlassCard>

                {/* Error Panel - Always Visible */}
                <ErrorPanel errors={errors} onClear={onClearErrors} />
            </div>
        </div>
    );
}
