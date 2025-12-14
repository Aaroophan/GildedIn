"use client"

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TechnologiesService } from '@/models/Services/Technologies'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { Glow, GlowCapture } from '@codaworks/react-glow'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import GridBackground from '../ui/GridBackground'
import TechCorners from '../ui/TechCorners'
import FadingBackground from '../ui/FadingBackground'
import { LazySection } from '../providers/LazySection'

// Marquee component for infinite scrolling
const SkillsMarquee = ({ skills, direction = "left", speed = 20 }: { skills: any[], direction?: "left" | "right", speed?: number }) => {
    return (
        <div className="relative flex overflow-hidden select-none gap-5 mask-linear-fade">

            <motion.div
                className="flex flex-nowrap gap-5"
                animate={{
                    x: direction === "left" ? ["0%", "-25%"] : ["-25%", "0%"],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear",
                    },
                }}
                whileHover={{ animationPlayState: "paused" }}
            >
                {/* Duplicate items for seamless loop */}
                {[...skills, ...skills, ...skills, ...skills].map(([icon, name]: any, index: number) => (
                    <div
                        key={`${name}-${index}`}
                        className="relative flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-[var(--mono-4)]/5 w-48 h-30 group cursor-pointer hover:bg-[var(--mono-4)]/5 transition-colors duration-300"
                    >
                        <TechCorners Padding={0} Width={4} Height={2} />

                        <div className="w-16 h-16 mb-3 relative grayscale-10 group-hover:grayscale-0 transition-all duration-300">
                            <Image
                                src={icon}
                                alt={name}
                                fill
                                className="object-contain drop-shadow-md"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=' + name
                                }}
                                loading="lazy"
                            />
                        </div>
                        <span className="text-lg font-inkfree font-bold text-[var(--foreground)]/80 text-center line-clamp-2 group-hover:text-[var(--mono-4)] transition-colors">
                            {name}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export const Technologies = () => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const [Data, setData] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Create refs for each category
    const categoryRefs = useRef<(HTMLDivElement | null)[]>([])

    const GetData = async () => {
        setIsLoading(true)

        try {
            const technologiesService = TechnologiesService.getInstance()
            const result = await technologiesService.Technologies(endpoint)

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                setData(result)
                setError(null)
            } else {
                setError(result.Message)
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unknown error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        GetData()
    }, [])

    if (error) return <ErrorMessage message={error} />
    if (isLoading) return <Loading />

    // Prepare data for GridBackground (inject Name)
    const backgroundData = { ...Data, Name: decodedUsername }

    return (
        <section id="Technologies" className="relative min-h-screen py-20 px-4 overflow-hidden font-comic text-[var(--foreground)]">
            <GridBackground Data={backgroundData} Name={Technologies.name} Code={Technologies.toString()} />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="container max-w-8xl mx-auto relative z-10 px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-16 relative"
                        >
                            <div className="inline-block">
                                <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] uppercase tracking-wide">
                                    Skills & Technologies
                                </h2>
                                <div className="h-2 w-full bg-gradient-to-r from-transparent via-[var(--mono-4)] to-transparent rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        whileInView={{ x: "200%" }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute top-0 left-0 w-1/3 h-full bg-[var(--mono-4)] opacity-50 blur-[2px]"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-16">
                            {Data.Technologies.map(([category, skills]: any, categoryIndex: number) => (
                                <div
                                    key={category}
                                    ref={el => { categoryRefs.current[categoryIndex] = el }}
                                    className="relative"
                                >
                                    <LazySection threshold={0.1} delay={categoryIndex * 100} fallback={<div className="w-full h-25 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />}>
                                        <div className="relative">
                                            {/* Category Header with Tech Styling */}
                                            <div className="flex items-center gap-4 mb-6 pl-4 border-l-4 border-[var(--mono-4)]">
                                                <h3 className="text-2xl font-bold font-comic text-[var(--foreground)] tracking-widest">
                                                    {category}
                                                </h3>
                                                <div className="h-px flex-1 bg-gradient-to-r from-[var(--mono-4)]/30 to-transparent" />
                                            </div>

                                            {/* Marquee with Themed Cards */}
                                            <SkillsMarquee
                                                skills={skills}
                                                direction={categoryIndex % 2 === 0 ? "left" : "right"}
                                                speed={40 + (skills.length * 1.5)}
                                            />
                                        </div>
                                    </LazySection>
                                </div>
                            ))}
                        </div>
                    </div>
                </Glow>
            </GlowCapture>
        </section>
    )
}