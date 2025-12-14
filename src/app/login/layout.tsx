
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Classified Access | GildedIn",
    description: "Restricted Access. Project GildedIn Details.",
    openGraph: {
        title: "Classified Access | GildedIn",
        description: "Restricted Access. Project GildedIn Details.",
    }
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}
