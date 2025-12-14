"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, User, MessageSquare, Loader2, ExternalLink } from "lucide-react"
import { ContactService } from "@/models/Services/Contact"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import { GlowCapture, Glow } from "@codaworks/react-glow"
import { useParams } from "next/navigation"
import GridBackground from "../ui/GridBackground"
import TechCorners from "../ui/TechCorners"
import WireframeGlobe from "../ui/WireframeGlobe"
import RainEffect from "../ui/RainEffect"
import ParticleNetwork from "../ui/ParticleNetwork"

export const Contacts = ({ initialData }: { initialData?: any }) => {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")
    const endpoint = `/${params?.username || ""}`
    const [contact, setContact] = useState<any>(initialData?.Contact || null)
    const [isLoading, setIsLoading] = useState(!initialData)
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
            const result = await contactService.Contact(endpoint)

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
        if (!initialData) {
            GetData()
        }
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
    // Prepare data for GridBackground based on form fields to make it look "live"
    const backgroundData = { ...formData, ...contact, Section: "CONTACT", Name: decodedUsername }

    return (
        <section className="relative min-h-screen py-20 px-4 overflow-hidden font-comic text-[var(--foreground)]" id="Contact">
            <GridBackground Data={backgroundData} Name={Contacts.name} Code={Contacts.toString()} />
            {/* <ParticleNetwork /> */}
            {/* <RainEffect /> */}
            <WireframeGlobe />
            <GlowCapture>
                <Glow color='var(--mono-4)'>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl sm:text-6xl font-bold mb-2 font-oswald text-[var(--foreground)] uppercase tracking-wide">
                                Get in Touch
                            </h2>
                            <div className="h-2 w-full max-w-lg mx-auto bg-gradient-to-r from-transparent via-[var(--mono-4)] to-transparent rounded-full overflow-hidden relative mb-6">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    whileInView={{ x: "200%" }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-0 left-0 w-1/3 h-full bg-[var(--mono-4)] opacity-50 blur-[2px]"
                                />
                            </div>
                            <p className="font-inkfree font-bold text-md md:text-lg text-[var(--foreground)] max-w-3xl mx-auto tracking-[0.1em] opacity-80 my-5">
                                {contact.Message}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="space-y-8"
                            >
                                <h3 className="text-2xl font-bold text-[var(--foreground)] font-comic  tracking-wide flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[var(--mono-4)] rounded-full animate-pulse" />
                                    Contact Information
                                </h3>

                                <div className="flex flex-col gap-6">
                                    <a
                                        href={contact.Email}
                                        className="relative flex items-center gap-4 p-6 rounded-xl bg-[var(--mono-4)]/5 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/40 hover:bg-[var(--mono-4)]/10 transition-all duration-300 group overflow-hidden backdrop-blur-xs"
                                    >
                                        <TechCorners Padding={2} Width={4} Height={4} />
                                        <div className="p-3 rounded-md bg-[var(--background)] border border-[var(--mono-4)]/20 text-[var(--mono-4)] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(var(--mono-4-rgb),0.1)]">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs text-[var(--mono-4)] font-mono uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-lg text-[var(--foreground)] font-bold font-comic tracking-wide group-hover:text-[var(--foreground)/80] transition-colors">{displayEmail}</p>
                                        </div>
                                        <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-[var(--mono-4)]/30 group-hover:text-[var(--mono-4)] transition-colors" />
                                    </a>

                                    <a
                                        href={contact.Phone}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative flex items-center gap-4 p-6 rounded-xl bg-[var(--mono-4)]/5 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/40 hover:bg-[var(--mono-4)]/10 transition-all duration-300 group overflow-hidden backdrop-blur-xs"
                                    >
                                        <TechCorners Padding={2} Width={4} Height={4} />
                                        <div className="p-3 rounded-md bg-[var(--background)] border border-[var(--mono-4)]/20 text-[var(--mono-4)] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(var(--mono-4-rgb),0.1)]">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs text-[var(--mono-4)] font-mono uppercase tracking-wider mb-1">WhatsApp</p>
                                            <p className="text-lg text-[var(--foreground)] font-bold font-comic tracking-wide group-hover:text-[var(--foreground)]/80 transition-colors">Start a Chat at {contact.Phone.split("wa.me/")[1] || contact.Phone}</p>
                                        </div>
                                        <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-[var(--mono-4)]/30 group-hover:text-[var(--mono-4)] transition-colors" />
                                    </a>

                                    <div className="relative flex items-center gap-4 p-6 rounded-xl bg-[var(--mono-4)]/5 border border-[var(--mono-4)]/10 hover:border-[var(--mono-4)]/40 hover:bg-[var(--mono-4)]/10 transition-all duration-300 group cursor-default overflow-hidden backdrop-blur-xs">
                                        <TechCorners Padding={2} Width={4} Height={4} />
                                        <div className="p-3 rounded-md bg-[var(--background)] border border-[var(--mono-4)]/20 text-[var(--mono-4)] group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(var(--mono-4-rgb),0.1)]">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs text-[var(--mono-4)] font-mono uppercase tracking-wider mb-1">Location</p>
                                            <p className="text-lg text-[var(--foreground)] font-bold font-comic tracking-wide">{contact.Location}</p>
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
                                className="relative bg-[var(--mono-4)]/5 backdrop-blur-md border border-[var(--mono-4)]/20 rounded-xl p-8 shadow-[0_0_40px_rgba(var(--mono-4-rgb),0.05)]"
                            >
                                <TechCorners Padding={6} Width={8} Height={8} />

                                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--mono-4)]/20" />
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--mono-4)]/20" />

                                <h3 className="text-xl font-bold text-[var(--foreground)] font-comic tracking-widest mb-8 text-center border-b border-[var(--mono-4)]/20 pb-4">
                                    Send a Message
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-md font-inkfree font-bold tracking-widest text-[var(--foreground)] ml-1 opacity-70">Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mono-4)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-[var(--background)]/50 border border-[var(--mono-4)]/20 rounded-md px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/20 font-comic focus:outline-none focus:border-[var(--mono-4)] focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all font-bold"
                                                placeholder="Your Name"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--mono-4)]/30 group-focus-within:bg-[var(--mono-4)] group-focus-within:shadow-[0_0_5px_var(--mono-4)] transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-md font-inkfree font-bold tracking-widest text-[var(--foreground)] ml-1 opacity-70">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mono-4)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-[var(--background)]/50 border border-[var(--mono-4)]/20 rounded-md px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/20 font-comic focus:outline-none focus:border-[var(--mono-4)] focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all font-bold"
                                                placeholder="your@email.com"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--mono-4)]/30 group-focus-within:bg-[var(--mono-4)] group-focus-within:shadow-[0_0_5px_var(--mono-4)] transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-md font-inkfree font-bold tracking-widest text-[var(--foreground)] ml-1 opacity-70">Subject</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mono-4)] group-focus-within:text-[var(--foreground)] transition-colors" />
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full bg-[var(--background)]/50 border border-[var(--mono-4)]/20 rounded-md px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/20 font-comic focus:outline-none focus:border-[var(--mono-4)] focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all font-bold"
                                                placeholder="What's this about?"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--mono-4)]/30 group-focus-within:bg-[var(--mono-4)] group-focus-within:shadow-[0_0_5px_var(--mono-4)] transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-md font-inkfree font-bold tracking-widest text-[var(--foreground)] ml-1 opacity-70">Message</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-4 w-4 h-4 text-[var(--mono-4)] group-focus-within:text-[var(--foreground)] transition-colors">
                                                <div className="w-1.5 h-1.5 bg-current animate-pulse" />
                                            </div>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                required
                                                rows={4}
                                                className="w-full bg-[var(--background)]/50 border border-[var(--mono-4)]/20 rounded-md px-12 py-3 text-[var(--foreground)] placeholder-[var(--foreground)]/20 font-comic focus:outline-none focus:border-[var(--mono-4)] focus:ring-1 focus:ring-[var(--mono-4)]/50 transition-all resize-none font-bold"
                                                placeholder="How can I help you?"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[var(--mono-4)] hover:bg-[var(--mono-4)]/90 text-white font-bold font-inkfree uppercase tracking-widest py-4 rounded-md shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--mono-4-rgb),0.5)] hover:scale-[1.01] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-white/20 skew-x-[-20deg] group-hover:left-[200%] transition-all duration-700 ease-in-out" />
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </Glow>
            </GlowCapture>
        </section>
    )
}
