import type { Config } from 'tailwindcss'
import fluid, { extract, fontSize } from 'fluid-tailwind'
import reset from 'tw-reset'
import plugin from 'tailwindcss/plugin'
import { screens, colors } from './theme'

export default {
	presets: [reset],
	content: {
		files: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
		extract
	},
	corePlugins: {
		container: false
	},
	theme: {
		screens,
		fontSize,
		colors,
		extend: {
			spacing: {
				'4.5': '1.125rem',
				'15': '3.75rem',
				'18': '4.5rem'
			},
			fontFamily: {
				sans: ['var(--font-cera)'],
				serif: ['Baskerville', 'Times New Roman', 'serif']
			},
			fontSize: {
				sm: ['0.8125rem', '1.1rem'],
				'6xl': ['3.4375rem', '3.4375rem'],
				'8xl': ['6.3125rem', '5.58025rem']
			},
			maxWidth: {
				'8xl': '87rem'
			}
		}
	},
	plugins: [
		fluid,
		plugin(({ matchUtilities, theme }) => {
			matchUtilities(
				{
					'header-py': (val) => ({
						'--header-py': val
					})
				},
				{ values: theme('padding') }
			)
			matchUtilities(
				{
					'section-pt': (val) => ({
						'--section-pt': val
					})
				},
				{ values: theme('padding') }
			)
		})
	]
} satisfies Config
