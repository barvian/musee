import interleave from '@/utils/interleave'
import { useRef, type ComponentType } from 'react'

type SplitTextProps = JSX.IntrinsicElements['span'] & {
	children: string
	CharacterWrapper: ComponentType<{ children: string; index: number }>
}

/**
 * Naive text splitting component
 */
export default function SplitText({ children, CharacterWrapper, ...props }: SplitTextProps) {
	const words = interleave(children.split(' '), ' ')
	let charIndex = 0

	return (
		<span {...props} aria-label={children}>
			{words.map((word, w) => (
				<span aria-hidden="true" className="whitespace-pre" key={w}>
					{word.split('').map((char, c) => (
						<CharacterWrapper index={charIndex++} key={c}>
							{char}
						</CharacterWrapper>
					))}
				</span>
			))}
		</span>
	)
}
