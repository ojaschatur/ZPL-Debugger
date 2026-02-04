import { useState, useEffect, useRef } from 'react';

interface PreviewPanelProps {
    image: string | null;
    isLoading: boolean;
    error: string | null;
    rotation?: 0 | 90 | 180 | 270;
}

export function PreviewPanel({ image, isLoading, error, rotation = 0 }: PreviewPanelProps) {
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(125);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (image) {
            const img = new Image();
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
            };
            img.src = image;
        }
    }, [image]);

    // Calculate scale to fit rotated image
    const getTransformStyle = () => {
        if (!image || !containerRef.current) return {};

        const isRotatedSideways = rotation === 90 || rotation === 270;
        const { width: imgW, height: imgH } = imageDimensions;

        if (imgW === 0 || imgH === 0) return { transform: `rotate(${rotation}deg) scale(${zoom / 100})` };

        // Get container dimensions
        const container = containerRef.current;
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;

        // Calculate required space after rotation
        const requiredW = isRotatedSideways ? imgH : imgW;
        const requiredH = isRotatedSideways ? imgW : imgH;

        // Calculate scale to fit
        const scaleX = containerW / requiredW;
        const scaleY = containerH / requiredH;
        const baseScale = Math.min(scaleX, scaleY, 1);

        // Apply zoom on top of base scale
        const finalScale = baseScale * (zoom / 100);

        return {
            transform: `rotate(${rotation}deg) scale(${finalScale})`,
            transition: 'transform 0.3s ease',
        };
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleZoomReset = () => setZoom(100);

    return (
        <div className="h-full min-h-[400px] rounded-xl border border-[var(--glass-border)] bg-white/50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] bg-white/30">
                <span className="text-sm font-medium text-[var(--text-primary)]">Label Preview</span>
                <div className="flex items-center gap-3">
                    {/* Zoom Controls */}
                    {image && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/60 rounded-lg border border-[var(--border-color)]">
                            <button
                                onClick={handleZoomOut}
                                className="p-1 hover:bg-white/80 rounded transition-colors"
                                title="Zoom Out"
                                disabled={zoom <= 25}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                </svg>
                            </button>
                            <span className="text-xs font-medium min-w-[3rem] text-center">{zoom}%</span>
                            <button
                                onClick={handleZoomIn}
                                className="p-1 hover:bg-white/80 rounded transition-colors"
                                title="Zoom In"
                                disabled={zoom >= 400}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleZoomReset}
                                className="p-1 hover:bg-white/80 rounded transition-colors ml-1"
                                title="Reset Zoom"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {rotation !== 0 && (
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {rotation}°
                        </span>
                    )}
                    {image && (
                        <a
                            href={image}
                            download="label-preview.png"
                            className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PNG
                        </a>
                    )}
                </div>
            </div>

            {/* Preview Area */}
            <div
                ref={containerRef}
                className="flex-1 p-4 overflow-auto bg-[repeating-conic-gradient(#f0f0f0_0_90deg,#fff_0_180deg)_0_0/20px_20px]"
            >
                <div className="w-full h-full flex items-center justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                            <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm">Rendering label...</span>
                        </div>
                    ) : error ? (
                        <div className="error-panel max-w-md text-center">
                            <div className="error-panel-title justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Render Error
                            </div>
                            <p className="text-sm">{error}</p>
                        </div>
                    ) : image ? (
                        <img
                            src={image}
                            alt="ZPL Label Preview"
                            className="shadow-lg rounded animate-fade-in"
                            style={{
                                ...getTransformStyle()
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                            <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">No preview yet</span>
                            <span className="text-xs">Enter ZPL code and click "Render Preview"</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
