import type { Metadata } from "next"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s Experience | GildedIn`,
        description: `Professional experience of ${decodedUsername}.`,
    }
}

export default function ExperienceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
