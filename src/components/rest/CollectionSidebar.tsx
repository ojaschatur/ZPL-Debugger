import { useState, useRef } from 'react';
import type { HoppCollection, HoppRequest, HttpMethod } from '../../types/restTypes';
import { METHOD_COLORS } from '../../types/restTypes';

interface CollectionSidebarProps {
    collections: HoppCollection[];
    activeRequestId: string | null;
    onRequestSelect: (collectionId: string, request: HoppRequest) => void;
    onAddCollection: (name?: string) => void;
    onDeleteCollection: (id: string) => void;
    onRenameCollection: (id: string, newName: string) => void;
    onAddRequest: (collectionId: string, name?: string) => void;
    onDeleteRequest: (collectionId: string, requestId: string) => void;
    onDuplicateRequest: (collectionId: string, requestId: string) => void;
    onImportCollection: (json: string) => { success: boolean; error?: string };
    onExportCollection: (id: string) => string | null;
}

export function CollectionSidebar({
    collections,
    activeRequestId,
    onRequestSelect,
    onAddCollection,
    onDeleteCollection,
    onRenameCollection,
    onAddRequest,
    onDeleteRequest,
    onDuplicateRequest,
    onImportCollection,
    onExportCollection,
}: CollectionSidebarProps) {
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'collection' | 'request'; id: string; collectionId: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleCollection = (id: string) => {
        setExpandedCollections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleContextMenu = (e: React.MouseEvent, type: 'collection' | 'request', id: string, collectionId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, type, id, collectionId });
    };

    const closeContextMenu = () => setContextMenu(null);

    const startRenaming = (id: string, currentName: string) => {
        setEditingId(id);
        setEditingName(currentName);
        closeContextMenu();
    };

    const finishRenaming = (collectionId: string) => {
        if (editingId && editingName.trim()) {
            onRenameCollection(collectionId, editingName.trim());
        }
        setEditingId(null);
    };

    const handleImport = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const json = ev.target?.result as string;
            const result = onImportCollection(json);
            if (!result.success) {
                alert(`Import failed: ${result.error}`);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const handleExport = (id: string) => {
        const json = onExportCollection(id);
        if (!json) return;

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const collection = collections.find(c => c.id === id);
        a.download = `${collection?.name || 'collection'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        closeContextMenu();
    };

    const getMethodBadge = (method: HttpMethod) => (
        <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: METHOD_COLORS[method], backgroundColor: `${METHOD_COLORS[method]}15` }}
        >
            {method.substring(0, 3)}
        </span>
    );

    // Filter requests based on search
    const filteredCollections = searchQuery
        ? collections.map(col => ({
            ...col,
            requests: col.requests.filter(req =>
                req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.endpoint.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter(col => col.requests.length > 0 || col.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : collections;

    return (
        <div className="h-full flex flex-col bg-white/30 backdrop-blur-sm border-r border-[var(--glass-border)]" onClick={closeContextMenu}>
            {/* Header */}
            <div className="p-3 border-b border-[var(--glass-border)]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Collections
                    </h3>
                    <div className="flex gap-1">
                        <button
                            onClick={handleImport}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/50 transition-colors"
                            title="Import collection"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onAddCollection()}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-white/50 transition-colors"
                            title="New collection"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Collection Tree */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredCollections.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
                        <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-xs">No collections yet</span>
                        <button
                            onClick={handleImport}
                            className="mt-2 text-xs text-[var(--accent-primary)] hover:underline"
                        >
                            Import a collection
                        </button>
                    </div>
                )}

                {filteredCollections.map(collection => (
                    <div key={collection.id}>
                        {/* Collection Header */}
                        <div
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/50 transition-colors group"
                            onClick={() => toggleCollection(collection.id)}
                            onContextMenu={e => handleContextMenu(e, 'collection', collection.id, collection.id)}
                        >
                            <svg
                                className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${expandedCollections.has(collection.id) ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                            </svg>

                            {editingId === collection.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={e => setEditingName(e.target.value)}
                                    onBlur={() => finishRenaming(collection.id)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') finishRenaming(collection.id);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    className="flex-1 text-xs px-1 py-0.5 bg-white rounded border border-[var(--accent-primary)] focus:outline-none"
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                />
                            ) : (
                                <span className="flex-1 text-xs font-medium text-[var(--text-primary)] truncate">
                                    {collection.name}
                                </span>
                            )}

                            <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                                {collection.requests.length}
                            </span>
                        </div>

                        {/* Requests */}
                        {expandedCollections.has(collection.id) && (
                            <div className="ml-4 space-y-0.5 mt-0.5">
                                {collection.requests.map(request => (
                                    <div
                                        key={request.id}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all group ${activeRequestId === request.id
                                                ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30'
                                                : 'hover:bg-white/50'
                                            }`}
                                        onClick={() => onRequestSelect(collection.id, request)}
                                        onContextMenu={e => handleContextMenu(e, 'request', request.id, collection.id)}
                                    >
                                        {getMethodBadge(request.method)}
                                        <span className={`flex-1 text-xs truncate ${activeRequestId === request.id
                                                ? 'text-[var(--text-primary)] font-medium'
                                                : 'text-[var(--text-secondary)]'
                                            }`}>
                                            {request.name}
                                        </span>
                                    </div>
                                ))}

                                {/* Add Request Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddRequest(collection.id); }}
                                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors w-full"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add request
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-[var(--glass-border)] py-1 min-w-[160px] animate-fade-in"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={e => e.stopPropagation()}
                >
                    {contextMenu.type === 'collection' && (
                        <>
                            <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent-primary)]/5 flex items-center gap-2"
                                onClick={() => { onAddRequest(contextMenu.collectionId); closeContextMenu(); }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Request
                            </button>
                            <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent-primary)]/5 flex items-center gap-2"
                                onClick={() => startRenaming(contextMenu.id, collections.find(c => c.id === contextMenu.id)?.name || '')}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Rename
                            </button>
                            <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent-primary)]/5 flex items-center gap-2"
                                onClick={() => handleExport(contextMenu.id)}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                            <div className="border-t border-[var(--glass-border)] my-1" />
                            <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
                                onClick={() => { onDeleteCollection(contextMenu.id); closeContextMenu(); }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </>
                    )}

                    {contextMenu.type === 'request' && (
                        <>
                            <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--accent-primary)]/5 flex items-center gap-2"
                                onClick={() => { onDuplicateRequest(contextMenu.collectionId, contextMenu.id); closeContextMenu(); }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Duplicate
                            </button>
                            <div className="border-t border-[var(--glass-border)] my-1" />
                            <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
                                onClick={() => { onDeleteRequest(contextMenu.collectionId, contextMenu.id); closeContextMenu(); }}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
