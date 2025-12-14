"use client"
import { motion } from "framer-motion"

export default function TechCorners({ Padding, Width, Height }: { Padding: number, Width: number, Height: number }) {
    const spacing = (val: number) => `${val * 0.25}rem`

    return (<>
        {/* Tech Corners */}
        <motion.div
            animate={{ width: spacing(Width), height: spacing(Height) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ top: `-${spacing(Padding)}`, left: `-${spacing(Padding)}` }}
            className="absolute border-t-2 border-l-2 border-[var(--mono-4)] rounded-tl-lg"
        />
        <motion.div
            animate={{ width: spacing(Width), height: spacing(Height) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ top: `-${spacing(Padding)}`, right: `-${spacing(Padding)}` }}
            className="absolute border-t-2 border-r-2 border-[var(--mono-4)] rounded-tr-lg"
        />
        <motion.div
            animate={{ width: spacing(Width), height: spacing(Height) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ bottom: `-${spacing(Padding)}`, left: `-${spacing(Padding)}` }}
            className="absolute border-b-2 border-l-2 border-[var(--mono-4)] rounded-bl-lg"
        />
        <motion.div
            animate={{ width: spacing(Width), height: spacing(Height) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ bottom: `-${spacing(Padding)}`, right: `-${spacing(Padding)}` }}
            className="absolute border-b-2 border-r-2 border-[var(--mono-4)] rounded-br-lg"
        />
    </>)
}