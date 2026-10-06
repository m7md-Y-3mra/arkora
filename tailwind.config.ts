import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import animate from 'tailwindcss-animate';

export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{ts,tsx}',
    ],
    theme: {
    	container: {
    		center: true,
    		padding: '1.5rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		fontFamily: {
    			sans: [
    				'Tajawal',
    				'IBM Plex Sans Arabic',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			],
    			heading: [
    				'Amiri',
    				'ui-serif',
    				'serif'
    			]
    		},
    		colors: {
    			onyx: {
    				'50': '#F1F3F7',
    				'100': '#E2E6ED',
    				'200': '#C5CCDA',
    				'300': '#9AA6BC',
    				'400': '#64748F',
    				'500': '#415272',
    				'600': '#2E3C57',
    				'700': '#1E2A42',
    				'800': '#141E33',
    				'900': '#0F172A',
    				'950': '#090D18',
    				DEFAULT: '#0F172A'
    			},
    			bronze: {
    				'50': '#FAF7F3',
    				'100': '#F3ECE2',
    				'200': '#E5D6C0',
    				'300': '#D4BC9B',
    				'400': '#C3A888',
    				'500': '#B59A7A',
    				'600': '#9B7E5C',
    				'700': '#7D6549',
    				'800': '#5F4D38',
    				'900': '#453728',
    				DEFAULT: '#B59A7A'
    			},
    			alabaster: '#FAFAFA',
    			charcoal: '#1E293B',
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
    plugins: [forms, animate],
} satisfies Config;
