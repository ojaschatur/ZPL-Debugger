import { useCallback } from 'react';
import type { KeyValuePair } from '../../types/restTypes';
import { generateId } from '../../types/restTypes';

interface KeyValueEditorProps {
    pairs: KeyValuePair[];
    onChange: (pairs: KeyValuePair[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    title?: string;
}

export function KeyValueEditor({
    pairs,
    onChange,
    keyPlaceholder = 'Key',
    valuePlaceholder = 'Value',
    title,
}: KeyValueEditorProps) {
    const handleAdd = useCallback(() => {
        onChange([...pairs, { id: generateId(), key: '', value: '', active: true }]);
    }, [pairs, onChange]);

    const handleRemove = useCallback((id: string) => {
        onChange(pairs.filter(p => p.id !== id));
    }, [pairs, onChange]);

    const handleUpdate = useCallback((id: string, field: 'key' | 'value', val: string) => {
        onChange(pairs.map(p => p.id === id ? { ...p, [field]: val } : p));
    }, [pairs, onChange]);

    const handleToggle = useCallback((id: string) => {
        onChange(pairs.map(p => p.id === id ? { ...p, active: !p.active } : p));
    }, [pairs, onChange]);

    return (
        <div className="space-y-2">
            {title && (
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        {title}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                        {pairs.filter(p => p.active && p.key).length} active
                    </span>
                </div>
            )}

            {/* Header Row */}
            {pairs.length > 0 && (
                <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 px-1">
                    <span></span>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{keyPlaceholder}</span>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase">{valuePlaceholder}</span>
                    <span></span>
                </div>
            )}

            {/* Rows */}
            {pairs.map(pair => (
                <div
                    key={pair.id}
                    className={`grid grid-cols-[32px_1fr_1fr_32px] gap-2 items-center group transition-opacity ${!pair.active ? 'opacity-40' : ''}`}
                >
                    {/* Toggle */}
                    <button
                        onClick={() => handleToggle(pair.id)}
                        className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center mx-auto ${pair.active
                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]'
                                : 'border-[var(--glass-border)] hover:border-[var(--text-muted)]'
                            }`}
                    >
                        {pair.active && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>

                    {/* Key */}
                    <input
                        type="text"
                        value={pair.key}
                        onChange={e => handleUpdate(pair.id, 'key', e.target.value)}
                        placeholder={keyPlaceholder}
                        className="px-3 py-1.5 text-sm rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors font-mono"
                    />

                    {/* Value */}
                    <input
                        type="text"
                        value={pair.value}
                        onChange={e => handleUpdate(pair.id, 'value', e.target.value)}
                        placeholder={valuePlaceholder}
                        className="px-3 py-1.5 text-sm rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors font-mono"
                    />

                    {/* Delete */}
                    <button
                        onClick={() => handleRemove(pair.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}

            {/* Add Button */}
            <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 rounded-lg transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add {title?.replace(/s$/, '') || 'Entry'}
            </button>
        </div>
    );
}
