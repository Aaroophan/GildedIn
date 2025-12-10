import type { Metadata } from "next"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s Technologies | GildedIn`,
        description: `Technologies and skills of ${decodedUsername}.`,
    }
}

export default function TechnologiesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
