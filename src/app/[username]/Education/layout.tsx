import type { Metadata } from "next"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s Education | GildedIn`,
        description: `Education background of ${decodedUsername}.`,
    }
}

export default function EducationLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
