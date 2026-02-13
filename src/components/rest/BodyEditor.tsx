import type { HoppBody } from '../../types/restTypes';

interface BodyEditorProps {
    body: HoppBody;
    onChange: (body: HoppBody) => void;
}

const CONTENT_TYPES = [
    { value: 'application/json', label: 'JSON' },
    { value: 'application/x-www-form-urlencoded', label: 'Form URL Encoded' },
    { value: 'text/plain', label: 'Plain Text' },
    { value: 'none', label: 'None' },
] as const;

export function BodyEditor({ body, onChange }: BodyEditorProps) {
    return (
        <div className="space-y-3">
            {/* Content Type Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Content Type
                </span>
                <div className="flex gap-1 bg-white/30 rounded-lg p-0.5">
                    {CONTENT_TYPES.map(ct => (
                        <button
                            key={ct.value}
                            onClick={() => onChange({ ...body, contentType: ct.value as HoppBody['contentType'] })}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${body.contentType === ct.value
                                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50'
                                }`}
                        >
                            {ct.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Body Editor */}
            {body.contentType !== 'none' && (
                <div className="relative">
                    <textarea
                        value={body.body}
                        onChange={e => onChange({ ...body, body: e.target.value })}
                        placeholder={getPlaceholder(body.contentType)}
                        className="w-full h-64 px-4 py-3 text-sm font-mono rounded-xl border border-[var(--glass-border)] bg-[#1e1e2e] text-[#cdd6f4] focus:border-[var(--accent-primary)] focus:outline-none transition-colors resize-y"
                        spellCheck={false}
                    />
                    {body.contentType === 'application/json' && body.body && (
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button
                                onClick={() => {
                                    try {
                                        const formatted = JSON.stringify(JSON.parse(body.body), null, 2);
                                        onChange({ ...body, body: formatted });
                                    } catch {
                                        // Invalid JSON, ignore
                                    }
                                }}
                                className="px-2 py-1 text-[10px] font-medium bg-white/10 hover:bg-white/20 text-white/70 rounded-md transition-colors"
                                title="Format JSON"
                            >
                                Format
                            </button>
                        </div>
                    )}
                </div>
            )}

            {body.contentType === 'none' && (
                <div className="flex items-center justify-center h-32 text-sm text-[var(--text-muted)] bg-white/20 rounded-xl border border-dashed border-[var(--glass-border)]">
                    This request does not have a body
                </div>
            )}
        </div>
    );
}

function getPlaceholder(contentType: string): string {
    switch (contentType) {
        case 'application/json':
            return '{\n  "key": "value"\n}';
        case 'application/x-www-form-urlencoded':
            return 'key1=value1&key2=value2';
        case 'text/plain':
            return 'Enter plain text body...';
        default:
            return '';
    }
}
