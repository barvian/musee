import {
	Canvas,
	type CanvasProps,
	extend,
	applyProps,
	type ThreeElements,
	useThree,
	useFrame
} from '@react-three/fiber'
import { Mesh, Group, MeshStandardMaterial, TorusGeometry, PointLight, CanvasTexture } from 'three'
import { OrbitControls, Torus, useEnvironment, useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Suspense, useRef } from 'react'
import { suspend } from 'suspend-react'
const studio = import('@pmndrs/assets/hdri/studio.exr')
import { motion } from 'framer-motion-3d'
import { expoOut, type MotionVector3, type MotionVector3Tuple } from '@/utils/motion'
import { useControls } from 'leva'
import useMergedProgress from '@/hooks/useMergedProgress'

extend({
	Mesh,
	Group,
	PointLight,
	TorusGeometry,
	CanvasTexture,
	MeshStandardMaterial
})

// Eased:
// prettier-ignore
const colors = ['#1f2022', '#1f2022', '#1e1f21', '#1d1d1f', '#1b1c1d', '#19191b', '#161718', '#131415', '#101112', '#0d0d0e', '#0a0a0a', '#070707', '#050505']
// prettier-ignore
const stops = [0, 0.1, .1907, .2744, .3526, 0.4272, 0.50, 0.5728, 0.6474, 0.7256, 0.8093, 0.9001, 1]

export default function Scene({
	cameraPosition,
	cameraLookAt,
	floatIntensity,
	floatSpeed,
	...props
}: CameraRigProps & Omit<CanvasProps, 'children'>) {
	// const { control } = useControls({ control: false })

	return (
		<Canvas {...props} camera={{ position: [20, 0, -5], fov: 8 }}>
			{/* {!control && ( */}
			<CameraRig
				cameraLookAt={cameraLookAt}
				cameraPosition={cameraPosition}
				floatIntensity={floatIntensity}
				floatSpeed={floatSpeed}
			/>
			{/* )} */}
			<RadialGradientTexture
				attach="background"
				stops={stops}
				colors={colors} // Colors need to match the number of stops
				radius={614}
				gradientCenter={[814, 400]}
				size={1024}
			/>
			<Light />
			<Suspense fallback={null}>
				{/* @ts-expect-error hopefully just an issue with React 19 RC */}
				<motion.group
					initial={{ y: -3 }}
					animate={{ y: 0 }}
					transition={{ type: 'spring', stiffness: 631, damping: 100 }}
				>
					<Venus position={[0, -2.3, 0]} rotation-y={0.45} />
					{/* <Box /> */}
					<pointLight position={[0, 0, -2]} decay={0.5} intensity={2} />
					{/* @ts-expect-error " */}
				</motion.group>
			</Suspense>
			<EffectComposer multisampling={0} enableNormalPass={false}>
				{/* <SSR
					temporalResolve={false}
					maxSamples={0}
					STRETCH_MISSED_RAYS
					USE_MRT
					USE_NORMALMAP
					USE_ROUGHNESSMAP
					ENABLE_BLUR
					blurMix={0.2}
					blurKernelSize={8}
					intensity={2.5}
					maxRoughness={1}
					NUM_BINARY_SEARCH_STEPS={6}
					maxDepth={1}
					maxDepthDifference={5}
					thickness={3}
					ior={1.45}
					rayStep={0.5}
					ENABLE_JITTERING
					MAX_STEPS={20}
				/> */}
				{/* <DepthOfField focusDistance={20} focalLength={5} bokehScale={2} height={480} /> */}
				<Bloom mipmapBlur intensity={0.25} />
				<Noise opacity={0.025} />
				<Vignette offset={0} darkness={0.75} />
			</EffectComposer>
			{/* {control && (
				<OrbitControls
					// @ts-expect-error weird type issue
					onChange={(event) => {
						console.log(event.target.object)
					}}
				/>
			)} */}
		</Canvas>
	)
}

type CameraRigProps = {
	cameraPosition: MotionVector3Tuple
	cameraLookAt: MotionVector3Tuple
	floatIntensity: MotionVector3Tuple
	floatSpeed?: number
}

function CameraRig({
	cameraPosition,
	cameraLookAt,
	floatIntensity,
	floatSpeed = 0.5
}: CameraRigProps) {
	useFrame(({ camera, clock }) => {
		const t = clock.getElapsedTime()
		camera.position.set(
			cameraPosition[0].get() + Math.sin(t * floatSpeed) * floatIntensity[0].get(),
			cameraPosition[1].get() + Math.sin(t * floatSpeed) * floatIntensity[1].get(),
			cameraPosition[2].get() + Math.sin(t * floatSpeed) * floatIntensity[2].get()
		)
		camera.lookAt(cameraLookAt[0].get(), cameraLookAt[1].get(), cameraLookAt[2].get())
	})

	return null
}

// Light/loader
function Light() {
	const ref = useRef<Mesh>(null)

	// Triggers a React warning:
	// https://github.com/pmndrs/drei/issues/314
	const progress = useMergedProgress(2)

	return (
		<Torus
			args={[1, 0.075, 12, 48, Math.PI * 2 * (progress / 100)]}
			ref={ref}
			rotation={[Math.PI + 0.2, 0, Math.PI]} // flip it for a more normal loading animation
			position={[-0.25, -0.125, -2.5]}
		>
			<meshStandardMaterial emissive={'#fff'} emissiveIntensity={1.5} />
		</Torus>
	)
}

/**
 * "Venus de Milo" (https://skfb.ly/oDLJZ) by Nancy/Lanzi Luo is licensed under
 * Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
 *
 * Converted with https://github.com/pmndrs/gltfjsx
 */
type GLTFResult = GLTF & {
	nodes: {
		Object_2: Mesh
	}
	materials: {
		['Scene_-_Root']: MeshStandardMaterial
	}
}

function Venus(props: ThreeElements['group']) {
	const { nodes, materials } = useGLTF('/venus.glb') as GLTFResult
	// @ts-expect-error weird suspend types
	const envMap = useEnvironment({ files: suspend(studio).default })

	applyProps(materials['Scene_-_Root'], {
		color: '#030303',
		roughness: 0.4,
		metalness: 0.5,
		envMap
	})
	return (
		<group {...props} dispose={null}>
			<mesh
				receiveShadow
				castShadow
				scale={0.015}
				position={[0.5, 5.66, 6.75]}
				geometry={nodes.Object_2.geometry}
				material={materials['Scene_-_Root']}
				rotation={[-0.5, 0, Math.PI / 2 + 0.1]}
			/>
		</group>
	)
}

useGLTF.preload('/venus.glb')

type RadialGradientTextureProps = Omit<ThreeElements['canvasTexture'], 'args'> & {
	stops: Array<number>
	colors: Array<string>
	size?: number
	width?: number
	gradientCenter?: [x: number, y: number]
	radius?: number
}

function RadialGradientTexture({
	stops,
	colors,
	size = 1024,
	gradientCenter: [cx, cy] = [512, 512],
	radius = 512,
	...props
}: RadialGradientTextureProps) {
	const gl = useThree((state) => state.gl)

	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')!
	canvas.width = canvas.height = size

	const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius)
	stops.forEach((stop, i) => {
		gradient.addColorStop(stop, colors[i])
	})

	context.save()
	context.fillStyle = gradient
	context.fillRect(0, 0, size, size)
	context.restore()

	return <canvasTexture args={[canvas]} colorSpace={gl.outputColorSpace} attach="map" {...props} />
}
