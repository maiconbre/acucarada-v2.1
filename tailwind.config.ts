import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				display: ['var(--font-display)', 'serif'],
				body: ['var(--font-body)', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Paleta personalizada - Rose (Primária)
				rose: {
					50: 'hsl(330 40% 95%)',
					100: 'hsl(330 40% 88%)',
					200: 'hsl(330 50% 80%)',
					300: 'hsl(330 60% 70%)',
					400: 'hsl(330 65% 65%)',
					500: 'hsl(330 70% 60%)', // Cor principal
					600: 'hsl(330 75% 55%)',
					700: 'hsl(330 80% 45%)',
					800: 'hsl(330 85% 35%)',
					900: 'hsl(330 90% 25%)'
				},
				// Paleta personalizada - Brown (Secundária)
				brown: {
					50: 'hsl(25 30% 92%)',
					100: 'hsl(25 30% 80%)',
					200: 'hsl(25 35% 75%)',
					300: 'hsl(25 40% 65%)',
					400: 'hsl(25 45% 55%)',
					500: 'hsl(25 50% 50%)', // Cor principal
					600: 'hsl(25 55% 40%)',
					700: 'hsl(25 60% 30%)',
					800: 'hsl(25 65% 25%)',
					900: 'hsl(25 70% 15%)'
				},
				// Paleta personalizada - Cream (Especiais)
				cream: {
					50: 'hsl(30 50% 98%)',
					100: 'hsl(30 45% 96%)',
					200: 'hsl(30 40% 94%)',
					300: 'hsl(30 35% 90%)',
					400: 'hsl(30 30% 85%)',
					500: 'hsl(30 25% 80%)',
					600: 'hsl(30 20% 75%)',
					700: 'hsl(30 15% 65%)',
					800: 'hsl(30 10% 55%)',
					900: 'hsl(30 5% 45%)'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					soft: 'hsl(var(--primary-soft))'
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
					foreground: 'hsl(var(--accent-foreground))',
					soft: 'hsl(var(--accent-soft))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
