import { useState, useCallback } from 'react';
import { extractLabels, type ExtractedLabel } from '../../utils/labelExtractor';

interface DecodePageProps {
    onLabelsExtracted: (zplContent: string) => void;
}

export function DecodePage({ onLabelsExtracted }: DecodePageProps) {
    const [input, setInput] = useState('');
    const [extractedLabels, setExtractedLabels] = useState<ExtractedLabel[]>([]);
    const [extractionMethod, setExtractionMethod] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDecode = useCallback(() => {
        if (!input.trim()) {
            setError('Please paste a response or encoded data first.');
            return;
        }

        setError(null);
        setExtractedLabels([]);
        setExtractionMethod(null);

        const { labels, method } = extractLabels(input.trim());

        if (labels.length === 0) {
            setError('No ZPL labels found. Supported formats: JSON with base64 ZPL, XML with <LabelData> tags, raw base64-encoded ZPL, or raw ZPL (^XA...^XZ).');
            return;
        }

        setExtractionMethod(method);

        if (labels.length === 1) {
            onLabelsExtracted(labels[0].zplContent);
        } else {
            setExtractedLabels(labels);
        }
    }, [input, onLabelsExtracted]);

    const handleClear = () => {
        setInput('');
        setExtractedLabels([]);
        setExtractionMethod(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    📋 Decode Response
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                    Paste an API response, base64-encoded ZPL, or raw ZPL to decode and preview
                </p>
            </div>

            {/* Input Area */}
            <div className="bg-white/40 rounded-2xl border border-[var(--glass-border)] backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Paste Response
                    </span>
                    <div className="flex gap-2">
                        {input && (
                            <button
                                onClick={handleClear}
                                className="px-3 py-1 text-xs font-medium text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={handleDecode}
                            disabled={!input.trim()}
                            className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-glow"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Decode & Preview
                        </button>
                    </div>
                </div>

                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Paste any of these formats:\n\n• Full JSON response:  {"shipment":{"labels":[{"data":"XlhBXkZPMzAs..."}]}}\n\n• XML with LabelData:  <LabelData>XlhBXkZPMzAs...</LabelData>\n\n• Raw base64:  XlhBXkZPMzAsNjQwXkEwTiwyMDAsMjAw...\n\n• Raw ZPL:  ^XA^FO30,640^A0N,200,200^FD...^FS^XZ`}
                    className="w-full h-72 px-4 py-3 text-sm font-mono rounded-xl bg-[#1e1e2e] text-[#cdd6f4] border border-[var(--glass-border)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors resize-y placeholder:text-[#45475a]"
                />

                {/* Format hints */}
                <div className="flex flex-wrap gap-2">
                    {['JSON Response', 'XML <LabelData>', 'Base64 ZPL', 'Raw ZPL'].map(format => (
                        <span key={format} className="px-2.5 py-1 text-[10px] font-medium bg-white/50 text-[var(--text-muted)] rounded-full border border-[var(--glass-border)]">
                            ✓ {format}
                        </span>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
                    <span className="flex-shrink-0 mt-0.5">❌</span>
                    <p>{error}</p>
                </div>
            )}

            {/* Multiple Labels Picker */}
            {extractedLabels.length > 1 && (
                <div className="bg-white/40 rounded-2xl border border-[var(--glass-border)] backdrop-blur-sm p-5 space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                            🏷️ {extractedLabels.length} Labels Found
                            {extractionMethod && (
                                <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                                    via {extractionMethod}
                                </span>
                            )}
                        </h3>
                    </div>
                    {extractedLabels.map((label, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent-primary)] transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <span className="text-xs font-mono text-[var(--accent-primary)] font-medium">
                                    {label.path}
                                </span>
                                <p className="text-xs text-[var(--text-muted)] mt-1 font-mono truncate">
                                    {label.zplContent.substring(0, 100)}...
                                </p>
                            </div>
                            <button
                                onClick={() => onLabelsExtracted(label.zplContent)}
                                className="ml-4 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                            >
                                Preview →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
