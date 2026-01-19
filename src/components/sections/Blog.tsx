"use client"

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LazySection } from '../providers/LazySection'
import ErrorMessage from '../ui/ErrorMessage'
import Loading from '../ui/Loading'
import { ExternalLink, Github, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { GlowCapture, Glow } from '@codaworks/react-glow'
import Modal from '../ui/Modal'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import GridBackground from '../ui/GridBackground'
import TechCorners from '../ui/TechCorners'
import { BlogService } from '@/models/Services/Blog'

export const Blog = ({ initialData }: { initialData?: any }) => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const containerRef = useRef<HTMLDivElement>(null)
    const isContainerInView = useInView(containerRef, { once: false, amount: 0.2 })
    const [Data, setData] = useState<any>(initialData)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const BlogRefs = useRef<(HTMLDivElement | null)[]>([])

    const extractImage = (item: any) => {
        if (item.thumbnail && item.thumbnail.length > 0) return item.thumbnail

        const imgRegex = /<img[^>]+src="([^">]+)"/
        const match = item.description.match(imgRegex) || item.content.match(imgRegex)
        if (match) return match[1]

        return null
    }

    const formatPubDate = (pubDate: string) => {
        const date = new Date(pubDate.replace(" ", "T"))
        const now = new Date()

        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        if (diffHours < 1) {
            return "Just now"
        }

        if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
        }

        if (diffDays <= 3) {
            return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).replace(/,/g, "").replace(" ", "/")
    }

    const GetData = async () => {
        setIsLoading(true)

        try {
            const blogService = BlogService.getInstance()
            const result = await blogService.Blog(endpoint)

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status) || result.status === "ok") {
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
        if (!initialData) {
            GetData()
        }
    }, [])

    if (error) return <ErrorMessage message={error} />
    if (isLoading) return <Loading />

    const backgroundData = { ...Data, Name: decodedUsername }

    return (
        <section
            id="Blog"
            className="relative min-h-screen py-20 px-4 overflow-hidden font-comic text-[var(--foreground)]"
            ref={containerRef}
        >
            <GridBackground Data={backgroundData} Name={Blog.name} Code={Blog.toString()} />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-8xl relative z-10">
                        <div className="mb-16 text-center relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-block"
                            >
                                <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] tracking-wide cursor-default">
                                    {Data.feed.title || "Blog"}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(isExpanded ? Data?.items : Data?.items.slice(0, 6)).map((Blog: any, index: number) => (
                                <div
                                    key={`${Blog.title}-${index}`}
                                    ref={el => { BlogRefs.current[index] = el }}
                                    className="h-full"
                                >
                                    <LazySection
                                        threshold={0.05}
                                        delay={index * 100}
                                        fallback={
                                            <div className="w-full h-96 bg-[var(--mono-4)]/10 animate-pulse rounded-xl" />
                                        }
                                    >
                                        <motion.a
                                            href={Blog.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                            viewport={{ once: true, amount: 0.1 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="h-full flex flex-col overflow-hidden transition-all duration-300 rounded-xl border border-[var(--foreground)]/5 hover:border-[var(--mono-4)]/50 cursor-pointer bg-[var(--mono-4)]/5 backdrop-blur-xs shadow-lg hover:shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.1)] group relative"
                                        >
                                            <TechCorners Padding={0} Width={8} Height={8} />

                                            <div className="h-60 overflow-hidden relative border-b border-[var(--foreground)]/10">
                                                <Image
                                                    src={extractImage(Blog)}
                                                    alt={Blog.title}
                                                    width={500}
                                                    height={500}
                                                    className="scale-95 translate-y-3 rounded-xl w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-[var(--mono-4)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
                                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                                <div className="grid grid-cols-8 gap-2 justify-between items-center mb-3">
                                                    <h3 className="col-span-8 text-xl font-bold font-comic text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors line-clamp-3 group-hover:line-clamp-none leading-7 min-h-[5.25rem]">
                                                        {Blog.title}
                                                    </h3>
                                                </div>

                                                <p className="text-sm font-comic text-[var(--foreground)]/70 mb-4 flex-1 transition-all duration-500 line-clamp-3 group-hover:line-clamp-3 leading-relaxed text-justify">
                                                    {Blog.description.replace(/<[^>]*>?/gm, "")}
                                                </p>

                                                <div className="mt-auto flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] font-mono text-[var(--mono-4)] uppercase">ACCESS_Blog</span>
                                                    <div className="h-px flex-1 bg-[var(--mono-4)]/30" />
                                                    <span className="col-span-2 flex justify-center items-center text-[10px] px-2 py-1 bg-[var(--mono-4)]/10 text-[var(--foreground)] font-mono border border-[var(--mono-4)]/20 rounded">
                                                        {formatPubDate(Blog.pubDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.a>
                                    </LazySection>
                                </div>
                            ))}
                        </div>

                        {/* View More Button */}
                        <div className="flex flex-col items-center gap-6 mt-16">
                            {Data.items.length > 6 && (
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
        </section>
    )
}