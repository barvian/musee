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
	useSpring
} from 'framer-motion'
import {
	type Ref,
	type JSX,
	createRef,
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
import { transformVector3, useMotionVector3, useVector3Spring } from '@/utils/motion'
import { useControls } from 'leva'

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

	const { stiffness, damping, mass } = useControls('scene', {
		// stiffness: 150,
		// damping: 70,
		stiffness: 100,
		damping: 40,
		mass: 1
	})

	const cameraPosition = useMotionVector3(cameraPositions[0])
	const smoothedCameraPosition = useVector3Spring(cameraPosition, { stiffness, damping, mass })
	const cameraLookAt = useMotionVector3(cameraLookAts[0])
	const smoothedCameraLookAt = useVector3Spring(cameraLookAt, { stiffness, damping, mass })
	const floatIntensity = useMotionVector3(floatIntensities[0])

	// const progress = useMergedProgress(2)

	// Create one IntersectionObserver for all sections, to handle race conditions
	useLayoutEffect(() => {
		const onEnds = new WeakMap<Element, () => void>()
		const onScrolls = new WeakMap<Element, (progress: number) => void>()

		sectionRefs.current.forEach((ref, curr) => {
			const prev = Math.max(curr - 1, 0)

			const [posX, posY, posZ] = transformVector3(
				[0, 1],
				[cameraPositions[prev], cameraPositions[curr]]
			)
			const [lookX, lookY, lookZ] = transformVector3(
				[0, 1],
				[cameraLookAts[prev], cameraLookAts[curr]]
			)
			const [floatX, floatY, floatZ] = transformVector3(
				[0, 0.1, 0.9, 1], // stop float mid-transition
				[floatIntensities[prev], ZERO, ZERO, floatIntensities[curr]]
			)
			onScrolls.set(ref.current!, (progress: number) => {
				cameraPosition.set(posX(progress), posY(progress), posZ(progress))
				cameraLookAt.set(lookX(progress), lookY(progress), lookZ(progress))
				floatIntensity.set(floatX(progress), floatY(progress), floatZ(progress))
			})
		})

		const onIntersectionChange: IntersectionObserverCallback = (entries) => {
			entries
				// Handle all non-intersecting elements first, so we can unsubscribe them first
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
						cameraLookAt={smoothedCameraLookAt}
						cameraPosition={smoothedCameraPosition}
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
				<TOC.Item
					href="#discovery-of-a-mutilated-masterpiece"
					sectionRef={sectionRefs.current[2]}
				/>
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
			<BottomAlignedSection2
				title="Discovery of a mutilated masterpiece"
				id="discovery-of-a-mutilated-masterpiece"
				ref={sectionRefs.current[2]}
				content1={
					<>
						A farmer named Yorgos Kentrotas found the statue while digging in his field on the Greek
						island of Milos. He uncovered the statue in several pieces within a buried niche in the
						ancient city ruins.
					</>
				}
				content2={
					<>
						Olivier Voutier, a French sailor with an interest in archaeology, observed the discovery
						and encouraged Yorgos to keep digging.
					</>
				}
			/>
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
		offset: ['end 55%', 'end 35%']
	})
	const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

	return (
		<Section className={clsx('content-end', className)} {...props}>
			<motion.div style={{ opacity }} ref={innerRef} className="grid-cols grid gap-4">
				<TitleTag className="col-span-3 justify-self-end text-right font-serif ~text-6xl/8xl md:~md:~max-w-[20rem]/[28.75rem]">
					{title}
				</TitleTag>
				<p className="justify-self-center text-sm text-white/70 ~lg:~mt-8/16 ~lg:~p-4/8 max-lg:col-span-2">
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
	const [scope, animate] = useAnimate<HTMLDivElement>()

	const divRefs = useRef(Array<HTMLDivElement | null>(items.length))
	const characterRefs = useRef(
		Array(items.length)
			.fill(null)
			.map(() => Array<HTMLSpanElement | null>())
	)
	const contentRefs = useRef(Array<HTMLElement | null>(items.length))

	// Entrance animations
	const { stiffness, damping, mass } = useControls({
		stiffness: 100,
		damping: 25,
		mass: 1
	})
	const { scrollYProgress: _inProgress } = useScroll({
		target: scope,
		offset: ['start 80%', 'center 55%'] // 55% = compensate for the header
	})
	const inProgress = useSpring(_inProgress, { stiffness, damping, mass })
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
						{ duration: 0.65, delay: 0.15, at: i * 0.15, ease: 'easeOut' }
					]
				])
			),
		inProgress,
		{
			// once: true
		}
	)

	// Exit animations
	const { scrollYProgress: outProgress } = useScroll({
		target: scope,
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
		outProgress
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
									characterRef={(el, index) => {
										characterRefs.current[i][index] = el
									}}
								>
									{title}
								</SplitText>
							</dt>
							<dd
								ref={(el) => {
									contentRefs.current[i] = el
								}}
								className="max-w-prose text-xs text-white/70 ~mt-3/6"
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

type BottomAlignedSection2Props = Omit<SectionProps, 'ref' | 'children'> & {
	title: string
	ref: Ref<HTMLElement>
	content1: ReactNode
	content2?: ReactNode
}
function BottomAlignedSection2({
	title,
	content1,
	content2,
	...props
}: BottomAlignedSection2Props) {
	const [scope, animate] = useAnimate<HTMLDivElement>()

	const titleWrapperRef = useRef<HTMLDivElement>(null)
	const characterRefs = useRef<Array<HTMLSpanElement | null>>([])
	const content1WrapperRef = useRef<HTMLDivElement>(null)
	const content1Ref = useRef<HTMLParagraphElement>(null)
	const content2WrapperRef = useRef<HTMLDivElement>(null)
	const content2Ref = useRef<HTMLParagraphElement>(null)

	// Entrance animations
	const { scrollYProgress: _inProgress } = useScroll({
		target: scope,
		offset: ['start end', 'end end'] // 55% = compensate for the header
	})
	const { stiffness, damping, mass } = useControls({
		stiffness: 100,
		damping: 25,
		mass: 1
	})
	const inProgress = useSpring(_inProgress, { stiffness, damping, mass })
	useScrubber(
		() =>
			animate([
				[
					characterRefs.current.filter(Boolean),
					{ opacity: [0, 1], y: ['50%', '0'] },
					{ duration: 0.35, delay: stagger(0.035, { startDelay: 0.35 }) }
				],
				[content2Ref.current!, { opacity: [0, 1], y: ['75%', '0'] }, { duration: 0.75, at: '-1' }]
			]),
		inProgress,
		{
			// once: true
		}
	)

	// Exit animations
	const { scrollYProgress: outProgress } = useScroll({
		target: scope,
		offset: ['center', 'end start']
	})
	useScrubber(
		() =>
			// Framer Motion doesn't compute the right duration unless it's in a sequence:
			animate([[titleWrapperRef.current!, { opacity: [1, 0] }, { duration: 0.5 }]]),
		outProgress,
		{}
	)

	return (
		<Section {...props} className="content-end">
			<div ref={scope} className="grid-cols grid gap-4 ~pb-0/16">
				<div ref={titleWrapperRef} className="col-span-2 col-start-2">
					<h2 className="font-serif ~text-6xl/8xl">
						<SplitText
							characterRef={(el, i) => {
								characterRefs.current[i] = el
							}}
						>
							{title}
						</SplitText>
					</h2>
				</div>
				<div ref={content1WrapperRef} className="col-start-4 row-start-2">
					<p ref={content1Ref} className="max-w-prose text-xs text-white/70">
						{content1}
					</p>
				</div>
				<div ref={content2WrapperRef} className="col-start-5 row-start-2">
					<p ref={content2Ref} className="max-w-prose text-xs text-white/70">
						{content2}
					</p>
				</div>
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
