// ===== Application Types =====

export type InputMode = 'api' | 'paste';

export interface RenderSettings {
    dpmm: number;
    widthMm: number;
    heightMm: number;
}

export interface ParseResult {
    success: boolean;
    labelData?: string;
    error?: string;
}

export interface ZplError {
    id: string;
    type: 'syntax' | 'rendering';
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
