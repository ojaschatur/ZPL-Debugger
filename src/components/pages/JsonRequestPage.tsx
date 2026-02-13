import { useState, useCallback } from 'react';
import type { HoppRequest, RestResponse } from '../../types/restTypes';
import { METHOD_COLORS } from '../../types/restTypes';
import { useCollections } from '../../hooks/useCollections';
import { sendRequest } from '../../utils/httpClient';
import { extractLabels, type ExtractedLabel } from '../../utils/labelExtractor';
import { CollectionSidebar } from '../rest/CollectionSidebar';
import { RequestEditor } from '../rest/RequestEditor';
import { ResponsePanel } from '../rest/ResponsePanel';
import { ResizablePanel } from '../layout/ResizablePanel';

interface JsonRequestPageProps {
    onLabelsExtracted: (zplContent: string) => void;
}

/** A single open tab holding its request state and response */
interface RequestTab {
    id: string;                   // unique tab id = request.id
    collectionId: string;
    request: HoppRequest;
    response: RestResponse | null;
    isLoading: boolean;
    extractedLabels: ExtractedLabel[];
    showLabelPicker: boolean;
}

export function JsonRequestPage({ onLabelsExtracted }: JsonRequestPageProps) {
    const {
        collections,
        addCollection,
        deleteCollection,
        renameCollection,
        addRequest,
        deleteRequest,
        updateRequest,
        duplicateRequest,
        importCollection,
        exportCollection,
    } = useCollections();

    // Multi-tab state
    const [tabs, setTabs] = useState<RequestTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    const activeTab = tabs.find(t => t.id === activeTabId) || null;

    // ---- Tab helpers ----

    const updateTab = useCallback((tabId: string, updates: Partial<RequestTab>) => {
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...updates } : t));
    }, []);

    // Open request in a tab (or switch to it if already open)
    const handleRequestSelect = useCallback((collectionId: string, request: HoppRequest) => {
        setTabs(prev => {
            const existing = prev.find(t => t.id === request.id);
            if (existing) {
                // Tab already open — just switch to it
                setActiveTabId(request.id);
                return prev;
            }
            // Open new tab
            const newTab: RequestTab = {
                id: request.id,
                collectionId,
                request: { ...request },
                response: null,
                isLoading: false,
                extractedLabels: [],
                showLabelPicker: false,
            };
            setActiveTabId(request.id);
            return [...prev, newTab];
        });
    }, []);

    const closeTab = useCallback((tabId: string) => {
        setTabs(prev => {
            const filtered = prev.filter(t => t.id !== tabId);
            // If we closed the active tab, switch to neighboring one
            if (activeTabId === tabId) {
                const closedIndex = prev.findIndex(t => t.id === tabId);
                const newActive = filtered[Math.min(closedIndex, filtered.length - 1)];
                setActiveTabId(newActive?.id || null);
            }
            return filtered;
        });
    }, [activeTabId]);

    // ---- Request operations ----

    const handleRequestChange = useCallback((updates: Partial<HoppRequest>) => {
        if (!activeTab) return;
        const updated = { ...activeTab.request, ...updates };
        updateTab(activeTab.id, { request: updated });

        // Auto-save to collection
        updateRequest(activeTab.collectionId, activeTab.request.id, updates);
    }, [activeTab, updateTab, updateRequest]);

    const handleSend = useCallback(async () => {
        if (!activeTab) return;
        const tabId = activeTab.id;

        updateTab(tabId, { isLoading: true, response: null, extractedLabels: [], showLabelPicker: false });

        try {
            const result = await sendRequest(activeTab.request);
            updateTab(tabId, { response: result, isLoading: false });
        } catch (error) {
            updateTab(tabId, {
                isLoading: false,
                response: {
                    status: 0,
                    statusText: 'Error',
                    headers: {},
                    body: '',
                    time: 0,
                    size: 0,
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    }, [activeTab, updateTab]);

    const handleExtractLabels = useCallback((responseBody: string) => {
        if (!activeTab) return;
        const labelPath = activeTab.request.labelPath;
        const { labels } = extractLabels(responseBody, labelPath);

        if (labels.length === 0) {
            alert('No ZPL labels found in the response. Try setting a custom label path in the request settings.');
            return;
        }

        if (labels.length === 1) {
            onLabelsExtracted(labels[0].zplContent);
        } else {
            updateTab(activeTab.id, { extractedLabels: labels, showLabelPicker: true });
        }
    }, [activeTab, updateTab, onLabelsExtracted]);

    // ---- Render ----

    return (
        <div className="flex h-[calc(100vh-140px)] animate-fade-in overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-white/20 backdrop-blur-sm">
            {/* Sidebar ↔ Main with resizable divider */}
            <ResizablePanel
                direction="horizontal"
                initialSize={260}
                minSize={200}
                maxSize={450}
            >
                {/* Sidebar */}
                <CollectionSidebar
                    collections={collections}
                    activeRequestId={activeTab?.request.id || null}
                    onRequestSelect={handleRequestSelect}
                    onAddCollection={addCollection}
                    onDeleteCollection={deleteCollection}
                    onRenameCollection={renameCollection}
                    onAddRequest={addRequest}
                    onDeleteRequest={deleteRequest}
                    onDuplicateRequest={duplicateRequest}
                    onImportCollection={importCollection}
                    onExportCollection={exportCollection}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* ===== Request Tabs Bar ===== */}
                    {tabs.length > 0 && (
                        <div className="flex items-center gap-0 border-b border-[var(--glass-border)] bg-white/30 overflow-x-auto flex-shrink-0 scrollbar-thin">
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    className={`group flex items-center gap-1.5 px-3 py-2 text-xs font-medium cursor-pointer border-r border-[var(--glass-border)] min-w-0 max-w-[200px] transition-colors ${activeTabId === tab.id
                                            ? 'bg-white/60 text-[var(--text-primary)] border-b-2 border-b-[var(--accent-primary)]'
                                            : 'text-[var(--text-secondary)] hover:bg-white/40 hover:text-[var(--text-primary)]'
                                        }`}
                                    onClick={() => setActiveTabId(tab.id)}
                                >
                                    {/* Method badge */}
                                    <span
                                        className="text-[9px] font-bold uppercase flex-shrink-0"
                                        style={{ color: METHOD_COLORS[tab.request.method] }}
                                    >
                                        {tab.request.method.substring(0, 3)}
                                    </span>

                                    {/* Name */}
                                    <span className="truncate">
                                        {tab.request.name || 'Untitled'}
                                    </span>

                                    {/* Loading indicator */}
                                    {tab.isLoading && (
                                        <svg className="w-3 h-3 animate-spin flex-shrink-0 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}

                                    {/* Response status dot */}
                                    {!tab.isLoading && tab.response && (
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tab.response.error ? 'bg-red-400' :
                                                tab.response.status >= 200 && tab.response.status < 300 ? 'bg-emerald-400' :
                                                    tab.response.status >= 400 ? 'bg-amber-400' : 'bg-gray-400'
                                            }`} />
                                    )}

                                    {/* Close button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all"
                                    >
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ===== Active Tab Content ===== */}
                    {activeTab ? (
                        <ResizablePanel
                            direction="vertical"
                            initialSize={340}
                            minSize={150}
                            maxSize={800}
                        >
                            {/* Request Editor */}
                            <div className="h-full p-4 overflow-y-auto">
                                <RequestEditor
                                    request={activeTab.request}
                                    onRequestChange={handleRequestChange}
                                    onSend={handleSend}
                                    isLoading={activeTab.isLoading}
                                />
                            </div>

                            {/* Response */}
                            <div className="h-full p-4 overflow-y-auto">
                                <ResponsePanel
                                    response={activeTab.response}
                                    isLoading={activeTab.isLoading}
                                    onExtractLabels={handleExtractLabels}
                                />

                                {/* Label Picker */}
                                {activeTab.showLabelPicker && activeTab.extractedLabels.length > 1 && (
                                    <div className="mt-4 p-4 bg-white/40 rounded-xl border border-[var(--glass-border)] space-y-3 animate-slide-up">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                                                🏷️ {activeTab.extractedLabels.length} Labels Found
                                            </h3>
                                            <button
                                                onClick={() => updateTab(activeTab.id, { showLabelPicker: false })}
                                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        {activeTab.extractedLabels.map((label, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-[var(--glass-border)] hover:border-[var(--accent-primary)] transition-colors"
                                            >
                                                <div>
                                                    <span className="text-xs font-mono text-[var(--text-secondary)]">
                                                        {label.path}
                                                    </span>
                                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                                        {label.zplContent.substring(0, 80)}...
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => onLabelsExtracted(label.zplContent)}
                                                    className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                                                >
                                                    Preview →
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ResizablePanel>
                    ) : (
                        /* Empty state when no tab is open */
                        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)]">
                            <svg className="w-20 h-20 mb-4 opacity-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-base font-medium mb-1">No Request Open</p>
                            <p className="text-sm">Select a request from the sidebar or create a new one</p>
                        </div>
                    )}
                </div>
            </ResizablePanel>
        </div>
    );
}
