"use client"

import { motion, useInView, AnimatePresence } from 'framer-motion'
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
import { useTypingEffect } from '@/hooks/useTypingEffect'
import { Timeline } from '../ui/Timeline'
import { Tooltip } from '../ui/Tooltip'
import ParticleNetwork from '../ui/ParticleNetwork'

const TypingDescription = ({ text }: { text: string }) => {
    const { displayText, isComplete } = useTypingEffect(text, 1)
    const paragraphs = displayText.split('\n\n')

    return (
        <div className="space-y-6">
            {paragraphs.map((paragraph: string, index: number) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative pl-6 border-l border-[var(--mono-4)]/30 hover:border-[var(--mono-4)] transition-colors duration-300"
                >
                    <div className="animate-pulse absolute top-0 left-[-4px] w-2 h-2 rounded-full bg-[var(--mono-4)] opacity-50" />
                    <p className={`whitespace-pre-line text-lg leading-relaxed font-comic text-[var(--foreground)]/90 selection:bg-[var(--mono-4)] selection:text-black ${paragraph.charAt(0) === '•' ? 'ml-4 mb-2' : ''}`}>
                        {paragraph}
                        {!isComplete && index === paragraphs.length - 1 && (
                            <span className="inline-block w-2 h-5 bg-[var(--mono-4)] ml-1 animate-pulse" />
                        )}
                    </p>
                </motion.div>
            ))}
        </div>
    )
}

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

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView !== null ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] tracking-wide cursor-default inline-block cursor-default">
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
                                {['about', 'values', 'interests', 'trivia'].map((tab, tabIndex) => (
                                    <motion.button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: tabIndex * 0.1 }}
                                        className={`
                                        relative px-6 py-2 rounded-lg font-inkfree text-md font-bold tracking-wider transition-all duration-300
                                        border group overflow-hidden
                                        ${activeTab === tab
                                                ? 'bg-[var(--mono-4)]/20 border-[var(--mono-4)] text-[var(--foreground)] shadow-[0_0_15px_rgba(var(--mono-4-rgb),0.2)]'
                                                : 'bg-transparent border-[var(--foreground)]/20 text-[var(--foreground)]/80 hover:text-[var(--mono-4)] hover:border-[var(--mono-4)]/50 hover:shadow-[0_0_10px_rgba(var(--mono-4-rgb),0.1)]'
                                            }
                                    `}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className={`absolute left-0 top-0 h-full w-1 bg-[var(--mono-4)] transition-opacity duration-300 ${activeTab === tab ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

                                        {/* Animated background */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-[var(--mono-4)]/10 to-transparent opacity-0 group-hover:opacity-100"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.6 }}
                                        />

                                        <span className="relative z-10">
                                            {tab === 'about' && "About Me"}
                                            {tab === 'values' && "Core Values"}
                                            {tab === 'interests' && "Interests"}
                                            {tab === 'trivia' && "Trivia"}
                                        </span>
                                    </motion.button>
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
                                        className="max-w-6xl mx-auto"
                                    >
                                        {/* Profile Section */}
                                        <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
                                            {/* Profile Image */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.6 }}
                                                className="relative group"
                                            >
                                                {endpoint === '/Aaroophan'  && <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[var(--mono-4)]/30 shadow-2xl">
                                                    <Image
                                                        src={Data.About?.Image || "/images/default-profile.png"}
                                                        alt={decodedUsername}
                                                        width={192}
                                                        height={192}
                                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--mono-4)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>}
                                                {/* Floating particles around image */}
                                                {/* <div className="absolute -inset-4 pointer-events-none">
                                                    {[...Array(6)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="absolute w-2 h-2 bg-[var(--mono-4)] rounded-full opacity-60"
                                                            animate={{
                                                                x: [0, Math.random() * 100 - 50],
                                                                y: [0, Math.random() * 100 - 50],
                                                                opacity: [0.6, 0.2, 0.6]
                                                            }}
                                                            transition={{
                                                                duration: 3 + Math.random() * 2,
                                                                repeat: Infinity,
                                                                delay: i * 0.5
                                                            }}
                                                            style={{
                                                                top: `${20 + Math.random() * 60}%`,
                                                                left: `${20 + Math.random() * 60}%`
                                                            }}
                                                        />
                                                    ))}
                                                </div> */}
                                            </motion.div>

                                            {/* Profile Info */}
                                            <div className="flex-1 text-center lg:text-left">
                                                <motion.h3
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                    className="text-3xl font-bold font-oswald text-[var(--foreground)] mb-2"
                                                >
                                                    {decodedUsername}
                                                </motion.h3>
                                                <motion.p
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.3 }}
                                                    className="text-lg text-[var(--foreground)]/70 font-comic mb-4"
                                                >
                                                    {Data.Tagline}
                                                </motion.p>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.4 }}
                                                    className="flex flex-wrap justify-center lg:justify-start gap-2"
                                                >
                                                    {['Next.js', 'React', 'TypeScript', 'ASP.NET Core', 'Python'].map((skill, index) => (
                                                        <span
                                                            key={skill}
                                                            className="px-3 py-1 bg-[var(--mono-4)]/10 border border-[var(--mono-4)]/30 rounded-full text-sm font-mono text-[var(--mono-4)] hover:bg-[var(--mono-4)]/20 transition-colors"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Description with Typing Effect */}
                                        <motion.div
                                            initial={{ opacity: 0, filter: 'blur(5px)' }}
                                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ duration: 0.5, delay: 0.5 }}
                                            className="space-y-6 text-justify"
                                        >
                                            <TypingDescription text={Data.About?.Description || ''} />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* Values Tab */}
                                {activeTab === 'values' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto auto-rows-fr">
                                        {values?.map((value: any, index: number) => {
                                            // @ts-ignore
                                            const Icon = LucideIcons[value.icon] || LucideIcons.HelpCircle
                                            return (
                                                <LazySection key={index} delay={index * 100} threshold={0.1}>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        whileHover={{
                                                            scale: 1.05,
                                                            boxShadow: "0 20px 40px rgba(var(--mono-4-rgb), 0.2)"
                                                        }}
                                                        transition={{ duration: 0.3 }}
                                                        className="relative group p-6 h-full flex flex-col bg-[var(--background)]/50 border border-[var(--foreground)]/10 hover:border-[var(--mono-4)]/50 transition-all duration-300 rounded-lg cursor-pointer overflow-hidden"
                                                    >
                                                        <TechCorners Padding={2} Width={4} Height={2} />

                                                        {/* Background gradient animation */}
                                                        <motion.div
                                                            className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                                                            initial={{ scale: 0 }}
                                                            whileHover={{ scale: 1 }}
                                                            transition={{ duration: 0.5 }}
                                                        />

                                                        <div className="flex items-start gap-4 mb-4 relative z-10">
                                                            <motion.div
                                                                className={`p-3 rounded bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover:scale-110 transition-transform duration-300`}
                                                                whileHover={{ rotate: 360 }}
                                                                transition={{ duration: 0.6 }}
                                                            >
                                                                <Icon className="w-6 h-6" />
                                                            </motion.div>
                                                            <h3 className="text-2xl font-bold font-comic text-[var(--foreground)] mt-2 group-hover:text-[var(--mono-4)] transition-colors">
                                                                {value.title}
                                                            </h3>
                                                        </div>

                                                        <div className="h-px w-full bg-gradient-to-r from-[var(--mono-4)]/50 to-transparent mb-4 relative z-10" />

                                                        <p className="text-md font-comic text-[var(--foreground)]/70 leading-relaxed relative z-10 group-hover:text-[var(--foreground)]/90 transition-colors">
                                                            {value.description}
                                                        </p>

                                                        {/* Floating particles */}
                                                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                            {[...Array(3)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="absolute w-1 h-1 bg-[var(--mono-4)] rounded-full"
                                                                    animate={{
                                                                        x: [0, Math.random() * 50 - 25],
                                                                        y: [0, Math.random() * 50 - 25],
                                                                        opacity: [0, 1, 0]
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.3
                                                                    }}
                                                                    style={{
                                                                        top: `${30 + Math.random() * 40}%`,
                                                                        left: `${30 + Math.random() * 40}%`
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                </LazySection>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Interests Tab */}
                                {interests && (activeTab === 'interests') && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto auto-rows-fr">
                                        {interests?.map((interest: any, index: number) => {
                                            // @ts-ignore
                                            const Icon = LucideIcons[interest.icon] || LucideIcons.HelpCircle
                                            return (
                                                <LazySection key={index} delay={index * 50} threshold={0.1}>
                                                    <Tooltip content={`${interest.name}: ${interest.level}%`}>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="flex items-center gap-4 p-4 h-full border border-[var(--foreground)]/10 bg-[var(--background)]/30 rounded hover:border-[var(--mono-4)]/30 transition-all duration-300 cursor-pointer group"
                                                        >
                                                            <TechCorners Padding={0} Width={4} Height={2} />
                                                            <motion.div
                                                                className={`p-2 rounded bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover:scale-110 transition-transform duration-300`}
                                                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                <Icon className="w-8 h-8" />
                                                            </motion.div>
                                                            <div className="flex-1 w-60 sm:w-100">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-bold font-comic text-md text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors">
                                                                        {interest.name}
                                                                    </span>
                                                                    <motion.span
                                                                        className="font-mono text-md text-[var(--foreground)]/50"
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        transition={{ delay: 0.5 + index * 0.1 }}
                                                                    >
                                                                        {interest.level}%
                                                                    </motion.span>
                                                                </div>
                                                                <div className="w-full h-3 bg-[var(--foreground)]/10 rounded-full overflow-hidden relative">
                                                                    <motion.div
                                                                        className={`h-full bg-gradient-to-r ${interest.color} rounded-full shadow-[0_0_10px_var(--mono-4)] relative`}
                                                                        initial={{ width: 0 }}
                                                                        whileInView={{ width: `${interest.level}%` }}
                                                                        transition={{ duration: 1.5, delay: 0.2 + index * 0.1 }}
                                                                    >
                                                                        {/* Animated shine effect */}
                                                                        <motion.div
                                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                                            animate={{ x: ['-100%', '100%'] }}
                                                                            transition={{
                                                                                duration: 2,
                                                                                repeat: Infinity,
                                                                                repeatDelay: 3,
                                                                                ease: "easeInOut"
                                                                            }}
                                                                        />
                                                                    </motion.div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </Tooltip>
                                                </LazySection>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Trivia Tab */}
                                {activeTab === 'trivia' && (
                                    <div className="max-w-6xl mx-auto space-y-12">

                                        {/* Fun Facts Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {funFacts?.map((fact: any, index: number) => {
                                                // @ts-ignore
                                                const Icon = LucideIcons[fact.icon] || LucideIcons.HelpCircle
                                                return (
                                                    <LazySection key={index} delay={index * 100}>
                                                        <motion.div
                                                            whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
                                                            transition={{ duration: 0.3 }}
                                                            className="h-full p-6 border border-[var(--foreground)]/10 bg-[var(--background)]/20 rounded-lg relative overflow-hidden group cursor-pointer"
                                                        >
                                                            <TechCorners Padding={0} Width={4} Height={2} />

                                                            {/* Background pattern */}
                                                            <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                                                <div className="absolute top-0 right-0 w-32 h-32">
                                                                    <Icon className="w-full h-full" />
                                                                </div>
                                                            </div>

                                                            <div className="relative z-10 flex flex-col gap-3">
                                                                <motion.div
                                                                    whileHover={{ scale: 1.1, rotate: 360 }}
                                                                    transition={{ duration: 0.6 }}
                                                                >
                                                                    <Icon className="w-8 h-8 text-[var(--mono-4)] mb-2" />
                                                                </motion.div>
                                                                <p className="font-comic text-md text-[var(--foreground)]/80 leading-relaxed group-hover:text-[var(--foreground)] transition-colors">
                                                                    {fact.fact}
                                                                </p>
                                                            </div>

                                                            {/* Hover glow effect */}
                                                            <motion.div
                                                                className={`absolute inset-0 bg-gradient-to-br ${fact.color} opacity-0 group-hover:opacity-10 rounded-lg`}
                                                                initial={{ scale: 0 }}
                                                                whileHover={{ scale: 1 }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        </motion.div>
                                                    </LazySection>
                                                )
                                            })}
                                        </div>

                                        {/* Daily Routine Timeline */}
                                        <LazySection threshold={0.2}>
                                            <div className="p-8 border border-[var(--mono-4)]/20 bg-[var(--background)]/30 rounded-xl relative">
                                                <div className="absolute -top-3 left-4 bg-[var(--background)] px-3 py-1 text-[var(--mono-4)] text-sm font-bold font-mono tracking-widest border border-[var(--mono-4)]/20 rounded">
                                                    Typical Day
                                                </div>
                                                <Timeline items={dayRythm || []} />
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