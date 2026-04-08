"use client"

import { Glow, GlowCapture } from "@codaworks/react-glow"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ExternalLink, Github, Play } from "lucide-react"
import { useEffect, useState, type KeyboardEvent } from "react"
import {
    ProjectsService,
    type ProjectLink,
    type ProjectRecord,
    type ProjectsResult
} from "@/models/Services/Projects"
import { LazySection } from "../providers/LazySection"
import ErrorMessage from "../ui/ErrorMessage"
import GridBackground from "../ui/GridBackground"
import Loading from "../ui/Loading"
import Modal from "../ui/Modal"
import TechCorners from "../ui/TechCorners"

const normalizeCopy = (value: string) =>
    value
        .replace(/\u00e2\u20ac\u201d|\u00c3\u00a2\u201a\u00ac\u00e2\u20ac\u009d/g, "--")
        .replace(/([a-z])\.([A-Z])/g, "$1. $2")
        .replace(/\s+/g, " ")
        .trim()

const normalizeSkills = (skills: ProjectRecord["Skills"]) => {
    if (Array.isArray(skills)) {
        return skills.map((skill) => skill.trim()).filter(Boolean)
    }

    if (typeof skills === "string") {
        return skills.split(",").map((skill) => skill.trim()).filter(Boolean)
    }

    return []
}

const getLinkIcon = (icon: string) => {
    switch (icon.toLowerCase()) {
        case "github":
            return <Github className="h-4 w-4" />
        case "play-circle":
            return <Play className="h-4 w-4" />
        case "link":
        default:
            return <ExternalLink className="h-4 w-4" />
    }
}

