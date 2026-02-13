/**
 * Simplified VBScript Interpreter
 * Handles common template patterns without full AST parsing
 */

import { VB_FUNCTIONS } from './builtins';

export interface ScriptExecutionResult {
    success: boolean;
    output: string;
    error?: string;
}

export class VBScriptInterpreter {
    private context: Record<string, any>; // Changed from MockDataContext to flat key-value
    private variables: Map<string, any>;

    constructor(context: Record<string, any>) {
        this.context = context;
        this.variables = new Map();
    }

    /**
     * Execute a VBScript block and return the result
     */
    execute(code: string): ScriptExecutionResult {
        console.log('[DEBUG] Executing script:', code);
        try {
            const result = this.evaluateScript(code);
            console.log('[DEBUG] Script returned:', result, 'type:', typeof result);
            const output = result !== null && result !== undefined ? String(result) : '';
            console.log('[DEBUG] Final output:', output);
            return {
                success: true,
                output
            };
        } catch (error) {
            console.log('[DEBUG] Script error:', error);
            return {
                success: false,
                output: '',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    private evaluateScript(code: string): any {
        const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        for (const line of lines) {
            // Skip comments
            if (line.toLowerCase().startsWith('rem ') || line.startsWith("'")) {
                continue;
            }

            // Handle return statement
            if (line.toLowerCase().startsWith('return ')) {
                const expr = line.substring(7).trim();
                const returnValue = this.evaluateExpression(expr);
                console.log('[DEBUG] Return statement evaluated to:', returnValue, 'type:', typeof returnValue);
                return returnValue;
            }

            // Handle dim statement (variable declaration)
            if (line.toLowerCase().startsWith('dim ')) {
                this.handleDimStatement(line);
                continue;
            }

            // Handle if statement (simplified - single line or block)
            if (line.toLowerCase().startsWith('if ')) {
                const result = this.handleIfStatement(code, lines);
                if (result !== undefined) {
                    return result;
                }
            }

            // Handle for loop (simplified)
            if (line.toLowerCase().startsWith('for ')) {
                const result = this.handleForLoop(code);
                if (result !== undefined) {
                    return result;
                }
            }

            // Handle assignment
            if (line.includes('=') && !this.isComparison(line)) {
                this.handleAssignment(line);
            }
        }

        return '';
    }

    private handleDimStatement(line: string): void {
        // Extract variable name and optional type
        // Examples: "dim sResult", "dim i = 0", "dim items As string()"
        const dimMatch = line.match(/dim\s+(\w+)(?:\s*=\s*(.+))?/i);
        if (dimMatch) {
            const varName = dimMatch[1];
            const initialValue = dimMatch[2] ? this.evaluateExpression(dimMatch[2]) : '';
            this.variables.set(varName, initialValue);
        }
    }

    private handleAssignment(line: string): void {
        const parts = line.split('=');
        if (parts.length < 2) return;

        const varName = parts[0].trim();
        const expr = parts.slice(1).join('=').trim();

        const value = this.evaluateExpression(expr);
        this.variables.set(varName, value);
    }

    private handleIfStatement(fullCode: string, _lines: string[]): any {
        // Handle if/elseif/else/end if blocks
        // Split by elseif to handle multiple conditions
        const lines = fullCode.split('\n').map(l => l.trim());

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].toLowerCase();

            // Found an if statement
            if (line.startsWith('if ')) {
                const ifMatch = line.match(/if\s+(.+?)\s+then/i);
                if (ifMatch) {
                    const condition = ifMatch[1];

                    // Collect the then block until elseif/else/end if
                    const thenBlock: string[] = [];
                    i++;

                    while (i < lines.length) {
                        const currentLine = lines[i];
                        const lowerLine = currentLine.toLowerCase();

                        if (lowerLine.startsWith('elseif ') || lowerLine.startsWith('else') || lowerLine.startsWith('end if')) {
                            break;
                        }
                        thenBlock.push(currentLine);
                        i++;
                    }

                    // Check condition
                    if (this.evaluateCondition(condition)) {
                        console.log('[DEBUG] If condition TRUE, executing then block:', thenBlock.join('\n'));
                        const result = this.evaluateScript(thenBlock.join('\n'));
                        console.log('[DEBUG] Then block returned:', result);
                        return result;
                    }

                    // Handle elseif chain
                    while (i < lines.length && lines[i].toLowerCase().startsWith('elseif ')) {
                        const elseifMatch = lines[i].match(/elseif\s+(.+?)\s+then/i);
                        if (elseifMatch) {
                            const elseifCondition = elseifMatch[1];
                            const elseifBlock: string[] = [];
                            i++;

                            while (i < lines.length) {
                                const currentLine = lines[i];
                                const lowerLine = currentLine.toLowerCase();

                                if (lowerLine.startsWith('elseif ') || lowerLine.startsWith('else') || lowerLine.startsWith('end if')) {
                                    break;
                                }
                                elseifBlock.push(currentLine);
                                i++;
                            }

                            if (this.evaluateCondition(elseifCondition)) {
                                return this.evaluateScript(elseifBlock.join('\n'));
                            }
                        }
                    }

                    // Handle else block
                    if (i < lines.length && lines[i].toLowerCase().startsWith('else')) {
                        const elseBlock: string[] = [];
                        i++;

                        while (i < lines.length && !lines[i].toLowerCase().startsWith('end if')) {
                            elseBlock.push(lines[i]);
                            i++;
                        }

                        return this.evaluateScript(elseBlock.join('\n'));
                    }
                }
            }
            i++;
        }

        return undefined;
    }

    private handleForLoop(code: string): any {
        // Simplified for loop: for i = start to end ... next
        const forMatch = code.match(/for\s+(\w+)\s*=\s*(.+?)\s+to\s+(.+?)\s*\n([\s\S]*?)next/i);

        if (forMatch) {
            const varName = forMatch[1];
            const start = this.evaluateExpression(forMatch[2]);
            const end = this.evaluateExpression(forMatch[3]);
            const body = forMatch[4];

            let result: any;
            for (let i = Number(start); i <= Number(end); i++) {
                this.variables.set(varName, i);
                result = this.evaluateScript(body);
            }
            return result;
        }

        return undefined;
    }

    private evaluateCondition(condition: string): boolean {
        const result = this.evaluateExpression(condition);

        // VBScript truthiness
        if (typeof result === 'boolean') return result;
        if (typeof result === 'number') return result !== 0;
        if (typeof result === 'string') return result.toLowerCase() === 'true' || result !== '';

        return Boolean(result);
    }

    private evaluateExpression(expr: string): any {
        expr = expr.trim();

        // String concatenation with & - CHECK FIRST before string literals
        // This handles: "text" & variable & "text"
        if (expr.includes('&')) {
            return this.evaluateStringConcat(expr);
        }

        // **NOW check string literals (simple quoted strings with no operators)**
        // This handles: "simple text"
        if (expr.startsWith('"') && expr.endsWith('"')) {
            const stringValue = expr.slice(1, -1);
            console.log('[DEBUG] String literal:', stringValue);
            return stringValue;
        }

        // Comparison operators
        if (expr.includes('=') || expr.includes('<>') || expr.includes('>=') ||
            expr.includes('<=') || expr.includes('>') || expr.includes('<')) {
            return this.evaluateComparison(expr);
        }

        // Logical operators
        if (expr.toLowerCase().includes(' and ') || expr.toLowerCase().includes(' or ') ||
            expr.toLowerCase().includes(' andalso ')) {
            return this.evaluateLogical(expr);
        }

        // Math operators
        if (expr.match(/[\+\-\*\/]/)) {
            return this.evaluateMath(expr);
        }

        // Function call
        if (expr.includes('(') && expr.includes(')')) {
            return this.evaluateFunctionCall(expr);
        }

        // Property access or method call
        if (expr.includes('.')) {
            return this.evaluatePropertyAccess(expr);
        }

        // Number literal
        if (/^-?\d+\.?\d*$/.test(expr)) {
            return Number(expr);
        }

        // Variable
        if (this.variables.has(expr)) {
            return this.variables.get(expr);
        }

        // Unknown - return as string
        return expr;
    }

    private evaluateStringConcat(expr: string): string {
        // Split by & but respect quotes
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];

            if (char === '"') {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === '&' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current) parts.push(current.trim());

        return parts.map(p => String(this.evaluateExpression(p))).join('');
    }

