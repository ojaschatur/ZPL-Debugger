export interface ValidationError {
    line?: number;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}

/**
 * Validates ZPL code for common syntax errors and issues
 */
export function validateZpl(zpl: string): ValidationResult {
    const errors: ValidationError[] = [];
    const lines = zpl.split('\n');

    // Trim whitespace and filter empty lines for analysis
    const nonEmptyLines = lines
        .map((line, idx) => ({ content: line.trim(), lineNumber: idx + 1 }))
        .filter(l => l.content.length > 0 && !l.content.startsWith('^FX'));

    if (nonEmptyLines.length === 0) {
        errors.push({
            message: 'ZPL code is empty',
            severity: 'error'
        });
        return { valid: false, errors };
    }

    // Check for ^XA (Start Format) command
    const hasStartCommand = nonEmptyLines.some(l => l.content.includes('^XA'));
    if (!hasStartCommand) {
        errors.push({
            line: 1,
            message: 'Missing ^XA (Start Format) command. ZPL must begin with ^XA',
            severity: 'error'
        });
    }

    // Check for ^XZ (End Format) command
    const hasEndCommand = nonEmptyLines.some(l => l.content.includes('^XZ'));
    if (!hasEndCommand) {
        errors.push({
            line: lines.length,
            message: 'Missing ^XZ (End Format) command. ZPL must end with ^XZ',
            severity: 'error'
        });
    }

    // Check for balanced ^XA and ^XZ
    const xaCount = zpl.split('^XA').length - 1;
    const xzCount = zpl.split('^XZ').length - 1;
    if (xaCount !== xzCount) {
        errors.push({
            message: `Unbalanced format commands: ${xaCount} ^XA but ${xzCount} ^XZ`,
            severity: 'error'
        });
    }

    // Check for commands with incomplete syntax (common errors)
    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Check for orphaned ^ characters
        if (trimmed.includes('^') && !trimmed.match(/\^[A-Z]{1,2}/)) {
            errors.push({
                line: idx + 1,
                message: 'Invalid command syntax - incomplete or malformed command',
                severity: 'warning'
            });
        }

        // Check for FD without closing FS
        if (trimmed.includes('^FD') && !trimmed.includes('^FS') && !line.includes('^FD') && line.includes('^FS')) {
            errors.push({
                line: idx + 1,
                message: 'Field data (^FD) not properly closed with ^FS',
                severity: 'warning'
            });
        }
    });

    // Warning for very large coordinates (might be off-label)
    const coordinatePattern = /\^FO(\d+),(\d+)/g;
    let match;
    const fullText = zpl;
    while ((match = coordinatePattern.exec(fullText)) !== null) {
        const x = parseInt(match[1]);
        const y = parseInt(match[2]);
        if (x > 2000 || y > 2000) {
            errors.push({
                message: `Possibly invalid coordinates at ^FO${x},${y} - coordinates seem very large`,
                severity: 'warning'
            });
        }
    }

    return {
        valid: errors.filter(e => e.severity === 'error').length === 0,
        errors
    };
}
