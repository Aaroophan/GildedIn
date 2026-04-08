import { NextResponse } from "next/server"
import { MongoClient, type Document } from "mongodb"

export class ServerHelper {
    private static instance: ServerHelper

    private constructor() {
    }

    public static getInstance(): ServerHelper {
        if (!ServerHelper.instance) {
            ServerHelper.instance = new ServerHelper()
        }
        return ServerHelper.instance
    }

    public ExtractURL(body: any): any {
        try {
            
            const name = body?.Name ?? body?.name
    
            if (!name || typeof name !== "string") {
                return NextResponse.json(
                    { Status: 400, Message: "Missing required 'Name' field in request body." },
                    { status: 400 }
                )
            }
            
            const trimmedName = name.trim()
            const escapedName = trimmedName.replace('/', '')

            return escapedName
        } catch (e) {
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }

    public async ConnectDB(Collection: string): Promise<{ client: MongoClient, collection: any } | { Status: number, Message: string }> {
        try {
            
            const uri = process.env.MONGODB_URI
            if (!uri) {
                return { Status: 500, Message: "MONGODB_URI is not configured." }
            }
    
            const dbName = process.env.MONGODB_DB ?? "User"
            const client = new MongoClient(uri)

            await client.connect()

            const db = client.db(dbName)
            const collection = db.collection<Document>(Collection)
            
            return { client, collection }
            
        } catch (e) {
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }

    public async DisconnectDB(client: MongoClient): Promise<void> {
        try {
            await client.close()
        } catch (e) {
            console.error("Error disconnecting from database:", e)
        }
    }
}