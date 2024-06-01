declare namespace React {
	interface CSSProperties {
		[index: `--${string}`]: string | number
	}
}

declare module '*.exr' {
	const content: string
	export default content
}
