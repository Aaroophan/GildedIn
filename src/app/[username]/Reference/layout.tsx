import type { Metadata } from "next"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s References | GildedIn`,
        description: `References for ${decodedUsername}.`,
    }
}

export default function ReferenceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
