"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, FileText, User, ShieldAlert, Cpu, Info, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import GridBackground from "@/components/ui/GridBackground"
import TechCorners from "@/components/ui/TechCorners"
import { Glow, GlowCapture } from "@codaworks/react-glow"
import { Button } from "@/components/ui/Button"
import { AuthService } from "@/models/Services/Auth"
import { signIn } from "next-auth/react"
import Tilt from "react-parallax-tilt"

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await AuthService.getInstance().login(email, password)
            if (response.Status === 200) {
                router.push("/Aaroophan")
            } else {
                setError(response.Message || "Login failed")
            }
        } catch (err) {
            setError("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    // Mock Data for the Grid Background to make it alive
    const mockData = {
        Name: "CLASSIFIED",
        Status: "RESTRICTED",
        System: "GILDED_IN_CORE",
        Code: "ACCESS_LEVEL_ALPHA"
    }

    return (
        <main className="min-h-screen relative overflow-hidden font-mono text-[var(--foreground)] flex flex-col items-center py-20 px-4">
            <GridBackground Data={mockData} Name="LOGIN_ACCESS" Code="RESTRICTED" />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12">

                        {/* Header Section */}
                        <motion.header
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center space-y-4"
                        >
                            <h1 className="text-5xl md:text-7xl font-bold font-oswald tracking-tight bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/50 bg-clip-text text-transparent">
                                GildedIn
                            </h1>
                            <p className="text-xl font-inkfree font-bold text-[var(--foreground)]/70 max-w-2xl mx-auto">
                                "Instant, dynamic portfolios for the modern professional."
                            </p>
                        </motion.header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                            {/* Platform Overview */}
                            <motion.section
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative bg-[var(--background)]/40 backdrop-blur-md rounded-xl p-8 border border-[var(--mono-4)]/20 hover:border-[var(--mono-4)]/50 transition-colors group"
                            >
                                <TechCorners Padding={4} Width={4} Height={4} />
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                                    <Cpu size={48} />
                                </div>

                                <h2 className="text-2xl font-bold font-oswald uppercase tracking-widest text-[var(--mono-4)] mb-6 flex items-center gap-3">
                                    <FileText size={24} />
                                    Platform Overview
                                </h2>

                                <div className="space-y-4 font-comic text-md leading-relaxed text-[var(--foreground)]/90 text-justify">
                                    <p>
                                        <strong className="text-[var(--mono-4)] font-oswald scale-105">GildedIn</strong> is a no-code portfolio platform that instantly gives users their own personalized space on the web through automatically generated dynamic routes. Upon signing up, GildedIn creates a unique URL like <span className="font-mono bg-[var(--mono-4)]/10 px-1 rounded">...com/Username</span> with nested sections such as Projects or About, functioning as mini websites that showcase a user’s profile, work, and visual preferences.
                                    </p>
                                    <p>
                                        Users can log in at any time to update their content, add projects, upload media, or tweak design settings through an intuitive dashboard, with all changes appearing in real time no coding or deployment required.
                                    </p>
                                    <p>
                                        Designed for users who don’t have the time to build a portfolio from scratch or need a substitute portfolio instantly, GildedIn combines responsive design, real-time editing, and optional animations or 3D visuals to make creating and maintaining a professional, visually rich portfolio effortless.
                                    </p>
                                </div>
                            </motion.section>

                            {/* Developer Note */}
                            <motion.section
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative bg-[var(--mono-4)]/5 backdrop-blur-md rounded-xl p-8 border border-[var(--mono-4)]/20 hover:border-[var(--mono-4)]/50 transition-colors group"
                            >
                                <TechCorners Padding={4} Width={4} Height={4} />
                                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-50 transition-opacity">
                                    <User size={48} />
                                </div>

                                <h2 className="text-2xl font-bold font-oswald uppercase tracking-widest text-[var(--mono-4)] mb-6 flex items-center gap-3">
                                    <ShieldAlert size={24} />
                                    Developer's Note
                                </h2>

                                <div className="font-inkfree font-bold text-lg leading-relaxed space-y-4">
                                    <p className="text-[var(--foreground)]">
                                        "I built this because I was tired of editing and updating my portfolio. I wanted something that felt like a CMS."
                                    </p>
                                    <div className="pt-4 flex items-center gap-4">
                                        <div className="h-px bg-[var(--mono-4)]/50 flex-1" />
                                        <span className="font-script text-xl text-[var(--mono-4)] tracking-wider">Aaroophan</span>
                                    </div>
                                    <div className="h-full flex justify-center items-center mt-6 font-inkfree font-bold tracking-wide text-[var(--foreground)] text-3xl">
                                        Visit
                                        <Link href={`/Aaroophan`}>
                                            <Button
                                                classname="ml-4 font-inkfree font-bold tracking-wide text-[var(--foreground)] text-3xl px-6 py-2 border border-[var(--mono-4)]/50 hover:border-[var(--mono-4)] hover:bg-[var(--mono-4)]/10 transition-all shadow-[0_0_10px_rgba(var(--mono-4-rgb),0.2)]"
                                                rounded={`rounded-xl`}
                                            >
                                                /Aaroophan
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="max-w-2xl mx-auto mt-8 bg-[var(--background)]/80 backdrop-blur-xl p-8 rounded-2xl border border-[var(--mono-4)]/20 hover:border-[var(--mono-4)]/40 transition-colors shadow-2xl shadow-[var(--mono-4)]/5 flex items-center justify-center"
                        >
                            <GlowCapture>
                                <Tilt
                                    tiltMaxAngleX={20}
                                    tiltMaxAngleY={20}
                                    glareEnable={false}
                                    perspective={1000}
                                    transitionSpeed={300}
                                    scale={1.05}
                                    className="inline-block p-2"
                                >
                                    <button
                                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                                        disabled={loading}
                                        className={`
                                            group relative ${`rounded-xl`}
                                            ${`w-full py-3 px-4 mt-2 text-lg font-bold tracking-wide flex items-center justify-center gap-5 rounded-xl shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.2)]/25 hover:shadow-[0_0_30px_rgba(var(--mono-4-rgb),0.4)]/25 transition`}
                                            hover:shadow-sm transition-all duration-300 ease-in-out disabled:opacity-50 
                                            bg-gradient-to-br from-[var(--mono-0)]/25 via-[var(--mono-4)]/25 to-[var(--mono-8)]/25
                                            focus:outline-none focus:ring-1 focus:ring-[var(--mono-4)] focus:ring-offset-1 cursor-pointer
                                            hover:scale-101
                                        `}
                                    >
                                        <Glow color='purple'>
                                            <span className={`relative z-1 ${`flex items-center justify-center`}`}>
                                                <svg width="64px" height="64px" viewBox="-65.5 -65.5 393.00 393.00" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.524"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path></g></svg>
                                                <span>Continue with Google</span>
                                            </span>
                                        </Glow>
                                        <span
                                            className={`
                                                absolute inset-0 ${`rounded-xl`}
                                                bg-gradient-to-br from-[var(--mono-8)]/25 via-[var(--mono-4)]/25 to-[var(--mono-0)]/25
                                                opacity-0 group-hover:opacity-100
                                                transition-opacity duration-300
                                                pointer-events-none
                                                z-0
                                            `}
                                        />
                                    </button>
                                </Tilt>
                            </GlowCapture>
                        </motion.div>

                    </div>
                </Glow>
            </GlowCapture>
        </main>
    )
}
