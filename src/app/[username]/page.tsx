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
    const title = heroData?.Greeting ? `${heroData.Greeting} ${name}` : `${name} - Portfolio`
    const description = aboutData?.About?.Description?.substring(0, 160) || `Check out ${name}'s professional portfolio on GildedIn.`
    const images = heroData?.Image ? [heroData.Image] : []

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: images,
            type: 'profile',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: images,
        },
        alternates: {
            canonical: `/${username}`,
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