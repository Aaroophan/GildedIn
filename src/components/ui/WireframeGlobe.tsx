"use client"

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const GlobeMesh = () => {
    const meshRef = useRef<THREE.Mesh>(null!)

    useFrame((state, delta) => {
        meshRef.current.rotation.y += delta * 0.1
    })

    return (
        <group>
            {/* Main Wireframe Globe */}
            <Icosahedron args={[6, 2]} ref={meshRef}>
                <meshBasicMaterial
                    color="var(--mono-4)"
                    wireframe
                    transparent
                    opacity={0.1}
                />
            </Icosahedron>
        </group>
    )
}

export default function WireframeGlobe() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none mask-linear-fade">
            <div className="absolute inset-0 z-0 pointer-events-none mask-linear-fade-y">
                <Canvas camera={{ position: [10, 1, 1] }} gl={{ alpha: true }}>
                    <ambientLight intensity={0.5} />
                    <GlobeMesh />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
                </Canvas>
            </div>
        </div>
    )
}
