interface VariablePanelProps {
    variables: string[];
    values: Record<string, string>;
    onValuesChange: (values: Record<string, string>) => void;
    scriptCount?: number;
}

export function VariablePanel({
    variables,
    values,
    onValuesChange,
    scriptCount = 0
}: VariablePanelProps) {

    const handleValueChange = (variable: string, value: string) => {
        onValuesChange({
            ...values,
            [variable]: value
        });
    };

    const handleClearAll = () => {
        const emptyValues: Record<string, string> = {};
        variables.forEach(v => emptyValues[v] = '');
        onValuesChange(emptyValues);
    };

    if (variables.length === 0 && scriptCount === 0) {
        return null;
    }

    return (
        <div className="glass-card-static p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Template Variables
                    {variables.length > 0 && (
                        <span className="text-xs text-[var(--text-muted)] font-normal">
                            ({variables.length})
                        </span>
                    )}
                </h3>
                {variables.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {scriptCount > 0 && (
                <div className="mb-4 p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-lg">
                    <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-[var(--warning-text)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-[var(--warning-text)]">
                                {scriptCount} script block{scriptCount > 1 ? 's' : ''} detected
                            </p>
                            <p className="text-xs text-[var(--warning-text)] opacity-80 mt-1">
                                Scripts will be removed before rendering. Fill variables below manually.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {variables.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-sm">No variables detected</p>
                    <p className="text-xs mt-1">
                        Use &lt;Variable.Name&gt; syntax
                    </p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {variables.map((variable) => (
                        <div key={variable}>
                            <label className="label mb-1.5">
                                {variable}
                            </label>
                            <input
                                type="text"
                                value={values[variable] || ''}
                                onChange={(e) => handleValueChange(variable, e.target.value)}
                                placeholder="Enter value..."
                                className="input-field"
                            />
                        </div>
                    ))}
                </div>
            )}

            {variables.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-muted)]">
                        💡 <strong>Tip:</strong> Empty variables will display as literal text on the label
                    </p>
                </div>
            )}
        </div>
    );
}
