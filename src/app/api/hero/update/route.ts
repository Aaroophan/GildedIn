import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/../auth"
import clientPromise from "@/lib/mongodb"

export async function PATCH(request: NextRequest) {
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

        const body = await request.json()

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_DB ?? "User")
        const hero = db.collection("Hero")

        const allowedUpdate = {
            Title: body.Title,
            Greeting: body.Greeting,
            Name: body.Name,
            Tagline: body.Tagline,
            Tags: body.Tags,
            Links: body.Links,
            Backgrounds: body.Backgrounds,
            Images: body.Images,
            UpdatedAt: new Date()
        }

        await hero.updateOne(
            { URL: portfolioURL },
            {
                $set: allowedUpdate
            }
        )

        return NextResponse.json({
            Status: 200,
            Message: "Hero updated successfully"
        })
    } catch (error) {
        console.error("Hero update error:", error)

        return NextResponse.json(
            {
                Status: 500,
                Message: error instanceof Error ? error.message : "Failed to update hero"
            },
            { status: 500 }
        )
    }
}