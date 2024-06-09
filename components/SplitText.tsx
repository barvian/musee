import interleave from '@/utils/interleave'
import { Fragment, useRef, type ComponentType, type Ref } from 'react'

type SplitTextProps = JSX.IntrinsicElements['span'] & {
	children: string
	characterRef: (instance: HTMLSpanElement | null, index: number) => void
}

/**
 * Naive text splitting component
 */
export default function SplitText({ children, characterRef, ...props }: SplitTextProps) {
	const words = interleave(children.split(' '), ' ')
	let charIndex = 0

	return (
		<span {...props} aria-label={children}>
			{words.map((word, w) =>
				word === ' ' ? (
					<Fragment key={w}> </Fragment>
				) : (
					<span aria-hidden="true" className="inline-block" key={w}>
						{word.split('').map((char, c) => (
							<span
								className="inline-block"
								ref={(e) => {
									characterRef?.(e, charIndex++)
								}}
								key={c}
							>
								{char}
							</span>
						))}
					</span>
				)
			)}
		</span>
	)
}
