import { useState, useCallback, useEffect } from 'react';
import type { HoppCollection, HoppRequest } from '../types/restTypes';
import { generateId, createEmptyCollection, createEmptyRequest } from '../types/restTypes';

const STORAGE_KEY = 'zpl-debugger-collections';

/**
 * Custom hook for managing REST API collections with localStorage persistence.
 * Supports full CRUD, import/export, and Hoppscotch format compatibility.
 */
export function useCollections() {
    const [collections, setCollections] = useState<HoppCollection[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist to localStorage on every change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
        } catch (e) {
            console.error('Failed to save collections to localStorage:', e);
        }
    }, [collections]);

    // ===== Collection CRUD =====

    const addCollection = useCallback((name?: string) => {
        const newCollection = createEmptyCollection(name);
        setCollections(prev => [...prev, newCollection]);
        return newCollection;
    }, []);

    const deleteCollection = useCallback((id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
    }, []);

    const renameCollection = useCallback((id: string, newName: string) => {
        setCollections(prev =>
            prev.map(c => c.id === id ? { ...c, name: newName } : c)
        );
    }, []);

    // ===== Request CRUD =====

    const addRequest = useCallback((collectionId: string, name?: string) => {
        const newRequest = createEmptyRequest(name);
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => ({
                ...col,
                requests: [...col.requests, newRequest]
            }))
        );
        return newRequest;
    }, []);

    const deleteRequest = useCallback((collectionId: string, requestId: string) => {
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => ({
                ...col,
                requests: col.requests.filter(r => r.id !== requestId)
            }))
        );
    }, []);

    const updateRequest = useCallback((collectionId: string, requestId: string, updates: Partial<HoppRequest>) => {
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => ({
                ...col,
                requests: col.requests.map(r =>
                    r.id === requestId ? { ...r, ...updates } : r
                )
            }))
        );
    }, []);

    const duplicateRequest = useCallback((collectionId: string, requestId: string) => {
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => {
                const original = col.requests.find(r => r.id === requestId);
                if (!original) return col;
                const duplicate: HoppRequest = {
                    ...original,
                    id: generateId(),
                    name: `${original.name} (copy)`,
                    _ref_id: generateId(),
                };
                return {
                    ...col,
                    requests: [...col.requests, duplicate]
                };
            })
        );
    }, []);

    // ===== Folder CRUD =====

    const addFolder = useCallback((collectionId: string, name?: string) => {
        const newFolder = createEmptyCollection(name || 'New Folder');
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => ({
                ...col,
                folders: [...col.folders, newFolder]
            }))
        );
        return newFolder;
    }, []);

    const deleteFolder = useCallback((collectionId: string, folderId: string) => {
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => ({
                ...col,
                folders: col.folders.filter(f => f.id !== folderId)
            }))
        );
    }, []);

    const renameFolder = useCallback((collectionId: string, folderId: string, newName: string) => {
        setCollections(prev =>
            updateCollectionDeep(prev, collectionId, col => ({
                ...col,
                folders: col.folders.map(f =>
                    f.id === folderId ? { ...f, name: newName } : f
                )
            }))
        );
    }, []);

    // ===== Import/Export =====

    const importCollection = useCallback((jsonString: string): { success: boolean; error?: string; collection?: HoppCollection } => {
        try {
            const parsed = JSON.parse(jsonString);

            // Handle Hoppscotch collection format
            if (parsed.v && parsed.name && parsed.requests) {
                // Ensure all requests have IDs
                const collection: HoppCollection = {
                    ...parsed,
                    id: parsed.id || generateId(),
                    requests: (parsed.requests || []).map((req: HoppRequest) => ({
                        ...req,
                        id: req.id || generateId(),
                    })),
                    folders: (parsed.folders || []).map((folder: HoppCollection) => ({
                        ...folder,
                        id: folder.id || generateId(),
                    })),
                };

                setCollections(prev => [...prev, collection]);
                return { success: true, collection };
            }

            // Handle array of collections
            if (Array.isArray(parsed)) {
                const newCollections = parsed.map(col => ({
                    ...col,
                    id: col.id || generateId(),
                }));
                setCollections(prev => [...prev, ...newCollections]);
                return { success: true };
            }

            return { success: false, error: 'Unrecognized collection format' };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
        }
    }, []);

    const exportCollection = useCallback((id: string): string | null => {
        const collection = collections.find(c => c.id === id);
        if (!collection) return null;
        return JSON.stringify(collection, null, 2);
    }, [collections]);

    const exportAllCollections = useCallback((): string => {
        return JSON.stringify(collections, null, 2);
    }, [collections]);

    // ===== Find Helpers =====

    const findRequest = useCallback((collectionId: string, requestId: string): HoppRequest | null => {
        const collection = findCollectionDeep(collections, collectionId);
        if (!collection) return null;
        return collection.requests.find(r => r.id === requestId) || null;
    }, [collections]);

    const findCollection = useCallback((id: string): HoppCollection | null => {
        return findCollectionDeep(collections, id);
    }, [collections]);

    return {
        collections,
        // Collection CRUD
        addCollection,
        deleteCollection,
        renameCollection,
        // Request CRUD
        addRequest,
        deleteRequest,
        updateRequest,
        duplicateRequest,
        // Folder CRUD
        addFolder,
        deleteFolder,
        renameFolder,
        // Import/Export
        importCollection,
        exportCollection,
        exportAllCollections,
        // Helpers
        findRequest,
        findCollection,
    };
}

// ===== Deep Update Helpers =====

function updateCollectionDeep(
    collections: HoppCollection[],
    targetId: string,
    updater: (col: HoppCollection) => HoppCollection
): HoppCollection[] {
    return collections.map(col => {
        if (col.id === targetId) {
            return updater(col);
        }
        if (col.folders.length > 0) {
            return {
                ...col,
                folders: updateCollectionDeep(col.folders, targetId, updater),
            };
        }
        return col;
    });
}

function findCollectionDeep(
    collections: HoppCollection[],
    targetId: string
): HoppCollection | null {
    for (const col of collections) {
        if (col.id === targetId) return col;
        if (col.folders.length > 0) {
            const found = findCollectionDeep(col.folders, targetId);
            if (found) return found;
        }
    }
    return null;
}
