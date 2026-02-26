/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Status colors - yellow (not started)
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-500', 'bg-yellow-600',
    'text-yellow-700', 'text-white',
    'hover:bg-yellow-100', 'hover:bg-yellow-600',
    'border-yellow-200', 'ring-2', 'ring-inset', 'ring-yellow-500',
    // Status colors - blue (reading)
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600',
    'text-blue-700',
    'hover:bg-blue-100', 'hover:bg-blue-600',
    'border-blue-200', 'ring-blue-500',
    // Status colors - green (read)
    'bg-green-50', 'bg-green-100', 'bg-green-500', 'bg-green-600',
    'text-green-700',
    'hover:bg-green-100', 'hover:bg-green-600',
    'border-green-200', 'ring-green-500',
    // Status colors - red (quit)
    'bg-red-50', 'bg-red-100', 'bg-red-500', 'bg-red-600',
    'text-red-700',
    'hover:bg-red-100', 'hover:bg-red-600',
    'border-red-200', 'ring-red-500',
    // Gray (all filter)
    'ring-gray-500', 'bg-gray-50', 'bg-gray-500', 'bg-gray-600',
    'text-gray-700', 'hover:bg-gray-100', 'hover:bg-gray-600', 'border-gray-200',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
