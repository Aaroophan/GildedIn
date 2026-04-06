"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Skills } from "@/components/sections/Skills"

export default function SkillsPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Skills />
            </div>
        </GlowCapture>
    )
}
