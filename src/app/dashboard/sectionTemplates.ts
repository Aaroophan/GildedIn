export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
export type JsonObject = { [key: string]: JsonValue }
export type SectionData = Record<string, JsonValue>

export type DashboardSectionId =
    | "hero"
    | "about"
    | "projects"
    | "experience"
    | "education"
    | "skills"
    | "references"
    | "blog"
    | "contact"

export type SectionTemplateContext = {
    userName?: string | null
    userEmail?: string | null
}

export const dashboardSections = [
    { id: "hero", title: "Hero", collection: "Hero", missingMessage: "No Hero document found for this URL." },
    { id: "about", title: "About", collection: "About", missingMessage: "No About document found for this URL." },
    { id: "projects", title: "Projects", collection: "Projects", missingMessage: "No Projects document found for this URL." },
    { id: "experience", title: "Experience", collection: "Experience", missingMessage: "No Experience document found for this URL." },
    { id: "education", title: "Education", collection: "Education", missingMessage: "No Education document found for this URL." },
    { id: "skills", title: "Skills", collection: "Skills", missingMessage: "No Skills document found for this URL." },
    { id: "references", title: "References", collection: "References", missingMessage: "No References document found for this URL." },
    { id: "blog", title: "Blog", collection: "Blog", missingMessage: "No Blog document found for this URL." },
    { id: "contact", title: "Contact", collection: "Contact", missingMessage: "No Contact document found for this URL." }
] as const satisfies ReadonlyArray<{
    id: DashboardSectionId
    title: string
    collection: string
    missingMessage: string
}>

export const reservedPortfolioSegments = new Set([
    "api",
    "dashboard",
    "login",
    "manifest",
    "robots",
    "robots.txt",
    "sitemap",
    "sitemap.xml"
])

export function normalizePortfolioURLInput(value: string) {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/_+/g, "_")
        .replace(/^[-_]+|[-_]+$/g, "")
}

export function createSuggestedPortfolioURL(userName?: string | null, userEmail?: string | null) {
    const nameSuggestion = normalizePortfolioURLInput(userName ?? "")
    if (nameSuggestion) {
        return nameSuggestion
    }

    const emailSuggestion = normalizePortfolioURLInput((userEmail ?? "").split("@")[0] ?? "")
    return emailSuggestion || "my-portfolio"
}

export function createSectionTemplate(
    sectionId: DashboardSectionId,
    context: SectionTemplateContext = {}
): SectionData {
    const userName = context.userName ?? ""
    const userEmail = context.userEmail ?? ""

    switch (sectionId) {
        case "hero":
            return {
                Title: "Hello, I'm",
                Greeting: "Hello",
                Name: userName,
                Tagline: "",
                Tags: ["Add your first headline"],
                Links: [],
                Backgrounds: [],
                Images: []
            }

        case "about":
            return {
                Title: "Who Am I?",
                Tagline: "",
                About: {
                    Description: "",
                    Image: ""
                },
                Values: [],
                Interests: [],
                FunFacts: [],
                Day: []
            }

        case "projects":
            return {
                Title: "Projects",
                Description: "",
                Guidance: "",
                Highlights: [],
                Lanes: [],
                Projects: []
            }

        case "experience":
            return {
                Title: "Career Timeline",
                Experiences: []
            }

        case "education":
            return {
                Title: "Academic Qualifications",
                Educations: []
            }

        case "skills":
            return {
                Title: "Skills",
                Description: "",
                Guidance: "",
                Highlights: [],
                Skills: [
                    [
                        "Primary Stack",
                        "Describe your main lane here.",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                                "Example Skill",
                                "Describe how you use this skill."
                            ]
                        ]
                    ]
                ]
            }

        case "references":
            return {
                Title: "References",
                References: []
            }

        case "blog":
            return {
                RSS: ""
            }

        case "contact":
            return {
                Title: "Get In Touch",
                Contact: {
                    Email: userEmail ? `mailto:${userEmail}` : "",
                    Phone: "",
                    Location: "",
                    Message: ""
                }
            }
    }
}

export function createArrayItemTemplate(
    sectionId: DashboardSectionId,
    path: Array<string | number>
): JsonValue {
    if (sectionId === "hero") {
        if (path[0] === "Tags" || path[0] === "Backgrounds" || path[0] === "Images") {
            return ""
        }
        if (path[0] === "Links") {
            return { Name: "", Icon: "", Href: "" }
        }
    }

    if (sectionId === "about") {
        if (path[0] === "Values") {
            return { title: "", description: "", icon: "", color: "" }
        }
        if (path[0] === "Interests") {
            return { name: "", level: 0, icon: "", color: "" }
        }
        if (path[0] === "FunFacts") {
            return { icon: "", fact: "", color: "" }
        }
        if (path[0] === "Day") {
            return { time: "", activity: "", color: "" }
        }
    }

    if (sectionId === "projects") {
        if (path[0] === "Highlights") {
            return { Title: "", Description: "", Icon: "" }
        }
        if (path[0] === "Lanes" && path.length === 1) {
            return ["", "", []]
        }
        if (path[0] === "Lanes" && path[2] === 2) {
            return ""
        }
        if (path[0] === "Projects" && path.length === 1) {
            return {
                Image: "",
                Name: "",
                Links: [],
                Date: "",
                Description: "",
                Skills: ""
            }
        }
        if (path[0] === "Projects" && path[2] === "Links") {
            return { Name: "", Icon: "", Href: "" }
        }
    }

    if (sectionId === "experience") {
        if (path[0] === "Experiences" && path.length === 1) {
            return {
                Image: "",
                Title: "",
                Company: "",
                JobType: "",
                Location: "",
                LocationType: "",
                Date: "",
                Description: [""]
            }
        }
        if (path[0] === "Experiences" && path[2] === "Description") {
            return ""
        }
    }

    if (sectionId === "education") {
        if (path[0] === "Educations" && path.length === 1) {
            return {
                Image: "",
                Title: "",
                Name: "",
                Date: "",
                Description: [""]
            }
        }
        if (path[0] === "Educations" && path[2] === "Description") {
            return ""
        }
    }

    if (sectionId === "skills") {
        if (path[0] === "Highlights") {
            return { Title: "", Description: "", Icon: "Layers3" }
        }
        if (path[0] === "Skills" && path.length === 1) {
            return ["", "", []]
        }
        if (path[0] === "Skills" && path[2] === 2) {
            return ["", "", ""]
        }
    }

    if (sectionId === "references" && path[0] === "References") {
        return {
            Name: "",
            Education: "",
            Job: "",
            Company: "",
            Phone: "",
            Email: ""
        }
    }

    return ""
}
