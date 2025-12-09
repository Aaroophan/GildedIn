import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TechnologiesService } from '@/models/Services/Technologies'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { Glow, GlowCapture } from '@codaworks/react-glow'
import Image from 'next/image'

// Marquee component for infinite scrolling
const SkillsMarquee = ({ skills, direction = "left", speed = 20 }: { skills: any[], direction?: "left" | "right", speed?: number }) => {
    return (
        <div className="relative flex overflow-hidden select-none gap-5 mask-linear-fade">
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[var(--background)] to-transparent w-20" />
            <div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none bg-gradient-to-l from-[var(--background)] to-transparent w-20" />

            <motion.div
                className="flex flex-nowrap gap-5 py-2"
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
                        className="flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-lg border-l-2 border-[var(--mono-4)] shadow-lg cursor-pointer bg-[var(--mono-4)]/5 backdrop-blur-lg w-42 h-32 hover:border-l-0 transition-all duration-300"
                    >
                        <div className="w-24 h-12 mb-3 flex items-center justify-center cursor-default">
                            <Image
                                src={icon}
                                alt={name}
                                width={50}
                                height={50}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=' + name;
                                }}
                                loading="lazy"
                            />
                        </div>
                        <span className="text-lg font-inkfree font-bold text-[var(--foreground)] text-center line-clamp-2">{name}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

export const Technologies = () => {
    const [Data, setData] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState<Boolean>(false)

    // Create refs for each category
    const categoryRefs = useRef<(HTMLDivElement | null)[]>([])

    const GetData = async () => {
        setIsLoading(true)

        try {
            const technologiesService = TechnologiesService.getInstance()
            const result = await technologiesService.Technologies("Aaroophan")

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

    return (
        <section id="Technologies" className="py-20 bg-gradient-to-b from-[var(--foreground)]/5 to-[var(--foreground)]/0 backdrop-blur-sm rounded-lg font-comic overflow-hidden">
            <GlowCapture><Glow color="var(--mono-4)" >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center font-comic text-4xl md:text-5xl font-bold pb-6 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent cursor-default"
                    >
                        {"Skills & Technologies".split('').map((letter, idx) => (
                            <motion.span
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.05, delay: idx * 0.05 }}
                                className="rounded-md hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.h2>

                    <div className="space-y-12">
                        {Data.Technologies.map(([category, skills]: any, categoryIndex: number) => (
                            <div
                                key={category}
                                ref={el => { categoryRefs.current[categoryIndex] = el }}
                            >
                                <motion.h3
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                                    className="text-xl font-bold mb-6 border-l-4 border-[var(--mono-4)] pl-3 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent rounded-lg cursor-default"
                                >
                                    {category}
                                </motion.h3>

                                {/* Pass skills to Marquee - alternate direction for visual interest if desired, or keep uniform */}
                                <SkillsMarquee
                                    skills={skills}
                                    direction={categoryIndex % 2 === 0 ? "left" : "right"}
                                    speed={50 + (skills.length * 2)} // Adjust speed based on content length to keep reasonable pace
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Glow></GlowCapture>
        </section>
    )
}