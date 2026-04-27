import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import clientPromise from "@/lib/mongodb"

const SECTION_COLLECTIONS = {
    hero: "Hero",
    about: "About",
    projects: "Projects",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    references: "References",
    blog: "Blog",
    contact: "Contact"
} as const

type SectionKey = keyof typeof SECTION_COLLECTIONS

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function sanitizePayload(payload: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(payload).filter(([key]) => {
            return !["_id", "ID", "URL", "CreatedAt", "UpdatedAt"].includes(key)
        })
    )
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ section: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json(
                { Status: 401, Message: "Unauthorized" },
                { status: 401 }
            )
        }

        const portfolioURL = session.user.portfolioURL
        if (!portfolioURL) {
            return NextResponse.json(
                { Status: 403, Message: "No portfolio assigned to this account" },
                { status: 403 }
            )
        }

        const { section } = await params
        const sectionKey = section.toLowerCase() as SectionKey
        const collectionName = SECTION_COLLECTIONS[sectionKey]

        if (!collectionName) {
            return NextResponse.json(
                { Status: 404, Message: "Section not found" },
                { status: 404 }
            )
        }

        const body = await request.json()
        if (!isPlainObject(body)) {
            return NextResponse.json(
                { Status: 400, Message: "Invalid request body" },
                { status: 400 }
            )
        }

        const updateData = sanitizePayload(body)

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB ?? "User")

        await db.collection(collectionName).updateOne(
            { URL: portfolioURL },
            {
                $set: {
                    ...updateData,
                    URL: portfolioURL,
                    UpdatedAt: new Date()
                },
                $setOnInsert: {
                    CreatedAt: new Date()
                }
            },
            { upsert: true }
        )

        return NextResponse.json({
            Status: 200,
            Message: `${collectionName} updated successfully`
        })
    } catch (error) {
        console.error("Dashboard update error:", error)

        return NextResponse.json(
            {
                Status: 500,
                Message: error instanceof Error ? error.message : "Failed to update section"
            },
            { status: 500 }
        )
    }
}
