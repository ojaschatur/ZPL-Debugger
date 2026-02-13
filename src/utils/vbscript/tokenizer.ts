/**
 * VBScript Tokenizer - Lexical Analysis
 * Converts VBScript source code into tokens for parsing
 */

export enum TokenType {
    // Keywords
    IF = 'IF',
    THEN = 'THEN',
    ELSE = 'ELSE',
    ELSEIF = 'ELSEIF',
    END = 'END',
    DIM = 'DIM',
    AS = 'AS',
    FOR = 'FOR',
    TO = 'TO',
    NEXT = 'NEXT',
    RETURN = 'RETURN',
    AND = 'AND',
    OR = 'OR',
    ANDALSO = 'ANDALSO',
    NOT = 'NOT',
    REM = 'REM',

    // Literals
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    IDENTIFIER = 'IDENTIFIER',

    // Operators
    EQUALS = 'EQUALS',              // =
    NOT_EQUALS = 'NOT_EQUALS',      // <>
    LESS_THAN = 'LESS_THAN',        // <
    GREATER_THAN = 'GREATER_THAN',  // >
    LESS_EQUAL = 'LESS_EQUAL',      // <=
    GREATER_EQUAL = 'GREATER_EQUAL',// >=
    PLUS = 'PLUS',                  // +
    MINUS = 'MINUS',                // -
    MULTIPLY = 'MULTIPLY',          // *
    DIVIDE = 'DIVIDE',              // /
    MOD = 'MOD',                    // Mod
    CONCAT = 'CONCAT',              // &

    // Delimiters
    LPAREN = 'LPAREN',              // (
    RPAREN = 'RPAREN',              // )
    COMMA = 'COMMA',                // ,
    DOT = 'DOT',                    // .

    // Special
    NEWLINE = 'NEWLINE',
    EOF = 'EOF'
}

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

const KEYWORDS: Record<string, TokenType> = {
    'if': TokenType.IF,
    'then': TokenType.THEN,
    'else': TokenType.ELSE,
    'elseif': TokenType.ELSEIF,
    'end': TokenType.END,
    'dim': TokenType.DIM,
    'as': TokenType.AS,
    'for': TokenType.FOR,
    'to': TokenType.TO,
    'next': TokenType.NEXT,
    'return': TokenType.RETURN,
    'and': TokenType.AND,
    'or': TokenType.OR,
    'andalso': TokenType.ANDALSO,
    'not': TokenType.NOT,
    'mod': TokenType.MOD,
    'rem': TokenType.REM
};

export class Tokenizer {
    private input: string;
    private pos: number;
    private line: number;
    private column: number;
    private tokens: Token[];

