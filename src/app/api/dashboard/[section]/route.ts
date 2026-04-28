import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import clientPromise from "@/lib/mongodb"
import {
    createSectionTemplate,
    dashboardSections,
    normalizePortfolioURLInput,
    reservedPortfolioSegments,
    type DashboardSectionId
} from "@/app/dashboard/sectionTemplates"

const SECTION_COLLECTIONS = Object.fromEntries(
    dashboardSections.map((section) => [section.id, section.collection])
) as Record<DashboardSectionId, string>

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function sanitizePayload(payload: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(payload).filter(([key]) => {
            return !["_id", "ID", "URL", "CreatedAt", "UpdatedAt", "portfolioURL", "data"].includes(key)
        })
    )
}

function resolveRequestBody(body: unknown) {
    if (!isPlainObject(body)) {
        return { data: null, portfolioURL: undefined }
    }

    const nestedData = isPlainObject(body.data) ? body.data : null
    const portfolioURL = typeof body.portfolioURL === "string" ? body.portfolioURL : undefined

    return {
        data: nestedData ?? body,
        portfolioURL
    }
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

        const { section } = await params
        const sectionKey = section.toLowerCase() as DashboardSectionId
        const collectionName = SECTION_COLLECTIONS[sectionKey]

        if (!collectionName) {
            return NextResponse.json(
                { Status: 404, Message: "Section not found" },
                { status: 404 }
            )
        }

        const rawBody = await request.json()
        const { data, portfolioURL: requestedPortfolioURLRaw } = resolveRequestBody(rawBody)

        if (!data || !isPlainObject(data)) {
            return NextResponse.json(
                { Status: 400, Message: "Invalid request body" },
                { status: 400 }
            )
        }

        const updateData = sanitizePayload(data)

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB ?? "User")
        const users = db.collection("Users")
        const currentUser = await users.findOne({
            Email: session.user.email
        })

        if (!currentUser) {
            return NextResponse.json(
                { Status: 404, Message: "User profile not found" },
                { status: 404 }
            )
        }

        const requestedPortfolioURL = requestedPortfolioURLRaw
            ? normalizePortfolioURLInput(requestedPortfolioURLRaw)
            : ""

        let portfolioURL =
            (typeof currentUser.PortfolioURL === "string" && currentUser.PortfolioURL) ||
            session.user.portfolioURL ||
            ""

        const now = new Date()
        let createdPortfolio = false

        if (!portfolioURL) {
            if (!requestedPortfolioURL) {
                return NextResponse.json(
                    { Status: 400, Message: "Choose a portfolio URL before saving." },
                    { status: 400 }
                )
            }

            if (reservedPortfolioSegments.has(requestedPortfolioURL.toLowerCase())) {
                return NextResponse.json(
                    { Status: 400, Message: "That portfolio URL is reserved. Please choose another one." },
                    { status: 400 }
                )
            }

            const existingUser = await users.findOne({
                PortfolioURL: requestedPortfolioURL,
                Email: { $ne: session.user.email }
            })

            if (existingUser) {
                return NextResponse.json(
                    { Status: 409, Message: "That portfolio URL is already taken." },
                    { status: 409 }
                )
            }

            for (const sectionConfig of dashboardSections) {
                const existingDoc = await db.collection(sectionConfig.collection).findOne({
                    URL: requestedPortfolioURL
                })

                if (existingDoc) {
                    return NextResponse.json(
                        { Status: 409, Message: "That portfolio URL is already in use." },
                        { status: 409 }
                    )
                }
            }

            portfolioURL = requestedPortfolioURL
            createdPortfolio = true

            await users.updateOne(
                { Email: session.user.email },
                {
                    $set: {
                        PortfolioURL: portfolioURL,
                        UpdatedAt: now
                    }
                }
            )

            for (const sectionConfig of dashboardSections) {
                await db.collection(sectionConfig.collection).updateOne(
                    { URL: portfolioURL },
                    {
                        $setOnInsert: {
                            ...createSectionTemplate(sectionConfig.id, {
                                userName: typeof currentUser.Name === "string" ? currentUser.Name : session.user.name,
                                userEmail: typeof currentUser.Email === "string" ? currentUser.Email : session.user.email
                            }),
                            URL: portfolioURL,
                            CreatedAt: now
                        },
                        $set: {
                            UpdatedAt: now
                        }
                    },
                    { upsert: true }
                )
            }
        }

        if (requestedPortfolioURL && portfolioURL && requestedPortfolioURL !== portfolioURL) {
            return NextResponse.json(
                { Status: 400, Message: "Portfolio URL changes are not supported from this form right now." },
                { status: 400 }
            )
        }

        await db.collection(collectionName).updateOne(
            { URL: portfolioURL },
            {
                $set: {
                    ...updateData,
                    URL: portfolioURL,
                    UpdatedAt: now
                },
                $setOnInsert: {
                    CreatedAt: now
                }
            },
            { upsert: true }
        )

        return NextResponse.json({
            Status: 200,
            Message: createdPortfolio
                ? `Portfolio created and ${collectionName} updated successfully`
                : `${collectionName} updated successfully`,
            PortfolioURL: portfolioURL
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
