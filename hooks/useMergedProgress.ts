import { useProgress } from '@react-three/drei'
import { useRef, useState } from 'react'

// "Merges" multiple useProgress hooks into one, when there's
// multiple Suspense in play
export default function useMergedProgress(suspenses: number) {
	const progresses = useRef(Array<number>(suspenses).fill(0))
	const nth = useRef(0)
	const { total, loaded } = useProgress(({ total, loaded }) => ({ total, loaded }))
	if (total !== 0 && loaded === total && nth.current < suspenses - 1) {
		progresses.current[nth.current++] = (loaded / total) * 100
	} else if (total !== 0) {
		progresses.current[nth.current] = (loaded / total) * 100
	}
	return progresses.current.reduce((p, c) => p + c / suspenses, 0)
}
