/**
 * Template parser for ZPL templates with variable placeholders and script blocks
 */

export interface ScriptRemovalResult {
    cleanedTemplate: string;
    scriptCount: number;
    warnings: string[];
}

/**
 * Extract all variable placeholders from template
 * Matches pattern: <Variable.Name> or <Object.Property.SubProperty>
 * Ignores: <script>, </script>, and other HTML-like tags
 */
export function extractVariables(template: string): string[] {
    const variables = new Set<string>();

    // Match <Variable.Name> pattern, but not <script> tags or special ZPL commands
    // Allows letters, numbers, dots, underscores, and parentheses in variable names
    const regex = /<([A-Za-z][A-Za-z0-9_.()"\s]*)>/g;

    let match;
    while ((match = regex.exec(template)) !== null) {
        const variable = match[1];

        // Skip script tags and common ZPL/HTML tags
        const lowerVar = variable.toLowerCase();
        if (lowerVar === 'script' ||
            lowerVar === '/script' ||
            lowerVar.startsWith('check') ||  // <checkvaldpd>
            lowerVar === '/check') {
            continue;
        }

        variables.add(variable);
    }

    return Array.from(variables).sort();
}

/**
 * Replace variable placeholders with actual values
 * Variables without values are left as-is
 */
export function replaceVariables(
    template: string,
    values: Record<string, string>
): string {
    let result = template;

    // Replace each variable that has a value
    Object.entries(values).forEach(([variable, value]) => {
        if (value !== '') {
            // Escape special regex characters in variable name
            const escapedVar = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`<${escapedVar}>`, 'g');
            result = result.replace(regex, value);
        }
    });

    return result;
}

/**
 * Remove script blocks from template and return warnings
 * Helps users understand that scripts were removed
 */
export function removeScriptBlocks(template: string): ScriptRemovalResult {
    const warnings: string[] = [];
    let scriptCount = 0;

    // Match <script>...</script> blocks (case-insensitive, multiline)
    const scriptRegex = /<script[\s\S]*?<\/script>/gi;

    // Find all script blocks and note their content
    const matches = template.match(scriptRegex);
    if (matches) {
        scriptCount = matches.length;

        matches.forEach((scriptBlock, index) => {
            // Extract first line of script for context
            const lines = scriptBlock.split('\n').filter(line =>
                line.trim() &&
                !line.trim().toLowerCase().startsWith('<script') &&
                !line.trim().toLowerCase().startsWith('</script')
            );

            if (lines.length > 0) {
                const firstLine = lines[0].trim().substring(0, 50);
                warnings.push(`Script ${index + 1}: ${firstLine}${firstLine.length === 50 ? '...' : ''}`);
            }
        });
    }

    // Remove all script blocks
    const cleanedTemplate = template.replace(scriptRegex, '');

    return {
        cleanedTemplate,
        scriptCount,
        warnings
    };
}

/**
 * Get template info summary
 */
export function analyzeTemplate(template: string): {
    variables: string[];
    scriptBlocks: number;
    hasVariables: boolean;
    hasScripts: boolean;
} {
    const variables = extractVariables(template);
    const { scriptCount } = removeScriptBlocks(template);

    return {
        variables,
        scriptBlocks: scriptCount,
        hasVariables: variables.length > 0,
        hasScripts: scriptCount > 0
    };
}

/**
 * Execute script blocks and replace with their output
 */
export async function executeScripts(
    template: string,
    mockData: any
): Promise<{
    processedTemplate: string;
    errors: string[];
}> {
    const errors: string[] = [];
    let processedTemplate = template;

    // Import interpreter dynamically
    try {
        const { executeVBScript } = await import('./vbscript/interpreter');

        // Find all script blocks
        const scriptRegex = /<script[\s\S]*?<\/script>/gi;
        const matches = template.match(scriptRegex);

        if (matches) {
            for (const scriptBlock of matches) {
                // Extract script content
                const scriptContent = scriptBlock
                    .replace(/<script[\s\S]*?>/i, '')
                    .replace(/<\/script>/i, '')
                    .trim();

                // Execute script
                const result = executeVBScript(scriptContent, mockData);

                if (result.success) {
                    // Replace script block with output
                    processedTemplate = processedTemplate.replace(scriptBlock, result.output);
                } else {
                    errors.push(result.error || 'Script execution failed');
                    // Remove failed script block
                    processedTemplate = processedTemplate.replace(scriptBlock, '');
                }
            }
        }
    } catch (error) {
        errors.push(`Script execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
        processedTemplate,
        errors
    };
}


/**
 * Extract variable references from script blocks
 * Finds patterns like Shipment.OrderNo, Parcel.Weight, etc.
 */
export function extractScriptVariables(template: string): string[] {
    const variables = new Set<string>();
    
    // Find all script blocks
    const scriptRegex = /<script[\s\S]*?<\/script>/gi;
    const matches = template.match(scriptRegex);
    
    if (matches) {
        matches.forEach(scriptBlock => {
            // Match object.property patterns
            // Matches: Shipment.Status, Parcel.Weight, Shipment.Sender.Name, etc.
            const varRegex = /\b(Shipment|Parcel|shipment|parcel)\.[\w.()]+/g;
            const vars = scriptBlock.match(varRegex);
            
            if (vars) {
                vars.forEach(v => {
                    // Clean up: remove function calls like .ToString()
                    const cleaned = v.replace(/\.[a-z]+\([^)]*\)$/i, '');
                    variables.add(cleaned);
                });
            }
        });
    }
    
    return Array.from(variables).sort();
}