    private evaluateComparison(expr: string): boolean {
        // Handle <>, >=, <=, =, >, <
        let operator = '';
        let parts: string[] = [];

        if (expr.includes('<>')) {
            operator = '<>';
            parts = expr.split('<>');
        } else if (expr.includes('>=')) {
            operator = '>=';
            parts = expr.split('>=');
        } else if (expr.includes('<=')) {
            operator = '<=';
            parts = expr.split('<=');
        } else if (expr.includes('=')) {
            operator = '=';
            parts = expr.split('=');
        } else if (expr.includes('>')) {
            operator = '>';
            parts = expr.split('>');
        } else if (expr.includes('<')) {
            operator = '<';
            parts = expr.split('<');
        }

        if (parts.length < 2) return false;

        const left = this.evaluateExpression(parts[0].trim());
        const right = this.evaluateExpression(parts.slice(1).join(operator).trim());

        console.log(`[DEBUG] Comparing: "${left}" ${operator} "${right}" (types: ${typeof left}, ${typeof right})`);

        let result = false;
        switch (operator) {
            case '=': result = left == right; break;  // VBScript uses == semantics
            case '<>': result = left != right; break;
            case '>': result = Number(left) > Number(right); break;
            case '<': result = Number(left) < Number(right); break;
            case '>=': result = Number(left) >= Number(right); break;
            case '<=': result = Number(left) <= Number(right); break;
        }

        console.log(`[DEBUG] Result: ${result}`);
        return result;
    }

