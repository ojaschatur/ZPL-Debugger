import { useState, useCallback, useRef, useEffect } from 'react';

interface ResizablePanelProps {
    direction: 'horizontal' | 'vertical';
    initialSize: number;   // Initial size in pixels
    minSize?: number;       // Minimum size in pixels
    maxSize?: number;       // Maximum size in pixels
    children: [React.ReactNode, React.ReactNode]; // Exactly 2 children
    className?: string;
    handleClassName?: string;
}

export function ResizablePanel({
    direction,
    initialSize,
    minSize = 100,
    maxSize = 2000,
    children,
    className = '',
    handleClassName = '',
}: ResizablePanelProps) {
    const [size, setSize] = useState(initialSize);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startPos = useRef(0);
    const startSize = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
        startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
        startSize.current = size;
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    }, [direction, size]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;

            const delta = direction === 'horizontal'
                ? e.clientX - startPos.current
                : e.clientY - startPos.current;

            const newSize = Math.max(minSize, Math.min(maxSize, startSize.current + delta));
            setSize(newSize);
        };

        const handleMouseUp = () => {
            if (isDragging.current) {
                isDragging.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [direction, minSize, maxSize]);

    const isHorizontal = direction === 'horizontal';

    return (
        <div
            ref={containerRef}
            className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
            style={{ height: '100%', width: '100%' }}
        >
            {/* First Panel */}
            <div
                style={isHorizontal ? { width: size, minWidth: minSize } : { height: size, minHeight: minSize }}
                className={`flex-shrink-0 overflow-hidden ${isHorizontal ? '' : ''}`}
            >
                {children[0]}
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                className={`
                    flex-shrink-0 relative group
                    ${isHorizontal
                        ? 'w-1.5 cursor-col-resize hover:bg-[var(--accent-primary)]/20 active:bg-[var(--accent-primary)]/30'
                        : 'h-1.5 cursor-row-resize hover:bg-[var(--accent-primary)]/20 active:bg-[var(--accent-primary)]/30'
                    }
                    transition-colors
                    ${handleClassName}
                `}
            >
                {/* Visual indicator */}
                <div className={`
                    absolute bg-[var(--accent-primary)]/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                    ${isHorizontal
                        ? 'w-0.5 h-8 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
                        : 'h-0.5 w-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                    }
                `} />
            </div>

            {/* Second Panel */}
            <div className="flex-1 overflow-hidden min-w-0 min-h-0">
                {children[1]}
            </div>
        </div>
    );
}
