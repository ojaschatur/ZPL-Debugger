import Editor, { OnMount } from '@monaco-editor/react';
import { useCallback } from 'react';

interface ZplEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function ZplEditor({ value, onChange, disabled = false }: ZplEditorProps) {
    const handleEditorMount: OnMount = useCallback((_editor, monaco) => {
        // Register ZPL language
        monaco.languages.register({ id: 'zpl' });

        // Define ZPL syntax highlighting
        monaco.languages.setMonarchTokensProvider('zpl', {
            tokenizer: {
                root: [
                    // Comments (^FX)
                    [/\^FX.*$/, 'comment'],

                    // Format commands (^XA, ^XZ)
                    [/\^(XA|XZ)/, 'keyword'],

                    // Field commands
                    [/\^(FO|FD|FS|FT|FB|FH|FN|FR|FW|FP|FV)/, 'type'],

                    // Barcode commands
                    [/\^(B[A-Z0-9])/, 'function'],

                    // Graphics commands
                    [/\^(GB|GC|GD|GE|GF|GS)/, 'number'],

                    // Font commands
                    [/\^(A[A-Z0-9]|CF)/, 'variable'],

                    // Change commands
                    [/\^(BY|CI|MM|PO|PW|LH|LL|LT|LS)/, 'string'],

                    // All other ^ commands
                    [/\^[A-Z]{1,2}/, 'support'],

                    // Numbers
                    [/\d+/, 'constant.numeric'],

                    // Commas (parameters)
                    [/,/, 'delimiter']
                ]
            }
        });

        // Define ZPL theme colors
        monaco.editor.defineTheme('zpl-theme', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'dc2626', fontStyle: 'bold' },
                { token: 'type', foreground: '2563eb' },
                { token: 'function', foreground: '7c3aed' },
                { token: 'number', foreground: 'd97706' },
                { token: 'variable', foreground: '059669' },
                { token: 'string', foreground: 'db2777' },
                { token: 'support', foreground: '64748b' },
                { token: 'constant.numeric', foreground: '0891b2' },
                { token: 'delimiter', foreground: '9ca3af' }
            ],
            colors: {}
        });

        // Apply the theme
        monaco.editor.setTheme('zpl-theme');
    }, []);

    return (
        <div className="h-full min-h-[400px] rounded-xl overflow-hidden border border-[var(--glass-border)] bg-white/50">
            <Editor
                height="100%"
                defaultLanguage="zpl"
                theme="zpl-theme"
                value={value}
                onChange={(val) => onChange(val || '')}
                onMount={handleEditorMount}
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
