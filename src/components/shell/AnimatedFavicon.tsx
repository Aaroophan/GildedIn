"use client"

import { useEffect, useRef } from "react"

export default function AnimatedFavicon() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const animationRef = useRef<number | null>(null)

    useEffect(() => {
        // Create canvas if it doesn't exist
        if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas")
            canvasRef.current.width = 32
            canvasRef.current.height = 32
        }

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const img = new Image()
        img.src = "/images/Aaroophan-Main.ico"

        let angle = 0

        const updateFavicon = () => {
            if (!ctx || !img.complete || img.naturalWidth === 0) return

            // Clear canvas
            ctx.clearRect(0, 0, 32, 32)

            // Save context
            ctx.save()

            // Translate to center, rotate, translate back
            ctx.translate(16, 16)
            ctx.rotate((angle * Math.PI) / 180)
            ctx.translate(-16, -16)

            // Draw image scaled to 32x32
            ctx.drawImage(img, 0, 0, 32, 32)

            // Restore context
            ctx.restore()

            // Get data URL
            const dataUrl = canvas.toDataURL("image/x-icon")

            // Find and update link tag
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
            if (!link) {
                link = document.createElement("link")
                link.rel = "shortcut icon"
                document.head.appendChild(link)
            }
            link.type = "image/png"
            link.href = dataUrl

            // Increment angle
            angle = (angle + 2) % 360

            // Loop
            animationRef.current = requestAnimationFrame(updateFavicon)
        }

        img.onload = () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
            updateFavicon()
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [])

    return null
}