    constructor(input: string) {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    tokenize(): Token[] {
        while (this.pos < this.input.length) {
            this.skipWhitespace();

            if (this.pos >= this.input.length) break;

            const char = this.current();

            // Comments (REM or ')
            if (this.matchKeyword('rem') || char === "'") {
                this.skipComment();
                continue;
            }

            // Newlines
            if (char === '\n' || char === '\r') {
                this.addToken(TokenType.NEWLINE, char);
                this.advance();
                if (char === '\r' && this.current() === '\n') {
                    this.advance(); // Skip \r\n
                }
                this.line++;
                this.column = 1;
                continue;
            }

            // Strings
            if (char === '"') {
                this.scanString();
                continue;
            }

            // Numbers
            if (this.isDigit(char)) {
                this.scanNumber();
                continue;
            }

            // Identifiers and keywords
            if (this.isAlpha(char)) {
                this.scanIdentifier();
                continue;
            }

            // Operators and delimiters
            if (this.scanOperator()) {
                continue;
            }

            // Unknown character, skip it
            this.advance();
        }

        this.addToken(TokenType.EOF, '');
        return this.tokens;
    }

    private current(): string {
        if (this.pos >= this.input.length) return '\0';
        return this.input[this.pos];
    }

    private peek(offset: number = 1): string {
        const pos = this.pos + offset;
        if (pos >= this.input.length) return '\0';
        return this.input[pos];
    }

    private advance(): string {
        const char = this.current();
        this.pos++;
        this.column++;
        return char;
    }

    private skipWhitespace(): void {
        while (this.pos < this.input.length) {
            const char = this.current();
            if (char === ' ' || char === '\t') {
                this.advance();
            } else {
                break;
            }
        }
    }

    private skipComment(): void {
        // Skip until end of line
        while (this.current() !== '\n' && this.current() !== '\r' && this.pos < this.input.length) {
            this.advance();
        }
    }

    private matchKeyword(keyword: string): boolean {
        const len = keyword.length;
        if (this.pos + len > this.input.length) return false;

        const slice = this.input.slice(this.pos, this.pos + len).toLowerCase();
        if (slice === keyword.toLowerCase()) {
            // Check that it's not part of a larger word
            const nextChar = this.peek(len - 1);
            if (nextChar && this.isAlphaNumeric(nextChar)) return false;
            return true;
        }
        return false;
    }

    private scanString(): void {
        const startLine = this.line;
        const startColumn = this.column;

        this.advance(); // Skip opening "

        let value = '';
        while (this.current() !== '"' && this.pos < this.input.length) {
            if (this.current() === '\n' || this.current() === '\r') {
                // Multi-line strings not supported in VBScript
                break;
            }
            value += this.advance();
        }

        if (this.current() === '"') {
            this.advance(); // Skip closing "
        }

        this.tokens.push({
            type: TokenType.STRING,
            value,
            line: startLine,
            column: startColumn
        });
    }

    private scanNumber(): void {
        const startLine = this.line;
        const startColumn = this.column;

        let value = '';
        while (this.isDigit(this.current())) {
            value += this.advance();
        }

        // Handle decimal point
        if (this.current() === '.' && this.isDigit(this.peek())) {
            value += this.advance(); // Add .
            while (this.isDigit(this.current())) {
                value += this.advance();
            }
        }

        this.tokens.push({
            type: TokenType.NUMBER,
            value,
            line: startLine,
            column: startColumn
        });
    }

    private scanIdentifier(): void {
        const startLine = this.line;
        const startColumn = this.column;

        let value = '';
        while (this.isAlphaNumeric(this.current()) || this.current() === '_') {
            value += this.advance();
        }

        const lowerValue = value.toLowerCase();
        const tokenType = KEYWORDS[lowerValue] || TokenType.IDENTIFIER;

        this.tokens.push({
            type: tokenType,
            value,
            line: startLine,
            column: startColumn
        });
    }

    private scanOperator(): boolean {
        const startLine = this.line;
        const startColumn = this.column;
        const char = this.current();
        const next = this.peek();

        // Two-character operators
        if (char === '<' && next === '>') {
            this.advance();
            this.advance();
            this.addTokenAt(TokenType.NOT_EQUALS, '<>', startLine, startColumn);
            return true;
        }
        if (char === '<' && next === '=') {
            this.advance();
            this.advance();
            this.addTokenAt(TokenType.LESS_EQUAL, '<=', startLine, startColumn);
            return true;
        }
        if (char === '>' && next === '=') {
            this.advance();
            this.advance();
            this.addTokenAt(TokenType.GREATER_EQUAL, '>=', startLine, startColumn);
            return true;
        }

        // Single-character operators
        const singleOps: Record<string, TokenType> = {
            '=': TokenType.EQUALS,
            '<': TokenType.LESS_THAN,
            '>': TokenType.GREATER_THAN,
            '+': TokenType.PLUS,
            '-': TokenType.MINUS,
            '*': TokenType.MULTIPLY,
            '/': TokenType.DIVIDE,
            '&': TokenType.CONCAT,
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            ',': TokenType.COMMA,
            '.': TokenType.DOT
        };

        if (char in singleOps) {
            this.advance();
            this.addTokenAt(singleOps[char], char, startLine, startColumn);
            return true;
        }

        return false;
    }

    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    private isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            char === '_';
    }

    private isAlphaNumeric(char: string): boolean {
        return this.isAlpha(char) || this.isDigit(char);
    }

    private addToken(type: TokenType, value: string): void {
        this.tokens.push({
            type,
            value,
            line: this.line,
            column: this.column
        });
    }

    private addTokenAt(type: TokenType, value: string, line: number, column: number): void {
        this.tokens.push({
            type,
            value,
            line,
            column
        });
    }
}

/**
 * Utility function to tokenize VBScript code
 */
export function tokenize(code: string): Token[] {
    const tokenizer = new Tokenizer(code);
    return tokenizer.tokenize();
}
