interface PreviewPanelProps {
    image: string | null;
    isLoading: boolean;
    error: string | null;
}

export function PreviewPanel({ image, isLoading, error }: PreviewPanelProps) {
    return (
        <div className="h-full min-h-[400px] rounded-xl border border-[var(--glass-border)] bg-white/50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] bg-white/30">
                <span className="text-sm font-medium text-[var(--text-primary)]">Label Preview</span>
                {image && (
                    <a
                        href={image}
                        download="label-preview.png"
                        className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PNG
                    </a>
                )}
            </div>

            {/* Preview Area */}
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-[repeating-conic-gradient(#f0f0f0_0_90deg,#fff_0_180deg)_0_0/20px_20px]">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                        <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm">Rendering label...</span>
                    </div>
                ) : error ? (
                    <div className="error-panel max-w-md text-center">
                        <div className="error-panel-title justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Render Error
                        </div>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : image ? (
                    <img
                        src={image}
                        alt="ZPL Label Preview"
                        className="max-w-full max-h-full object-contain shadow-lg rounded animate-fade-in"
                        style={{ imageRendering: 'pixelated' }}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                        <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">No preview yet</span>
                        <span className="text-xs">Enter ZPL code and click "Render Preview"</span>
                    </div>
                )}
            </div>
        </div>
    );
}
