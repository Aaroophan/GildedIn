"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X, Sun, Moon, Briefcase, Code, User, FileText, Send, Award, GraduationCap } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/hooks"
import { toggleTheme } from "@/models/store/themeSlice"
import { Button } from "../ui/Button"

const navItems = [
    { name: "Home", href: "/", icon: null },
    { name: "About", href: "#about", icon: User },
    { name: "Technologies", href: "#tech", icon: Code },
    { name: "Projects", href: "#projects", icon: Briefcase },
    { name: "Experience", href: "#experience", icon: Award },
    { name: "Education", href: "#education", icon: GraduationCap },
    { name: "Contact", href: "#contact", icon: Send },
]

const letterAnimation = {
    rest: { y: 0, rotate: 0 },
    hover: {
        y: -5,
        rotate: [0, -10, 10, -5, 5, 0],
        transition: { duration: 0.5, type: "spring" as const, stiffness: 300 },
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
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-[var(--background)]/50 backdrop-blur-md shadow-md py-2"
                    : "bg-transparent py-4"
                    }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold font-oswald tracking-tight flex overflow-hidden">
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
                    <nav className={`hidden lg:flex items-center gap-6 ${!scrolled && `bg-[var(--background)]/50 backdrop-blur-sm py-1 px-5 rounded-full`}`}>
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
                                    className="font-bold font-inkfree text-sm text-[var(--foreground)] opacity-80 hover:opacity-100 transition-opacity relative group flex items-center gap-2"
                                >
                                    {item.icon && (
                                        <item.icon size={16} />
                                    )}
                                    <motion.span
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-block"
                                    >
                                        {item.name}
                                    </motion.span>
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
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
                            className="p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--mono-2)]/10 dark:hover:bg-[var(--mono-6)]/10 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            <ThemeIcon size={20} />
                        </motion.button>

                        {/* CTA
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1, type: "spring" }}
                        >
                            <Button
                                type="button"
                                classname={`w-40 disabled:opacity-75 text-foreground dark:text-foreground font-bold py-1 px-6 m-1 text-lg font-inkfree`}
                                disabled={false}
                                rounded="rounded-xl"
                                onclick={() => { alert("Building") }}
                                tooltip="Your Portfolio"
                            >
                                Your Portfolio
                            </Button>
                        </motion.div> */}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden flex items-center gap-4">
                        <motion.button
                            onClick={() => dispatch(toggleTheme())}
                            whileTap={{ rotate: 180 }}
                            className="p-2 text-[var(--foreground)]"
                        >
                            <ThemeIcon size={20} />
                        </motion.button>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-[var(--foreground)]"
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
                        className="fixed inset-0 z-50 bg-white dark:bg-[#000e23] flex flex-col p-6 lg:hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-2xl font-bold font-oswald bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                Menu
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-[var(--foreground)] hover:text-red-500 transition-colors"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-4">
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
                                        className="group flex items-center gap-4 text-2xl font-inkfree font-bold text-[var(--foreground)] p-2 hover:bg-[var(--mono-2)]/5 rounded-xl transition-all"
                                    >
                                        {item.icon && (
                                            <item.icon className="text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" size={24} />
                                        )}
                                        <span className="group-hover:translate-x-2 transition-transform">{item.name}</span>
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6"
                            >
                                <Button
                                    type="button"
                                    classname="w-full py-4 text-lg font-bold bg-primary text-white shadow-xl"
                                    onclick={() => setMobileMenuOpen(false)}
                                >
                                    Create Your Portfolio
                                </Button>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
