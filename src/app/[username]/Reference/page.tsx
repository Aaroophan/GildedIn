"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { References } from "@/components/sections/References"

export default function ReferencePage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <References />
            </div>
        </GlowCapture>
    )
}
