"use client"

/* eslint-disable @next/next/no-img-element */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Layers3, Rocket, ShieldCheck } from 'lucide-react'
import {
    SkillsService,
    type SkillsResult,
    type TechnologySkill,
    type TechnologyLane
} from '@/models/Services/Skills'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { Glow, GlowCapture } from '@codaworks/react-glow'
import { useParams } from 'next/navigation'
import GridBackground from '../ui/GridBackground'
import TechCorners from '../ui/TechCorners'

const highlightIcons = {
    Layers3,
    ShieldCheck,
    Rocket
}

const SkillBadge = ({
    skill,
    active = false,
    onHover
}: {
    skill: TechnologySkill
    active?: boolean
    onHover?: () => void
}) => {
    const [icon, name] = skill

    return (
        <button
            type="button"
            onMouseEnter={onHover}
            onFocus={onHover}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-left transition-colors ${active
                ? "border-[var(--mono-4)]/60 bg-[var(--mono-4)]/12 text-[var(--mono-4)]"
                : "border-[var(--mono-4)]/14 bg-[var(--background)]/55 text-[var(--foreground)]/72 hover:border-[var(--mono-4)]/36 hover:text-[var(--mono-4)]"
                }`}
        >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--mono-4)]/14 bg-[var(--background)]/75 p-1">
                <img src={icon} alt="" className="h-full w-full object-contain" loading="lazy" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em]">
                {name}
            </span>
        </button>
    )
}

const SkillStream = ({
    laneIndex,
    skills,
    reverse = false,
    speed = 18,
    activeLaneIndex,
    activeSkillIndex,
    onActivateSkill
}: {
    laneIndex: number
    skills: TechnologySkill[]
    reverse?: boolean
    speed?: number
    activeLaneIndex: number
    activeSkillIndex: number
    onActivateSkill: (laneIndex: number, skillIndex: number) => void
}) => {
    const repeatedSkills = [...skills, ...skills]

    return (
        <div className="relative overflow-hidden mask-linear-fade">
            <motion.div
                className="flex w-max gap-4 py-1"
                animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed,
                        ease: "linear"
                    }
                }}
            >
                {repeatedSkills.map((skill, index) => {
                    const [icon, name, description] = skill
                    const normalizedIndex = index % skills.length
                    const isActive = laneIndex === activeLaneIndex && normalizedIndex === activeSkillIndex

                    return (
                        <button
                            key={`${laneIndex}-${name}-${index}`}
                            type="button"
                            onMouseEnter={() => onActivateSkill(laneIndex, normalizedIndex)}
                            onFocus={() => onActivateSkill(laneIndex, normalizedIndex)}
                            className={`group relative w-[18rem] flex-shrink-0 overflow-hidden rounded-[1.5rem] border p-4 text-left backdrop-blur-lg transition-all ${isActive
                                ? "border-[var(--mono-4)]/50 bg-[var(--mono-4)]/12 shadow-[0_0_32px_rgba(15,115,255,0.14)]"
                                : "border-[var(--mono-4)]/14 bg-[var(--background)]/68 hover:border-[var(--mono-4)]/34 hover:bg-[var(--background)]/82"
                                }`}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,115,255,0.08),transparent_55%)] opacity-70" />
                            <div className="relative flex items-start gap-4">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--mono-4)]/18 bg-[var(--background)]/78 p-2 shadow-[0_10px_25px_rgba(15,115,255,0.06)]">
                                    <img src={icon} alt="" className="h-full w-full object-contain" loading="lazy" />
                                </div>
                                <div>
                                    <p className="font-oswald text-xl tracking-widest text-[var(--foreground)]">
                                        {name}
                                    </p>
                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--foreground)]/68">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </motion.div>
        </div>
    )
}

export const Skills = ({ initialData }: { initialData?: SkillsResult }) => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const [data, setData] = useState<SkillsResult | null>(initialData || null)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)
    const [activeLaneIndex, setActiveLaneIndex] = useState(0)
    const [activeSkillIndex, setActiveSkillIndex] = useState(0)

    useEffect(() => {
        if (initialData) {
            return
        }

        const loadData = async () => {
            setIsLoading(true)

            try {
                const skillsService = SkillsService.getInstance()
                const result = await skillsService.Skills(endpoint)

                if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                    setData(result)
                    setError(null)
                } else {
                    setError(result.Message)
                }
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : "Unknown error occurred")
            } finally {
                setIsLoading(false)
            }
        }

        void loadData()
    }, [endpoint, initialData])

    useEffect(() => {
        if (data?.Skills?.length && activeLaneIndex > data.Skills.length - 1) {
            setActiveLaneIndex(0)
        }
    }, [activeLaneIndex, data])

    useEffect(() => {
        setActiveSkillIndex(0)
    }, [activeLaneIndex])

    if (error) return <ErrorMessage message={error} />
    if (isLoading || !data || !data.Skills?.length) return <Loading />

    const backgroundData = { ...data, Name: decodedUsername }
    const activeLane: TechnologyLane = data.Skills[activeLaneIndex]
    const activeSkill = activeLane[2][activeSkillIndex] || activeLane[2][0]
    const [activeSkillIcon, activeSkillName, activeSkillDescription] = activeSkill

    const handleActivateLane = (laneIndex: number) => {
        setActiveLaneIndex(laneIndex)
        setActiveSkillIndex(0)
    }

    const handleActivateSkill = (laneIndex: number, skillIndex: number) => {
        setActiveLaneIndex(laneIndex)
        setActiveSkillIndex(skillIndex)
    }

    return (
        <section id="Skills" className="relative overflow-hidden px-3 py-16 lg:px-5 lg:py-24 font-comic text-[var(--foreground)]">
            <GridBackground Data={backgroundData} Name={Skills.name} Code={Skills.toString()} />

            <GlowCapture>
                <Glow color="var(--mono-4)">
                    <div className="container relative z-10 mx-auto max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5 }}
                            className="mx-auto mb-10 max-w-4xl text-center lg:mb-14"
                        >
                            <div className="inline-block">
                                <h2 className="text-3xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] tracking-wide cursor-default">
                                    {data.Title}
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

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px] xl:items-start">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.55, delay: 0.1 }}
                                className="relative "
                            >
                                <div className="space-y-4">
                                    {data.Skills.map((lane, laneIndex) => {
                                        const [category, description, skills] = lane

                                        return (
                                            <div
                                                key={category}
                                                onMouseEnter={() => handleActivateLane(laneIndex)}
                                                className={`rounded-xl border p-5 backdrop-blur-lg transition-colors ${laneIndex === activeLaneIndex
                                                    ? "border-[var(--mono-4)]/40 bg-[var(--mono-4)]/10"
                                                    : "border-[var(--mono-4)]/14 bg-[var(--background)]/58"
                                                    }`}
                                            >
                                                <TechCorners Padding={1} Width={6} Height={6} />
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                                    <div>
                                                        <p className="font-oswald text-2xl tracking-[0.12em] text-[var(--foreground)]">
                                                            {category}
                                                        </p>
                                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground)]/68">
                                                            {description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <SkillStream
                                                        laneIndex={laneIndex}
                                                        skills={skills}
                                                        reverse={laneIndex % 2 === 1}
                                                        speed={18 + laneIndex * 2}
                                                        activeLaneIndex={activeLaneIndex}
                                                        activeSkillIndex={activeSkillIndex}
                                                        onActivateSkill={handleActivateSkill}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>

                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{ duration: 0.55, delay: 0.16 }}
                                    className="relative rounded-[1.75rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/74 p-5 backdrop-blur-xl"
                                >
                                    <TechCorners Padding={2} Width={5} Height={5} />
                                    <p className="font-mono text-[10px] tracking-[0.34em] text-[var(--mono-4)]">Focused Skill</p>
                                    <p className="mt-3 font-mono text-[10px] tracking-[0.28em] text-[var(--foreground)]/52">{activeLane[0]}</p>
                                    <div className="mt-4 flex items-start gap-4">
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.25rem] border border-[var(--mono-4)]/18 bg-[var(--background)]/82 p-3">
                                            <img src={activeSkillIcon} alt="" className="h-full w-full object-contain" loading="lazy" />
                                        </div>
                                        <div>
                                            <h3 className="font-oswald text-3xl tracking-[0.12em] text-[var(--foreground)]">{activeSkillName}</h3>
                                            <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/72">{activeSkillDescription}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 rounded-[1.25rem] border border-[var(--mono-4)]/12 bg-[var(--background)]/55 p-4">
                                        <p className="font-mono text-[10px] tracking-[0.28em] text-[var(--foreground)]/52">Lane Summary</p>
                                        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/68">{activeLane[1]}</p>
                                    </div>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {activeLane[2].map((skill, skillIndex) => (
                                            <SkillBadge
                                                key={`${activeLane[0]}-${skill[1]}`}
                                                skill={skill}
                                                active={skillIndex === activeSkillIndex}
                                                onHover={() => handleActivateSkill(activeLaneIndex, skillIndex)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                {data.Highlights?.map((highlight, index) => {
                                    const Icon = highlightIcons[highlight.Icon]

                                    return (
                                        <motion.div
                                            key={highlight.Title}
                                            initial={{ opacity: 0, y: 24 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-80px" }}
                                            transition={{ duration: 0.45, delay: 0.2 + index * 0.07 }}
                                            className="rounded-[1.75rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/68 p-5 backdrop-blur-xl"
                                        >
                                            <TechCorners Padding={2} Width={3} Height={3} />
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--mono-4)]/20 bg-[var(--mono-4)]/10 text-[var(--mono-4)]">
                                                    <Icon size={22} />
                                                </div>
                                                <div>
                                                    <h4 className="font-oswald text-2xl tracking-[0.1em] text-[var(--foreground)]">{highlight.Title}</h4>
                                                    <p className="mt-2 text-sm leading-7 text-[var(--foreground)]/72">{highlight.Description}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </Glow>
            </GlowCapture>
        </section>
    )
}
