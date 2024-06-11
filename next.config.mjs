/** @type {import('next').NextConfig} */
export default {
	// Doesn't seem to work with Framer Motion in React 19 atm:
	// https://github.com/framer/motion/issues/2668
	reactStrictMode: false,
	experimental: {
		reactCompiler: {
			compilationMode: 'all',
			panicThreshold: 'CRITICAL_ERRORS'
		}
	}
}
