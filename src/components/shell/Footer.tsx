"use client"

import { motion } from "framer-motion"
import { Instagram, Linkedin, Github, PenLine, Mail, Phone, FileText, ALargeSmall, User } from "lucide-react"

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative z-10 py-8 border-t border-[var(--mono-4)]/10 bg-[var(--background)]/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="font-mono flex items-center justify-center gap-2">
                    <a href="https://aaroophan.dev" className="font-oswald text-[var(--mono-4)] text-md">GildedIn</a>
                    <span className="font-mono text-sm text-[var(--foreground)]/60">by</span>
                    <a href="https://aaroophan.dev" className="font-inkfree font-medium text-[var(--foreground)]"><i>Aaroophan Varatharajan</i></a>
                </div>
                <div className="h-px flex-1 bg-[var(--mono-4)]/30" />

                <div className="flex items-center gap-4">
                    {[
                        { name: "Portfolio", icon: User, href: "https://aaroophan.dev" },
                        { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/aaroophan/?theme=dark" },
                        { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/aaroophan/" },
                        { name: "GitHub", icon: Github, href: "https://github.com/Aaroophan" },
                        { name: "Medium", icon: PenLine, href: "https://medium.com/@aaroophan" },
                        { name: "Email", icon: Mail, href: "mailto:arophn@gmail.com" },
                        { name: "Phone", icon: Phone, href: "https://wa.me/+94768505131" },
                        { name: "Resume", icon: FileText, href: "https://docs.google.com/document/d/1DfQIxQo6b5PwLa1kKXoS7bUM2pUMsKIY5_GTlorXpzk/edit?usp=sharing" }
                    ].map((link) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -3, scale: 1.1 }}
                            className="text-[var(--foreground)]/60 hover:text-[var(--mono-4)] transition-colors p-2 hover:bg-[var(--mono-4)]/10 rounded-full"
                            aria-label={link.name}
                        >
                            <link.icon size={18} />
                        </motion.a>
                    ))}
                </div>
            </div>
        </footer>
    )
}
