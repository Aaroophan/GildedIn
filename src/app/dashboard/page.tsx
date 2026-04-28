import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import clientPromise from "@/lib/mongodb"
import DashboardEditor from "./DashboardEditor"
import {
    createSectionTemplate,
    createSuggestedPortfolioURL,
    dashboardSections,
    type JsonValue,
    type SectionData
} from "./sectionTemplates"

export const dynamic = "force-dynamic"
export const revalidate = 0

type AnyRecord = Record<string, unknown>

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
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB ?? "User")
    const users = db.collection("Users")
    const userRecord = session.user.email
        ? await users.findOne({ Email: session.user.email })
        : null
    const portfolioURL =
        session.user.portfolioURL ??
        (typeof userRecord?.PortfolioURL === "string" ? userRecord.PortfolioURL : null)
    const templateContext = {
        userName: (typeof userRecord?.Name === "string" ? userRecord.Name : session.user.name) ?? "",
        userEmail: (typeof userRecord?.Email === "string" ? userRecord.Email : session.user.email) ?? ""
    }

    const sectionData = await Promise.all(
        dashboardSections.map(async (section) => {
            const doc = portfolioURL
                ? await db.collection(section.collection).findOne({ URL: portfolioURL })
                : null

            return {
                id: section.id,
                title: section.title,
                missingMessage: section.missingMessage,
                data: doc
                    ? normalizeDoc(doc as unknown as AnyRecord)
                    : createSectionTemplate(section.id, templateContext)
            }
        })
    )

    return (
        <DashboardEditor
            portfolioURL={portfolioURL ?? createSuggestedPortfolioURL(templateContext.userName, templateContext.userEmail)}
            hasPortfolio={Boolean(portfolioURL)}
            userName={session.user.name}
            userEmail={session.user.email}
            sections={sectionData}
        />
    )
}
