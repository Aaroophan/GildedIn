import type { Metadata } from "next"
import { redirect } from "next/navigation"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s Portfolio`,
        description: `Explore ${decodedUsername}'s projects, skills, and professional journey on GildedIn.`,
        openGraph: {
            title: `${decodedUsername} - Portfolio`,
            description: `Check out ${decodedUsername}'s portfolio on GildedIn.`,
            type: 'profile',
            images: [
                {
                    url: `/images/Profile_1-min.JPG`, // Ideally dynamic based on user
                    width: 1200,
                    height: 630,
                    alt: `${decodedUsername}'s Profile Picture`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${decodedUsername} - Portfolio`,
            description: `Check out ${decodedUsername}'s latest work.`,
            images: [`/images/Profile_1-min.JPG`], // Ideally dynamic
        },
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

    const mobileFontStyle = `@media (max-width: 640px) { .font-comic, .font-inkfree { font-family: var(--font-roboto), sans-serif !important; } }`;

    // JSON-LD for Search Engines
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: await Promise.resolve(params).then(p => decodeURIComponent(p.username)),
        url: `https://aaroophan.vercel.app/${(await params).username}`,
        image: 'https://aaroophan.vercel.app/images/Profile_1-min.JPG', // Placeholder for now
        sameAs: [
            // Example links - ideally fetched from user data
            "https://www.linkedin.com/in/Aaroophan",
            "https://github.com/Aaroophan"
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <style>{mobileFontStyle}</style>
            {children}
        </>
    )
}
