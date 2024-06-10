import clsx from 'clsx'

export function Root({ children, className, ...props }: JSX.IntrinsicElements['nav']) {
	return (
		<nav className={clsx(className, 'text-xs font-medium uppercase tracking-widest')} {...props}>
			<ul className="flex ~gap-8/18">{children}</ul>
		</nav>
	)
}

export function Item({
	active = false,
	className,
	children,
	...props
}: JSX.IntrinsicElements['span'] & { active?: boolean }) {
	return (
		<li className="group relative">
			<span className={clsx(className, 'cursor-not-allowed')} {...props}>
				{children}
			</span>
			<div
				className={clsx(
					'absolute left-0 top-[150%] h-0.5 w-[2.5em] transition-all',
					active
						? 'rounded-full bg-blue-800'
						: 'bg-white [clip-path:inset(0_100%_0_0_round_100px)] group-hover:bg-blue-400 group-hover:[clip-path:inset(0_50%_0_0_round_100px)]'
				)}
			/>
		</li>
	)
}
