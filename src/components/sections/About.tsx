import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LazySection } from '../providers/LazySection'
import { AboutService } from '@/models/Services/About'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { Glow, GlowCapture } from '@codaworks/react-glow'
import * as LucideIcons from "lucide-react"
import FadingBackground from '../ui/FadingBackground'
import { useParams } from "next/navigation"

export const About = () => {
    const params = useParams<{ username?: string }>()
    const endpoint = `/${params?.username || ""}`

    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: false })

    const [Data, setData] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'about' | 'values' | 'interests' | 'trivia'>('about')

    const [funFacts, setFunFacts] = useState<any[]>([])
    const [values, setValues] = useState<any[]>([])
    const [interests, setInterests] = useState<any[]>([])
    const [dayRythm, setDayRythm] = useState<any[]>([])

    const GetData = async () => {
        setIsLoading(true)

        try {
            const aboutService = AboutService.getInstance()
            const result = await aboutService.About(endpoint)

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                setData(result)
                setValues(result.Values)
                setInterests(result.Interests)
                setFunFacts(result.FunFacts)
                setDayRythm(result.Day)
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

    const paragraphs = Data?.About?.Description.split('\n\n')

    useEffect(() => {
        GetData()
    }, [])

    if (error) return <ErrorMessage message={error} />
    if (isLoading) return <Loading />

    return (
        <section id="about" className="snap-start py-8 cursor-default px-4">
            <FadingBackground Value="Images" />
            <GlowCapture><Glow color='var(--mono-4)'>
                <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 rounded-xl border-l-4 border-[var(--mono-4)] shadow-lg hover:shadow-xl cursor-default bg-[var(--mono-4)]/5 backdrop-blur-xs py-2" ref={ref}>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent">
                            {"Beyond the Code".split('').map((letter, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                    transition={{ duration: 0.05, delay: idx * 0.05 }}
                                    className="rounded-md hover:text-[var(--mono-4)] transition-colors"
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </h2>
                        <p className="text-center text-[var(--foreground)]/70 mb-5 font-comic">
                            Getting to know the person behind the keyboard
                        </p>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                        {['about', 'values', 'interests', 'trivia'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`font-inkfree font-bold w-30 px-5 py-1 rounded-full transition-all duration-300 ${activeTab === tab
                                    ? 'bg-[var(--mono-4)] text-white shadow-lg'
                                    : 'bg-[var(--mono-4)]/10 text-[var(--foreground)] hover:bg-[var(--mono-4)]/20'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content Sections */}
                    <div className="min-h-[80vh] max-h-[80vh] font-comic ">
                        {/* About Tab */}
                        {activeTab === 'about' && (
                            <div className="max-w-7xl mx-auto flex flex-col gap-4 text-justify">
                                {paragraphs.map((paragraph: string, index: number) => (
                                    <LazySection
                                        key={index}
                                        threshold={0.2}
                                        delay={index * 150}
                                        className="relative"
                                        fallback={<div className="h-10 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />}
                                    >
                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="leading-relaxed whitespace-pre-line bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background)] dark:from-[var(--foreground)] dark:via-[var(--foreground)] dark:to-[var(--foreground)] bg-clip-text text-[var(--background)] dark:text-[var(--foreground)] text-md"
                                        >
                                            {paragraph}
                                        </motion.p>
                                    </LazySection>
                                ))}
                            </div>
                            // </Glow>
                        )}

                        {/* Values Tab */}
                        {activeTab === 'values' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                                {values?.map((value: any, index: number) => {
                                    // @ts-ignore
                                    const Icon = LucideIcons[value.icon] || LucideIcons.HelpCircle
                                    return (
                                        <LazySection
                                            key={index}
                                            threshold={0.1}
                                            delay={index * 100}
                                            fallback={
                                                <div className="h-35 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />
                                            }
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="group p-6 rounded-xl bg-gradient-to-br from-[var(--mono-4)]/20 to-transparent border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 transition-all duration-300 backdrop-blur-sm"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${value.color} text-white`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold mb-2 text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors">
                                                            {value.title}
                                                        </h3>
                                                        <p className="text-[var(--foreground)]/70">
                                                            {value.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </LazySection>
                                    )
                                })}
                            </div>
                        )}

                        {/* Interests Tab */}
                        {interests && (activeTab === 'interests') && (
                            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                                {interests?.map((interest: any, index: number) => {
                                    // @ts-ignore
                                    const Icon = LucideIcons[interest.icon] || LucideIcons.HelpCircle
                                    return (
                                        <LazySection
                                            key={index}
                                            threshold={0.05}
                                            delay={index * 50}
                                            fallback={
                                                <div className="h-40 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />
                                            }
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-[var(--mono-4)]/20 to-transparent border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 transition-all duration-300"
                                            >
                                                <div className={`p-3 rounded-full bg-gradient-to-br ${interest.color} text-white mb-4`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h4 className="font-semibold text-[var(--foreground)] mb-2 text-center">
                                                    {interest.name}
                                                </h4>
                                                <div className="w-full bg-[var(--mono-4)]/10 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${interest.level}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h-full bg-gradient-to-r ${interest.color} rounded-full`}
                                                    />
                                                </div>
                                                <span className="text-xs mt-2 text-[var(--foreground)]/60">
                                                    {interest.level}% enthusiasm
                                                </span>
                                            </motion.div>
                                        </LazySection>
                                    )
                                })}
                            </div>
                        )}

                        {/* Trivia Tab */}
                        {activeTab === 'trivia' && (
                            <div className="max-w-6xl mx-auto">
                                <LazySection threshold={0.1}>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        className="text-center mb-8"
                                    >
                                        <h3 className="text-2xl font-bold mb-2 text-[var(--foreground)]">
                                            Fun Facts & Trivia
                                        </h3>
                                        <p className="text-[var(--foreground)]/70">
                                            Random things that make me, me
                                        </p>
                                    </motion.div>
                                </LazySection>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {funFacts?.map((fact: any, index: number) => {
                                        // @ts-ignore
                                        const Icon = LucideIcons[fact.icon] || LucideIcons.HelpCircle
                                        return (
                                            <LazySection
                                                key={index}
                                                threshold={0.05}
                                                delay={index * 100}
                                                fallback={
                                                    <div className="h-32 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />
                                                }
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, rotateY: 90 }}
                                                    whileInView={{ opacity: 1, rotateY: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="group p-6 rounded-xl bg-gradient-to-br from-[var(--mono-4)]/20 to-transparent border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 transition-all duration-300 hover:scale-[1.02]"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${fact.color} text-white group-hover:scale-110 transition-transform`}>
                                                            <Icon className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-[var(--foreground)] font-medium">
                                                            {fact.fact}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </LazySection>
                                        )
                                    })}
                                </div>

                                {/* Daily Routine Visualization */}
                                <LazySection threshold={0.2} delay={500}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        className="mt-10 p-6 rounded-xl bg-gradient-to-br from-[var(--mono-4)]/10 to-[var(--mono-4)]/5 border border-[var(--mono-4)]/20"
                                    >
                                        <h4 className="font-bold text-lg mb-4 text-[var(--foreground)] flex items-center gap-2">
                                            <LucideIcons.Clock className="w-5 h-5" />
                                            Typical Day Rhythm
                                        </h4>
                                        <div className="space-y-3">
                                            {dayRythm?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <span className="text-sm font-medium text-[var(--foreground)]/70 min-w-20">
                                                        {item.time}
                                                    </span>
                                                    <div className={`flex-1 ${item.color}/25 rounded-full h-2 overflow-hidden`}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: "100%" }}
                                                            transition={{ duration: 4, delay: idx * 0.2 }}
                                                            className={`h-full ${item.color} rounded-full`}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-[var(--foreground)]/70">
                                                        {item.activity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </LazySection>
                            </div>
                        )}
                    </div>
                </div>
            </Glow></GlowCapture>
        </section>
    )
}