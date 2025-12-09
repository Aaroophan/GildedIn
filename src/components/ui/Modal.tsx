import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Modal({ children, Title, setIsModalOpen }: { children: React.ReactNode, Title?: string, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    
    // Update URL when modal opens/closes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (Title) {
            params.set('action', Title)
        } else {
            params.delete('action')
        }
        
        router.replace(`?${params.toString()}`, { scroll: false })
    }, [Title, searchParams, router])
        
    const handleClose = () => {
        // Remove action parameter when closing modal
        const params = new URLSearchParams(searchParams.toString())
        params.delete('action')
        router.replace(`?${params.toString()}`, { scroll: false })
        
        setIsModalOpen(false)
    }
    
    const ModalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ModalRef.current && !ModalRef.current.contains(event.target as Node)) {
                handleClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [handleClose])
        
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
                opacity: { duration: 0.25 },
                scale: { type: 'spring', stiffness: 300, damping: 25 },
            }}
            className="fixed inset-0 bg-[var(--background)]/75 backdrop-blur-lg z-50 flex items-center justify-center"
        >
            <div className="bg-[var(--background)]/75 backdrop-blur-lg rounded-xl p-10 max-w-7xl min-w-xl" ref={ModalRef}>
                <div className="sticky z-60 flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[var(--secondary-color)]">
                        {Title}
                    </h2>
                    <motion.button 
                        // initial={{ scale: 1 }}
                        // animate={{ scale: 1 }}
                        // whileHover={{ rotate: 90 }}
                        // transition={{
                        //     rotate: { duration: 0.25, ease: "easeInOut" },
                        // }}
                        onClick={handleClose}
                        className="text-gray-500 hover:text-red-500 hover:scale-125 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </motion.button>
                </div>
                <hr className="w-full h-0.5 bg-[var(--mono-8)]/5"/>
                
                <div className="overflow-auto scrollbar-custom max-h-[69vh] space-y-4 mt-5 text-black">
                    {children}
                </div>
            </div>
        </motion.div>
    )
}