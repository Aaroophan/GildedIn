import type { Metadata } from "next"
import { Geist, Geist_Mono, Oswald } from "next/font/google"
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

export const metadata: Metadata = {
	title: "GildedIn",
	description: "GildedIn is a no-code portfolio platform that instantly gives users their own personalized space on the web through automatically generated dynamic routes. Upon signing up, GildedIn creates a unique URL like ...com/Username with nested sections such as Projects or About, functioning as mini websites that showcase a user’s profile, work, and visual preferences. Users can log in at any time to update their content, add projects, upload media, or tweak design settings through an intuitive dashboard, with all changes appearing in real time no coding or deployment required. Designed for users who don’t have the time to build a portfolio from scratch or need a substitute portfolio instantly, GildedIn combines responsive design, real-time editing, and optional animations or 3D visuals to make creating and maintaining a professional, visually rich portfolio effortless.",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const mobileFontStyle = `@media (max-width: 640px) { .mobile-font-override { font-family: 'Comic Sans MS', 'Comic Sans' !important; } }`;
	return (
		<html lang="en">
			<head>
				<link rel="icon" type="image/jpeg" href="/images/Profile_1-min.JPG" />
				<style>{mobileFontStyle}</style>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} antialiased`}
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
