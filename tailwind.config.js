/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
        "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js"
    ],
    darkMode: ["class"],
    theme: {
    	transparent: 'transparent',
    	current: 'currentColor',
    	container: {
    		center: 'true',
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			tremor: {
    				brand: {
    					faint: '#eff6ff',
    					muted: '#bfdbfe',
    					subtle: '#60a5fa',
    					DEFAULT: '#3b82f6',
    					emphasis: '#1d4ed8',
    					inverted: '#ffffff'
    				},
    				background: {
    					muted: '#f9fafb',
    					subtle: '#f3f4f6',
    					DEFAULT: '#ffffff',
    					emphasis: '#374151'
    				},
    				border: {
    					DEFAULT: '#e5e7eb'
    				},
    				ring: {
    					DEFAULT: '#e5e7eb'
    				},
    				content: {
    					subtle: '#9ca3af',
    					DEFAULT: '#6b7280',
    					emphasis: '#374151',
    					strong: '#111827',
    					inverted: '#ffffff'
    				}
    			},
    			'dark-tremor': {
    				brand: {
    					faint: '#0B1229',
    					muted: '#172554',
    					subtle: '#1e40af',
    					DEFAULT: '#3b82f6',
    					emphasis: '#60a5fa',
    					inverted: '#030712'
    				},
    				background: {
    					muted: '#131A2B',
    					subtle: '#1f2937',
    					DEFAULT: 'hsl(var(--background))',
    					emphasis: '#d1d5db'
    				},
    				border: {
    					DEFAULT: '#1f2937'
    				},
    				ring: {
    					DEFAULT: '#1f2937'
    				},
    				content: {
    					subtle: '#6b7280',
    					DEFAULT: '#9ca3af',
    					emphasis: '#e5e7eb',
    					strong: '#f9fafb',
    					inverted: '#000000'
    				}
    			},
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
    			},
    			crimson: {
    				'1': 'hsl(335, 20.0%, 9.6%)',
    				'2': 'hsl(335, 32.2%, 11.6%)',
    				'3': 'hsl(335, 42.5%, 16.5%)',
    				'4': 'hsl(335, 47.2%, 19.3%)',
    				'5': 'hsl(335, 50.9%, 21.8%)',
    				'6': 'hsl(335, 55.7%, 25.3%)',
    				'7': 'hsl(336, 62.9%, 30.8%)',
    				'8': 'hsl(336, 74.9%, 39.0%)',
    				'9': 'hsl(336, 80.0%, 57.8%)',
    				'10': 'hsl(339, 84.1%, 62.6%)',
    				'11': 'hsl(341, 90.0%, 67.3%)',
    				'12': 'hsl(332, 87.0%, 96.0%)'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		boxShadow: {
    			'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			'tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    			'tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    			'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			'dark-tremor-card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    			'dark-tremor-dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    		},
    		borderRadius: {
    			'tremor-small': '0.375rem',
    			'tremor-default': '0.5rem',
    			'tremor-full': '9999px',
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontSize: {
    			'tremor-label': ["0.75rem"],
    			'tremor-default': ["0.875rem", { lineHeight: "1.25rem" }],
    			'tremor-title': ["1.125rem", { lineHeight: "1.75rem" }],
    			'tremor-metric': ["1.875rem", { lineHeight: "2.5rem" }]
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
    			},
    			'slide-from-left': {
    				'0%': {
    					transform: 'translateX(-100%)'
    				},
    				'100%': {
    					transform: 'translateX(0)'
    				}
    			},
    			'slide-to-left': {
    				'0%': {
    					transform: 'translateX(0)'
    				},
    				'100%': {
    					transform: 'translateX(-100%)'
    				}
    			}
    		},
    		animation: {
    			'slide-from-left': 'slide-from-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
    			'slide-to-left': 'slide-to-left 0.25s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		fontFamily: {
    			sans: ["var(--font-inter)", ...fontFamily.sans]
    		}
    	}
    },
    safelist: [
        {
            pattern:
                /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "ui-selected"]
        },
        {
            pattern:
                /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "ui-selected"]
        },
        {
            pattern:
                /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
            variants: ["hover", "ui-selected"]
        },
        {
            pattern:
                /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
        },
        {
            pattern:
                /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
        },
        {
            pattern:
                /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
        }
    ],
    plugins: [require("@headlessui/tailwindcss"), require("tailwindcss-animate"), require("@tailwindcss/typography")]
};
