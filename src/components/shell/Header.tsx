"use client"

import { useParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, Sun, Moon, Briefcase, Code, User, FileText, Send, Award, GraduationCap } from "lucide-react"
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
    const username = params?.username || "Aaroophan"

    const navItems = [
        { name: "Home", href: `/${username}`, icon: null },
        { name: "About", href: `/${username}/About`, icon: User },
        { name: "Technologies", href: `/${username}/Technologies`, icon: Code },
        { name: "Projects", href: `/${username}/Projects`, icon: Briefcase },
        { name: "Experience", href: `/${username}/Experience`, icon: Award },
        { name: "Education", href: `/${username}/Education`, icon: GraduationCap },
        { name: "Reference", href: `/${username}/Reference`, icon: FileText },
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

    // Toggle Theme with Animation
    const ThemeIcon = resolvedTheme === "dark" ? Moon : Sun

    return (
        <>
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-inkfree font-bold ${scrolled
                    ? "bg-[var(--background)]/70 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-2 border-b border-[var(--mono-4)]/10"
                    : "bg-transparent py-4 border-b border-transparent"
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href={`/${username}`} className="text-2xl font-bold font-oswald tracking-tight flex overflow-hidden group">
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
                    </Link>

                    {/* Desktop Nav */}
                    <nav className={`hidden xl:flex items-center gap-6 ${!scrolled && `bg-[var(--background)]/30 backdrop-blur-sm py-1 px-5 rounded-full border border-[var(--mono-4)]/5`}`}>
                        {navItems.map((item, i) => (
                            <motion.div
                                key={item.name}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={navItemVariants}
                            >
                                <Link
                                    href={item.href}
                                    className="text-md text-[var(--foreground)]/80 hover:text-[var(--mono-4)] transition-all relative group flex items-center gap-2"
                                >
                                    {item.icon && (
                                        <item.icon size={16} className="text-[var(--foreground)] opacity-70 group-hover:opacity-100 transition-opacity" />
                                    )}
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-block"
                                    >
                                        {item.name}
                                    </motion.span>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--mono-4)] transition-all group-hover:w-full rounded-full opacity-50" />
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-4">
                        {/* Theme Toggle */}
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
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="xl:hidden flex items-center gap-4">
                        <motion.button
                            onClick={() => dispatch(toggleTheme())}
                            whileTap={{ rotate: 180 }}
                            className="p-2 text-[var(--foreground)]"
                        >
                            <ThemeIcon size={20} />
                        </motion.button>

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

            {/* Mobile Menu Overlay */}
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
                            {navItems.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="group flex items-center gap-4 text-xl text-[var(--foreground)]/80 p-4 hover:bg-[var(--mono-4)]/10 rounded-xl transition-all border border-transparent hover:border-[var(--mono-4)]/20"
                                    >
                                        <div className="p-2 rounded-lg bg-[var(--mono-4)]/5 text-[var(--mono-4)] group-hover:scale-110 transition-transform">
                                            {item.icon && <item.icon size={20} />}
                                        </div>
                                        <span className="group-hover:translate-x-2 transition-transform group-hover:text-[var(--foreground)]">{item.name}</span>
                                        <div className="ml-auto w-1 h-1 rounded-full bg-[var(--mono-4)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
