import clsx from 'clsx'
import { useScroll, useTransform, motion } from 'framer-motion'
import type { RefObject } from 'react'
import { colors } from '@/theme'

export function Root({ children, className, ...props }: JSX.IntrinsicElements['nav']) {
	return (
		<nav
			aria-label="On this page"
			{...props}
			className={clsx(
				className,
				'pointer-events-none fixed inset-0 z-10 flex size-full items-center'
			)}
		>
			<ul className="container space-y-0.5">{children}</ul>
		</nav>
	)
}

export function Item({
	sectionRef,
	...props
}: JSX.IntrinsicElements['a'] & { sectionRef: RefObject<HTMLElement> }) {
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		layoutEffect: false,
		offset: ['start end', 'start start', 'end end', 'end start']
	})
	const width = useTransform(
		scrollYProgress,
		[0, 1 / 3, 2 / 3, 1],
		['0.125rem', '3rem', '3rem', '0.125rem']
	)
	const backgroundColor = useTransform(
		scrollYProgress,
		[0, 1 / 3, 2 / 3, 1],
		[colors.white, colors.blue['800'], colors.blue['800'], colors.white]
	)

	return (
		<li className="pointer-events-auto">
			<a {...props} className="block w-[5rem] py-2">
				<motion.span
					style={{ width, backgroundColor }}
					className="block h-0.5 rounded-full bg-current"
				/>
			</a>
		</li>
	)
}
