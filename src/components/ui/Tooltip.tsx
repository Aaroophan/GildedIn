"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { useState, ReactNode } from 'react'

interface TooltipProps {
    content: string
    children: ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip = ({ content, children, position = 'top' }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false)

    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute z-50 px-3 py-2 bg-[var(--background)] border border-[var(--mono-4)]/30 rounded-lg shadow-lg text-sm font-comic text-[var(--foreground)] whitespace-nowrap ${positionClasses[position]}`}
                    >
                        <div className="absolute w-2 h-2 bg-[var(--background)] border-l border-t border-[var(--mono-4)]/30 transform rotate-45"
                             style={{
                                 top: position === 'bottom' ? '-4px' : position === 'top' ? '100%' : '50%',
                                 left: position === 'right' ? '-4px' : position === 'left' ? '100%' : '50%',
                                 transform: position === 'top' ? 'translateX(-50%) rotate(45deg)' :
                                          position === 'bottom' ? 'translateX(-50%) rotate(225deg)' :
                                          position === 'left' ? 'translateY(-50%) rotate(135deg)' :
                                          'translateY(-50%) rotate(315deg)'
                             }}
                        />
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}