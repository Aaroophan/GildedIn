"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Experiences } from "@/components/sections/Experiences"

export default function ExperiencePage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Experiences />
            </div>
        </GlowCapture>
    )
}
