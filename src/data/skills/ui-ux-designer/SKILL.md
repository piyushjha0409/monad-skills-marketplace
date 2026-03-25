---
name: ui-ux-designer
description: "ACTIVATE when the user wants to design, prototype, or build a polished frontend UI. Triggers on: UI design, UX design, design system, Tailwind CSS, Framer Motion, animation, component library, responsive design, dark mode, color palette, typography, spacing, layout, landing page, dashboard, mint page, card component, modal, navigation, Figma to code, pixel-perfect, design tokens. Use this skill for ANY task involving visual design, frontend components, or design systems."
category: Frontend
difficulty: beginner
author: Piyush Jha
version: "2.0.0"
skills:
  - Figma
  - UI/UX Design
  - Motion Design
  - Tailwind CSS
  - React
  - Prototyping
---

## Instructions

You are a **UI/UX Design Engineer** who bridges aesthetics and code. Your job is to help users build production-ready design systems, polished React + Tailwind components, Framer Motion animations, and responsive layouts — with a focus on Web3 / Monad dApp interfaces.

---

## Design Token System

Every project should start with a consistent design token system. Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Monad-inspired palette
        primary: {
          50:  '#f0e6ff',
          100: '#d4b3ff',
          200: '#b880ff',
          300: '#9c4dff',
          400: '#8026ff',
          500: '#6600ff', // Monad purple
          600: '#5200cc',
          700: '#3d0099',
          800: '#290066',
          900: '#140033',
        },
        surface: {
          50:  '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          700: '#1a1b23',
          800: '#13141a',
          900: '#0c0d12',
          950: '#080910',
        },
        accent: {
          green:  '#00d68f',
          red:    '#ff3d71',
          yellow: '#ffaa00',
          blue:   '#0095ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-lg': ['2rem', { lineHeight: '1.25' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4' }],
        'body-lg':    ['1.125rem', { lineHeight: '1.6' }],
        'body':       ['1rem', { lineHeight: '1.6' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.5' }],
        'caption':    ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(102, 0, 255, 0.15)',
        'glow-md': '0 0 30px rgba(102, 0, 255, 0.2)',
        'glow-lg': '0 0 60px rgba(102, 0, 255, 0.25)',
        'card':    '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 15px rgba(102, 0, 255, 0.2)' }, '50%': { boxShadow: '0 0 40px rgba(102, 0, 255, 0.4)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Reusable Component Patterns

### Glass Card Component

```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 40px rgba(102, 0, 255, 0.15)' } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-card
        transition-colors duration-300
        ${className}
      `}
    >
      {/* Gradient accent border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
```

### Animated Button

```tsx
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:   'bg-primary-500 hover:bg-primary-600 text-white shadow-glow-sm hover:shadow-glow-md',
  secondary: 'bg-surface-800 hover:bg-surface-700 text-white border border-white/10',
  ghost:     'bg-transparent hover:bg-white/5 text-white',
  danger:    'bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-body-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-body rounded-xl gap-2',
  lg: 'px-8 py-3.5 text-body-lg rounded-xl gap-2.5 font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </motion.button>
  );
}
```

### Staggered List Animation

```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function StaggerList({ children, className = '' }: { children: ReactNode[]; className?: string }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children.map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Stat Card (for dashboards)

```tsx
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
}

export function StatCard({ label, value, change, positive, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-surface-800/50 backdrop-blur-sm border border-white/5 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-body-sm text-gray-400">{label}</span>
        <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
          {icon}
        </div>
      </div>
      <div className="text-heading-lg font-bold text-white">{value}</div>
      {change && (
        <div className={`text-body-sm mt-1 ${positive ? 'text-accent-green' : 'text-accent-red'}`}>
          {positive ? '+' : ''}{change}
        </div>
      )}
    </motion.div>
  );
}
```

### Modal / Dialog

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-lg rounded-2xl bg-surface-800 border border-white/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-heading-md font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## Page Layout Pattern

```tsx
import { ReactNode } from 'react';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-primary-700/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-heading-sm font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              MonadApp
            </span>
            {/* Add navigation items here */}
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Responsive Breakpoint Guide

| Breakpoint | Width | Usage |
|---|---|---|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

Pattern for responsive grids:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

---

## Framer Motion Cheat Sheet

```tsx
// Scroll-triggered animation
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6 }}
/>

// Hover + tap interaction
<motion.div
  whileHover={{ scale: 1.05, rotate: 1 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300 }}
/>

// Layout animation (for reordering lists)
<motion.div layout layoutId={`card-${id}`} transition={{ type: 'spring', stiffness: 200 }} />

// Page transitions with AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={page}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  />
</AnimatePresence>
```

---

## When to Use

- User wants to **design a UI** or **build a frontend component**
- User mentions **Tailwind CSS**, **design system**, or **component library**
- User asks about **Framer Motion**, **animations**, or **transitions**
- User needs a **landing page**, **dashboard**, **mint page**, or **modal**
- User wants **responsive design** or **dark mode** implementation
- User mentions **design tokens**, **color palette**, or **typography**
- User says **pixel-perfect**, **polished**, or **Figma to code**
- User needs a **card**, **button**, **navigation**, or any UI component

## When NOT to Use

- **Smart contract development** — use `token-deployer`, `nft-collection`, `defi-protocol`, or `p2p-gaming`
- **Backend / API development** — not a frontend task
- **Data analysis or scripting** — not a design task
- **DevOps / infrastructure** — not a design task
