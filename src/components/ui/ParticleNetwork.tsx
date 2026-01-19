"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ParticleConnections = ({ count = 100, radius = 1.5, maxDistance = 1.5 }) => {
    const pointsRef = useRef<THREE.Points>(null!)
    const linesRef = useRef<THREE.LineSegments>(null!)

    // Initial random positions and velocities
    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const vel = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10
            vel[i * 3] = (Math.random() - 0.5) * 0.02
            vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02
        }
        return [pos, vel]
    }, [count])

    // Buffer for line positions (max possible lines = count * count, but we limit for perf)
    // Dynamic line geometry is expensive, so we'll use a fixed buffer and update it
    const linePositions = useMemo(() => new Float32Array(count * count * 3), [count])

    useFrame(() => {
        if (!pointsRef.current || !linesRef.current) return

        // Update point positions
        const currentPositions = pointsRef.current.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < count; i++) {
            // Update position based on velocity
            currentPositions[i * 3] += velocities[i * 3]
            currentPositions[i * 3 + 1] += velocities[i * 3 + 1]
            currentPositions[i * 3 + 2] += velocities[i * 3 + 2]

            // Bounce off boundaries (simple box)
            if (Math.abs(currentPositions[i * 3]) > 5) velocities[i * 3] *= -1
            if (Math.abs(currentPositions[i * 3 + 1]) > 5) velocities[i * 3 + 1] *= -1
            if (Math.abs(currentPositions[i * 3 + 2]) > 5) velocities[i * 3 + 2] *= -1
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true

        // Update connections
        let lineIndex = 0
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dx = currentPositions[i * 3] - currentPositions[j * 3]
                const dy = currentPositions[i * 3 + 1] - currentPositions[j * 3 + 1]
                const dz = currentPositions[i * 3 + 2] - currentPositions[j * 3 + 2]
                const distSq = dx * dx + dy * dy + dz * dz

                if (distSq < maxDistance * maxDistance) {
                    // Add line segment
                    linePositions[lineIndex++] = currentPositions[i * 3]
                    linePositions[lineIndex++] = currentPositions[i * 3 + 1]
                    linePositions[lineIndex++] = currentPositions[i * 3 + 2]

                    linePositions[lineIndex++] = currentPositions[j * 3]
                    linePositions[lineIndex++] = currentPositions[j * 3 + 1]
                    linePositions[lineIndex++] = currentPositions[j * 3 + 2]
                }
            }
        }

        // Update line geometry
        linesRef.current.geometry.setDrawRange(0, lineIndex / 3) // count is number of vertices
        linesRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={count}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#2a9d8f"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                />
            </points>

            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={linePositions.length / 3}
                        array={linePositions}
                        itemSize={3}
                        usage={THREE.DynamicDrawUsage}
                        args={[linePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#2a9d8f"
                    transparent
                    opacity={0.15}
                    linewidth={1}
                />
            </lineSegments>
        </>
    )
}

// Wrapper to handle Theme Colors
const ThemedNetwork = () => {
    // In a real app we might use a hook to get the theme color. 
    // For now we hardcode the teal/cyan often used in the theme or try to read it.
    // The "RainEffect" used a mix-blend overlay. We can do similar or just specific color.
    return <ParticleConnections count={60} />
}

export default function ParticleNetwork() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none mask-linear-fade">
            <div className="absolute inset-0 bg-[var(--mono-4)]/5 mix-blend-overlay z-10" />
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }}>
                <ThemedNetwork />
                <ambientLight intensity={0.5} />
            </Canvas>
        </div>
    )
}
