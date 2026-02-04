export function Header() {
    return (
        <header className="py-6 px-8">
            <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
                    <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                    </svg>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        ZPL Label Debugger
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Debug, edit, and preview shipping labels
                    </p>
                </div>
            </div>
        </header>
    );
}
