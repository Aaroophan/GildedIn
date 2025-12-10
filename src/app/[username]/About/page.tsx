"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { About } from "@/components/sections/About"

export default function AboutPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen">
                <About />
            </div>
        </GlowCapture>
    )
}
