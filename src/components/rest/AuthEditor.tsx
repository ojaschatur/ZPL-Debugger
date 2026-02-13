import { useState } from 'react';
import type { HoppAuth } from '../../types/restTypes';

interface AuthEditorProps {
    auth: HoppAuth;
    onChange: (auth: HoppAuth) => void;
}

type AuthType = 'none' | 'bearer' | 'basic' | 'oauth-2';

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
    const [showSecret, setShowSecret] = useState(false);

    const handleTypeChange = (authType: AuthType) => {
        switch (authType) {
            case 'none':
                onChange({ authType: 'none', authActive: true });
                break;
            case 'bearer':
                onChange({ authType: 'bearer', token: '', authActive: true });
                break;
            case 'basic':
                onChange({ authType: 'basic', username: '', password: '', authActive: true });
                break;
            case 'oauth-2':
                onChange({
                    authType: 'oauth-2',
                    authActive: true,
                    addTo: 'HEADERS',
                    grantTypeInfo: {
                        grantType: 'CLIENT_CREDENTIALS',
                        authEndpoint: '',
                        tokenEndpoint: '',
                        clientID: '',
                        clientSecret: '',
                        scopes: '',
                        clientAuthentication: 'IN_BODY',
                        token: '',
                        isPKCE: false,
                        codeVerifierMethod: 'S256',
                        tokenRequestParams: [],
                        refreshRequestParams: [],
                        authRequestParams: [],
                    },
                });
                break;
        }
    };

    return (
        <div className="space-y-4">
            {/* Auth Type Selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Authorization
                </span>
                <div className="flex gap-1 bg-white/30 rounded-lg p-0.5">
                    {(['none', 'bearer', 'basic', 'oauth-2'] as AuthType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => handleTypeChange(type)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${auth.authType === type
                                    ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50'
                                }`}
                        >
                            {type === 'oauth-2' ? 'OAuth 2.0' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Auth Fields */}
            {auth.authType === 'none' && (
                <div className="flex items-center justify-center h-24 text-sm text-[var(--text-muted)] bg-white/20 rounded-xl border border-dashed border-[var(--glass-border)]">
                    No authorization required
                </div>
            )}

            {auth.authType === 'bearer' && (
                <div className="space-y-3">
                    <label className="block">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Token</span>
                        <textarea
                            value={auth.token}
                            onChange={e => onChange({ ...auth, token: e.target.value })}
                            placeholder="Enter bearer token..."
                            className="mt-1 w-full px-3 py-2 text-sm font-mono rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors resize-y h-20"
                        />
                    </label>
                    <p className="text-[10px] text-[var(--text-muted)]">
                        The token will be sent as: <code className="bg-white/40 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>
                    </p>
                </div>
            )}

            {auth.authType === 'basic' && (
                <div className="space-y-3">
                    <label className="block">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Username</span>
                        <input
                            type="text"
                            value={auth.username}
                            onChange={e => onChange({ ...auth, username: e.target.value })}
                            placeholder="Enter username..."
                            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Password</span>
                        <input
                            type={showSecret ? 'text' : 'password'}
                            value={auth.password}
                            onChange={e => onChange({ ...auth, password: e.target.value })}
                            placeholder="Enter password..."
                            className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                        />
                    </label>
                </div>
            )}

            {auth.authType === 'oauth-2' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-xs font-medium text-[var(--text-secondary)]">Grant Type</span>
                            <select
                                value={auth.grantTypeInfo.grantType}
                                onChange={e => onChange({
                                    ...auth,
                                    grantTypeInfo: { ...auth.grantTypeInfo, grantType: e.target.value as 'CLIENT_CREDENTIALS' | 'AUTHORIZATION_CODE' | 'PASSWORD' }
                                })}
                                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                            >
                                <option value="CLIENT_CREDENTIALS">Client Credentials</option>
                                <option value="AUTHORIZATION_CODE">Authorization Code</option>
                                <option value="PASSWORD">Password</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-xs font-medium text-[var(--text-secondary)]">Add To</span>
                            <select
                                value={auth.addTo}
                                onChange={e => onChange({ ...auth, addTo: e.target.value as 'HEADERS' | 'QUERY_PARAMS' })}
                                className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                            >
                                <option value="HEADERS">Headers</option>
                                <option value="QUERY_PARAMS">Query Params</option>
                            </select>
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Token Endpoint</span>
                        <input
                            type="text"
                            value={auth.grantTypeInfo.tokenEndpoint || auth.grantTypeInfo.authEndpoint}
                            onChange={e => onChange({
                                ...auth,
                                grantTypeInfo: { ...auth.grantTypeInfo, tokenEndpoint: e.target.value, authEndpoint: e.target.value }
                            })}
                            placeholder="https://auth.example.com/token"
                            className="mt-1 w-full px-3 py-2 text-sm font-mono rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-xs font-medium text-[var(--text-secondary)]">Client ID</span>
                            <input
                                type="text"
                                value={auth.grantTypeInfo.clientID}
                                onChange={e => onChange({
                                    ...auth,
                                    grantTypeInfo: { ...auth.grantTypeInfo, clientID: e.target.value }
                                })}
                                placeholder="Client ID"
                                className="mt-1 w-full px-3 py-2 text-sm font-mono rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs font-medium text-[var(--text-secondary)]">Client Secret</span>
                            <div className="relative mt-1">
                                <input
                                    type={showSecret ? 'text' : 'password'}
                                    value={auth.grantTypeInfo.clientSecret}
                                    onChange={e => onChange({
                                        ...auth,
                                        grantTypeInfo: { ...auth.grantTypeInfo, clientSecret: e.target.value }
                                    })}
                                    placeholder="Client Secret"
                                    className="w-full px-3 py-2 pr-10 text-sm font-mono rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {showSecret ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        ) : (
                                            <>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </>
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Scopes</span>
                        <input
                            type="text"
                            value={auth.grantTypeInfo.scopes}
                            onChange={e => onChange({
                                ...auth,
                                grantTypeInfo: { ...auth.grantTypeInfo, scopes: e.target.value }
                            })}
                            placeholder="scope1 scope2"
                            className="mt-1 w-full px-3 py-2 text-sm font-mono rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
                        />
                    </label>

                    {/* Current Token */}
                    <label className="block">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">Access Token</span>
                        <textarea
                            value={auth.grantTypeInfo.token}
                            onChange={e => onChange({
                                ...auth,
                                grantTypeInfo: { ...auth.grantTypeInfo, token: e.target.value }
                            })}
                            placeholder="Paste access token or use Get Token button..."
                            className="mt-1 w-full h-16 px-3 py-2 text-sm font-mono rounded-lg border border-[var(--glass-border)] bg-white/50 focus:border-[var(--accent-primary)] focus:outline-none transition-colors resize-y"
                        />
                    </label>
                </div>
            )}
        </div>
    );
}
