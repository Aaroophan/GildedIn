"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Educations } from "@/components/sections/Educations"

export default function EducationPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Educations />
            </div>
        </GlowCapture>
    )
}
