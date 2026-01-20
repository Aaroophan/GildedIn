import { HeroService } from "@/models/Services/Hero"
import { Metadata, ResolvingMetadata } from "next"
import { AboutService } from "@/models/Services/About"

import { ProjectsService } from "@/models/Services/Projects"
import { ExperienceService } from "@/models/Services/Experience"
import { EducationService } from "@/models/Services/Education"
import { ContactService } from "@/models/Services/Contact"
import { ReferenceService } from "@/models/Services/References"
import LandingPageClient from "@/components/shell/LandingPageClient"
import { BlogService } from "@/models/Services/Blog"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { username } = await params
    const endpoint = `/${username || ""}`

    const [heroData, aboutData] = await Promise.all([
        HeroService.getInstance().Hero(endpoint),
        AboutService.getInstance().About(endpoint)
    ])

    const name = heroData?.Name || username || "Professional"
    const title = `${name} | Portfolio`
    const description = aboutData?.Tagline || `Check out ${name}'s professional portfolio on GildedIn. | Aaroophan`
    const images = heroData?.Image ? [heroData.Image] : []

    return {
        title: title,
        description: description,
        keywords: ["Portfolio", "No-code", "Resume", "CV", "Developer", "Designer", "Professional", "Showcase", "Aaroophan"],
        authors: [{ name: "Aaroophan Varatharajan", url: "https://aaroophan.dev" }],
        creator: "Aaroophan Varatharajan",
        publisher: "Aaroophan Varatharajan",
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aaroophan.dev'),
        alternates: {
            canonical: `/${username}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: 'https://aaroophan.dev',
            siteName: 'GildedIn',
            locale: 'en_US',
            type: 'website',
            images: images,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            creator: '@Aaroophan',
            images: images,
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        category: 'technology',
        icons: {
            icon: '/images/Aaroophan-Main.ico',
            shortcut: '/images/Aaroophan-Main.ico',
            apple: '/images/Aaroophan-Main.png',
        },
    }
}

export default async function Home({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const endpoint = `/${username || ""}`

    const [
        heroData,
        aboutData,
        experiencesData,
        projectsData,
        BlogData,
        educationsData,
        referencesData,
        contactData
    ] = await Promise.all([
        HeroService.getInstance().Hero(endpoint),
        AboutService.getInstance().About(endpoint),
        ExperienceService.getInstance().Experience(endpoint),
        ProjectsService.getInstance().Projects(endpoint),
        BlogService.getInstance().Blog(endpoint),
        EducationService.getInstance().Education(endpoint),
        ReferenceService.getInstance().Reference(endpoint),
        ContactService.getInstance().Contact(endpoint)
    ])

    return (
        <LandingPageClient
            heroData={heroData}
            aboutData={aboutData}
            experiencesData={experiencesData}
            projectsData={projectsData}
            BlogData={BlogData}
            educationsData={educationsData}
            referencesData={referencesData}
            contactData={contactData}
        />
    )
}