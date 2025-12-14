"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { GraduationCap, Calendar, Award, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { EducationService } from "@/models/Services/Education"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import Image from "next/image"
import { useParams } from "next/navigation"
import GridBackground from "../ui/GridBackground"
import TechCorners from "../ui/TechCorners"
import { GlowCapture, Glow } from "@codaworks/react-glow"

export const Educations = ({ initialData }: { initialData?: any }) => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const [educations, setEducations] = useState<any[]>(initialData?.Educations || [])
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)

    const GetData = async () => {
        setIsLoading(true)
        try {
            const educationService = EducationService.getInstance()
            const result = await educationService.Education(endpoint)

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                if (result.Educations) {
                    setEducations(result.Educations)
                }
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
        if (!initialData) {
            GetData()
        }
    }, [])

    if (isLoading) return <Loading />
    if (error) return <ErrorMessage message={error} />
    if (!educations || educations.length === 0) return null

    // Prepare data for GridBackground (inject Name)
    const backgroundData = { Educations: educations.length, Name: decodedUsername }

    return (
        <section id="Education" className="relative min-h-screen py-20 px-4 overflow-hidden font-comic text-[var(--foreground)]">
            <GridBackground Data={backgroundData} Name={Educations.name} Code={Educations.toString()} />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <EducationTimeline educations={educations} />
                </Glow>
            </GlowCapture>
        </section>
    )
}

const EducationTimeline = ({ educations }: { educations: any[] }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const scaleY = useTransform(scrollYProgress, [0, 2], [0, 2.5])

    return (
        <div ref={containerRef} className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="mb-24 text-center relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block"
                >
                    <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] uppercase tracking-wide">
                        Academic Qualifications
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

            <div className="relative max-w-8xl mx-auto">
                {/* Central Line - styled as a data pipe */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 md:w-0.5 -translate-x-1/2 hidden md:block border-l-2 border-dashed border-[var(--mono-4)]/30">
                    <motion.div
                        style={{ scaleY, transformOrigin: "top" }}
                        className="absolute top-0 left-[-2px] w-[3px] h-full bg-[var(--mono-4)] opacity-50 shadow-[0_0_10px_var(--mono-4)]"
                    />
                </div>

                {/* Mobile Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-[var(--mono-4)]/30 md:hidden">
                    <motion.div
                        style={{ scaleY, transformOrigin: "top" }}
                        className="absolute top-0 left-[-2px] w-[3px] h-full bg-[var(--mono-4)] opacity-50"
                    />
                </div>

                <div className="flex flex-col gap-16 md:gap-24">
                    {educations.map((education, index) => (
                        <EducationCard
                            key={index}
                            education={education}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const EducationCard = ({ education, index }: { education: any, index: number }) => {
    const isLeft = index % 2 === 1
    // Check if education is "Present" or ongoing
    const isCurrent = education.Date ? education.Date.includes("Present") : false
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${!isLeft ? 'md:flex-row-reverse' : ''}`}>

            {/* Timeline Node - styled as a tech connector */}
            <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-md bg-[var(--background)] border border-[var(--mono-4)] z-20 -translate-x-1/2 mt-1.5 md:mt-8 flex items-center justify-center shadow-[0_0_15px_rgba(var(--mono-4-rgb),0.2)]">
                <div className="w-4 h-4 rounded-sm bg-[var(--mono-4)] animate-pulse shadow-[0_0_8px_var(--mono-4)]" />
                {/* Connector Lines */}
                <div className={`hidden md:block absolute top-1/2 w-10 h-px bg-[var(--mono-4)]/50 ${isLeft ? 'right-full' : 'left-full'}`} />
            </div>

            {/* Content Spacer */}
            <div className="flex-1 md:w-1/2 hidden md:block" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`cursor-default flex-1 md:w-1/2 pl-12 md:pl-0 ${isLeft ? 'md:pl-16' : 'md:pr-16'}`}
            >
                <div className={`group relative p-6 sm:p-8 rounded-xl ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-[var(--mono-4)]/15 to-[var(--mono-4)]/0 backdrop-blur-xs border border-[var(--foreground)]/5 hover:border-[var(--mono-4)]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--mono-4-rgb),0.1)]`}>
                    <TechCorners Padding={2} Width={6} Height={6} />

                    {isCurrent && (
                        <div className="absolute -top-3 right-6 px-3 py-1 text-[10px] font-bold tracking-widest text-[var(--background)] bg-[var(--mono-4)] border border-[var(--mono-4)] animate-pulse shadow-[0_0_10px_var(--mono-4)] uppercase rounded-lg">
                            Studying
                        </div>
                    )}

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            {education.Image && (
                                <div className="relative w-24 h-24 shrink-0 rounded border border-[var(--mono-4)]/30 overflow-hidden group-hover:border-[var(--mono-4)] transition-colors p-1 bg-[var(--background)]/50">
                                    <div className="w-full h-full relative overflow-hidden">
                                        <Image
                                            src={education.Image}
                                            alt={education.Name}
                                            fill
                                            className="rounded-md object-cover group-hover:grayscale-0 transition-all duration-500"
                                            onError={(e) => { }}
                                        />
                                    </div>
                                    {/* Corner markers for image */}
                                    <div className="absolute top-0 left-0 w-1 h-1 bg-[var(--mono-4)]" />
                                    <div className="absolute bottom-0 right-0 w-1 h-1 bg-[var(--mono-4)]" />
                                </div>
                            )}

                            <div className="flex flex-col gap-2 w-full">
                                <h3 className="text-lg md:text-xl font-bold font-comic text-[var(--foreground)] uppercase tracking-wide group-hover:text-[var(--mono-4)] transition-colors">
                                    {education.Title}
                                </h3>

                                <div className="flex items-center text-md md:text-lg font-bold font-comic text-[var(--foreground)]/80">
                                    <GraduationCap className="w-5 h-5 mr-2 text-[var(--mono-4)]" />
                                    {education.Name}
                                </div>

                                <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2 text-sm font-mono text-[var(--foreground)]/60">
                                    <div className="flex items-center text-[var(--mono-4)]">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {education.Date}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {education.Description && education.Description.length > 0 && (
                            <div className="relative border-t border-[var(--mono-4)]/10">
                                <ul className="space-y-3">
                                    {education.Description.map((desc: string, i: number) => (
                                        <li key={i} className="flex items-start text-sm md:text-md text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors group/item">
                                            <span className="text-[var(--mono-4)] mr-3 mt-1 text-[10px] group-hover/item:text-[var(--foreground)] font-mono">{`${i < 9 ? '0' : ''}${i + 1}`}</span>
                                            <span className="leading-relaxed">{desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
