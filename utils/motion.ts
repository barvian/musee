import type { Vector3Tuple } from 'three'
import { cubicBezier, interpolate, transform } from 'framer-motion'

export const expoOut = cubicBezier(0.16, 1, 0.3, 1)

// This is actually unnecessary b/c Framer handles arrays of numbers:
//
// const inputRange = [0, 1]
// export function mixVector3Tuples(
// 	from: Vector3Tuple,
// 	to: Vector3Tuple
// ): (inputValue: number) => Vector3Tuple {
// 	const x = transform(inputRange, [from[0], to[0]])
// 	const y = transform(inputRange, [from[1], to[1]])
// 	const z = transform(inputRange, [from[2], to[2]])

// 	let output: Vector3Tuple = [0, 0, 0]
// 	// Mutate for better performance
// 	return (inputValue) => {
// 		;[output[0], output[1], output[2]] = [x(inputValue), y(inputValue), z(inputValue)]
// 		return output
// 	}
// }
