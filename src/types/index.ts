// ===== Application Types =====

export type InputMode = 'paste' | 'upload' | 'api';
export type ErrorType = 'syntax' | 'rendering' | 'template';
export interface RenderSettings {
    dpmm: number;
    widthMm: number;
    heightMm: number;
    unit: 'mm' | 'inches';
    rotation: 0 | 90 | 180 | 270;
}

export interface ParseResult {
    success: boolean;
    labelData?: string;
    error?: string;
}

export interface ZplError {
    id: string;
    type: ErrorType;
    message: string;
    line?: number;
    timestamp: Date;
}

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export interface ApiRequest {
    url: string;
    headers: string;
    body: string;
}

export interface ApiResponse {
    success: boolean;
    data?: string;
    status?: number;
    error?: string;
}

// Template support types
export interface VariablePreset {
    name: string;
    values: Record<string, string>;
}

export interface TemplateInfo {
    variables: string[];
    scriptBlocks: number;
    hasVariables: boolean;
    hasScripts: boolean;
}

// ===== Worker Message Types =====

export interface RenderRequest {
    type: 'render';
    zpl: string;
    widthMm: number;
    heightMm: number;
    dpmm: number;
}

export interface RenderResponse {
    type: 'render-result';
    success: boolean;
    image?: string;
    error?: string;
}

export interface WorkerReadyMessage {
    type: 'ready';
}

export type WorkerMessage = RenderRequest;
export type WorkerResponse = RenderResponse | WorkerReadyMessage;
