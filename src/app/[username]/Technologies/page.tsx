"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Technologies } from "@/components/sections/Technologies"

export default function TechnologiesPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Technologies />
            </div>
        </GlowCapture>
    )
}
