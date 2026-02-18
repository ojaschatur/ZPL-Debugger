/**
 * Label Extraction Utilities
 * Auto-scans JSON responses for base64-encoded ZPL labels,
 * or extracts by configurable JSON path.
 */

export interface ExtractedLabel {
    path: string;       // JSON path where the label was found
    rawData: string;    // Original base64 data
    zplContent: string; // Decoded ZPL
}

/**
 * Auto-scan: Recursively search JSON for base64-encoded ZPL strings.
 * Tries to decode every string field and checks if it starts with ^XA.
 */
export function autoScanLabels(data: unknown, currentPath = ''): ExtractedLabel[] {
    const results: ExtractedLabel[] = [];

    if (typeof data === 'string') {
        // Try base64 decode
        const decoded = tryBase64Decode(data);
        if (decoded && isZplContent(decoded)) {
            results.push({
                path: currentPath,
                rawData: data,
                zplContent: decoded,
            });
        }
        return results;
    }

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const itemPath = `${currentPath}[${index}]`;
            results.push(...autoScanLabels(item, itemPath));
        });
        return results;
    }

    if (data && typeof data === 'object') {
        for (const [key, value] of Object.entries(data)) {
            const keyPath = currentPath ? `${currentPath}.${key}` : key;
            results.push(...autoScanLabels(value, keyPath));
        }
    }

    return results;
}

/**
 * Path-based extraction: Extract values at a specific JSON path.
 * Supports wildcards: shipment.parcels[*].labels[*].data
 */
export function extractByPath(data: unknown, path: string): ExtractedLabel[] {
    const results: ExtractedLabel[] = [];
    const parts = parsePath(path);
    const values = resolvePathParts(data, parts, '');

    for (const { value, resolvedPath } of values) {
        if (typeof value === 'string') {
            const decoded = tryBase64Decode(value);
            if (decoded && isZplContent(decoded)) {
                results.push({
                    path: resolvedPath,
                    rawData: value,
                    zplContent: decoded,
                });
            }
        }
    }

    return results;
}

/**
 * Combined extraction: try configurable path first, then auto-scan.
 */
export function extractLabels(
    responseBody: string,
    labelPath?: string
): { labels: ExtractedLabel[]; method: 'path' | 'auto-scan' | 'xml-tag' } {
    let data: unknown;
    try {
        data = JSON.parse(responseBody);
    } catch {
        // Not JSON — check if it's raw ZPL
        if (isZplContent(responseBody)) {
            return {
                labels: [{
                    path: '(raw)',
                    rawData: '',
                    zplContent: responseBody,
                }],
                method: 'auto-scan',
            };
        }

        // Try XML <LabelData> extraction
        const xmlLabels = extractXmlLabelData(responseBody);
        if (xmlLabels.length > 0) {
            return { labels: xmlLabels, method: 'xml-tag' };
        }

        // Try direct base64 decode
        const decoded = tryBase64Decode(responseBody);
        if (decoded && isZplContent(decoded)) {
            return {
                labels: [{
                    path: '(raw base64)',
                    rawData: responseBody,
                    zplContent: decoded,
                }],
                method: 'auto-scan',
            };
        }
        return { labels: [], method: 'auto-scan' };
    }

    // Try path-based extraction first
    if (labelPath) {
        const pathLabels = extractByPath(data, labelPath);
        if (pathLabels.length > 0) {
            return { labels: pathLabels, method: 'path' };
        }
    }

    // Fall back to auto-scan (also checks for LabelData keys in JSON)
    const autoLabels = autoScanLabels(data);
    return { labels: autoLabels, method: 'auto-scan' };
}

// ===== Helper Functions =====

