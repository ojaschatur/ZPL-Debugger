import { useState } from 'react';
import type { ZplError } from '../../types';

interface ErrorPanelProps {
    errors: ZplError[];
    onClear: () => void;
}

export function ErrorPanel({ errors, onClear }: ErrorPanelProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const syntaxErrors = errors.filter(e => e.type === 'syntax');
    const renderingErrors = errors.filter(e => e.type === 'rendering');
    const hasErrors = errors.length > 0;

    return (
        <div className={`rounded-xl border overflow-hidden ${hasErrors
                ? 'border-[var(--error-border)] bg-[var(--error-bg)]'
                : 'border-[var(--glass-border)] bg-white/50'
            }`}>
            {/* Header */}
            <div
                className={`flex items-center justify-between px-4 py-3 ${hasErrors ? 'cursor-pointer hover:bg-red-50/50' : ''
                    } transition-colors`}
                onClick={() => hasErrors && setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2">
                    {hasErrors ? (
                        <>
                            <svg className="w-5 h-5 text-[var(--error-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-semibold text-[var(--error-text)]">
                                {errors.length} Error{errors.length !== 1 ? 's' : ''} Found
                            </span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-[var(--success-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-[var(--text-secondary)]">
                                No Errors
                            </span>
                        </>
                    )}

                    {/* Error type badges */}
                    {hasErrors && (
                        <div className="flex gap-2 ml-2">
                            {syntaxErrors.length > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                                    {syntaxErrors.length} Syntax
                                </span>
                            )}
                            {renderingErrors.length > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                    {renderingErrors.length} Rendering
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {hasErrors && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="text-xs text-[var(--error-text)] hover:underline"
                        >
                            Clear All
                        </button>
                        <svg
                            className={`w-5 h-5 text-[var(--error-text)] transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Error List */}
            {hasErrors && !isCollapsed && (
                <div className="px-4 pb-4 space-y-2">
                    {errors.map((error) => (
                        <div
                            key={error.id}
                            className={`p-3 rounded-lg text-sm ${error.type === 'syntax'
                                    ? 'bg-orange-50 border border-orange-200'
                                    : 'bg-red-50 border border-red-200'
                                }`}
                        >
                            <div className="flex items-start gap-2">
                                <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${error.type === 'syntax'
                                        ? 'bg-orange-200 text-orange-800'
                                        : 'bg-red-200 text-red-800'
                                    }`}>
                                    {error.type === 'syntax' ? 'SYNTAX' : 'RENDER'}
                                </span>

                                {error.line && (
                                    <span className="text-xs text-[var(--text-muted)]">
                                        Line {error.line}
                                    </span>
                                )}
                            </div>

                            <p className={`mt-1 ${error.type === 'syntax' ? 'text-orange-800' : 'text-red-800'
                                }`}>
                                {error.message}
                            </p>

                            <span className="text-xs text-[var(--text-muted)]">
                                {error.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
