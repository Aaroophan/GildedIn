'use client'

import { motion } from 'framer-motion'

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0.8 }}
            animate={{ 
                opacity: [1, 0.8, 1]
            }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="h-full w-full flex items-center justify-center" 
            role="alert"
        >
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-5">
                <div className="flex px-4 py-2">
                    <div className="font-bold mr-4">Error:</div>
                    <div className="space-y-1">
                        {message.split('\n').map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}