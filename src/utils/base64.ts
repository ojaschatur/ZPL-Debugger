/**
 * Decode a Base64 encoded string.
 * Handles both standard and URL-safe Base64.
 */
export function decodeBase64(input: string): { success: boolean; data?: string; error?: string } {
    try {
        if (!input || typeof input !== 'string') {
            return {
                success: false,
                error: 'Invalid input: Base64 string is empty or not a string'
            };
        }

        const trimmed = input.trim();

        if (!trimmed) {
            return {
                success: false,
                error: 'Base64 string is empty after trimming'
            };
        }

        // Handle URL-safe Base64 (replace - with + and _ with /)
        const standardBase64 = trimmed
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Decode
        const decoded = atob(standardBase64);

        return {
            success: true,
            data: decoded
        };
    } catch (error) {
        return {
            success: false,
            error: `Base64 decode failed: ${error instanceof Error ? error.message : 'Invalid Base64 string'}`
        };
    }
}

/**
 * Encode a string to Base64.
 */
export function encodeBase64(input: string): { success: boolean; data?: string; error?: string } {
    try {
        if (typeof input !== 'string') {
            return {
                success: false,
                error: 'Invalid input: must be a string'
            };
        }

        const encoded = btoa(input);

        return {
            success: true,
            data: encoded
        };
    } catch (error) {
        return {
            success: false,
            error: `Base64 encode failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
