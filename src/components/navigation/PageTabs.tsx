export type PageType = 'json' | 'xml' | 'preview';

interface PageTabsProps {
    activePage: PageType;
    onPageChange: (page: PageType) => void;
}

const tabs: { id: PageType; label: string; icon: JSX.Element; disabled?: boolean; tooltip?: string }[] = [
    {
        id: 'json',
        label: 'JSON',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        id: 'xml',
        label: 'XML',
        disabled: true,
        tooltip: 'Coming Soon',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
    },
    {
        id: 'preview',
        label: 'Preview',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
];

export function PageTabs({ activePage, onPageChange }: PageTabsProps) {
    return (
        <div className="flex gap-2 p-1 bg-white/40 rounded-2xl border border-[var(--glass-border)] backdrop-blur-sm">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${tab.disabled
                            ? 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
                            : activePage === tab.id
                                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50'
                        }`}
                    onClick={() => !tab.disabled && onPageChange(tab.id)}
                    title={tab.tooltip}
                    disabled={tab.disabled}
                >
                    {tab.icon}
                    {tab.label}
                    {tab.disabled && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/30 text-[var(--text-muted)] font-normal">
                            Soon
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
