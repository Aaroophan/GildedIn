import type { Metadata } from "next"

export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params
    const decodedUsername = decodeURIComponent(username)

    return {
        title: `${decodedUsername}'s Projects | GildedIn | Aaroophan`,
        description: `Explore the projects created by ${decodedUsername}.`,
        keywords: ["Portfolio", "No-code", "Resume", "CV", "Developer", "Designer", "Professional", "Showcase", "Aaroophan"],
        authors: [{ name: "Aaroophan Varatharajan", url: "https://aaroophan.dev" }],
        creator: "Aaroophan Varatharajan",
        publisher: "GildedIn",
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aaroophan.dev'),
        alternates: {
            canonical: '/',
        },
        openGraph: {
            title: `${decodedUsername}'s Projects | GildedIn | Aaroophan`,
            description: `Explore the projects created by ${decodedUsername}.`,
            url: 'https://aaroophan.dev',
            siteName: 'GildedIn',
            locale: 'en_US',
            type: 'website',
            images: [
                {
                    url: '/images/Aaroophan-Main.png',
                    width: 1200,
                    height: 630,
                    alt: 'GildedIn Preview',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${decodedUsername}'s Projects | GildedIn | Aaroophan`,
            description: `Explore the projects created by ${decodedUsername}.`,
            creator: '@Aaroophan',
            images: ['/images/Aaroophan-Main.png'],
        },
        verification: {
            google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        category: 'technology',
        icons: {
            icon: '/images/Aaroophan-Main.ico',
            shortcut: '/images/Aaroophan-Main.ico',
            apple: '/images/Aaroophan-Main.png',
        },
    }
}

export default async function ProjectsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ username: string }>
}) {
    // JSON-LD for Search Engines
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Aaroophan Varatharajan",
        "alternateName": "Aaroophan",
        "url": "https://aaroophan.dev",
        "jobTitle": [
            "Full Stack Software Engineer",
            "Full Stack Developer",
            "Software Engineer",
            "React Developer",
            "Next Developer"
        ],
        "alumniOf": [
            "University of Moratuwa",
            "University of Bedfordshire",
            "SLIIT City Uni"
        ],
        "sameAs": [
            "https://linkedin.com/in/aaroophan",
            "https://github.com/Aaroophan",
            "https://aaroophan.medium.com",
            "https://www.aaroophan.dev",
            "https://instagram.com/aaroophan",
            "https://twitter.com/aaroophan",
            "https://www.youtube.com/@aaroophan",
            "https://harkbase.onrender.com",
            "https://github.com/Aaroophan/HarkBase",
            "https://OneWorkLoc.vercel.app",
            "https://github.com/Aaroophan/OneWorkLoc",
            "https://skrineplae.vercel.app",
            "https://github.com/Aaroophan/SkrinePlae",
            "https://aaroophan.dev",
            "https://github.com/Aaroophan/GildedIn",
            "https://aaroophan.github.io/Tic-Tac-Bot/",
            "https://github.com/Aaroophan/Tic-Tac-Bot",
            "https://aaroophan.github.io/Grid-ify/",
            "https://github.com/Aaroophan/Grid-ify",
            "https://aaroophan.github.io/SVG-ify/",
            "https://github.com/Aaroophan/SVG-ify",
            "https://aaroophan.github.io/PixelPainter/",
            "https://github.com/Aaroophan/PixelPainter",
            "https://mend-tale-game.onrender.com/",
            "https://github.com/Aaroophan/Mend-Tale-Game",
            "https://mend-tale-game.onrender.com/",
            "https://cis-domeytoe-game.onrender.com/",
            "https://github.com/Aaroophan/CIS-Domeytoe-Game",
            "https://www.youtube.com/watch?v=Q0trwCC5dgE",
            "https://loc-dev-assessment.onrender.com/",
            "https://github.com/Aaroophan/loc-dev-assessment",
            "https://3d2y-genin-com.stackstaging.com/",
            "https://github.com/NeroBrutal/EveryMoveApp",
            "https://baratiebakery-asv.stackstaging.com/",
            "https://github.com/Aaroophan/BaratieBakery",
            "https://www.youtube.com/watch?v=Q0trwCC5dgE",
            "https://github.com/Aaroophan/PaperClips"
        ]
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    )
}
