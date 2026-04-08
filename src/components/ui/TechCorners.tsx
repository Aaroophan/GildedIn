"use client"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function TechCorners({ Padding, Width, Height }: { Padding: number, Width: number, Height: number }) {
    
    const [cornerDims, setCornerDims] = useState({ trw: 10, trh: 10, tlw: 10, tlh: 10, blw: 10, blh: 10, brw: 10, brh: 10 })

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
        }, 500)
        return () => clearInterval(interval)
    }, [])
        
    const spacing = (val: number) => `${val * 0.25}rem`

    return (<>
        {/* Tech Corners */}
        <motion.div
            animate={{ width: spacing(cornerDims.tlw), height: spacing(cornerDims.tlh) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ top: `-${spacing(Padding)}`, left: `-${spacing(Padding)}` }}
            className="absolute border-t-2 border-l-2 border-[var(--mono-4)] rounded-tl-lg"
        />
        <motion.div
            animate={{ width: spacing(cornerDims.trw), height: spacing(cornerDims.trh) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ top: `-${spacing(Padding)}`, right: `-${spacing(Padding)}` }}
            className="absolute border-t-2 border-r-2 border-[var(--mono-4)] rounded-tr-lg"
        />
        <motion.div
            animate={{ width: spacing(cornerDims.blw), height: spacing(cornerDims.blh) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ bottom: `-${spacing(Padding)}`, left: `-${spacing(Padding)}` }}
            className="absolute border-b-2 border-l-2 border-[var(--mono-4)] rounded-bl-lg"
        />
        <motion.div
            animate={{ width: spacing(cornerDims.brw), height: spacing(cornerDims.brh) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ bottom: `-${spacing(Padding)}`, right: `-${spacing(Padding)}` }}
            className="absolute border-b-2 border-r-2 border-[var(--mono-4)] rounded-br-lg"
        />
    </>)
}