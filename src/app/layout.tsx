import type { Metadata } from "next"
import { Geist, Geist_Mono, Oswald, Roboto } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/ReduxProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import Header from "@/components/shell/Header"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

const oswald = Oswald({
	variable: "--font-oswald",
	subsets: ["latin"],
})

const roboto = Roboto({
	weight: ["200", "300", "400", "500", "600", "700"],
	variable: "--font-roboto",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: {
		default: "GildedIn | Your Instant Portfolio",
		template: "%s | GildedIn",
	},
	description: "GildedIn is a no-code portfolio platform that instantly gives users their own personalized space on the web through automatically generated dynamic routes.",
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.gildedin.com'),
	openGraph: {
		title: 'GildedIn | Your Instant Portfolio',
		description: 'Create your professional portfolio instantly without coding. Dynamic routes, premium themes, and real-time updates.',
		url: 'https://www.gildedin.com',
		siteName: 'GildedIn',
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'GildedIn',
		description: 'Instant no-code portfolios for professionals.',
		creator: '@Aaroophan',
	},
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: '/images/Profile_1-min.JPG',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const mobileFontStyle = `@media (max-width: 640px) { .font-comic, .font-inkfree { font-family: var(--font-roboto), sans-serif !important; } }`;
	return (
		<html lang="en">
			<head>
				<link rel="icon" type="image/jpeg" href="/images/Profile_1-min.JPG" />
				<style>{mobileFontStyle}</style>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${roboto.variable} antialiased`}
			>
				<ReduxProvider>
					<ThemeProvider>
						<Header />
						{children}
					</ThemeProvider>
				</ReduxProvider>
			</body>
		</html>
	)
}