    private evaluateLogical(expr: string): boolean {
        const lowerExpr = expr.toLowerCase();

        if (lowerExpr.includes(' andalso ')) {
            const parts = expr.split(/andalso/i);
            return parts.every(p => this.evaluateCondition(p.trim()));
        }

        if (lowerExpr.includes(' and ')) {
            const parts = expr.split(/and/i);
            return parts.every(p => this.evaluateCondition(p.trim()));
        }

        if (lowerExpr.includes(' or ')) {
            const parts = expr.split(/or/i);
            return parts.some(p => this.evaluateCondition(p.trim()));
        }

        return false;
    }

    private evaluateMath(expr: string): number {
        // Very simple math evaluation
        try {
            // Replace variables with values
            let processed = expr;
            this.variables.forEach((value, key) => {
                processed = processed.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
            });

            // Use Function constructor for safe eval (limited scope)
            return Number(new Function(`return ${processed}`)());
        } catch {
            return 0;
        }
    }

    private evaluateFunctionCall(expr: string): any {
        const match = expr.match(/(\w+)\((.*)\)/);
        if (!match) return expr;

        const funcName = match[1].toLowerCase();
        const argsStr = match[2];

        // Parse arguments
        const args = this.parseArguments(argsStr);
        const evaluatedArgs = args.map(arg => this.evaluateExpression(arg));

        // Check built-in functions
        if (VB_FUNCTIONS[funcName]) {
            return VB_FUNCTIONS[funcName](...evaluatedArgs);
        }

        return expr;
    }

    private evaluatePropertyAccess(expr: string): any {
        console.log(`[DEBUG] Looking up property: "${expr}"`);
        console.log(`[DEBUG] Available context keys:`, Object.keys(this.context));

        // For flat context like {"Shipment.Status": "99", "Shipment.OrderNo": "12345"}
        // VBScript is case-insensitive, so we need to do case-insensitive lookup

        // First try exact match
        if (this.context[expr] !== undefined) {
            console.log(`[DEBUG] Found exact match: ${this.context[expr]}`);
            return this.context[expr];
        }

        // Try case-insensitive match
        const lowerExpr = expr.toLowerCase();
        for (const key of Object.keys(this.context)) {
            if (key.toLowerCase() === lowerExpr) {
                console.log(`[DEBUG] Found case-insensitive match: ${this.context[key]}`);
                return this.context[key];
            }
        }

        const parts = expr.split('.');

        // Try to find longest matching key
        for (let i = parts.length; i > 0; i--) {
            const key = parts.slice(0, i).join('.');
            const lowerKey = key.toLowerCase();

            // Case-insensitive search
            for (const contextKey of Object.keys(this.context)) {
                if (contextKey.toLowerCase() === lowerKey) {
                    let current = this.context[contextKey];

                    // Continue with remaining parts if any
                    const remainingParts = parts.slice(i);
                    for (const part of remainingParts) {
                        if (!current) break;
                        current = current?.[part];
                    }
                    console.log(`[DEBUG] Found partial match with remaining: ${current}`);
                    return current;
                }
            }
        }

        // Check variables
        if (this.variables.has(parts[0])) {
            let current = this.variables.get(parts[0]);
            for (let i = 1; i < parts.length; i++) {
                if (!current) break;
                current = current?.[parts[i]];
            }
            console.log(`[DEBUG] Found in variables: ${current}`);
            return current;
        }

        console.log(`[DEBUG] Property not found, returning undefined`);
        return undefined;
    }

    private parseArguments(argsStr: string): string[] {
        if (!argsStr.trim()) return [];

        const args: string[] = [];
        let current = '';
        let depth = 0;
        let inQuotes = false;

        for (const char of argsStr) {
            if (char === '"') {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === '(' && !inQuotes) {
                depth++;
                current += char;
            } else if (char === ')' && !inQuotes) {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0 && !inQuotes) {
                args.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) args.push(current.trim());

        return args;
    }

    private isComparison(line: string): boolean {
        return line.includes('==') || line.includes('!=') ||
            line.includes(' = ') && (line.includes('>') || line.includes('<') ||
                line.toLowerCase().includes('if ') || line.toLowerCase().includes('then'));
    }
}

/**
 * Execute VBScript code with flat variable context
 */
export function executeVBScript(code: string, context: Record<string, any>): ScriptExecutionResult {
    const interpreter = new VBScriptInterpreter(context);
    return interpreter.execute(code);
}
