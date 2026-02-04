import { useState } from 'react';

interface PasteModePanelProps {
    onXmlPasted: (xml: string) => void;
    onError: (error: string) => void;
}

export function PasteModePanel({ onXmlPasted, onError }: PasteModePanelProps) {
    const [pastedXml, setPastedXml] = useState('');

    const handleSubmit = () => {
        if (!pastedXml.trim()) {
            onError('Please paste XML content before extracting');
            return;
        }
        onXmlPasted(pastedXml);
    };

    const handleClear = () => {
        setPastedXml('');
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Paste Area */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Paste SOAP/XML Response</label>
                    {pastedXml && (
                        <button
                            onClick={handleClear}
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--error-text)] transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
                <textarea
                    className="textarea-field min-h-[300px]"
                    placeholder={`Paste your SOAP XML response here...

Example:
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <ManifestShipmentResponse>
      ...
      <LabelData>BASE64_ENCODED_ZPL</LabelData>
      ...
    </ManifestShipmentResponse>
  </s:Body>
</s:Envelope>`}
                    value={pastedXml}
                    onChange={(e) => setPastedXml(e.target.value)}
                />
            </div>

            {/* Character Count */}
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{pastedXml.length.toLocaleString()} characters</span>
                {pastedXml && (
                    <span className="flex items-center gap-1 text-[var(--success-text)]">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Content detected
                    </span>
                )}
            </div>

            {/* Extract Button */}
            <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={handleSubmit}
                disabled={!pastedXml.trim()}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Extract & Decode ZPL
            </button>

            {/* Helper Text */}
            <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] bg-white/30 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>
                    This will parse the XML, find the <code className="bg-white/50 px-1 rounded">&lt;LabelData&gt;</code> element,
                    and decode the Base64-encoded ZPL content.
                </span>
            </div>
        </div>
    );
}
