interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
};

export function GlassCard({
    children,
    className = '',
    hover = true,
    padding = 'md'
}: GlassCardProps) {
    const baseClass = hover ? 'glass-card' : 'glass-card-static';
    const paddingClass = paddingClasses[padding];

    return (
        <div className={`${baseClass} ${paddingClass} ${className}`}>
            {children}
        </div>
    );
}
