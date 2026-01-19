"use client"

import { useParams, usePathname } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, Sun, Moon, Briefcase, Code, User, FileText, Send, Award, GraduationCap, Info, PenLine } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/hooks"
import { toggleTheme } from "@/models/store/themeSlice"
import { Button } from "../ui/Button"

const letterAnimation = {
    rest: { y: 0, opacity: 0.8 },
    hover: {
        y: -3,
        opacity: 1,
        textShadow: "0 0 8px var(--mono-4)",
        transition: { duration: 0.3 },
    },
}

const navItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            type: "spring" as const,
            stiffness: 100,
            damping: 10,
        },
    }),
}

export default function Header() {
    const params = useParams<{ username?: string }>()
    const pathname = usePathname()
    const username = params?.username || "Aaroophan"

    const navItems = [
        { name: "Home", href: `/${username}`, icon: null },
        { name: "About", href: `/${username}/About`, icon: User },
        { name: "Experience", href: `/${username}/Experience`, icon: Award },
        { name: "Projects", href: `/${username}/Projects`, icon: Briefcase },
        { name: "Blog", href: `/${username}/Blog`, icon: PenLine },
        { name: "Education", href: `/${username}/Education`, icon: GraduationCap },
        { name: "References", href: `/${username}/References`, icon: FileText },
        { name: "Contact", href: `/${username}/Contact`, icon: Send },
    ]

    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()
    const dispatch = useAppDispatch()
    const { resolvedTheme } = useAppSelector((state) => state.theme)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 50)
    })

    const isActive = (href: string) => {
        if (href === `/${username}`) {
            return pathname === `/${username}` || pathname === `/${username}/`
        }
        return pathname.startsWith(href)
    }

    const ThemeIcon = resolvedTheme === "dark" ? Moon : Sun

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-inkfree font-bold ${scrolled
                    ? "bg-[var(--background)]/70 backdrop-blur-xs shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-2 border-b border-[var(--mono-4)]/10"
                    : "bg-transparent py-4 border-b border-transparent"
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <Link href={`/${username}`} className="text-2xl font-bold font-oswald tracking-tight flex overflow-hidden group">
                        <motion.span
                            className="inline-block cursor-default bg-gradient-to-br from-mono-3 via-mono-4 to-mono-5 bg-clip-text text-transparent border border-2 border-r-[var(--mono-4)]/60 px-2 flex items-center justify-center"
                        >
                            {"GildedIn".split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    variants={letterAnimation}
                                    initial="rest"
                                    whileHover="hover"
                                    className="inline-block cursor-default bg-gradient-to-br from-mono-3 via-mono-4 to-mono-5 bg-clip-text text-transparent"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.span>
                        <motion.span
                            className="inline-block cursor-default bg-gradient-to-br from-mono-3 via-mono-4 to-mono-5 bg-clip-text text-transparent border border-2 border-l-[var(--mono-4)]/60 px-2 flex flex-col items-center justify-center"
                        >
                            {username.split("").map((char, index) => (
                                <motion.span
                                    key={index}
                                    variants={letterAnimation}
                                    initial="rest"
                                    whileHover="hover"
                                    className="inline-block cursor-default bg-gradient-to-br from-mono-3 via-mono-4 to-mono-5 bg-clip-text text-transparent"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.span>
                    </Link>

                    <nav className={`hidden xl:flex items-center gap-6 ${!scrolled && `bg-[var(--background)]/30 backdrop-blur-sm py-1 px-5 rounded-full border border-[var(--mono-4)]/5`}`}>
                        {navItems.map((item, i) => {
                            const active = isActive(item.href)
                            return (
                                <motion.div
                                    key={item.name}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={navItemVariants}
                                >
                                    <Link
                                        href={item.href}
                                        className={`text-md transition-all relative group flex items-center gap-2 ${active
                                            ? "text-[var(--mono-4)] font-semibold"
                                            : "text-[var(--foreground)]/80 hover:text-[var(--mono-4)]"
                                            }`}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                size={16}
                                                className={`transition-opacity ${active
                                                    ? "text-[var(--mono-4)] opacity-100"
                                                    : "text-[var(--foreground)] opacity-70 group-hover:opacity-100"
                                                    }`}
                                            />
                                        )}
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-block"
                                        >
                                            {item.name}
                                        </motion.span>
                                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--mono-4)] transition-all rounded-full opacity-50 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </nav>

                    <div className="hidden lg:flex items-center gap-6">

                        <motion.button
                            onClick={() => dispatch(toggleTheme())}
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--mono-4)]/10 hover:text-[var(--mono-4)] transition-colors"
                            aria-label="Toggle Theme"
                        >
                            <ThemeIcon size={20} />
                        </motion.button>

                        <Link href={`/login`}>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1 rounded-full text-[var(--foreground)] bg-[var(--mono-4)] transition-colors animate-ping scale-50"
                                aria-label="Information"
                                title={`Click Me`}
                            >
                                <Info size={25} />
                            </motion.button>
                        </Link>
                    </div>

                    <div className="xl:hidden flex items-center gap-6">
                        <motion.button
                            onClick={() => dispatch(toggleTheme())}
                            whileTap={{ rotate: 180 }}
                            className="p-2 text-[var(--foreground)]"
                        >
                            <ThemeIcon size={20} />
                        </motion.button>

                        <Link href={`/login`}>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1 rounded-full text-[var(--foreground)] bg-[var(--mono-4)] hover:bg-[var(--mono-4)]/10 hover:text-[var(--mono-4)] transition-colors animate-ping scale-50"
                                aria-label="Information"
                            >
                                <Info size={15} />
                            </motion.button>
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-[var(--foreground)] hover:text-[var(--mono-4)] transition-colors"
                            aria-label="Open Menu"
                        >
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </motion.header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-50 bg-[var(--background)]/95 backdrop-blur-xl border-l border-[var(--mono-4)]/20 flex flex-col p-6 xl:hidden font-inkfree font-bold"
                    >
                        {/* Grid Background Overlay for Menu */}
                        <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(var(--mono-4) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--mono-4)]/10">
                            <span className="text-2xl font-bold font-oswald text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-[var(--mono-4)] rounded-full animate-pulse" />
                                Navigation
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-[var(--foreground)] hover:text-[var(--mono-4)] hover:rotate-90 transition-all duration-300"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2 overflow-y-auto">
                            {navItems.map((item, i) => {
                                const active = isActive(item.href)
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`group flex items-center gap-4 text-xl p-4 rounded-xl transition-all border ${active
                                                ? "bg-[var(--mono-4)]/10 border-[var(--mono-4)]/20 text-[var(--mono-4)]"
                                                : "text-[var(--foreground)]/80 hover:bg-[var(--mono-4)]/10 border-transparent hover:border-[var(--mono-4)]/20"
                                                }`}
                                        >
                                            <div className={`p-2 rounded-lg transition-transform ${active
                                                ? "bg-[var(--mono-4)]/20 text-[var(--mono-4)] scale-110"
                                                : "bg-[var(--mono-4)]/5 text-[var(--mono-4)] group-hover:scale-110"
                                                }`}>
                                                {item.icon && <item.icon size={20} />}
                                            </div>
                                            <span className={`transition-transform ${active
                                                ? "translate-x-2 font-semibold"
                                                : "group-hover:translate-x-2"
                                                }`}>
                                                {item.name}
                                            </span>
                                            <div className={`ml-auto w-1 h-1 rounded-full bg-[var(--mono-4)] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}