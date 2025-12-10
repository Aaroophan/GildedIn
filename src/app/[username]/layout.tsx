import type { Metadata } from "next"
import { redirect } from "next/navigation"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s Portfolio | GildedIn`,
        description: `Welcome to ${decodedUsername}'s personalized portfolio on GildedIn. Check out their projects, skills, and experiences.`,
    }
}

const ALLOWED_USERS = ["Aaroophan", "Shathana", "Laxsanan", "Shadhujan"]
const DEFAULT_USER = "Aaroophan"

export default async function UserLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ username: string }>
}) {
    const { username } = await params
    if (!ALLOWED_USERS.includes(username)) {
        redirect(`/${DEFAULT_USER}`)
    }

    return (
        <>
            {children}
        </>
    )
}
