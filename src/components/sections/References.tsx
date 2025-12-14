"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ReferenceService } from "@/models/Services/References"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import { GlowCapture, Glow } from "@codaworks/react-glow"
import { Mail, Phone, Building2, GraduationCap, Quote, ExternalLink } from "lucide-react"
import { LazySection } from "../providers/LazySection"
import { useParams } from "next/navigation"
import GridBackground from "../ui/GridBackground"
import TechCorners from "../ui/TechCorners"

export const References = () => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const [references, setReferences] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const GetData = async () => {
        setIsLoading(true)
        try {
            const referenceService = ReferenceService.getInstance()
            const result = await referenceService.Reference(endpoint)

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                if (result.References) {
                    setReferences(result.References)
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
    if (!references || references.length === 0) return null

    // Prepare data for GridBackground (inject Name)
    const backgroundData = { References: references.length, Name: decodedUsername }

    return (
        <section className="relative min-h-screen py-20 px-4 overflow-hidden font-comic text-[var(--foreground)]" id="References">
            <GridBackground Data={backgroundData} Name={References.name} Code={References.toString()} />

            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* Header */}
                        <div className="mb-24 text-center relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-block"
                            >
                                <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] uppercase tracking-wide">
                                    References
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                            {references.map((ref, index) => (
                                <LazySection key={index} delay={index * 100}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5 }}
                                        whileHover={{ y: -5 }}
                                        className="h-full"
                                    >
                                        <div className="h-full bg-[var(--mono-4)]/5 backdrop-blur-xs border border-[var(--foreground)]/5 hover:border-[var(--mono-4)]/30 rounded-xl p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--mono-4-rgb),0.1)] group relative overflow-hidden">
                                            <TechCorners Padding={4} Width={6} Height={6} />

                                            {/* Quote Icon Background */}
                                            <Quote className="absolute top-6 right-8 w-24 h-24 text-[var(--mono-4)]/5 -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-500" />

                                            <div className="relative z-10 flex flex-col h-full gap-6">
                                                {/* Header */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-2xl font-bold font-Comic text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors duration-300 tracking-wide">
                                                            {ref.Name}
                                                        </h3>
                                                        <div className="w-2 h-2 rounded-full bg-[var(--mono-4)] animate-pulse shadow-[0_0_8px_var(--mono-4)] mt-2" />
                                                    </div>

                                                    <div className="flex flex-col gap-1 text-[var(--foreground)]/80">
                                                        <span className="font-bold text-lg font-comic text-[var(--mono-4)]">{ref.Job}</span>
                                                        <span className="flex items-center gap-1.5 text-sm font-mono opacity-80">
                                                            <Building2 className="w-3 h-3 text-[var(--mono-4)]" />
                                                            {ref.Company}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Education if available */}
                                                {ref.Education && (
                                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--background)]/30 border border-[var(--mono-4)]/10 group-hover:border-[var(--mono-4)]/20 transition-colors">
                                                        <GraduationCap className="w-5 h-5 text-[var(--mono-4)] mt-0.5 shrink-0" />
                                                        <p className="text-sm font-comic text-[var(--foreground)]/80 italic leading-relaxed">
                                                            "{ref.Education}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Divider */}
                                                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--mono-4)]/20 to-transparent my-auto" />

                                                {/* Contact Links - Styled as Data Points */}
                                                <div className="flex flex-col gap-3 mt-auto">
                                                    {ref.Email && (
                                                        <a
                                                            // href={`mailto:${ref.Email}`}
                                                            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--mono-4)]/5 bg-[var(--mono-4)]/5 hover:bg-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 text-[var(--foreground)]/80 hover:text-[var(--mono-4)] transition-all group/link"
                                                        >
                                                            <div className="p-1.5 rounded bg-[var(--background)] text-[var(--mono-4)] border border-[var(--mono-4)]/20">
                                                                <Mail className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-bold font-mono tracking-tight blur-xs">{ref.Email}</span>
                                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover/link:opacity-50 transition-opacity" />
                                                        </a>
                                                    )}
                                                    {ref.Phone && (
                                                        <a
                                                            // href={`tel:${ref.Phone}`}
                                                            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--mono-4)]/5 bg-[var(--mono-4)]/5 hover:bg-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 text-[var(--foreground)]/80 hover:text-[var(--mono-4)] transition-all group/link"
                                                        >
                                                            <div className="p-1.5 rounded bg-[var(--background)] text-[var(--mono-4)] border border-[var(--mono-4)]/20">
                                                                <Phone className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-bold font-mono tracking-tight blur-xs">{ref.Phone}</span>
                                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover/link:opacity-50 transition-opacity" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </LazySection>
                            ))}
                        </div>
                    </div>
                </Glow>
            </GlowCapture>
        </section>
    )
}