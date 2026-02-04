import type { ParseResult } from '../types';

/**
 * Parse XML SOAP response and extract LabelData content.
 * Uses native DOMParser for XML parsing.
 * 
 * Designed with abstraction layer for easy JSON support later.
 */
export function parseXmlResponse(xmlString: string): ParseResult {
    try {
        // Validate input
        if (!xmlString || typeof xmlString !== 'string') {
            return {
                success: false,
                error: 'Invalid input: XML string is empty or not a string'
            };
        }

        const trimmedXml = xmlString.trim();

        if (!trimmedXml) {
            return {
                success: false,
                error: 'XML string is empty after trimming'
            };
        }

        // Parse XML using DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(trimmedXml, 'text/xml');

        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
            return {
                success: false,
                error: `XML Parse Error: ${parseError.textContent || 'Unknown parsing error'}`
            };
        }

        // Find LabelData element (handles namespaced XML)
        // Try multiple approaches since SOAP responses can have various namespace configurations
        let labelDataElement: Element | null = null;

        // Approach 1: Try getElementsByTagName (ignores namespaces)
        const labelDataElements = xmlDoc.getElementsByTagName('LabelData');
        if (labelDataElements.length > 0) {
            labelDataElement = labelDataElements[0];
        }

        // Approach 2: Try with namespace-aware query
        if (!labelDataElement) {
            // Use XPath-like query for any element named LabelData
            labelDataElement = xmlDoc.querySelector('*|LabelData');
        }

        // Approach 3: Walk through all elements
        if (!labelDataElement) {
            const allElements = xmlDoc.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i];
                if (el.localName === 'LabelData' || el.tagName.endsWith(':LabelData')) {
                    labelDataElement = el;
                    break;
                }
            }
        }

        if (!labelDataElement) {
            return {
                success: false,
                error: 'LabelData element not found in the XML response. Please ensure the response contains a <LabelData> element.'
            };
        }

        // Extract text content
        const labelData = labelDataElement.textContent?.trim();

        if (!labelData) {
            return {
                success: false,
                error: 'LabelData element is empty'
            };
        }

        return {
            success: true,
            labelData
        };

    } catch (error) {
        return {
            success: false,
            error: `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Extract and decode ZPL from a response.
 * This is the main function to use - it handles parsing and Base64 decoding.
 */
export function extractZplFromXml(xmlString: string): ParseResult {
    const parseResult = parseXmlResponse(xmlString);

    if (!parseResult.success || !parseResult.labelData) {
        return parseResult;
    }

    // Decode Base64
    try {
        const decodedZpl = atob(parseResult.labelData);
        return {
            success: true,
            labelData: decodedZpl
        };
    } catch (error) {
        return {
            success: false,
            error: `Failed to decode Base64: ${error instanceof Error ? error.message : 'Invalid Base64 encoding'}`
        };
    }
}
