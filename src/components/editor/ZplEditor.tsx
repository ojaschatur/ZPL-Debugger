import Editor from '@monaco-editor/react';

interface ZplEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function ZplEditor({ value, onChange, disabled = false }: ZplEditorProps) {
    return (
        <div className="h-full min-h-[400px] rounded-xl overflow-hidden border border-[var(--glass-border)] bg-white/50">
            <Editor
                height="100%"
                defaultLanguage="plaintext"
                theme="vs"
                value={value}
                onChange={(val) => onChange(val || '')}
                options={{
                    readOnly: disabled,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'line',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    tabSize: 2,
                }}
                loading={
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading editor...
                    </div>
                }
            />
        </div>
    );
}
