import type { Vector3Tuple } from 'three'
import {
	MotionValue,
	cubicBezier,
	transform,
	useIsomorphicLayoutEffect,
	useMotionValue,
	useSpring,
	type SpringOptions
} from 'framer-motion'

export const expoOut = cubicBezier(0.16, 1, 0.3, 1)

export type MotionVector3Tuple = [MotionValue<number>, MotionValue<number>, MotionValue<number>]
export type MotionVector3 = MotionVector3Tuple & {
	set(...args: Vector3Tuple): void
}

// A tuple of MotionValues
export function useMotionVector3(source: Vector3Tuple): MotionVector3 {
	const x = useMotionValue(source[0])
	const y = useMotionValue(source[1])
	const z = useMotionValue(source[2])

	// Hack to add an instance method, while still preserving iteration
	// https://github.com/microsoft/TypeScript/issues/42033
	return Object.assign([x, y, z] as MotionVector3Tuple, {
		set(...args: Vector3Tuple) {
			x.set(args[0])
			y.set(args[1])
			z.set(args[2])
		}
	})
}

export function useVector3Spring(
	source: MotionVector3,
	config: SpringOptions = {}
): MotionVector3Tuple {
	const x = useSpring(source[0], config)
	const y = useSpring(source[1], config)
	const z = useSpring(source[2], config)

	return [x, y, z]
}

// This is verbose but faster b/c it's not returning a new array every time
export const transformVector3 = (inputRange: number[], outputRange: Vector3Tuple[]) => [
	transform(
		inputRange,
		outputRange.map((v) => v[0])
	),
	transform(
		inputRange,
		outputRange.map((v) => v[1])
	),
	transform(
		inputRange,
		outputRange.map((v) => v[2])
	)
]
