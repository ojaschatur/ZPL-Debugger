/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                glass: {
                    light: 'rgba(255, 255, 255, 0.7)',
                    border: 'rgba(255, 255, 255, 0.2)',
                },
                accent: {
                    primary: '#6366f1',
                    secondary: '#8b5cf6',
                    glow: '#818cf8',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backdropBlur: {
                glass: '20px',
            },
            boxShadow: {
                glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
                'glass-hover': '0 16px 48px rgba(0, 0, 0, 0.15)',
                glow: '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-strong': '0 0 30px rgba(99, 102, 241, 0.5)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'tab-indicator': 'tabIndicator 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' },
                },
                tabIndicator: {
                    '0%': { transform: 'scaleX(0)' },
                    '100%': { transform: 'scaleX(1)' },
                },
            },
        },
    },
    plugins: [],
}
