"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ReferenceService } from "@/models/Services/References"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import { GlowCapture } from "@codaworks/react-glow"
import { Mail, Phone, Building2, GraduationCap, Quote } from "lucide-react"
import { LazySection } from "../providers/LazySection"
import { useParams } from "next/navigation"

export const References = () => {
    const params = useParams<{ username?: string }>()
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

    return (
        <section className="py-24 relative overflow-hidden font-comic" id="References">
            <GlowCapture>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-comic text-4xl md:text-5xl font-bold pb-6 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent cursor-default">
                            References
                        </h2>
                        <p className="font-comic text-lg text-gray-400 max-w-2xl mx-auto bg-gradient-to-br from-[var(--foreground)]/75 via-[var(--foreground)]/75 to-[var(--foreground)]/75 bg-clip-text text-transparent cursor-default">
                            Professional endorsements and recommendations.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {references.map((ref, index) => (
                            <LazySection key={index} delay={index * 100}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    whileHover={{ y: -5 }}
                                    className="h-full bg-gradient-to-br from-[var(--mono-4)]/10 to-[var(--mono-4)]/0 backdrop-blur-sm border border-[var(--mono-4)]/10 rounded-3xl p-8 hover:border-[var(--mono-4)]/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                                >
                                    {/* Quote Icon Background */}
                                    <Quote className="absolute top-4 right-6 w-24 h-24 text-[var(--mono-4)]/5 -rotate-12 group-hover:scale-110 transition-transform duration-500" />

                                    <div className="relative z-10 flex flex-col h-full gap-6">
                                        {/* Header */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-[var(--foreground)] group-hover:text-[var(--mono-4)] transition-colors duration-300">
                                                {ref.Name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-4 text-[var(--foreground)]/80">
                                                <span className="font-semibold">{ref.Job}</span>
                                                <span className="text-[var(--mono-4)]">•</span>
                                                <span className="flex items-center gap-1.5 text-[var(--mono-4)]">
                                                    <Building2 className="w-4 h-4" />
                                                    {ref.Company}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Education if available */}
                                        {ref.Education && (
                                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--mono-4)]/5 border border-[var(--mono-4)]/10">
                                                <GraduationCap className="w-5 h-5 text-[var(--mono-4)] mt-0.5 shrink-0" />
                                                <p className="text-sm text-[var(--foreground)]/70 italic">
                                                    {ref.Education}
                                                </p>
                                            </div>
                                        )}

                                        {/* Divider */}
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--mono-4)]/20 to-transparent my-auto" />

                                        {/* Contact Links */}
                                        <div className="flex flex-col gap-3 mt-auto">
                                            {ref.Email && (
                                                <a
                                                    // href={`mailto:${ref.Email}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--mono-4)]/10 text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors group/link"
                                                >
                                                    <div className="p-2 rounded-full bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover/link:scale-110 transition-transform">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-medium">{ref.Email}</span>
                                                </a>
                                            )}
                                            {ref.Phone && (
                                                <a
                                                    // href={`tel:${ref.Phone}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--mono-4)]/10 text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors group/link"
                                                >
                                                    <div className="p-2 rounded-full bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover/link:scale-110 transition-transform">
                                                        <Phone className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-medium">{ref.Phone}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </LazySection>
                        ))}
                    </div>
                </div>
            </GlowCapture>
        </section>
    )
}