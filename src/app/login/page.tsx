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
                                        <strong className="text-[var(--mono-4)]">GildedIn</strong> is a no-code portfolio platform that instantly gives users their own personalized space on the web through automatically generated dynamic routes. Upon signing up, GildedIn creates a unique URL like <span className="font-mono bg-[var(--mono-4)]/10 px-1 rounded">...com/Username</span> with nested sections such as Projects or About, functioning as mini websites that showcase a user’s profile, work, and visual preferences.
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

                        {/* Mock Login Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="max-w-2xl mx-auto mt-8 bg-[var(--background)]/80 backdrop-blur-xl p-8 rounded-2xl border border-[var(--mono-4)]/20 hover:border-[var(--mono-4)]/40 transition-colors shadow-2xl shadow-[var(--mono-4)]/5 flex items-center justify-center"
                        >
                            <form className="space-y-5 text-left max-w-xl" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                                <h3 className="text-[var(--foreground)] font-oswald font-bold text-2xl mb-6 text-center tracking-wide">
                                    Welcome
                                </h3>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--foreground)]/70">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="user@gilded.in"
                                        className="w-full bg-[var(--mono-1)]/0 border border-[var(--mono-4)]/20 rounded-lg p-3 text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:border-[var(--mono-4)]/50 focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="block text-sm font-medium text-[var(--foreground)]/70">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-[var(--mono-1)]/0 border border-[var(--mono-4)]/20 rounded-lg p-3 pr-10 text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:border-[var(--mono-4)]/50 focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-[var(--foreground)]/40 hover:text-[var(--mono-4)] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm animate-pulse">{error}</p>
                                )}

                                <div className="flex items-center justify-center">
                                    <Button
                                        classname="w-full py-3 px-4 mt-2 text-lg font-bold tracking-wide shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.2)] hover:shadow-[0_0_30px_rgba(var(--mono-4-rgb),0.4)]"
                                        rounded="rounded-xl"
                                        flex={`flex items-center justify-center`}
                                        onClick={handleLogin}
                                        disabled={loading}
                                    >
                                        {loading ? "Authenticating..." : "Sign In"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>

                    </div>
                </Glow>
            </GlowCapture>
        </main>
    )
}
