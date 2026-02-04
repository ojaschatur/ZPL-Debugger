import type { InputMode } from '../../types';

interface ModeTabsProps {
    activeMode: InputMode;
    onModeChange: (mode: InputMode) => void;
}

export function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
    return (
        <div className="tab-container">
            <button
                className={`tab-button ${activeMode === 'api' ? 'active' : ''}`}
                onClick={() => onModeChange('api')}
            >
                <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    API Mode
                </span>
            </button>
            <button
                className={`tab-button ${activeMode === 'paste' ? 'active' : ''}`}
                onClick={() => onModeChange('paste')}
            >
                <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Paste Mode
                </span>
            </button>
        </div>
    );
}
