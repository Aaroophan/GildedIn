"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RainParticles = ({ count = 500 }) => {
    const points = useRef<THREE.Points>(null!)

    // Generate random positions for rain drops
    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50 // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50 // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 // z
        }
        return positions
    }, [count])

    useFrame((state, delta) => {
        if (!points.current) return

        const positions = points.current.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < count; i++) {
            // Move drops down
            positions[i * 3 + 1] -= 12 * delta

            // Reset when they fall below a certain point
            if (positions[i * 3 + 1] < -25) {
                positions[i * 3 + 1] = 25
            }
        }

        points.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                    args={[particlesPosition, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="var(--mono-4)"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default function RainEffect() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none mask-linear-fade">
            {/* Gradient overlay to tint the rain with the theme color */}
            <div className="absolute inset-0 mix-blend-overlay z-10" />
            <Canvas camera={{ position: [10, 1, 10], fov: 60 }} gl={{ alpha: true }}>
                <RainParticles />
                <ambientLight intensity={0.5} />
            </Canvas>
        </div>
    )
}
