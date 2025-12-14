"use client"

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Torus, Icosahedron, Float } from '@react-three/drei'
import * as THREE from 'three'

const HolographicRing = ({
    radius = 3,
    tube = 0.02,
    speed = 0.5,
    ...props
}) => {
    const meshRef = useRef<THREE.Mesh>(null!)

    useFrame((state, delta) => {
        meshRef.current.rotation.z += delta * speed * 0.5
        meshRef.current.rotation.x += delta * speed * 0.2
    })

    return (
        <Torus args={[radius, tube, 16, 100]} ref={meshRef} {...props}>
            <meshBasicMaterial
                color="var(--mono-4)"
                transparent
                opacity={0.3}
                wireframe
            />
        </Torus>
    )
}

const FloatingDataCore = () => {
    const meshRef = useRef<THREE.Mesh>(null!)

    useFrame((state, delta) => {
        meshRef.current.rotation.y -= delta * 0.5
        meshRef.current.rotation.x += delta * 0.2
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Icosahedron args={[1.5, 1]} ref={meshRef}>
                <meshBasicMaterial
                    color="var(--mono-4)"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Icosahedron>
        </Float>
    )
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mask-radial-fade">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)] z-10" />

            <Canvas camera={{ position: [0, 0, 10], fov: 50 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />

                {/* Center Core */}
                <FloatingDataCore />

                {/* Orbiting Rings */}
                <HolographicRing radius={3.5} speed={0.2} rotation={[Math.PI / 3, 0, 0]} />
                <HolographicRing radius={4.2} speed={-0.15} rotation={[-Math.PI / 4, 0, 0]} />
                <HolographicRing radius={5.0} speed={0.1} tube={0.01} opacity={0.1} />

            </Canvas>
        </div>
    )
}
