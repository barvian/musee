import type { AnimationPlaybackControls, MotionValue } from 'framer-motion'
import { useLayoutEffect } from 'react'

export default function useScrubber(
	setup: () => AnimationPlaybackControls,
	scrubber: MotionValue<number>,
	{ once = false } = {}
) {
	useLayoutEffect(() => {
		const animation = setup()
		animation.pause()
		const { duration } = animation
		animation.time = scrubber.get() * duration
		const unsub = scrubber.on(
			'change',
			once
				? (value) => {
						animation.time = value * duration
						if (once && value === 1) {
							// Don't stop the animation b/c it messed it up on load if it was already scrubbed
							unsub()
						}
					}
				: (value) => {
						animation.time = value * duration
					}
		)
		return () => unsub()
	}, [scrubber])
}
