import { NextRequest, NextResponse } from "next/server"
import { MongoClient, type Document } from "mongodb"
import { ServerHelper } from "@/lib/ServerHelpers"

export async function POST(request: NextRequest) {
    let client: MongoClient | undefined
    try {
        
        const body = await request.json().catch(() => null)
        const escapedName = ServerHelper.getInstance().ExtractURL(body)

        const result = await ServerHelper.getInstance().ConnectDB("References")

        if ('Status' in result) {
            return NextResponse.json(result, { status: result.Status })
        }

        const { client: dbClient, collection } = result
        client = dbClient

        const Data = await collection.findOne({
            $or: [
                { URL: escapedName },
            ],
        })

        if (!Data) {
            return NextResponse.json(
                { Status: 404, Message: `Data not found for name '${escapedName}'.` },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                ...Data
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("API error:", error)
        return NextResponse.json(
            {
                Status: 500,
                Message: error instanceof Error ? error.message : "Failed to process request"
            },
            { status: 500 }
        )
    } finally {
        if (client) {
            await ServerHelper.getInstance().DisconnectDB(client)
        }
    }
}