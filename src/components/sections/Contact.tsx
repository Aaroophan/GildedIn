"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, User, MessageSquare, Loader2 } from "lucide-react"
import { ContactService } from "@/models/Services/Contact"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import { GlowCapture } from "@codaworks/react-glow"
import { Button } from "../ui/Button"

export const Contacts = () => {
    const [contact, setContact] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const GetData = async () => {
        setIsLoading(true)
        try {
            const contactService = ContactService.getInstance()
            const result = await contactService.Contact("Aaroophan")

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
                if (result.Contact) {
                    setContact(result.Contact)
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate network delay for better UX
        setTimeout(() => {
            const mailtoLink = `${contact.Email}?subject=${encodeURIComponent(formData.subject || "Portfolio Contact")}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)}`
            window.location.href = mailtoLink
            setIsSubmitting(false)
            setFormData({ name: "", email: "", subject: "", message: "" })
        }, 1000)
    }

    if (isLoading) return <Loading />
    if (error) return <ErrorMessage message={error} />
    if (!contact) return null

    const displayEmail = contact.Email ? contact.Email.replace("mailto:", "") : ""

    return (
        <section className="py-24 relative overflow-hidden" id="Contact">
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
                            Get in Touch
                        </h2>
                        <p className="font-comic text-lg text-gray-400 max-w-2xl mx-auto bg-gradient-to-br from-[var(--foreground)]/75 via-[var(--foreground)]/75 to-[var(--foreground)]/75 bg-clip-text text-transparent cursor-default">
                            {contact.Message}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 font-comic">Contact Information</h3>

                            <div className="flex flex-col gap-6">
                                <a
                                    href={contact.Email}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[var(--mono-4)]/10 to-[var(--mono-4)]/0 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 hover:bg-[var(--mono-4)]/10 transition-all duration-300 group"
                                >
                                    <div className="p-3 rounded-full bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--foreground)]/60 font-medium">Email Me</p>
                                        <p className="text-lg text-[var(--foreground)] font-semibold">{displayEmail}</p>
                                    </div>
                                </a>

                                <a
                                    href={contact.Phone}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[var(--mono-4)]/10 to-[var(--mono-4)]/0 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 hover:bg-[var(--mono-4)]/10 transition-all duration-300 group"
                                >
                                    <div className="p-3 rounded-full bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--foreground)]/60 font-medium">WhatsApp</p>
                                        <p className="text-lg text-[var(--foreground)] font-semibold">Start a Chat at { contact.Phone.split("wa.me/")[1] || contact.Phone}</p>
                                    </div>
                                </a>

                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[var(--mono-4)]/10 to-[var(--mono-4)]/0 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/30 hover:bg-[var(--mono-4)]/10 transition-all duration-300 group cursor-default">
                                    <div className="p-3 rounded-full bg-[var(--mono-4)]/10 text-[var(--mono-4)] group-hover:scale-110 transition-transform">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--foreground)]/60 font-medium">Location</p>
                                        <p className="text-lg text-[var(--foreground)] font-semibold">{contact.Location}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-gradient-to-br from-[var(--mono-4)]/10 to-[var(--mono-4)]/0 backdrop-blur-sm border border-[var(--mono-4)]/10 rounded-3xl p-8 shadow-xl"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-[var(--foreground)] ml-1">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mono-4)]" />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-[var(--background)] border border-[var(--mono-4)]/20 rounded-xl px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--mono-4)]/50 focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-[var(--foreground)] ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mono-4)]" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-[var(--background)] border border-[var(--mono-4)]/20 rounded-xl px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--mono-4)]/50 focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-medium text-[var(--foreground)] ml-1">Subject</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--mono-4)]" />
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-[var(--background)] border border-[var(--mono-4)]/20 rounded-xl px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--mono-4)]/50 focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all"
                                            placeholder="Project Inquiry"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-[var(--foreground)] ml-1">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full bg-[var(--background)] border border-[var(--mono-4)]/20 rounded-xl px-4 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/30 focus:outline-none focus:border-[var(--mono-4)]/50 focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all resize-none"
                                        placeholder="Hello, I'd like to talk about..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-[var(--mono-4)] to-[var(--mono-4)]/70 hover:from-[var(--mono-4)]/90 hover:to-[var(--mono-4)]/60 text-[var(--foreground)] dark:text-[var(--foreground)] font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Preparing Email...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </GlowCapture>
        </section>
    )
}
