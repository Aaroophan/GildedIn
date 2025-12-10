"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Briefcase, Calendar, MapPin, Award, ChevronDown, ChevronUp } from "lucide-react"
import { ExperienceService } from "@/models/Services/Experience"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import Image from "next/image"
import { useParams } from "next/navigation"

export const Experiences = () => {
    const params = useParams<{ username?: string }>()
    const endpoint = `/${params?.username || ""}`
    const [experiences, setExperiences] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const GetData = async () => {
        setIsLoading(true)
        try {
            const experienceService = ExperienceService.getInstance()
            const result = await experienceService.Experience(endpoint)

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                if (result.Experiences) {
                    setExperiences(result.Experiences)
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
        GetData()
    }, [])

    if (isLoading) return <Loading />
    if (error) return <ErrorMessage message={error} />
    if (!experiences || experiences.length === 0) return null

    return <ExperienceTimeline experiences={experiences} />
}

const ExperienceTimeline = ({ experiences }: { experiences: any[] }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const scaleY = useTransform(scrollYProgress, [0, 2], [0, 2.5])

    return (
        <section ref={containerRef} className="py-10 md:py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-comic text-4xl md:text-5xl font-bold pb-6 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent cursor-default">
                        Experience
                    </h2>
                    <p className="font-comic text-lg text-gray-400 max-w-2xl mx-auto bg-gradient-to-br from-[var(--foreground)]/75 via-[var(--foreground)]/75 to-[var(--foreground)]/75 bg-clip-text text-transparent cursor-default">
                        A timeline of my career growth, key projects, and milestones.
                    </p>
                </motion.div>

                <div className="relative max-w-8xl mx-auto font-comic">
                    {/* Central Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 md:w-2 rounded-full bg-[var(--mono-4)]/0 -translate-x-1/2 hidden md:block">
                        <motion.div
                            style={{ scaleY, transformOrigin: "top" }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--mono-4)] via-[var(--mono-4)]/50 to-[var(--mono-4)]/10 animate-pulse rounded-full"
                        />
                    </div>

                    {/* Mobile Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-2 rounded-full bg-[var(--mono-4)]/0 md:hidden">
                        <motion.div
                            style={{ scaleY, transformOrigin: "top" }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--mono-4)] via-[var(--mono-4)]/50 to-[var(--mono-4)]/10"
                        />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-8">
                        {experiences.map((experience, index) => (
                            <ExperienceCard
                                key={index}
                                experience={experience}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

const ExperienceCard = ({ experience, index }: { experience: any, index: number }) => {
    const isLeft = index % 2 === 1
    // Safe check in case Date is missing or undefined
    const isCurrent = experience.Date ? experience.Date.includes("Present") : false
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${!isLeft ? 'md:flex-row-reverse' : ''}`}>

            {/* Timeline Dot */}
            <div className="absolute left-4 md:left-1/2 w-6 h-6 rounded-full bg-[var(--background)] border-2 border-[var(--mono-4)] z-20 -translate-x-1/2 mt-1.5 md:mt-8">
                <div className="absolute inset-0 rounded-full bg-[var(--mono-4)]/20 animate-ping" />

            </div>

            {/* Content Spacer */}
            <div className="flex-1 md:w-1/2 hidden md:block" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`cursor-default flex-1 md:w-1/2 pl-10 md:pl-0 ${isLeft ? 'md:pl-10' : 'md:pr-10'}`}
            >
                <div className={`group relative p-6 rounded-2xl ${isLeft ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-[var(--mono-4)]/20 to-[var(--mono-4)]/0 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 transition-all duration-300 hover:shadow-lg backdrop-blur-sm`}>
                    {isCurrent && (
                        <div className="absolute -top-3 right-6 px-3 py-1 text-xs font-semibold text-[var(--foreground)] bg-gradient-to-bl from-[var(--mono-4)]/80 to-[var(--mono-4)]/20 border border-[var(--mono-4)]/90 hover:border-[var(--mono-4)]/70 transition-all duration-300 rounded-full shadow-lg  group-hover:scale-120 transition-all duration-200 cursor-default animate-pulse">
                            Current Role
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-5">
                            {experience.Image && (
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[var(--mono-4)]/30 group-hover:scale-105 group-hover:translate-x-1 transition-all duration-200 cursor-default">
                                    <Image
                                        src={experience.Image}
                                        alt={experience.Company}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            // Fallback to Briefcase on error - tough to do with Next/Image directly in this structure without state, 
                                            // but we can try just hiding it? Or just let it fail to transparent.
                                            // Actually, best to just render Image.
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h3 className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--mono-4)] group-hover:scale-120 group-hover:translate-x-10 transition-all duration-200 cursor-default">
                                        {experience.Title}
                                    </h3>
                                </div>
                                <div className="flex items-center text-md text-[var(--foreground)] font-medium group-hover:scale-120 group-hover:translate-x-17 transition-all duration-200 cursor-default">
                                    <Briefcase className="w-4 h-4 mr-2 text-[var(--mono-4)]" />
                                    {experience.Company}
                                    {experience.JobType && <span className="text-sm text-[var(--mono-4)] ml-2">({experience.JobType})</span>}
                                </div>
                                <div className="flex items-center text-sm text-[var(--foreground)] group-hover:scale-120 group-hover:translate-x-20 transition-all duration-200 cursor-default">
                                    <MapPin className="w-4 h-4 mr-2 text-[var(--mono-4)]" />
                                    {experience.Location}
                                    {experience.LocationType && <span className="ml-2 text-[var(--mono-4)]">({experience.LocationType})</span>}
                                </div>
                                <span className={`flex items-center text-sm text-[var(--foreground)] group-hover:scale-120 group-hover:translate-x-23 transition-all duration-200 cursor-default`}>
                                    <Calendar className="w-4 h-4 mr-2 text-[var(--mono-4)]" />
                                    <i>{experience.Date}</i>
                                </span>
                            </div>
                        </div>

                        {experience.Description && (
                            <>
                                <ul className="space-y-2 mt-4">
                                    {(isExpanded ? experience.Description : experience.Description.slice(0, 4)).map((desc: string, i: number) => (
                                        <li key={i} className="flex items-start text-sm text-[var(--foreground)]/70 group-hover:text-[var(--foreground)] transition-all hover:translate-x-5 duration-300">
                                            <Award className="w-4 h-4 mr-2.5 text-blue-500 mt-0.5 shrink-0" />
                                            <span className="text-sm hover:text-[var(--mono-4)] cursor-default">{desc}</span>
                                        </li>
                                    ))}
                                </ul>
                                {experience.Description.length > 4 && (
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="mt-4 flex items-center text-sm font-medium text-[var(--mono-4)] hover:text-[var(--foreground)] transition-colors focus:outline-none"
                                    >
                                        {isExpanded ? (
                                            <>
                                                Show Less <ChevronUp className="w-4 h-4 ml-1" />
                                            </>
                                        ) : (
                                            <>
                                                Show More <ChevronDown className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
