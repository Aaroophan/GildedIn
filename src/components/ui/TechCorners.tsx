"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function TechCorners({
    Padding,
    Width,
    Height,
    Radius = "lg"
}: {
    Padding: number
    Width: number
    Height: number
    Radius?: "none" | "sm" | "md" | "lg" | "xl" | "full"
}) {

    const [cornerDims, setCornerDims] = useState({
        trw: 10, trh: 10,
        tlw: 10, tlh: 10,
        blw: 10, blh: 10,
        brw: 10, brh: 10
    })

    useEffect(() => {
        const interval = setInterval(() => {
            setCornerDims({
                trw: Math.floor(Math.random() * 2 * Width) + 1,
                trh: Math.floor(Math.random() * 2 * Height) + 1,
                tlw: Math.floor(Math.random() * 2 * Width) + 1,
                tlh: Math.floor(Math.random() * 2 * Height) + 1,
                blw: Math.floor(Math.random() * 2 * Width) + 1,
                blh: Math.floor(Math.random() * 2 * Height) + 1,
                brw: Math.floor(Math.random() * 2 * Width) + 1,
                brh: Math.floor(Math.random() * 2 * Height) + 1
            })
        }, (Math.random() * 750) + 250)

        return () => clearInterval(interval)
    }, [Width, Height])

    const spacing = (val: number) => `${val * 0.25}rem`

    const radiusMap: Record<string, string> = {
        none: "0px",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
    }

    const r = radiusMap[Radius]

    return (
        <>
            {/* TL */}
            <motion.div
                animate={{ width: spacing(cornerDims.tlw), height: spacing(cornerDims.tlh) }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                    top: `-${spacing(Padding)}`,
                    left: `-${spacing(Padding)}`,
                    borderTopLeftRadius: r
                }}
                className="absolute border-t-2 border-l-2 border-[var(--mono-4)]"
            />

            {/* TR */}
            <motion.div
                animate={{ width: spacing(cornerDims.trw), height: spacing(cornerDims.trh) }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                    top: `-${spacing(Padding)}`,
                    right: `-${spacing(Padding)}`,
                    borderTopRightRadius: r
                }}
                className="absolute border-t-2 border-r-2 border-[var(--mono-4)]"
            />

            {/* BL */}
            <motion.div
                animate={{ width: spacing(cornerDims.blw), height: spacing(cornerDims.blh) }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                    bottom: `-${spacing(Padding)}`,
                    left: `-${spacing(Padding)}`,
                    borderBottomLeftRadius: r
                }}
                className="absolute border-b-2 border-l-2 border-[var(--mono-4)]"
            />

            {/* BR */}
            <motion.div
                animate={{ width: spacing(cornerDims.brw), height: spacing(cornerDims.brh) }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                    bottom: `-${spacing(Padding)}`,
                    right: `-${spacing(Padding)}`,
                    borderBottomRightRadius: r
                }}
                className="absolute border-b-2 border-r-2 border-[var(--mono-4)]"
            />
        </>
    )
}