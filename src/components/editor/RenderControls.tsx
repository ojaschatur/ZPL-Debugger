import { useMemo } from 'react';
import type { RenderSettings } from '../../types';

interface RenderControlsProps {
    settings: RenderSettings;
    onSettingsChange: (settings: RenderSettings) => void;
    onRender: () => void;
    isRendering: boolean;
    disabled: boolean;
}

const DPMM_OPTIONS = [6, 8, 12, 24];
const ROTATION_OPTIONS = [0, 90, 180, 270] as const;

// Conversion helpers
const mmToInches = (mm: number) => Number((mm / 25.4).toFixed(3));
const inchesToMm = (inches: number) => Number((inches * 25.4).toFixed(1));

export function RenderControls({
    settings,
    onSettingsChange,
    onRender,
    isRendering,
    disabled
}: RenderControlsProps) {
    // Display values based on current unit
    const displayWidth = useMemo(() => {
        return settings.unit === 'inches' ? mmToInches(settings.widthMm) : settings.widthMm;
    }, [settings.widthMm, settings.unit]);

    const displayHeight = useMemo(() => {
        return settings.unit === 'inches' ? mmToInches(settings.heightMm) : settings.heightMm;
    }, [settings.heightMm, settings.unit]);

    const handleWidthChange = (value: number) => {
        const widthMm = settings.unit === 'inches' ? inchesToMm(value) : value;
        onSettingsChange({ ...settings, widthMm });
    };

    const handleHeightChange = (value: number) => {
        const heightMm = settings.unit === 'inches' ? inchesToMm(value) : value;
        onSettingsChange({ ...settings, heightMm });
    };

    const handleUnitChange = (unit: 'mm' | 'inches') => {
        onSettingsChange({ ...settings, unit });
    };

    return (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-white/40 rounded-xl border border-[var(--glass-border)]">
            {/* DPMM Select */}
            <div className="flex-1 min-w-[130px]">
                <label className="label">Resolution (dpmm)</label>
                <select
                    className="select-field w-full"
                    value={settings.dpmm}
                    onChange={(e) => onSettingsChange({ ...settings, dpmm: Number(e.target.value) })}
                    disabled={disabled}
                >
                    {DPMM_OPTIONS.map(dpmm => (
                        <option key={dpmm} value={dpmm}>
                            {dpmm} dpmm ({dpmm * 25.4} DPI)
                        </option>
                    ))}
                </select>
            </div>

            {/* Unit Select */}
            <div className="min-w-[90px]">
                <label className="label">Unit</label>
                <select
                    className="select-field w-full"
                    value={settings.unit}
                    onChange={(e) => handleUnitChange(e.target.value as 'mm' | 'inches')}
                    disabled={disabled}
                >
                    <option value="mm">mm</option>
                    <option value="inches">inches</option>
                </select>
            </div>

            {/* Width Input */}
            <div className="flex-1 min-w-[100px]">
                <label className="label">Width ({settings.unit})</label>
                <input
                    type="number"
                    className="input-field"
                    value={displayWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    min={settings.unit === 'inches' ? 0.5 : 10}
                    max={settings.unit === 'inches' ? 20 : 500}
                    step={settings.unit === 'inches' ? 0.01 : 0.1}
                    disabled={disabled}
                />
            </div>

            {/* Height Input */}
            <div className="flex-1 min-w-[100px]">
                <label className="label">Height ({settings.unit})</label>
                <input
                    type="number"
                    className="input-field"
                    value={displayHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    min={settings.unit === 'inches' ? 0.5 : 10}
                    max={settings.unit === 'inches' ? 20 : 500}
                    step={settings.unit === 'inches' ? 0.01 : 0.1}
                    disabled={disabled}
                />
            </div>

            {/* Rotation Select */}
            <div className="min-w-[90px]">
                <label className="label">Rotate</label>
                <select
                    className="select-field w-full"
                    value={settings.rotation}
                    onChange={(e) => onSettingsChange({ ...settings, rotation: Number(e.target.value) as 0 | 90 | 180 | 270 })}
                    disabled={disabled}
                >
                    {ROTATION_OPTIONS.map(deg => (
                        <option key={deg} value={deg}>
                            {deg}°
                        </option>
                    ))}
                </select>
            </div>

            {/* Render Button */}
            <div className="flex-shrink-0">
                <button
                    className="btn-primary flex items-center gap-2 h-[42px]"
                    onClick={onRender}
                    disabled={disabled || isRendering}
                >
                    {isRendering ? (
                        <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Rendering...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Render Preview
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
