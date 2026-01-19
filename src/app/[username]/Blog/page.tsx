"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Blog } from "@/components/sections/Blog"

export default function BlogPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Blog />
            </div>
        </GlowCapture>
    )
}
