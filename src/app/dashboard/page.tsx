import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import clientPromise from "@/lib/mongodb"
import DashboardEditor from "./DashboardEditor"

export const dynamic = "force-dynamic"
export const revalidate = 0

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type AnyRecord = Record<string, unknown>
type SectionData = Record<string, JsonValue>

function normalizeDoc(doc: AnyRecord): SectionData {
    const out: SectionData = {}

    for (const [key, value] of Object.entries(doc)) {
        if (key === "_id" || key === "ID" || key === "URL" || key === "CreatedAt" || key === "UpdatedAt") {
            continue
        }

        if (value instanceof Date) {
            out[key] = value.toISOString()
            continue
        }

        // Best-effort serialization for Mongo types and Dates stored as objects.
        if (typeof value === "object" && value !== null) {
            const maybeToJSON = (value as { toJSON?: unknown }).toJSON
            if (typeof maybeToJSON === "function") {
                try {
                    out[key] = (maybeToJSON as () => unknown).call(value) as JsonValue
                    continue
                } catch {
                    // fall through
                }
            }
        }

        out[key] = value as JsonValue
    }

    return out
}

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if (!session.user.portfolioURL) {
        return (
            <main className="min-h-screen p-10">
                <h1 className="text-3xl font-bold">Portfolio not connected</h1>
                <p>Your Google account is logged in, but no portfolio is assigned yet.</p>
            </main>
        )
    }

    const portfolioURL = session.user.portfolioURL
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB ?? "User")

    const sections = [
        { id: "hero", title: "Hero", collection: "Hero", missingMessage: "No Hero document found for this URL." },
        { id: "about", title: "About", collection: "About", missingMessage: "No About document found for this URL." },
        { id: "projects", title: "Projects", collection: "Projects", missingMessage: "No Projects document found for this URL." },
        { id: "experience", title: "Experience", collection: "Experience", missingMessage: "No Experience document found for this URL." },
        { id: "education", title: "Education", collection: "Education", missingMessage: "No Education document found for this URL." },
        { id: "skills", title: "Skills", collection: "Skills", missingMessage: "No Skills document found for this URL." },
        { id: "references", title: "References", collection: "References", missingMessage: "No References document found for this URL." },
        { id: "blog", title: "Blog", collection: "Blog", missingMessage: "No Blog document found for this URL." },
        { id: "contact", title: "Contact", collection: "Contact", missingMessage: "No Contact document found for this URL." }
    ] as const

    const sectionData = await Promise.all(
        sections.map(async (section) => {
            const doc = await db.collection(section.collection).findOne({ URL: portfolioURL })
            return {
                id: section.id,
                title: section.title,
                missingMessage: section.missingMessage,
                data: doc ? normalizeDoc(doc as unknown as AnyRecord) : null
            }
        })
    )

    return (
        <DashboardEditor
            portfolioURL={portfolioURL}
            userName={session.user.name}
            userEmail={session.user.email}
            sections={sectionData}
        />
    )
}