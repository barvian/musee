'use client'

import useScrubber from '@/hooks/useScrubber'
import './page.css'
import {
	useScroll,
	motion,
	useTransform,
	useAnimate,
	stagger,
	scrollInfo,
	useMotionValue,
	transform,
	inView
} from 'framer-motion'
import {
	type Ref,
	type JSX,
	createRef,
	useImperativeHandle,
	useRef,
	type ReactNode,
	Suspense,
	useLayoutEffect
} from 'react'
import * as TOC from '@/components/TOC'
import clsx from 'clsx'
import SplitText from '@/components/SplitText'
import Scene from './Scene'
import type { Vector3Tuple } from 'three'
import useMergedProgress from '@/hooks/useMergedProgress'

const cameraPositions: Array<Vector3Tuple> = [
	[0, 0, 20],
	[20, 0, 0],
	[0, 0, 20],
	[20, 0, -5],
	[0, 0, 20]
]
const cameraLookAts: Array<Vector3Tuple> = [
	[0, 0, 0],
	[0, 0, 1.175],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
]
const floatIntensities: Array<Vector3Tuple> = [
	[1, 0, 0],
	[0, 0, 1],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0]
]

const ZERO: Vector3Tuple = [0, 0, 0]

export default function Home() {
	// We need this to be an array of refs, so we can pass the inner refs to <TOC.Item>
	const sectionRefs = useRef(
		Array(5)
			.fill(null)
			.map(() => createRef<HTMLElement>())
	)

	const cameraPosition = useMotionValue(cameraPositions[0])
	const cameraLookAt = useMotionValue(cameraLookAts[0])
	const floatIntensity = useMotionValue(floatIntensities[0])

	// const progress = useMergedProgress(2)

	// Create one IntersectionObserver for all sections to handle race conditions
	useLayoutEffect(() => {
		const onEnds = new WeakMap<Element, () => void>()
		const onScrolls = new WeakMap<Element, (progress: number) => void>()

		sectionRefs.current.forEach((ref, curr) => {
			const prev = Math.max(curr - 1, 0)

			const position = transform([0, 1], [cameraPositions[prev], cameraPositions[curr]])
			const lookAt = transform([0, 1], [cameraLookAts[prev], cameraLookAts[curr]])
			const float = transform(
				[0, 0.1, 0.9, 1], // stop float mid-transition
				[floatIntensities[prev], ZERO, ZERO, floatIntensities[curr]]
			)
			onScrolls.set(ref.current!, (progress: number) => {
				cameraPosition.set(position(progress))
				cameraLookAt.set(lookAt(progress))
				floatIntensity.set(float(progress))
			})
		})

		const onIntersectionChange: IntersectionObserverCallback = (entries) => {
			entries
				// Handle all non-intersecting elements first
				.sort((a, b) => (a.isIntersecting === b.isIntersecting ? 0 : !a.isIntersecting ? -1 : 1))
				.forEach((entry) => {
					const onEnd = onEnds.get(entry.target)

					// console.log(makeOnScroll(entry.target)(0.5))
					/**
					 * If there's no change to the intersection, we don't need to
					 * do anything here.
					 */
					if (entry.isIntersecting === Boolean(onEnd)) return

					if (entry.isIntersecting) {
						const newOnEnd = scrollInfo(
							({ y: { progress } }) => onScrolls.get(entry.target)?.(progress),
							{
								target: entry.target,
								offset: ['start end', 'start start']
							}
						)
						onEnds.set(entry.target, newOnEnd)
					} else if (onEnd) {
						onEnd()
						onEnds.delete(entry.target)
					}
				})
		}

		const observer = new IntersectionObserver(onIntersectionChange, {
			rootMargin: '-100% 0px 0px 0px' // small sliver at the bottom
		})

		sectionRefs.current.forEach((ref) => {
			observer.observe(ref.current!)
		})

		return () => observer.disconnect()
	}, [])

	return (
		<>
			<Suspense fallback={null}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.75 }}
				>
					<Scene
						cameraLookAt={cameraLookAt}
						cameraPosition={cameraPosition}
						floatIntensity={floatIntensity}
						className="!fixed !inset-0"
					/>
				</motion.div>
			</Suspense>
			{/* Not a fallback for suspense: https://github.com/framer/motion/issues/1193 */}
			{/* <AnimatePresence>
				{progress < 100 && (
					<Progress.Root asChild value={progress}>
						<motion.div
							className="fixed left-1/2 top-1/2 h-3 w-80 -translate-x-1/2 -translate-y-1/2 overflow-clip rounded-full bg-white/25"
							exit={{ opacity: 0, filter: 'blur(8px)' }}
						>
							<Progress.Indicator asChild>
								<motion.div
									className="size-full rounded-[inherit] bg-white"
									initial={{ x: '-100%' }}
									animate={{ x: `-${100 - progress}%` }}
									transition={{ type: 'spring', bounce: false }}
								></motion.div>
							</Progress.Indicator>
						</motion.div>
					</Progress.Root>
				)}
			</AnimatePresence> */}
			<TOC.Root>
				<TOC.Item title="Museum of Ancient Art" href="#" sectionRef={sectionRefs.current[0]} />
				<TOC.Item
					title="Alexandros of Antioch"
					href="#alexandros-of-antioch"
					sectionRef={sectionRefs.current[1]}
				/>
				<TOC.Item sectionRef={sectionRefs.current[2]} />
				<TOC.Item sectionRef={sectionRefs.current[3]} />
				<TOC.Item href="#last" sectionRef={sectionRefs.current[4]} />
			</TOC.Root>

			<BottomAlignedSection
				title="Museum of Ancient Art"
				TitleTag="h1"
				ref={sectionRefs.current[0]}
			>
				History and creativity converge to tell the captivating stories of civilizations long past.
				Our collection, ranging from majestic sculptures to intricate pottery, offers a glimpse into
				the artistic achievements and cultural expressions of ancient societies.
			</BottomAlignedSection>
			<LeftAlignedSection
				id="alexandros-of-antioch"
				ref={sectionRefs.current[1]}
				items={[
					{
						title: 'Alexandros of Antioch',
						content: (
							<>
								Alexandros of Antioch was an ancient Greek sculptor best known for creating the
								famous statue "Venus de Milo," discovered on the island of Milos in 1820.
							</>
						)
					},
					{
						title: '203 cm (80 in)',
						content: (
							<>
								The height of the statue is notable for its impressive scale, reflecting the
								grandeur and idealized proportions characteristic of Hellenistic sculpture.
							</>
						)
					},
					{
						title: 'Island of Melos',
						content: (
							<>
								The Venus de Milo was discovered in 1820 by a Greek farmer named Yorgos Kentrotas on
								the island of Milos, and it quickly became one of the most celebrated examples of
								ancient Greek sculpture.
							</>
						)
					}
				]}
			/>
			<Section ref={sectionRefs.current[2]}>
				<h1 className="col-span-3 justify-self-end text-right font-serif ~text-6xl/8xl md:~md:~max-w-[20rem]/[28.75rem]">
					Museum of Ancient Art
				</h1>
				<p className="justify-self-center text-sm ~lg:~mt-8/16 ~lg:~p-4/8 max-lg:col-span-2">
					History and creativity converge to tell the captivating stories of civilizations long
					past. Our collection, ranging from majestic sculptures to intricate pottery, offers a
					glimpse into the artistic achievements and cultural expressions of ancient societies.
				</p>
			</Section>
			<Section ref={sectionRefs.current[3]}>
				<h1 className="col-span-3 justify-self-end text-right font-serif ~text-6xl/8xl md:~md:~max-w-[20rem]/[28.75rem]">
					Museum of Ancient Art
				</h1>
				<p className="justify-self-center text-sm ~lg:~mt-8/16 ~lg:~p-4/8 max-lg:col-span-2">
					History and creativity converge to tell the captivating stories of civilizations long
					past. Our collection, ranging from majestic sculptures to intricate pottery, offers a
					glimpse into the artistic achievements and cultural expressions of ancient societies.
				</p>
			</Section>
			<Section id="last" ref={sectionRefs.current[4]}>
				<h1 className="col-span-3 justify-self-end text-right font-serif ~text-6xl/8xl md:~md:~max-w-[20rem]/[28.75rem]">
					Museum of Ancient Art
				</h1>
				<p className="justify-self-center text-sm ~lg:~mt-8/16 ~lg:~p-4/8 max-lg:col-span-2">
					History and creativity converge to tell the captivating stories of civilizations long
					past. Our collection, ranging from majestic sculptures to intricate pottery, offers a
					glimpse into the artistic achievements and cultural expressions of ancient societies.
				</p>
			</Section>
		</>
	)
}

