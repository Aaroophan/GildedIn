import type { Metadata } from "next"
import { Geist, Geist_Mono, Oswald, Roboto } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/ReduxProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import Header from "@/components/shell/Header"
import Footer from "@/components/shell/Footer"
import AnimatedFavicon from "@/components/shell/AnimatedFavicon"

import GoogleAnalytics from "@/components/providers/GoogleAnalytics"

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
	keywords: ["Portfolio", "No-code", "Resume", "CV", "Developer", "Designer", "Professional", "Showcase"],
	authors: [{ name: "Aaroophan Varatharajan", url: "https://aaroophan.dev" }],
	creator: "Aaroophan Varatharajan",
	publisher: "GildedIn",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.gildedin.com'),
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: 'GildedIn | Your Instant Portfolio',
		description: 'Create your professional portfolio instantly without coding. Dynamic routes, premium themes, and real-time updates.',
		url: 'https://www.gildedin.com',
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
		title: 'GildedIn',
		description: 'Instant no-code portfolios for professionals.',
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

export const viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#000000' },
	],
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
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

				<style>{mobileFontStyle}</style>
			</head>
			<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${roboto.variable} antialiased`}
			>
				<ReduxProvider>
					<ThemeProvider>
						<Header />
						{children}
						<Footer />
						<AnimatedFavicon />
					</ThemeProvider>
				</ReduxProvider>
			</body>
		</html>
	)
}
