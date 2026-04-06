import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"

export default function Modal({ children, Title, setIsModalOpen }: { children: React.ReactNode, Title?: string, setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Update URL when modal opens/closes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (Title) {
            params.set("action", Title)
        } else {
            params.delete("action")
        }

        router.replace(`?${params.toString()}`, { scroll: false })
    }, [Title, searchParams, router])

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("action")
        router.replace(`?${params.toString()}`, { scroll: false })

        setIsModalOpen(false)
    }, [router, searchParams, setIsModalOpen])

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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [handleClose])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
                opacity: { duration: 0.25 },
                scale: { type: "spring", stiffness: 300, damping: 25 },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/75 p-4 backdrop-blur-lg"
        >
            <div
                className="w-full max-w-7xl rounded-[1.5rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/82 p-5 shadow-[0_24px_80px_rgba(0,14,35,0.18)] backdrop-blur-xl sm:p-8"
                ref={ModalRef}
            >
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="font-mono text-sm font-bold tracking-[0.2em] text-[var(--mono-4)] uppercase sm:text-base">
                        {Title}
                    </h2>
                    <motion.button
                        type="button"
                        onClick={handleClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mono-4)]/16 text-[var(--foreground)]/60 transition-all duration-200 ease-in-out hover:border-[var(--mono-4)]/40 hover:text-[var(--mono-4)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </motion.button>
                </div>
                <hr className="h-px w-full bg-[var(--mono-4)]/12" />

                <div className="mt-5 max-h-[78vh] overflow-auto space-y-4 text-[var(--foreground)] scrollbar-custom">
                    {children}
                </div>
            </div>
        </motion.div>
    )
}
