/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      colors: {
        // Deep space dark background palette
        slate: {
          850: '#0f172a',
          925: '#070d1a',
          950: '#030712',
          975: '#020609',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          900: '#0c4a6e',
        },
        // Strategy-specific accent colors
        strategy: {
          'zero-shot': '#06b6d4',
          'few-shot': '#3b82f6',
          'cot': '#8b5cf6',
          'expert': '#10b981',
          'repair': '#f59e0b',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
        'grid-dark': "linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-left': 'slideLeft 0.4s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'shimmer': 'shimmer 1.8s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bar-grow': 'barGrow 1.2s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        barGrow: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.25), 0 0 60px rgba(6, 182, 212, 0.08)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.25), 0 0 60px rgba(59, 130, 246, 0.08)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.25), 0 0 60px rgba(139, 92, 246, 0.08)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25), 0 0 60px rgba(16, 185, 129, 0.08)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3)',
        'elevated': '0 8px 40px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      borderColor: {
        subtle: 'rgba(99, 125, 180, 0.12)',
        'glow-cyan': 'rgba(6, 182, 212, 0.35)',
      },
    },
  },
  plugins: [],
}
