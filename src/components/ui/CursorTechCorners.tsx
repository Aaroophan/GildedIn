"use client"

import { useEffect, useRef, useState } from "react"
import TechCorners from "@/components/ui/TechCorners"

const CURSOR_SIZE = 28
const CURSOR_OFFSET = CURSOR_SIZE / 2

export default function CursorTechCorners() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const [isEnabled, setIsEnabled] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const isVisibleRef = useRef(false)

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        const mediaQuery = window.matchMedia("(pointer: fine)")

        const updatePointerMode = () => {
            const enabled = mediaQuery.matches
            setIsEnabled(enabled)
            setIsVisible(false)
            isVisibleRef.current = false

            document.body.classList.toggle("cursor-tech-corners", enabled)
        }

        const handlePointerMove = (event: PointerEvent) => {
            if (!cursorRef.current || !mediaQuery.matches) {
                return
            }

            cursorRef.current.style.transform = `translate3d(${event.clientX - CURSOR_OFFSET}px, ${event.clientY - CURSOR_OFFSET}px, 0)`

            if (!isVisibleRef.current) {
                isVisibleRef.current = true
                setIsVisible(true)
            }
        }

        const handlePointerLeave = () => {
            isVisibleRef.current = false
            setIsVisible(false)
        }

        updatePointerMode()

        mediaQuery.addEventListener("change", updatePointerMode)
        window.addEventListener("pointermove", handlePointerMove, { passive: true })
        window.addEventListener("pointerleave", handlePointerLeave)
        window.addEventListener("blur", handlePointerLeave)

        return () => {
            mediaQuery.removeEventListener("change", updatePointerMode)
            window.removeEventListener("pointermove", handlePointerMove)
            window.removeEventListener("pointerleave", handlePointerLeave)
            window.removeEventListener("blur", handlePointerLeave)
            document.body.classList.remove("cursor-tech-corners")
        }
    }, [])

    if (!isEnabled) {
        return null
    }

    return (
        <div
            ref={cursorRef}
            aria-hidden="true"
            className={`pointer-events-none fixed left-0 top-0 z-[10000] transition-opacity duration-150 ${isVisible ? "opacity-100" : "opacity-0"}`}
            style={{
                width: `${CURSOR_SIZE}px`,
                height: `${CURSOR_SIZE}px`,
            }}
        >
            <div className="relative h-full w-full">
                <TechCorners Padding={0} Width={10} Height={10} Radius="xl" />
                <div
                    className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mono-4)]"
                />
            </div>
        </div>
    )
}
