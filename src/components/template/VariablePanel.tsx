/**
 * VariablePanel - Unified panel for template and script variables
 * Now includes Auto/Manual toggle for script mode
 */

interface VariablePanelProps {
    // Template variables (from <Variable> placeholders)
    templateVariables: string[];
    // Script variables (from Shipment.X, Parcel.Y in scripts)
    scriptVariables: string[];
    // Combined values for both types
    values: Record<string, string>;
    onValuesChange: (values: Record<string, string>) => void;
    // Script execution mode
    scriptMode: 'auto' | 'manual';
    onScriptModeChange: (mode: 'auto' | 'manual') => void;
    // Script block count for warnings
    scriptCount?: number;
}

export function VariablePanel({
    templateVariables,
    scriptVariables,
    values,
    onValuesChange,
    scriptMode,
    onScriptModeChange,
    scriptCount = 0
}: VariablePanelProps) {
    const hasScripts = scriptCount > 0;
    const hasVariables = templateVariables.length > 0 || scriptVariables.length > 0;

    if (!hasScripts && !hasVariables) {
        return null;
    }

    const handleValueChange = (variable: string, value: string) => {
        onValuesChange({
            ...values,
            [variable]: value
        });
    };

    const handleClearAll = () => {
        onValuesChange({});
    };

    return (
        <div className="glass-card-static p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Template Variables
                    {hasVariables && (
                        <span className="text-xs text-[var(--text-secondary)] font-normal">
                            ({templateVariables.length + scriptVariables.length})
                        </span>
                    )}
                </h3>

                {hasVariables && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--error-text)] transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Script Mode Toggle (only if scripts detected) */}
            {hasScripts && (
                <div className="mb-4 p-3 bg-[var(--card-hover)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--text-primary)]">Script Mode</span>
                        <div className="flex items-center gap-2 text-xs">
                            <button
                                onClick={() => onScriptModeChange('manual')}
                                className={`px-3 py-1 rounded-l transition-colors ${scriptMode === 'manual'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'
                                    }`}
                            >
                                Manual
                            </button>
                            <button
                                onClick={() => onScriptModeChange('auto')}
                                className={`px-3 py-1 rounded-r transition-colors ${scriptMode === 'auto'
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]'
                                    }`}
                            >
                                Auto
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {scriptMode === 'auto'
                            ? '✨ Scripts will execute using values below'
                            : '⚠️ Scripts removed - fill all variables manually'}
                    </p>
                </div>
            )}

            {/* Script Variables Section (only in Auto mode) */}
            {scriptMode === 'auto' && scriptVariables.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-3.5 h-3.5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <h4 className="text-xs font-semibold text-[var(--text-primary)]">Script Variables</h4>
                        <span className="text-xs text-[var(--text-secondary)]">({scriptVariables.length})</span>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {scriptVariables.map((variable) => (
                            <div key={variable}>
                                <label className="label mb-1.5 font-mono text-xs">
                                    {variable}
                                </label>
                                <input
                                    type="text"
                                    value={values[variable] || ''}
                                    onChange={(e) => handleValueChange(variable, e.target.value)}
                                    placeholder="Enter value..."
                                    className="input-field text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Template Variables Section */}
            {templateVariables.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-3.5 h-3.5 text-[var(--success-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h4 className="text-xs font-semibold text-[var(--text-primary)]">Template Variables</h4>
                        <span className="text-xs text-[var(--text-secondary)]">({templateVariables.length})</span>
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {templateVariables.map((variable) => (
                            <div key={variable}>
                                <label className="label mb-1.5">
                                    {variable}
                                </label>
                                <input
                                    type="text"
                                    value={values[variable] || ''}
                                    onChange={(e) => handleValueChange(variable, e.target.value)}
                                    placeholder="Enter value..."
                                    className="input-field text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No variables message */}
            {!hasVariables && hasScripts && (
                <div className="text-center px-6 py-8 text-[var(--text-secondary)]">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--info-bg)] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--info-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm">
                        {scriptMode === 'auto'
                            ? 'No variables detected in scripts'
                            : 'Scripts removed - no template variables found'}
                    </p>
                </div>
            )}
        </div>
    );
}