const isSuccessfulStatus = (status: number) =>
    [200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(status)

export const Projects = ({ initialData }: { initialData?: ProjectsResult }) => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`

    const [data, setData] = useState<ProjectsResult | null>(initialData || null)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [activeProjectName, setActiveProjectName] = useState<string | null>(initialData?.Projects?.[0]?.Name ?? null)

    useEffect(() => {
        if (initialData) {
            return
        }

        const loadData = async () => {
            setIsLoading(true)

            try {
                const projectsService = ProjectsService.getInstance()
                const result = await projectsService.Projects(endpoint)

                if (isSuccessfulStatus(result.Status)) {
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

    if (error) return <ErrorMessage message={error} />
    if (isLoading || !data) return <Loading />
    if (!data.Projects?.length) return <ErrorMessage message="No projects are available right now." />

    const allProjects = data.Projects
    const visibleProjects = isExpanded ? allProjects : allProjects.slice(0, 6)
    const activeProject = allProjects.find((project) => project.Name === activeProjectName) || allProjects[0]
    const activeProjectIndex = allProjects.findIndex((project) => project.Name === activeProject.Name)
    const spotlightSkills = normalizeSkills(activeProject.Skills)
    const spotlightLinks = activeProject.Links ?? []
    const selectedProjectIndex = selectedProject
        ? allProjects.findIndex((project) => project.Name === selectedProject.Name)
        : -1
    const backgroundData = { ...data, ActiveProject: activeProject.Name, Name: decodedUsername }

    const handleProjectFocus = (project: ProjectRecord) => {
        setActiveProjectName(project.Name)
    }

    const handleOpenProject = (project: ProjectRecord) => {
        setActiveProjectName(project.Name)
        setSelectedProject(project)
        setIsModalOpen(true)
    }

    const handleRotateProject = (direction: 1 | -1) => {
        const nextIndex = (activeProjectIndex + direction + allProjects.length) % allProjects.length
        setActiveProjectName(allProjects[nextIndex].Name)
    }

    const handleProjectKeyDown = (event: KeyboardEvent<HTMLElement>, project: ProjectRecord) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleOpenProject(project)
        }
    }

    const handleModalNavigation = (direction: 1 | -1) => {
        if (!selectedProject) {
            return
        }

        const currentIndex = allProjects.findIndex((project) => project.Name === selectedProject.Name)
        const nextIndex = (currentIndex + direction + allProjects.length) % allProjects.length
        const nextProject = allProjects[nextIndex]

        setSelectedProject(nextProject)
        setActiveProjectName(nextProject.Name)
    }

    return (
        <section id="Projects" className="relative overflow-x-clip px-3 py-16 font-comic text-[var(--foreground)] lg:px-5 lg:py-24">
            <GridBackground Data={backgroundData} Name={Projects.name} Code={Projects.toString()} />

            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(15,115,255,0.16),transparent_68%)] blur-3xl" />
                <div className="absolute bottom-10 right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(15,115,255,0.12),transparent_72%)] blur-3xl" />
            </div>

            <GlowCapture>
                <Glow color="var(--mono-4)">
                    <div className="relative z-10 mx-auto max-w-[90rem]">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5 }}
                            className="mx-auto mb-10 max-w-4xl text-center lg:mb-14"
                        >
                            <div className="inline-block">
                                <h2 className="mb-2 font-oswald text-4xl font-bold tracking-[0.08em] text-[var(--foreground)] sm:text-6xl">
                                    {data.Title}
                                </h2>
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-transparent via-[var(--mono-4)] to-transparent">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        whileInView={{ x: "200%" }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute left-0 top-0 h-full w-1/3 bg-[var(--mono-4)] opacity-50 blur-[2px]"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <div className="grid gap-8 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] xl:items-start">
                            <motion.aside
                                initial={{ opacity: 0, x: -18 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5, delay: 0.08 }}
                                className="relative self-start rounded-[1.75rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/78 p-5 backdrop-blur-xl xl:sticky xl:top-24"
                            >
                                <TechCorners Padding={1} Width={6} Height={6} />

                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={activeProject.Name}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -18 }}
                                        transition={{ duration: 0.28, ease: "easeOut" }}
                                        className="relative"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="mt-2 font-oswald text-3xl tracking-[0.08em] text-[var(--foreground)]">
                                                    {activeProject.Name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRotateProject(-1)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mono-4)]/18 bg-[var(--background)]/80 text-[var(--foreground)] transition-colors hover:border-[var(--mono-4)]/40 hover:text-[var(--mono-4)]"
                                                    aria-label="Show previous project"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRotateProject(1)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mono-4)]/18 bg-[var(--background)]/80 text-[var(--foreground)] transition-colors hover:border-[var(--mono-4)]/40 hover:text-[var(--mono-4)]"
                                                    aria-label="Show next project"
                                                >
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {endpoint === '/Aaroophan' && <div className="relative mt-5 overflow-hidden rounded-[1.25rem] border border-[var(--mono-4)]/16">
                                            <div className="relative aspect-[4/3]">
                                                <Image
                                                    src={activeProject.Image}
                                                    alt={activeProject.Name}
                                                    fill
                                                    sizes="(max-width: 1279px) 100vw, 380px"
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,14,35,0.05),rgba(0,14,35,0.78))]" />
                                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.06)_50%)] bg-[length:100%_4px] opacity-20" />
                                                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 p-4">
                                                    <span className="rounded-full border border-white/18 bg-black/25 px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white/90 uppercase backdrop-blur-md">
                                                        {activeProject.Date}
                                                    </span>
                                                    <span className="rounded-full border border-white/18 bg-black/20 px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white/80 uppercase backdrop-blur-md">
                                                        {`${(activeProjectIndex + 1).toString().padStart(2, "0")} / ${allProjects.length.toString().padStart(2, "0")}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>}

                                        <p className="mt-5 text-sm leading-7 text-[var(--foreground)]/72">
                                            {normalizeCopy(activeProject.Description)}
                                        </p>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {spotlightSkills.slice(0, 6).map((skill) => (
                                                <span
                                                    key={`${activeProject.Name}-${skill}`}
                                                    className="rounded-full border border-[var(--mono-4)]/14 bg-[var(--background)]/82 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-[var(--foreground)]/76"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-5 grid gap-3">
                                            {spotlightLinks.length ? (
                                                spotlightLinks.map((link) => (
                                                    <a
                                                        key={`${activeProject.Name}-${link.Name}-${link.Href}`}
                                                        href={link.Href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group flex items-center gap-3 rounded-[1rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/82 px-4 py-3 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--mono-4)]/40 hover:bg-[var(--mono-4)]/10"
                                                    >
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mono-4)]/18 bg-[var(--background)] text-[var(--mono-4)]">
                                                            {getLinkIcon(link.Icon)}
                                                        </span>
                                                        <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
                                                            {link.Name}
                                                        </span>
                                                        <ExternalLink className="ml-auto h-3.5 w-3.5 text-[var(--foreground)]/50 transition-transform group-hover:translate-x-0.5" />
                                                    </a>
                                                ))
                                            ) : (
                                                <div className="rounded-[1rem] border border-dashed border-[var(--mono-4)]/18 px-4 py-4 text-sm leading-7 text-[var(--foreground)]/60">
                                                    No public links were published for this project.
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenProject(activeProject)}
                                            className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--mono-4)]/24 bg-[var(--mono-4)] px-5 py-3 font-mono text-[11px] tracking-[0.24em] text-white uppercase transition-transform hover:scale-[1.01]"
                                        >
                                            Open
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            </motion.aside>

                            <div>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 2xl:grid-cols-2">
                                    {visibleProjects.map((project, index) => {
                                        const projectSkills = normalizeSkills(project.Skills)
                                        const isActiveProject = project.Name === activeProject.Name

                                        return (
                                            <div key={project.Name} className="h-full">
                                                <LazySection
                                                    threshold={0.05}
                                                    delay={index * 80}
                                                    fallback={<div className="h-96 w-full animate-pulse rounded-xl bg-[var(--mono-4)]/10" />}
                                                >
                                                    <motion.article
                                                        tabIndex={0}
                                                        role="button"
                                                        onClick={() => handleOpenProject(project)}
                                                        onMouseEnter={() => handleProjectFocus(project)}
                                                        onFocus={() => handleProjectFocus(project)}
                                                        onKeyDown={(event) => handleProjectKeyDown(event, project)}
                                                        whileHover={{ y: -5, scale: 1.02 }}
                                                        className={`group relative flex h-full cursor-pointer flex-col rounded-xl border bg-transparent shadow-lg backdrop-blur-xs transition-all duration-300 ${isActiveProject
                                                            ? "border-[var(--mono-4)]/50 shadow-[0_0_20px_rgba(15,115,255,0.12)]"
                                                            : "border-[var(--foreground)]/5 hover:border-[var(--mono-4)]/50 hover:shadow-[0_0_20px_rgba(15,115,255,0.1)]"
                                                            }`}
                                                    >
                                                        <TechCorners Padding={2} Width={8} Height={8} />

                                                        {endpoint === '/Aaroophan' && <div className="relative h-60 overflow-hidden">
                                                            <Image
                                                                src={project.Image}
                                                                alt={project.Name}
                                                                width={500}
                                                                height={500}
                                                                className="h-full w-full scale-95 translate-y-3 rounded-xl object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
                                                            />
                                                            <div className="absolute inset-0 bg-[var(--mono-4)]/10 opacity-0 transition-opacity duration-300 mix-blend-overlay group-hover:opacity-100" />
                                                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10" />
                                                        </div>}

                                                        <div className="relative z-10 flex flex-1 flex-col p-6">
                                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                                <h3 className="text-xl font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--mono-4)]">
                                                                    {project.Name}
                                                                </h3>
                                                                <span className="rounded border border-[var(--mono-4)]/20 bg-[var(--mono-4)]/10 px-2 py-1 font-mono text-[10px] text-[var(--foreground)] sm:text-xs">
                                                                    {project.Date}
                                                                </span>
                                                            </div>

                                                            <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--foreground)]/70 transition-all duration-500 line-clamp-3 group-hover:line-clamp-none">
                                                                {normalizeCopy(project.Description)}
                                                            </p>

                                                            <div className="mb-6">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {projectSkills.map((skill) => (
                                                                        <span
                                                                            key={`${project.Name}-${skill}`}
                                                                            className="border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 px-2 py-1 font-mono text-[10px] text-[var(--foreground)]/80 transition-colors group-hover:border-[var(--mono-4)]/30 group-hover:text-[var(--mono-4)]"
                                                                        >
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="mt-auto flex items-center gap-2 opacity-50 transition-opacity group-hover:opacity-100">
                                                                <div className="h-px flex-1 bg-[var(--mono-4)]/30" />
                                                                <span className="font-mono text-[10px] uppercase text-[var(--mono-4)]">
                                                                    Open
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </motion.article>
                                                </LazySection>
                                            </div>
                                        )
                                    })}
                                </div>

                                {allProjects.length > 6 ? (
                                    <div className="mt-16 flex flex-col items-center gap-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsExpanded((current) => !current)}
                                            className="inline-flex items-center gap-2 border border-[var(--mono-4)]/30 bg-[var(--mono-4)]/10 px-8 py-3 font-comic font-bold uppercase tracking-wider text-[var(--foreground)] transition-all duration-300 hover:border-[var(--mono-4)] hover:bg-[var(--mono-4)]/20"
                                        >
                                            {isExpanded ? "COLLAPSE_ARCHIVE" : "EXPAND_ARCHIVE"}
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Glow>
            </GlowCapture>

            {isModalOpen && selectedProject ? (
                <Modal Title={`CASE_FILE: ${selectedProject.Name}`} setIsModalOpen={setIsModalOpen}>
                    <div className="relative space-y-6 font-comic text-[var(--foreground)]">
                        <div className="pointer-events-none absolute inset-0 opacity-10">
                            <div className="absolute right-0 top-0 h-32 w-32 rounded-tr-[2rem] border-r border-t border-[var(--mono-4)]" />
                            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-bl-[2rem] border-b border-l border-[var(--mono-4)]" />
                        </div>

                        <div className="relative flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[var(--mono-4)]/14 bg-[var(--background)]/72 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-[var(--foreground)]/70 uppercase">
                                {selectedProject.Date}
                            </span>
                            {selectedProjectIndex >= 0 ? (
                                <span className="rounded-full border border-[var(--mono-4)]/14 bg-[var(--background)]/72 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-[var(--foreground)]/70 uppercase">
                                    {`${(selectedProjectIndex + 1).toString().padStart(2, "0")} / ${allProjects.length.toString().padStart(2, "0")}`}
                                </span>
                            ) : null}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_320px]">
                            <div className="space-y-6">
                                <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/74">
                                    <div className="relative aspect-[16/9]">
                                        {endpoint === '/Aaroophan' && <Image
                                            src={selectedProject.Image}
                                            alt={selectedProject.Name}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 800px"
                                            className="object-cover"
                                        />}
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,14,35,0.06),rgba(0,14,35,0.75))]" />
                                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.06)_50%)] bg-[length:100%_4px] opacity-20" />
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <h3 className="font-oswald text-3xl tracking-[0.1em] text-white sm:text-4xl">
                                                {selectedProject.Name}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-[var(--mono-4)]/14 bg-[var(--background)]/72 p-5">
                                    <p className="mt-4 text-sm leading-8 text-[var(--foreground)]/76">
                                        {normalizeCopy(selectedProject.Description)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="rounded-[1.5rem] border border-[var(--mono-4)]/14 bg-[linear-gradient(180deg,rgba(15,115,255,0.12),rgba(15,115,255,0.04))] p-5">
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {normalizeSkills(selectedProject.Skills).map((skill) => (
                                            <span
                                                key={`${selectedProject.Name}-${skill}`}
                                                className="rounded-full border border-[var(--mono-4)]/16 bg-[var(--background)]/78 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-[var(--foreground)]/78"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-[var(--mono-4)]/14 bg-[var(--background)]/72 p-5">
                                    <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--mono-4)] uppercase">
                                        Links
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        {(selectedProject.Links ?? []).length ? (
                                            selectedProject.Links.map((link: ProjectLink) => (
                                                <a
                                                    key={`${selectedProject.Name}-${link.Name}-${link.Href}`}
                                                    href={link.Href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-center gap-3 rounded-[1rem] border border-[var(--mono-4)]/16 bg-[var(--background)]/82 px-4 py-3 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--mono-4)]/40 hover:bg-[var(--mono-4)]/10"
                                                >
                                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mono-4)]/18 bg-[var(--background)] text-[var(--mono-4)]">
                                                        {getLinkIcon(link.Icon)}
                                                    </span>
                                                    <span className="font-mono text-[11px] tracking-[0.22em] uppercase">
                                                        {link.Name}
                                                    </span>
                                                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-[var(--foreground)]/50 transition-transform group-hover:translate-x-0.5" />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="rounded-[1rem] border border-dashed border-[var(--mono-4)]/18 px-4 py-4 text-sm leading-7 text-[var(--foreground)]/60">
                                                No public links were published for this project.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-[var(--mono-4)]/14 bg-[var(--background)]/72 p-5">
                                    <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--mono-4)] uppercase">
                                        Project Navigation
                                    </p>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleModalNavigation(-1)}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--mono-4)]/18 bg-[var(--background)]/82 px-4 py-3 font-mono text-[11px] tracking-[0.22em] text-[var(--foreground)] uppercase transition-colors hover:border-[var(--mono-4)]/40 hover:text-[var(--mono-4)]"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleModalNavigation(1)}
                                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--mono-4)]/18 bg-[var(--background)]/82 px-4 py-3 font-mono text-[11px] tracking-[0.22em] text-[var(--foreground)] uppercase transition-colors hover:border-[var(--mono-4)]/40 hover:text-[var(--mono-4)]"
                                        >
                                            Next
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            ) : null}
        </section>
    )
}
