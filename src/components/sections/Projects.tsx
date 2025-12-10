import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LazySection } from '../providers/LazySection'
import { ProjectsService } from '@/models/Services/Projects'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { ExternalLink, Github, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { GlowCapture } from '@codaworks/react-glow'
import Modal from '../ui/Modal'
import Image from 'next/image'
import { useParams } from 'next/navigation'

export const Projects = () => {
    const params = useParams<{ username?: string }>()
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

    return (
        <section
            id="Projects"
            className="py-10 md:py-20 bg-gradient-to-b from-[var(--foreground)]/0 to-[var(--foreground)]/5 backdrop-blur-sm rounded-lg font-comic"
            ref={containerRef}
        >
            <GlowCapture>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl">
                    {/* Header */}
                    <LazySection threshold={0.1} fallback={<div className="h-12 bg-[var(--mono-4)]/10 animate-pulse rounded-lg w-64 mx-auto mb-10" />}>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center font-comic text-4xl md:text-5xl font-bold pb-6 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent cursor-default"
                        >
                            {"Featured Projects".split('').map((letter, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.05, delay: idx * 0.05 }}
                                    className="rounded-md text-[var(--foreground)] hover:text-[var(--mono-4)] transition-colors"
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </motion.h2>
                    </LazySection>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                    </motion.div>

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
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.3 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className="h-full flex flex-col overflow-hidden transition-all duration-300 rounded-xl border-l-4 border-[var(--mono-4)] hover:border-l-0 cursor-pointer bg-[var(--mono-4)]/5 backdrop-blur-sm shadow-lg hover:shadow-xl group"
                                    >
                                        {/* Project Image */}
                                        <div className="h-48 overflow-hidden relative">
                                            <Image
                                                src={project.Image}
                                                alt={project.Name}
                                                width={500}
                                                height={500}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    // Fallback image
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        {/* Project Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Header with date */}
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors">
                                                    {project.Name}
                                                </h3>
                                                <span className="text-xs px-3 py-1 bg-[var(--mono-4)]/10 text-[var(--mono-4)] rounded-full font-medium">
                                                    {project.Date}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-[var(--foreground)]/70 mb-4 flex-1 transition-all duration-500 line-clamp-3 group-hover:line-clamp-none">
                                                {project.Description}
                                            </p>

                                            {/* Technologies */}
                                            <div className="mb-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(project.Technologies)
                                                        ? project.Technologies.slice(0, 3).map((tech: string) => (
                                                            <span
                                                                key={tech}
                                                                className="text-xs px-3 py-1 bg-[var(--mono-4)]/10 text-[var(--foreground)] rounded-full transition-colors group-hover:bg-[var(--mono-4)]/20 group-hover:text-[var(--mono-4)]"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))
                                                        : typeof project.Technologies === 'string'
                                                            ? project.Technologies.split(', ').slice(0, 3).map((tech: string) => (
                                                                <span
                                                                    key={tech}
                                                                    className="text-xs px-3 py-1 bg-[var(--mono-4)]/10 text-[var(--foreground)] rounded-full transition-colors group-hover:bg-[var(--mono-4)]/20 group-hover:text-[var(--mono-4)]"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))
                                                            : null
                                                    }
                                                    {(Array.isArray(project.Technologies) && project.Technologies.length > 3) || (typeof project.Technologies === 'string' && project.Technologies.split(', ').length > 3) ? (
                                                        <span className="text-xs px-3 py-1 bg-[var(--mono-4)]/10 text-[var(--foreground)] rounded-full">...</span>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Links */}
                                            {project.Links && project.Links.length > 0 && (
                                                <div className="flex gap-3 mt-auto pt-4 border-t border-[var(--mono-4)]/10">
                                                    <span className="text-xs text-[var(--mono-4)] font-medium self-center">Click for details</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </LazySection>
                            </div>
                        ))}
                    </div>

                    {/* View More Button */}
                    <div className="flex flex-col items-center gap-6 mt-12">
                        {Data.Projects.length > 6 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--mono-4)]/10 hover:bg-[var(--mono-4)]/20 text-[var(--mono-4)] font-medium transition-all duration-300 hover:scale-105"
                            >
                                {isExpanded ? (
                                    <>
                                        Show Less Projects <ChevronUp className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        Show More Projects <ChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}

                        <LazySection threshold={0.2} delay={500}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                            >
                                <a
                                    href="https://github.com/Aaroophan?tab=repositories"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--mono-4)]/10 text-[var(--foreground)]/70 hover:text-[var(--mono-4)] hover:border-[var(--mono-4)] font-medium transition-all duration-300"
                                >
                                    View More on GitHub
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </motion.div>
                        </LazySection>
                    </div>
                </div>
            </GlowCapture>

            {/* Project Details Modal */}
            {isModalOpen && selectedProject && (
                <div className="" >
                    <Modal Title={selectedProject.Name} setIsModalOpen={setIsModalOpen}>
                        <div className="space-y-6 font-comic">
                            {/* Image Banner */}
                            <div className="w-full h-64 sm:h-96 rounded-xl overflow-hidden relative border border-[var(--mono-4)]/20">
                                <img
                                    src={selectedProject.Image}
                                    alt={selectedProject.Name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-[var(--foreground)] flex items-center gap-2">
                                            <span className="w-1 h-6 bg-[var(--mono-4)] rounded-full"></span>
                                            About this project
                                        </h3>
                                        <p className="text-[var(--foreground)]/80 leading-relaxed text-justify whitespace-pre-line">
                                            {selectedProject.Description}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Date */}
                                    <div className="p-4 rounded-xl bg-[var(--mono-4)]/5 border border-[var(--mono-4)]/10">
                                        <h4 className="text-sm font-bold text-[var(--foreground)]/60 mb-1 uppercase tracking-wider">Timeline</h4>
                                        <p className="text-[var(--foreground)] font-medium">{selectedProject.Date}</p>
                                    </div>

                                    {/* Technologies */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-3 text-[var(--foreground)]">Technologies</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(selectedProject.Technologies)
                                                ? selectedProject.Technologies.map((tech: string) => (
                                                    <span
                                                        key={tech}
                                                        className="text-xs px-3 py-1.5 bg-[var(--mono-4)]/10 text-[var(--foreground)] rounded-lg border border-[var(--mono-4)]/10"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))
                                                : typeof selectedProject.Technologies === 'string'
                                                    ? selectedProject.Technologies.split(', ').map((tech: string) => (
                                                        <span
                                                            key={tech}
                                                            className="text-xs px-3 py-1.5 bg-[var(--mono-4)]/10 text-[var(--foreground)] rounded-lg border border-[var(--mono-4)]/10"
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
                                        <h3 className="text-lg font-bold mb-3 text-[var(--foreground)]">Links</h3>
                                        <div className="flex flex-col gap-3">
                                            {selectedProject.Links && selectedProject.Links.map((link: any, index: number) => (
                                                <a
                                                    key={index}
                                                    href={link.Href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--mono-4)]/10 hover:bg-[var(--mono-4)]/20 text-[var(--foreground)] transition-all duration-300 hover:translate-x-1 group"
                                                >
                                                    <div className="p-2 bg-[var(--background)] rounded-full text-[var(--mono-4)]">
                                                        {getLinkIcon(link.Icon)}
                                                    </div>
                                                    <span className="font-medium group-hover:text-[var(--mono-4)] transition-colors">{link.Name}</span>
                                                    <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
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