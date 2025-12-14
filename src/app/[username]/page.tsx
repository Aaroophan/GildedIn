import { HeroService } from "@/models/Services/Hero"
import { AboutService } from "@/models/Services/About"
import { TechnologiesService } from "@/models/Services/Technologies"
import { ProjectsService } from "@/models/Services/Projects"
import { ExperienceService } from "@/models/Services/Experience"
import { EducationService } from "@/models/Services/Education"
import { ContactService } from "@/models/Services/Contact"
import { ReferenceService } from "@/models/Services/References"
import LandingPageClient from "@/components/shell/LandingPageClient"

export default async function Home({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const endpoint = `/${username || ""}`

    // Fetch all data in parallel
    const [
        heroData,
        aboutData,
        technologiesData,
        projectsData,
        experiencesData,
        educationsData,
        referencesData,
        contactData
    ] = await Promise.all([
        HeroService.getInstance().Hero(endpoint),
        AboutService.getInstance().About(endpoint),
        TechnologiesService.getInstance().Technologies(endpoint),
        ProjectsService.getInstance().Projects(endpoint),
        ExperienceService.getInstance().Experience(endpoint),
        EducationService.getInstance().Education(endpoint),
        ReferenceService.getInstance().Reference(endpoint),
        ContactService.getInstance().Contact(endpoint)
    ])

    return (
        <LandingPageClient
            heroData={heroData}
            aboutData={aboutData}
            technologiesData={technologiesData}
            projectsData={projectsData}
            experiencesData={experiencesData}
            educationsData={educationsData}
            referencesData={referencesData}
            contactData={contactData}
        />
    )
}