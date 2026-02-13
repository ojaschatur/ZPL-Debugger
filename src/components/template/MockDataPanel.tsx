/**
 * MockDataPanel - UI for managing VBScript execution context
 * Allows users to input Shipment/Parcel data and toggle script execution
 */

import { useState } from 'react';
import type { MockDataContext } from '../../types/mockData';
import { MOCK_DATA_PRESETS, getDefaultMockData } from '../../types/mockData';

interface MockDataPanelProps {
    mockData: MockDataContext;
    onMockDataChange: (data: MockDataContext) => void;
    scriptMode: 'auto' | 'manual';
    onScriptModeChange: (mode: 'auto' | 'manual') => void;
}

export function MockDataPanel({
    mockData,
    onMockDataChange,
    scriptMode,
    onScriptModeChange
}: MockDataPanelProps) {
    const [jsonError, setJsonError] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handlePresetChange = (presetName: string) => {
        const preset = MOCK_DATA_PRESETS.find(p => p.name === presetName);
        if (preset) {
            onMockDataChange(preset.data);
            setJsonError('');
        }
    };

    const handleJsonChange = (jsonStr: string) => {
        try {
            const parsed = JSON.parse(jsonStr);
            onMockDataChange(parsed);
            setJsonError('');
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
        }
    };

    const currentPreset = MOCK_DATA_PRESETS.find(p =>
        JSON.stringify(p.data) === JSON.stringify(mockData)
    );

    return (
        <div className="glass-card-static p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Script Mode
                </h3>

                {/* Auto/Manual Toggle */}
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

            {/* Mode Description */}
            <div className="mb-4 p-3 bg-[var(--info-bg)] border border-[var(--info-border)] rounded-lg text-xs text-[var(--info-text)]">
                {scriptMode === 'auto' ? (
                    <div>
                        <strong>Auto Mode:</strong> Scripts execute automatically using mock data below. Variables are auto-filled.
                    </div>
                ) : (
                    <div>
                        <strong>Manual Mode:</strong> Scripts are removed. Fill variables manually using the Variable Panel.
                    </div>
                )}
            </div>

            {/* Mock Data Editor (only in Auto mode) */}
            {scriptMode === 'auto' && (
                <>
                    {/* Preset Selector */}
                    <div className="mb-3">
                        <label className="label mb-1.5">Mock Data Preset</label>
                        <select
                            value={currentPreset?.name || 'Custom'}
                            onChange={(e) => handlePresetChange(e.target.value)}
                            className="input-field text-sm"
                        >
                            {MOCK_DATA_PRESETS.map(preset => (
                                <option key={preset.name} value={preset.name}>
                                    {preset.name} - {preset.description}
                                </option>
                            ))}
                            {!currentPreset && <option value="Custom">Custom</option>}
                        </select>
                    </div>

                    {/* Expand/Collapse JSON Editor */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--card-hover)] rounded transition-colors mb-2"
                    >
                        <span>{isExpanded ? 'Hide' : 'Show'} Mock Data JSON</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* JSON Editor */}
                    {isExpanded && (
                        <div className="space-y-2">
                            <textarea
                                value={JSON.stringify(mockData, null, 2)}
                                onChange={(e) => handleJsonChange(e.target.value)}
                                className="input-field font-mono text-xs min-h-[300px] max-h-[500px]"
                                placeholder="Enter mock data JSON..."
                                spellCheck={false}
                            />

                            {jsonError && (
                                <div className="text-xs text-[var(--error-text)] p-2 bg-[var(--error-bg)] border border-[var(--error-border)] rounded">
                                    ⚠️ {jsonError}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    onMockDataChange(getDefaultMockData());
                                    setJsonError('');
                                }}
                                className="btn-secondary text-xs w-full"
                            >
                                Reset to Default
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
