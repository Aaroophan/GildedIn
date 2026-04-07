"use client"

import { motion } from 'framer-motion'
import { useState } from 'react'

interface TimelineItem {
    time: string
    activity: string
    color: string
}

interface TimelineProps {
    items: TimelineItem[]
}

export const Timeline = ({ items }: TimelineProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--mono-4)]/20 via-[var(--mono-4)]/50 to-[var(--mono-4)]/20" />

            <div className="space-y-8">
                {items.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="relative flex items-center gap-6 group"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Timeline dot */}
                        <div className="relative z-10">
                            <motion.div
                                className={`w-4 h-4 rounded-full border-2 border-[var(--mono-4)] ${item.color} shadow-lg`}
                                whileHover={{ scale: 1.2 }}
                                animate={hoveredIndex === index ? { scale: 1.2 } : { scale: 1 }}
                            />
                            <motion.div
                                className={`absolute inset-0 rounded-full ${item.color} opacity-30`}
                                animate={hoveredIndex === index ? { scale: 2, opacity: 0.5 } : { scale: 1, opacity: 0.3 }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Content card */}
                        <motion.div
                            className="flex-1 p-4 bg-[var(--background)]/50 backdrop-blur-sm border border-[var(--foreground)]/10 rounded-lg hover:border-[var(--mono-4)]/30 transition-all duration-300 cursor-pointer"
                            whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(var(--mono-4-rgb), 0.1)" }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-mono text-[var(--mono-4)] font-bold">
                                        {item.time}
                                    </span>
                                    <div className="h-px w-8 bg-[var(--mono-4)]/30" />
                                    <span className="font-comic text-[var(--foreground)] font-medium">
                                        {item.activity}
                                    </span>
                                </div>
                                <motion.div
                                    className={`w-3 h-3 rounded-full ${item.color}`}
                                    animate={hoveredIndex === index ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                    transition={{ duration: 0.6, repeat: hoveredIndex === index ? Infinity : 0 }}
                                />
                            </div>

                            {/* Progress bar */}
                            <motion.div
                                className="mt-3 h-1 bg-[var(--foreground)]/10 rounded-full overflow-hidden"
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                            >
                                <motion.div
                                    className={`h-full ${item.color} rounded-full`}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "100%" }}
                                    transition={{ duration: 1.5, delay: index * 0.3 }}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}