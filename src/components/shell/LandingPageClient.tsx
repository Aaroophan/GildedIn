"use client"

import { useEffect, useRef, useState } from "react"
import { GlowCapture } from "@codaworks/react-glow"
import Hero from "@/components/sections/Hero"
import { About } from "@/components/sections/About"
import { Blog } from "@/components/sections/Blog"
import { Projects } from "@/components/sections/Projects"
import { Experiences } from "@/components/sections/Experiences"
import { Educations } from "@/components/sections/Educations"
import { Contacts } from "@/components/sections/Contact"
import { References } from "@/components/sections/References"

interface LandingPageClientProps {
    heroData?: any
    aboutData?: any

    projectsData?: any
    BlogData?: any
    experiencesData?: any
    educationsData?: any
    referencesData?: any
    contactData?: any
}

export default function LandingPageClient({
    heroData,
    aboutData,

    projectsData,
    BlogData,
    experiencesData,
    educationsData,
    referencesData,
    contactData
}: LandingPageClientProps) {
    // Refs for sections
    const heroRef = useRef<HTMLDivElement>(null)
    const aboutRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // State for controlling Hero visibility
    const [showHero, setShowHero] = useState(true)
    const [heroOpacity, setHeroOpacity] = useState(1)
    const [aboutPosition, setAboutPosition] = useState(0)

    // Scroll listener for fade effect
    useEffect(() => {
        const handleScroll = () => {
            if (!aboutRef.current || !heroRef.current) return

            const aboutRect = aboutRef.current.getBoundingClientRect()
            const scrollY = window.scrollY
            const windowHeight = window.innerHeight

            // Calculate how much of About section has covered the viewport
            const aboutTopInViewport = aboutRect.top
            const heroCoverage = Math.min(Math.max(0, (windowHeight - aboutTopInViewport) / windowHeight), 1)

            // Update Hero opacity based on coverage
            const newOpacity = Math.max(0, 1 - heroCoverage * 1.5) // 1.5 for faster fade
            setHeroOpacity(newOpacity)

            // Update About section position
            const newPosition = Math.min(Math.max(0, scrollY - windowHeight * 0.5), windowHeight)
            setAboutPosition(newPosition)

            // Hide Hero when it's mostly covered
            if (heroCoverage > 0.95) {
                setShowHero(false)
            } else {
                setShowHero(true)
            }
        }

        // Initial call
        handleScroll()

        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [])

    // Add space after Hero for About to slide into
    const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 1000

    return (
        <GlowCapture>
            <div ref={containerRef} className="relative">
                {/* <RainEffect /> */}
                <div
                    ref={heroRef}
                    className="fixed inset-0 z-20 transition-opacity duration-500 ease-out"
                    style={{
                        opacity: heroOpacity,
                        pointerEvents: showHero ? 'auto' : 'none',
                        height: `${heroHeight}px`
                    }}
                >
                    {showHero && <Hero initialData={heroData} />}
                </div>

                <div style={{ height: `${heroHeight}px` }} />

                <div
                    ref={aboutRef}
                    className="relative z-30 transition-transform duration-700 ease-out"
                >
                    <About initialData={aboutData} />
                </div>

                <div className="relative z-10 bg-[var(--background)]">
                    <Experiences initialData={experiencesData} />
                </div>

                <div className="relative z-10 bg-[var(--background)]">
                    <Projects initialData={projectsData} />
                </div>

                <div className="relative z-10 bg-[var(--background)]">
                    <Blog initialData={BlogData} />
                </div>

                <div className="relative z-10 bg-[var(--background)]">
                    <Educations initialData={educationsData} />
                </div>

                <div className="relative z-10 bg-[var(--background)]">
                    <References initialData={referencesData} />
                </div>

                <div className="relative z-10 bg-[var(--background)]">
                    <Contacts initialData={contactData} />
                </div>
            </div>
        </GlowCapture>
    )
}
