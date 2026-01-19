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
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aaroophan.dev'),
	alternates: {
		canonical: '/',
	},
	openGraph: {
		title: 'GildedIn | Your Instant Portfolio',
		description: 'Create your professional portfolio instantly without coding. Dynamic routes, premium themes, and real-time updates.',
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
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
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
						})
					}}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${roboto.variable} antialiased`}
			>
				<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
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
