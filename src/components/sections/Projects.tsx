"use client"

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LazySection } from '../providers/LazySection'
import { ProjectsService } from '@/models/Services/Projects'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { ExternalLink, Github, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { GlowCapture, Glow } from '@codaworks/react-glow'
import Modal from '../ui/Modal'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import GridBackground from '../ui/GridBackground'
import TechCorners from '../ui/TechCorners'

export const Projects = () => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const containerRef = useRef<HTMLDivElement>(null)
    const isContainerInView = useInView(containerRef, { once: false, amount: 0.2 })

    const [Data, setData] = useState<any>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal state
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    // Dynamic refs for each project
    const projectRefs = useRef<(HTMLDivElement | null)[]>([])

    const getLinkIcon = (icon: string) => {
        switch (icon.toLowerCase()) {
            case 'github':
                return <Github className="w-5 h-5" />
            case 'link':
                return <ExternalLink className="w-5 h-5" />
            case 'play-circle':
                return <Play className="w-5 h-5" />
            default:
                return <ExternalLink className="w-5 h-5" />
        }
    }
    const GetData = async () => {
        setIsLoading(true)

        try {
            const projectsService = ProjectsService.getInstance()
            const result = await projectsService.Projects(endpoint)

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
        <section
            id="Projects"
            className="relative min-h-screen py-20 px-4 overflow-hidden font-comic text-[var(--foreground)]"
            ref={containerRef}
        >
            <GridBackground Data={backgroundData} Name={Projects.name} Code={Projects.toString()} />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl relative z-10">
                        {/* Header */}
                        <div className="mb-16 text-center relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-block"
                            >
                                <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] uppercase tracking-wide">
                                    Project Archive
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

                        {/* Projects Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(isExpanded ? Data.Projects : Data.Projects.slice(0, 6)).map((project: any, index: number) => (
                                <div
                                    key={`${project.Name}-${index}`}
                                    ref={el => { projectRefs.current[index] = el }}
                                    className="h-full"
                                    onClick={() => {
                                        setSelectedProject(project)
                                        setIsModalOpen(true)
                                    }}
                                >
                                    <LazySection
                                        threshold={0.05}
                                        delay={index * 100}
                                        fallback={
                                            <div className="w-full h-96 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />
                                        }
                                    >
                                        <motion.article
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.1 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="h-full flex flex-col overflow-hidden transition-all duration-300 rounded-xl border border-[var(--foreground)]/5 hover:border-[var(--mono-4)]/50 cursor-pointer bg-[var(--mono-4)]/5 backdrop-blur-xs shadow-lg hover:shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.1)] group relative"
                                        >
                                            <TechCorners Padding={0} Width={8} Height={8} />

                                            {/* Project Image */}
                                            <div className="h-48 overflow-hidden relative border-b border-[var(--foreground)]/10">
                                                <Image
                                                    src={project.Image}
                                                    alt={project.Name}
                                                    width={500}
                                                    height={500}
                                                    className="scale-95 translate-y-3 rounded-xl w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                    onError={(e) => {
                                                        // Fallback image
                                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-[var(--mono-4)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                                                {/* Scanline effect */}
                                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
                                            </div>

                                            {/* Project Content */}
                                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                                {/* Header with date */}
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-xl font-bold font-comic text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors ">
                                                        {project.Name}
                                                    </h3>
                                                    <span className="text-[10px] sm:text-xs px-2 py-1 bg-[var(--mono-4)]/10 text-[var(--foreground)] font-mono border border-[var(--mono-4)]/20 rounded">
                                                        {project.Date}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm font-comic text-[var(--foreground)]/70 mb-4 flex-1 transition-all duration-500 line-clamp-3 group-hover:line-clamp-none leading-relaxed">
                                                    {project.Description}
                                                </p>

                                                {/* Technologies */}
                                                <div className="mb-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(project.Technologies)
                                                            ? project.Technologies.slice(0, 4).map((tech: string) => (
                                                                <span
                                                                    key={tech}
                                                                    className="text-[10px] px-2 py-1 bg-[var(--foreground)]/5 text-[var(--foreground)]/80 font-mono border border-[var(--foreground)]/10 transition-colors group-hover:border-[var(--mono-4)]/30 group-hover:text-[var(--mono-4)]"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))
                                                            : typeof project.Technologies === 'string'
                                                                ? project.Technologies.split(', ').slice(0, 4).map((tech: string) => (
                                                                    <span
                                                                        key={tech}
                                                                        className="text-[10px] px-2 py-1 bg-[var(--foreground)]/5 text-[var(--foreground)]/80 font-mono border border-[var(--foreground)]/10 transition-colors group-hover:border-[var(--mono-4)]/30 group-hover:text-[var(--mono-4)]"
                                                                    >
                                                                        {tech}
                                                                    </span>
                                                                ))
                                                                : null
                                                        }
                                                        {(Array.isArray(project.Technologies) && project.Technologies.length > 4) || (typeof project.Technologies === 'string' && project.Technologies.split(', ').length > 4) ? (
                                                            <span className="text-[10px] px-2 py-1 text-[var(--mono-4)] font-mono">...</span>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {/* Links Indicator */}
                                                <div className="mt-auto flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <div className="h-px flex-1 bg-[var(--mono-4)]/30" />
                                                    <span className="text-[10px] font-mono text-[var(--mono-4)] uppercase">ACCESS_PROJECT</span>
                                                </div>
                                            </div>
                                        </motion.article>
                                    </LazySection>
                                </div>
                            ))}
                        </div>

                        {/* View More Button */}
                        <div className="flex flex-col items-center gap-6 mt-16">
                            {Data.Projects.length > 6 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--mono-4)]/10 hover:bg-[var(--mono-4)]/20 text-[var(--foreground)] font-bold font-comic uppercase tracking-wider transition-all duration-300 border border-[var(--mono-4)]/30 hover:border-[var(--mono-4)]"
                                >
                                    {isExpanded ? (
                                        <>
                                            COLLAPSE_ARCHIVE <ChevronUp className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            EXPAND_ARCHIVE <ChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </Glow>
            </GlowCapture>

            {/* Project Details Modal */}
            {isModalOpen && selectedProject && (
                <div className="" >
                    <Modal Title={`CASE_FILE: ${selectedProject.Name}`} setIsModalOpen={setIsModalOpen}>
                        <div className="space-y-6 font-comic relative">
                            {/* Decorative Background inside Modal */}
                            <div className="absolute inset-0 pointer-events-none opacity-5">
                                <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-[var(--foreground)] rounded-tr-3xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-[var(--foreground)] rounded-bl-3xl" />
                            </div>

                            {/* Image Banner */}
                            <div className="w-full h-64 sm:h-96 rounded-none border-y-2 border-[var(--mono-4)]/30 overflow-hidden relative group">
                                <img
                                    src={selectedProject.Image}
                                    alt={selectedProject.Name}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                    }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-20 pointer-events-none" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-[var(--foreground)] flex items-center gap-2 uppercase tracking-tight">
                                            <span className="w-2 h-2 bg-[var(--mono-4)]"></span>
                                            Mission Brief
                                        </h3>
                                        <div className="p-4 border border-[var(--foreground)]/10 bg-[var(--background)]/30 relative">
                                            <TechCorners Padding={0} Width={1} Height={1} />
                                            <p className="text-[var(--foreground)]/80 leading-relaxed text-justify whitespace-pre-line text-sm md:text-md">
                                                {selectedProject.Description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Date */}
                                    <div className="p-4 bg-[var(--mono-4)]/5 border-l-2 border-[var(--mono-4)]">
                                        <h4 className="text-xs font-bold font-mono text-[var(--mono-4)] mb-1 uppercase tracking-wider">Timestamp</h4>
                                        <p className="text-[var(--foreground)] font-bold">{selectedProject.Date}</p>
                                    </div>

                                    {/* Technologies */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-[var(--foreground)] uppercase tracking-tight">Tech Stack</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(selectedProject.Technologies)
                                                ? selectedProject.Technologies.map((tech: string) => (
                                                    <span
                                                        key={tech}
                                                        className="text-xs px-2 py-1 bg-[var(--foreground)]/5 text-[var(--foreground)]/90 font-mono border border-[var(--foreground)]/10"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))
                                                : typeof selectedProject.Technologies === 'string'
                                                    ? selectedProject.Technologies.split(', ').map((tech: string) => (
                                                        <span
                                                            key={tech}
                                                            className="text-xs px-2 py-1 bg-[var(--foreground)]/5 text-[var(--foreground)]/90 font-mono border border-[var(--foreground)]/10"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))
                                                    : null
                                            }
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-[var(--foreground)] uppercase tracking-tight">Data Links</h3>
                                        <div className="flex flex-col gap-3">
                                            {selectedProject.Links && selectedProject.Links.map((link: any, index: number) => (
                                                <a
                                                    key={index}
                                                    href={link.Href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 border border-[var(--mono-4)]/20 hover:bg-[var(--mono-4)]/10 hover:border-[var(--mono-4)] text-[var(--foreground)] transition-all duration-300 group"
                                                >
                                                    <div className="p-2 bg-[var(--mono-4)]/10 text-[var(--mono-4)]">
                                                        {getLinkIcon(link.Icon)}
                                                    </div>
                                                    <span className="font-bold font-comic text-sm group-hover:translate-x-1 transition-transform">{link.Name}</span>
                                                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>
            )}
        </section>
    )
}