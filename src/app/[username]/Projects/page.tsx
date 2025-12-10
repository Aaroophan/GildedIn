"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Projects } from "@/components/sections/Projects"

export default function ProjectsPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Projects />
            </div>
        </GlowCapture>
    )
}
