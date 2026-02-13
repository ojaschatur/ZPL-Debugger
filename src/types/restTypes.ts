/**
 * REST API Client Types
 * Compatible with Hoppscotch v10/v16 collection export format
 */

// ===== HTTP Method =====
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ===== Method Colors =====
export const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: '#10b981',      // green
    POST: '#f59e0b',     // amber
    PUT: '#3b82f6',      // blue
    DELETE: '#ef4444',    // red
    PATCH: '#8b5cf6',    // purple
    HEAD: '#6b7280',     // gray
    OPTIONS: '#6b7280',  // gray
};

// ===== Key-Value Pair =====
export interface KeyValuePair {
    id: string;
    key: string;
    value: string;
    active: boolean;
}

// ===== Auth Types =====
export interface HoppAuthNone {
    authType: 'none';
    authActive: boolean;
}

export interface HoppAuthBearer {
    authType: 'bearer';
    token: string;
    authActive: boolean;
}

export interface HoppAuthBasic {
    authType: 'basic';
    username: string;
    password: string;
    authActive: boolean;
}

export interface HoppAuthOAuth2 {
    authType: 'oauth-2';
    authActive: boolean;
    addTo: 'HEADERS' | 'QUERY_PARAMS';
    grantTypeInfo: {
        grantType: 'CLIENT_CREDENTIALS' | 'AUTHORIZATION_CODE' | 'PASSWORD';
        authEndpoint: string;
        tokenEndpoint: string;
        clientID: string;
        clientSecret: string;
        scopes: string;
        clientAuthentication: 'IN_BODY' | 'IN_HEADER';
        token: string;
        isPKCE: boolean;
        codeVerifierMethod: string;
        tokenRequestParams: KeyValuePair[];
        refreshRequestParams: KeyValuePair[];
        authRequestParams: KeyValuePair[];
    };
}

export interface HoppAuthInherit {
    authType: 'inherit';
    authActive: boolean;
}

export type HoppAuth = HoppAuthNone | HoppAuthBearer | HoppAuthBasic | HoppAuthOAuth2 | HoppAuthInherit;

// ===== Request Body =====
export interface HoppBody {
    contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain' | 'none';
    body: string;
}

// ===== Request =====
export interface HoppRequest {
    v: string;
    id: string;
    name: string;
    method: HttpMethod;
    endpoint: string;
    params: KeyValuePair[];
    headers: KeyValuePair[];
    preRequestScript: string;
    testScript: string;
    auth: HoppAuth;
    body: HoppBody;
    requestVariables: KeyValuePair[];
    responses: Record<string, unknown>;
    _ref_id: string;
    // Custom fields for our app
    labelPath?: string; // Configurable JSON path for label extraction
}

// ===== Collection =====
export interface HoppCollection {
    id: string;
    _ref_id?: string;
    v: number;
    name: string;
    folders: HoppCollection[];
    requests: HoppRequest[];
    auth: HoppAuth;
    headers: KeyValuePair[];
    variables?: KeyValuePair[];
}

// ===== REST Response =====
export interface RestResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
    size: number;
    error?: string;
}

// ===== Active Request State =====
export interface ActiveRequest {
    collectionId: string;
    requestId: string;
    // Unsaved edits
    draft?: Partial<HoppRequest>;
    isDirty: boolean;
}

// ===== Collection Tree Item (for sidebar) =====
export interface CollectionTreeItem {
    type: 'collection' | 'folder' | 'request';
    id: string;
    name: string;
    method?: HttpMethod;
    children?: CollectionTreeItem[];
    parentId?: string;
    isExpanded?: boolean;
}

// ===== Helper to generate IDs =====
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ===== Default empty request =====
export function createEmptyRequest(name = 'New Request'): HoppRequest {
    return {
        v: '16',
        id: generateId(),
        name,
        method: 'GET',
        endpoint: '',
        params: [],
        headers: [],
        preRequestScript: '',
        testScript: '',
        auth: { authType: 'none', authActive: true },
        body: { contentType: 'application/json', body: '' },
        requestVariables: [],
        responses: {},
        _ref_id: generateId(),
    };
}

// ===== Default empty collection =====
export function createEmptyCollection(name = 'New Collection'): HoppCollection {
    return {
        id: generateId(),
        v: 10,
        name,
        folders: [],
        requests: [],
        auth: { authType: 'inherit', authActive: true },
        headers: [],
        variables: [],
    };
}
