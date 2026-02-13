/**
 * VBScript Built-in Functions
 * Implementation of common VBScript string, math, and date functions
 */

// ===== String Functions =====

export function vbLeft(str: any, length: number): string {
    const s = String(str);
    return s.substring(0, Math.max(0, length));
}

export function vbRight(str: any, length: number): string {
    const s = String(str);
    return s.substring(Math.max(0, s.length - length));
}

export function vbMid(str: any, start: number, length?: number): string {
    const s = String(str);
    // VBScript is 1-indexed
    const startIndex = Math.max(0, start - 1);

    if (length === undefined) {
        return s.substring(startIndex);
    }
    return s.substring(startIndex, startIndex + length);
}

export function vbReplace(str: any, find: any, replaceWith: any): string {
    const s = String(str);
    const f = String(find);
    const r = String(replaceWith);
    return s.split(f).join(r);
}

export function vbLen(str: any): number {
    return String(str).length;
}

export function vbSplit(str: any, delimiter: any): string[] {
    return String(str).split(String(delimiter));
}

export function vbChr(code: number): string {
    return String.fromCharCode(code);
}

export function vbLCase(str: any): string {
    return String(str).toLowerCase();
}

export function vbUCase(str: any): string {
    return String(str).toUpperCase();
}

export function vbTrim(str: any): string {
    return String(str).trim();
}

// ===== Type Conversion =====

export function vbCStr(value: any): string {
    return String(value);
}

export function vbCInt(value: any): number {
    return Math.floor(Number(value));
}

export function vbCDbl(value: any): number {
    return Number(value);
}

// ===== Type Checking =====

export function vbIsNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

export function vbIsEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
}

// ===== Math Functions =====

export function vbMod(a: number, b: number): number {
    return a % b;
}

// ===== Date Functions =====

export function vbNow(): Date {
    return new Date();
}

export function vbFormat(value: any, formatStr: string): string {
    if (value instanceof Date) {
        return formatDate(value, formatStr);
    }

    // Number formatting
    if (typeof value === 'number' || vbIsNumeric(value)) {
        const num = Number(value);

        // Parse format string for decimal places
        const decimalMatch = formatStr.match(/0+\.0+|#.*#/);
        if (decimalMatch) {
            const decimals = decimalMatch[0].split('.')[1]?.length || 0;
            return num.toFixed(decimals);
        }

        return num.toString();
    }

    return String(value);
}

export function vbFormatNumber(
    value: number,
    decimals: number = 2,
    _includeLeadingDigit: number = -1,
    useParensForNegative: number = 0,
    groupDigits: number = 0
): string {
    let result = value.toFixed(decimals);

    // Handle negative numbers with parentheses
    if (useParensForNegative && value < 0) {
        result = `(${result.substring(1)})`;
    }

    // Group digits with commas
    if (groupDigits) {
        const parts = result.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        result = parts.join('.');
    }

    return result;
}

function formatDate(date: Date, formatStr: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    let result = formatStr;

    // Year
    result = result.replace(/yyyy/g, String(year));
    result = result.replace(/yy/g, String(year).slice(-2));

    // Month
    result = result.replace(/MM/g, String(month).padStart(2, '0'));
    result = result.replace(/M/g, String(month));

    // Day
    result = result.replace(/dd/g, String(day).padStart(2, '0'));
    result = result.replace(/d/g, String(day));

    // Hours
    result = result.replace(/HH/g, String(hours).padStart(2, '0'));
    result = result.replace(/H/g, String(hours));
    result = result.replace(/hh/g, String(hours % 12 || 12).padStart(2, '0'));
    result = result.replace(/h/g, String(hours % 12 || 12));

    // Minutes
    result = result.replace(/mm/g, String(minutes).padStart(2, '0'));
    result = result.replace(/m/g, String(minutes));

    // Seconds
    result = result.replace(/ss/g, String(seconds).padStart(2, '0'));
    result = result.replace(/s/g, String(seconds));

    return result;
}

// ===== String Methods (for object-style calls) =====

export function vbToString(value: any, format?: string): string {
    if (format && value instanceof Date) {
        return formatDate(value, format);
    }
    return String(value);
}

export function vbToUpper(str: any): string {
    return String(str).toUpperCase();
}

export function vbToLower(str: any): string {
    return String(str).toLowerCase();
}

export function vbStringReplace(str: any, find: any, replaceWith: any): string {
    return vbReplace(str, find, replaceWith);
}

export function vbSubstring(str: any, start: number, length?: number): string {
    const s = String(str);
    if (length === undefined) {
        return s.substring(start);
    }
    return s.substring(start, start + length);
}

// ===== Function Registry =====

export const VB_FUNCTIONS: Record<string, Function> = {
    // String functions
    'left': vbLeft,
    'right': vbRight,
    'mid': vbMid,
    'replace': vbReplace,
    'len': vbLen,
    'split': vbSplit,
    'chr': vbChr,
    'lcase': vbLCase,
    'ucase': vbUCase,
    'trim': vbTrim,

    // Type conversion
    'cstr': vbCStr,
    'cint': vbCInt,
    'cdbl': vbCDbl,

    // Type checking
    'isnumeric': vbIsNumeric,
    'isempty': vbIsEmpty,

    // Date/time
    'now': vbNow,
    'format': vbFormat,
    'formatnumber': vbFormatNumber
};

// Helper for method calls on objects
export const VB_METHODS: Record<string, Function> = {
    'tostring': vbToString,
    'toupper': vbToUpper,
    'tolower': vbToLower,
    'replace': vbStringReplace,
    'substring': vbSubstring
};