function tryBase64Decode(str: string): string | null {
    // Quick heuristic: base64 strings are typically long and use only base64 chars
    if (str.length < 20) return null;
    if (!/^[A-Za-z0-9+/=\s]+$/.test(str)) return null;

    try {
        const decoded = atob(str.replace(/\s/g, ''));
        // Check if decoded content is valid text (not binary garbage)
        if (/[\x00-\x08\x0E-\x1F]/.test(decoded.substring(0, 100))) {
            return null; // Contains control characters = probably binary
        }
        return decoded;
    } catch {
        return null;
    }
}

function isZplContent(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.includes('^XA') && trimmed.includes('^XZ');
}

/**
 * Extract ZPL labels from XML/SOAP <LabelData> tags.
 * Handles common tag variations: <LabelData>, <labelData>, <LabelImage>, etc.
 */
function extractXmlLabelData(xmlString: string): ExtractedLabel[] {
    const results: ExtractedLabel[] = [];
    // Match common ZPL label XML tags (case-insensitive)
    const tagPatterns = [
        /<LabelData[^>]*>([^<]+)<\/LabelData>/gi,
        /<labelData[^>]*>([^<]+)<\/labelData>/gi,
        /<LabelImage[^>]*>([^<]+)<\/LabelImage>/gi,
        /<labelImage[^>]*>([^<]+)<\/labelImage>/gi,
        /<Label[^>]*>([^<]{50,})<\/Label>/gi,  // Only match long content (likely base64)
    ];

    const seen = new Set<string>();

    for (const pattern of tagPatterns) {
        let match;
        let index = 0;
        while ((match = pattern.exec(xmlString)) !== null) {
            const rawData = match[1].trim();
            if (seen.has(rawData)) continue;
            seen.add(rawData);

            // Try base64 decode
            const decoded = tryBase64Decode(rawData);
            if (decoded && isZplContent(decoded)) {
                results.push({
                    path: `<${match[0].match(/<(\w+)/)?.[1] || 'LabelData'}>[${index}]`,
                    rawData,
                    zplContent: decoded,
                });
                index++;
            }
        }
    }

    return results;
}

interface PathPart {
    key: string;
    isWildcard: boolean;
    isArrayIndex: boolean;
    index?: number;
}

function parsePath(path: string): PathPart[] {
    const parts: PathPart[] = [];
    const segments = path.split('.');

    for (const segment of segments) {
        const arrayMatch = segment.match(/^(.+?)\[(\*|\d+)\]$/);
        if (arrayMatch) {
            parts.push({ key: arrayMatch[1], isWildcard: false, isArrayIndex: false });
            parts.push({
                key: arrayMatch[2],
                isWildcard: arrayMatch[2] === '*',
                isArrayIndex: true,
                index: arrayMatch[2] === '*' ? undefined : parseInt(arrayMatch[2], 10),
            });
        } else {
            parts.push({ key: segment, isWildcard: false, isArrayIndex: false });
        }
    }

    return parts;
}

function resolvePathParts(
    data: unknown,
    parts: PathPart[],
    currentPath: string
): { value: unknown; resolvedPath: string }[] {
    if (parts.length === 0) {
        return [{ value: data, resolvedPath: currentPath }];
    }

    const [part, ...rest] = parts;

    if (part.isArrayIndex) {
        if (!Array.isArray(data)) return [];

        if (part.isWildcard) {
            const results: { value: unknown; resolvedPath: string }[] = [];
            data.forEach((item, i) => {
                results.push(...resolvePathParts(item, rest, `${currentPath}[${i}]`));
            });
            return results;
        } else if (part.index !== undefined && part.index < data.length) {
            return resolvePathParts(data[part.index], rest, `${currentPath}[${part.index}]`);
        }
        return [];
    }

    if (data && typeof data === 'object' && !Array.isArray(data)) {
        const obj = data as Record<string, unknown>;
        if (part.key in obj) {
            const nextPath = currentPath ? `${currentPath}.${part.key}` : part.key;
            return resolvePathParts(obj[part.key], rest, nextPath);
        }
    }

    return [];
}
