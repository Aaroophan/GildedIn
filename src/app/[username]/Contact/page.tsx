"use client"

import { GlowCapture } from "@codaworks/react-glow"
import { Contacts } from "@/components/sections/Contact"

export default function ContactPage() {
    return (
        <GlowCapture>
            <div className="relative z-10 bg-[var(--background)] min-h-screen mt-10">
                <Contacts />
            </div>
        </GlowCapture>
    )
}
