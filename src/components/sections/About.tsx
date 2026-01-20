"use client"

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
import GridBackground from '../ui/GridBackground'
import TechCorners from '../ui/TechCorners'
import Image from 'next/image'

export const About = ({ initialData }: { initialData?: any }) => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`

    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: false })

    const [Data, setData] = useState<any>(initialData)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'about' | 'values' | 'interests' | 'trivia'>('about')

    const [funFacts, setFunFacts] = useState<any[]>(initialData?.FunFacts || [])
    const [values, setValues] = useState<any[]>(initialData?.Values || [])
    const [interests, setInterests] = useState<any[]>(initialData?.Interests || [])
    const [dayRythm, setDayRythm] = useState<any[]>(initialData?.Day || [])

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
        if (!initialData) {
            GetData()
        }
    }, [])

    if (error) return <ErrorMessage message={error} />
    if (isLoading) return <Loading />

    // Prepare data for GridBackground (inject Name)
    const backgroundData = { ...Data, Name: decodedUsername }

    return (
        <section id="about" className="relative min-h-screen py-20 px-4 overflow-hidden font-mono text-[var(--foreground)]">
            {/* <FadingBackground Value="Images" /> */}
            <GridBackground Data={backgroundData} Name={About.name} Code={About.toString()} />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="container max-w-7xl mx-auto relative z-10" ref={ref}>

                        {/* Main Dossier Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative p-6 sm:p-10 rounded-xl bg-[var(--background)]/25 backdrop-blur-sm border border-[var(--foreground)]/10 shadow-2xl"
                        >
                            <TechCorners Padding={2} Width={6} Height={6} />

                            {/* Header Section */}
                            <div className="mb-12 text-center relative">
                                <div className="absolute top-0 right-0 text-[10px] sm:text-xs text-[var(--mono-4)] tracking-widest opacity-60 font-bold border border-[var(--mono-4)]/30 px-2 py-1 rounded cursor-default">
                                    REF: CONFIDENTIAL
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView !== null ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-4xl sm:text-5xl font-bold mb-4 font-oswald tracking-wide bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)]/50 bg-clip-text text-transparent inline-block cursor-default">
                                        {Data.Title.split('').map((letter: string, idx: number) => (
                                            <motion.span
                                                key={idx}
                                                initial={{ opacity: 0 }}
                                                animate={isInView !== null ? { opacity: 1 } : { opacity: 0 }}
                                                transition={{ duration: 0.05, delay: idx * 0.03 }}
                                                className="hover:text-[var(--mono-4)] transition-colors"
                                            >
                                                {letter}
                                            </motion.span>
                                        ))}
                                    </h2>
                                    <div className="h-2 w-full bg-gradient-to-r from-transparent via-[var(--mono-4)] to-transparent rounded-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ x: "-100%" }}
                                            whileInView={{ x: "200%" }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute top-0 left-0 w-1/3 h-full bg-[var(--mono-4)] opacity-50 blur-[2px]"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Navigation Tabs (Access Keys) */}
                            <div className="flex flex-wrap justify-center gap-4 mb-12">
                                {['about', 'values', 'interests', 'trivia'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`
                                        relative px-6 py-2 rounded-lg font-inkfree text-md font-bold tracking-wider transition-all duration-300
                                        border group overflow-hidden
                                        ${activeTab === tab
                                                ? 'bg-[var(--mono-4)]/20 border-[var(--mono-4)] text-[var(--foreground)] shadow-[0_0_15px_rgba(var(--mono-4-rgb),0.2)]'
                                                : 'bg-transparent border-[var(--foreground)]/20 text-[var(--foreground)]/80 hover:text-[var(--mono-4)] hover:border-[var(--mono-4)]/50 animate-pulse'
                                            }
                                    `}
                                    >
                                        <div className={`absolute left-0 top-0 h-full w-1 bg-[var(--mono-4)] transition-opacity duration-300 ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                                        {tab === 'about' && "About Me"}
                                        {tab === 'values' && "Core Values"}
                                        {tab === 'interests' && "Interests"}
                                        {tab === 'trivia' && "Trivia"}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="min-h-[60vh] relative">

                                {/* About Tab */}
                                {activeTab === 'about' && (
                                    <motion.div
                                        initial={{ opacity: 0, filter: 'blur(5px)' }}
                                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.5 }}
                                        className="max-w-4xl mx-auto space-y-6 text-justify flex justify-center "
                                    >
                                        {/* <motion.div
                                            initial={{ opacity: 0, filter: 'blur(5px)' }}
                                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full text-justify"
                                        >
                                            <Image
                                                src={Data.Image}
                                                alt={Data.Name}
                                                width={720}
                                                height={720}
                                                className="rounded-md object-cover group-hover:grayscale-0 transition-all duration-500"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                }}
                                            />

                                        </motion.div> */}
                                        <motion.div
                                            initial={{ opacity: 0, filter: 'blur(5px)' }}
                                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.5 }}
                                            className="space-y-6 text-justify cursor-default"
                                        >
                                            {paragraphs.map((paragraph: string, index: number) => (
                                                <LazySection
                                                    key={index}
                                                    threshold={0.1}
                                                    delay={index * 100}
                                                    className="relative pl-6 border-l border-[var(--mono-4)]/30 hover:border-[var(--mono-4)] transition-colors duration-300"
                                                    fallback={<div className="h-20 bg-[var(--mono-4)]/5 animate-pulse rounded" />}
                                                >
                                                    <div className="animate-pulse absolute top-0 left-[-4px] w-2 h-2 rounded-full bg-[var(--mono-4)] opacity-50" />
                                                    <p className={`whitespace-pre-line text-lg leading-relaxed font-comic text-[var(--foreground)]/90 selection:bg-[var(--mono-4)] selection:text-black ${paragraph.charAt(0) === '•' ? 'ml-4 mb-2' : ''}`}>
                                                        {paragraph}
                                                    </p>
                                                </LazySection>
                                            ))}
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* Values Tab */}
                                {activeTab === 'values' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                        {values?.map((value: any, index: number) => {
                                            // @ts-ignore
                                            const Icon = LucideIcons[value.icon] || LucideIcons.HelpCircle
                                            return (
                                                <LazySection key={index} delay={index * 100} threshold={0.1}>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        className="relative group p-6 h-full flex flex-col bg-[var(--background)]/50 border border-[var(--foreground)]/10 hover:border-[var(--mono-4)]/50 transition-all duration-300 rounded-lg hover:shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.1)]"
                                                    >
                                                        <TechCorners Padding={2} Width={4} Height={2} />
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <div className={`p-3 rounded bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover:scale-110 transition-transform duration-300`}>
                                                                <Icon className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="text-2xl font-bold font-comic text-[var(--foreground)] mt-2">
                                                                {value.title}
                                                            </h3>
                                                        </div>
                                                        <div className="h-px w-full bg-gradient-to-r from-[var(--mono-4)]/50 to-transparent mb-4" />
                                                        <p className="text-md font-comic text-[var(--foreground)]/70 leading-relaxed">
                                                            {value.description}
                                                        </p>
                                                    </motion.div>
                                                </LazySection>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Interests Tab */}
                                {interests && (activeTab === 'interests') && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                                        {interests?.map((interest: any, index: number) => {
                                            // @ts-ignore
                                            const Icon = LucideIcons[interest.icon] || LucideIcons.HelpCircle
                                            return (
                                                <LazySection key={index} delay={index * 50} threshold={0.1}>
                                                    <TechCorners Padding={0} Width={4} Height={2} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-4 p-4 border border-[var(--foreground)]/10 bg-[var(--background)]/30 rounded hover:border-[var(--mono-4)]/30 transition-colors"
                                                    >
                                                        <div className={`p-2 rounded bg-[var(--mono-4)]/10 text-[var(--mono-4)]`}>
                                                            <Icon className="w-8 h-8" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold font-comic text-md text-[var(--foreground)]">{interest.name}</span>
                                                                <span className="font-mono text-md text-[var(--foreground)]/50">{interest.level}%</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: `${interest.level}%` }}
                                                                    transition={{ duration: 1, delay: 0.2 }}
                                                                    className={`h-full bg-[var(--mono-4)]/80 rounded-full shadow-[0_0_10px_var(--mono-4)]`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </LazySection>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Trivia Tab */}
                                {activeTab === 'trivia' && (
                                    <div className="max-w-6xl mx-auto space-y-12">

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {funFacts?.map((fact: any, index: number) => {
                                                // @ts-ignore
                                                const Icon = LucideIcons[fact.icon] || LucideIcons.HelpCircle
                                                return (
                                                    <LazySection key={index} delay={index * 100}>
                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            className="h-full p-6 border border-[var(--foreground)]/10 bg-[var(--background)]/20 rounded-lg relative overflow-hidden group"
                                                        >
                                                            <TechCorners Padding={0} Width={4} Height={2} />
                                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                                <Icon className="w-16 h-16" />
                                                            </div>
                                                            <div className="relative z-10 flex flex-col gap-2">
                                                                <Icon className="w-6 h-6 text-[var(--mono-4)] mb-2" />
                                                                <p className="font-comic text-md text-[var(--foreground)]/80">{fact.fact}</p>
                                                            </div>
                                                        </motion.div>
                                                    </LazySection>
                                                )
                                            })}
                                        </div>

                                        {/* Daily Routine Visualization */}
                                        <LazySection threshold={0.2}>
                                            <div className="p-8 border border-[var(--mono-4)]/20 bg-[var(--background)]/30 rounded-xl relative">
                                                <div className="absolute -top-3 left-4 bg-[var(--background)] px-2 text-[var(--mono-4)] text-xs font-bold font-mono tracking-widest border border-[var(--mono-4)]/20 rounded">
                                                    Typical Day
                                                </div>
                                                <div className="space-y-4 font-mono text-sm">
                                                    {dayRythm?.map((item, idx) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
                                                            <div className="min-w-24 text-[var(--mono-4)]/80 text-xs font-bold">{item.time}</div>
                                                            <div className="flex-1 h-8 bg-[var(--foreground)]/5 rounded overflow-hidden relative border border-[var(--foreground)]/5 group-hover:border-[var(--mono-4)]/30 transition-colors">
                                                                <div className="absolute inset-y-0 left-4 flex items-center z-10 text-[var(--foreground)]/90 text-md font-comic tracking-wide px-2">
                                                                    {item.activity}
                                                                </div>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: "100%" }}
                                                                    transition={{ duration: 1.5, delay: idx * 0.1 }}
                                                                    className={`h-full ${item.color.replace('bg-', 'bg-opacity-20 bg-')} w-full absolute top-0 left-0`}
                                                                >
                                                                    <div className={`h-full w-1 bg-[var(--mono-4)] absolute right-0 top-0 shadow-[0_0_10px_var(--mono-4)] opacity-50`} />
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </LazySection>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                </Glow>
            </GlowCapture>
        </section>
    )
}