import {
	Canvas,
	type CanvasProps,
	extend,
	applyProps,
	type ThreeElements,
	useThree,
	type Vector2,
	useFrame
} from '@react-three/fiber'
import {
	Mesh,
	Group,
	MeshStandardMaterial,
	EllipseCurve,
	TorusGeometry,
	PointLight,
	CanvasTexture,
	type Vector3Tuple
} from 'three'
import { OrbitControls, Torus, useEnvironment, useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Suspense, useEffect } from 'react'
import { suspend } from 'suspend-react'
import { MotionValue, cubicBezier, transform, useScroll, useTransform } from 'framer-motion'
const studio = import('@pmndrs/assets/hdri/studio.exr')
import { motion } from 'framer-motion-3d'
import { expoOut, type MotionVector3, type MotionVector3Tuple } from '@/utils/motion'

extend({
	Mesh,
	Group,
	PointLight,
	TorusGeometry,
	CanvasTexture,
	MeshStandardMaterial
})

// Eased
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
	const light = new EllipseCurve(0, 0, 10, 10, 0, 2 * Math.PI, false, 0)
	return (
		<Canvas {...props} camera={{ position: [20, 0, -5], fov: 8 }}>
			<CameraRig
				cameraLookAt={cameraLookAt}
				cameraPosition={cameraPosition}
				floatIntensity={floatIntensity}
				floatSpeed={floatSpeed}
			/>
			<RadialGradientTexture
				attach="background"
				stops={stops} // As many stops as you want
				colors={colors} // Colors need to match the number of stops
				radius={614}
				gradientCenter={[814, 400]}
				size={1024} // Size (height) is optional, default = 1024
			/>
			<Suspense fallback={null}>
				<motion.group
					initial={{ y: -3 }}
					animate={{ y: 0 }}
					transition={{ ease: expoOut, duration: 1 }}
				>
					<Venus position={[0, -2.25, 0]} rotation-y={0.425} />
					{/* <Box /> */}
					<Torus args={[1.2, 0.075]} rotation={[0.2, 0, 0]} position={[0, -0.25, -2.5]}>
						<meshStandardMaterial emissive={'#fff'} emissiveIntensity={1.5} />
					</Torus>
					<pointLight position={[0, 0, -2]} decay={0.5} intensity={2} />
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
			{/* <OrbitControls /> */}
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