type BottomAlignedSectionProps = SectionProps & {
	title: string
	TitleTag: 'h1' | 'h2'
}

function BottomAlignedSection({
	title,
	TitleTag = 'h2',
	className,
	children,
	...props
}: BottomAlignedSectionProps) {
	const innerRef = useRef<HTMLDivElement>(null)

	const { scrollYProgress } = useScroll({
		target: innerRef,
		layoutEffect: false,
		offset: ['end 55%', 'end 35%']
	})
	const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

	return (
		<Section className={clsx('content-end items-center', className)} {...props}>
			<motion.div style={{ opacity }} ref={innerRef} className="grid-cols grid gap-4">
				<TitleTag className="col-span-3 justify-self-end text-right font-serif ~text-6xl/8xl md:~md:~max-w-[20rem]/[28.75rem]">
					{title}
				</TitleTag>
				<p className="justify-self-center text-sm ~lg:~mt-8/16 ~lg:~p-4/8 max-lg:col-span-2">
					{children}
				</p>
			</motion.div>
		</Section>
	)
}

type LeftAlignedSectionProps = Omit<SectionProps, 'children'> & {
	items: {
		title: string
		content: ReactNode
	}[]
}
function LeftAlignedSection({ items, ...props }: LeftAlignedSectionProps) {
	const [scope, animate] = useAnimate()

	const divRefs = useRef(Array<HTMLDivElement | null>(items.length))
	// TODO: splice these if items ever change
	// https://stackoverflow.com/a/56063129
	const characterRefs = useRef(
		Array(items.length)
			.fill(null)
			.map(() => Array<HTMLSpanElement | null>())
	)
	const contentRefs = useRef(Array<HTMLElement | null>(items.length))

	// Entrance animations
	const { scrollYProgress: inProgress } = useScroll({
		target: scope,
		offset: ['start 80%', 'center 55%'] // 55% = compensate for the header
	})
	useScrubber(
		() =>
			animate(
				items.flatMap((_, i) => [
					[
						characterRefs.current[i].filter(Boolean),
						{ opacity: [0, 1], y: ['25%', '0'] },
						{ duration: 0.35, delay: stagger(0.035), at: i * 0.25 }
					],
					[
						contentRefs.current[i]!,
						{ opacity: [0, 1], y: ['50%', '0'] },
						{ duration: 0.65, delay: 0.15, at: i * 0.15, ease: 'easeIn' }
					]
				])
			),
		inProgress,
		{
			once: true
		}
	)

	// Exit animations
	const { scrollYProgress: outProgress } = useScroll({
		target: scope,
		layoutEffect: false,
		offset: ['center', 'end start']
	})
	useScrubber(
		() =>
			// Framer Motion doesn't compute the right duration unless it's in a sequence:
			animate([
				[
					divRefs.current.filter(Boolean),
					{ opacity: [1, 0] },
					{ delay: stagger(0.15, { startDelay: 0.05, ease: 'easeIn' }), duration: 0.5 }
				]
			]),
		outProgress,
		{
			layoutEffect: false
		}
	)

	return (
		<Section {...props} className="grid-cols grid content-center items-center gap-4">
			<div ref={scope} className="col-span-2 col-start-2">
				<dl className="~space-y-6/12">
					{items.map(({ title, content }, i) => (
						<div
							ref={(el) => {
								divRefs.current[i] = el
							}}
							key={title}
						>
							<dt className="font-serif ~text-3xl/6xl">
								<SplitText
									CharacterWrapper={({ children, index }) => (
										<span
											ref={(el) => {
												characterRefs.current[i][index] = el
											}}
											className="inline-block"
											key={index}
										>
											{children}
										</span>
									)}
								>
									{title}
								</SplitText>
							</dt>
							<dd
								ref={(el) => {
									contentRefs.current[i] = el
								}}
								className="max-w-prose text-xs text-white/60 ~mt-3/6"
							>
								{content}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</Section>
	)
}

type SectionProps = JSX.IntrinsicElements['section'] & {}

function Section({ children, className, ...props }: SectionProps) {
	return (
		<section
			{...props}
			className={clsx(
				'container relative min-h-screen snap-start pt-[--header-height] ~pb-6/16',
				className
			)}
		>
			{children}
		</section>
	)
}
