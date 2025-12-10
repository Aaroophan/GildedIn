"use client"

import Tilt from "react-parallax-tilt"
import { motion } from 'framer-motion'
import { HeroService } from "@/models/Services/Hero"
import { useEffect, useState } from "react"
import ErrorMessage from "../ui/ErrorMessage"
import Loading from "../ui/Loading"
import Image from "next/image"
import * as LucideIcons from "lucide-react"
import React from 'react'
import FadingBackground from '../ui/FadingBackground'
import { Glow, GlowCapture } from "@codaworks/react-glow"
import { useParams } from "next/navigation"

function TimelyGreeting({ Data }: { Data: string }) {
	const [greetingData, setGreetingData] = useState({
		icon: LucideIcons.Coffee,
		text: "Hello",
		className: "",
	})

	useEffect(() => {
		const interval = setInterval(() => {
			const hour = new Date().getHours()

			if (hour >= 5 && hour < 8) {
				setGreetingData({
					icon: LucideIcons.Coffee,
					text: 'Up early? Let’s build something cool.',
					className: 'bg-gradient-to-br from-orange-400 to-yellow-300 dark:from-orange-300 dark:to-yellow-200 bg-clip-text text-transparent',
				})
			} else if (hour >= 8 && hour < 12) {
				setGreetingData({
					icon: LucideIcons.Compass,
					text: 'Good morning! Ready to explore?',
					className: 'bg-gradient-to-br from-orange-600 to-yellow-400 dark:from-orange-400 dark:to-yellow-200 bg-clip-text text-transparent',
				})
			} else if (hour >= 12 && hour < 15) {
				setGreetingData({
					icon: LucideIcons.Brain,
					text: 'Good afternoon! Let’s dive in.',
					className: 'bg-gradient-to-br from-yellow-400 to-yellow-700 dark:from-yellow-500 dark:to-yellow-100 bg-clip-text text-transparent',
				})
			} else if (hour >= 15 && hour < 18) {
				setGreetingData({
					icon: LucideIcons.Globe,
					text: 'Late afternoon already? Perfect time to browse.',
					className: 'bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-300 dark:to-orange-300 bg-clip-text text-transparent',
				})
			} else if (hour >= 18 && hour < 21) {
				setGreetingData({
					icon: LucideIcons.Sunset,
					text: 'Good evening! Glad to have you here.',
					className: 'bg-gradient-to-br from-yellow-600 to-fuchsia-600 dark:from-yellow-200 dark:to-fuchsia-400 bg-clip-text text-transparent',
				})
			} else if (hour >= 21 || hour < 2) {
				setGreetingData({
					icon: LucideIcons.MoonStar,
					text: 'Visiting me so late? Appreciate your curiosity.',
					className: 'bg-gradient-to-br from-blue-700 to-purple-700 dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent',
				})
			} else {
				setGreetingData({
					icon: LucideIcons.Sparkles,
					text: 'Burning the midnight oil? You’re awesome.',
					className: 'bg-gradient-to-br from-blue-700 to-purple-700 dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent',
				})
			}
		}, 2000)

		return () => clearInterval(interval)
	}, [])

	const { icon: IconComponent, text, className } = greetingData

	return (
		<>
			<div className="inline-flex items-center gap-2 bg-[var(--background)]/50 backdrop-blur-sm py-1 px-3 rounded-xl">
				<i className={className}>
					{text.split("").map((letter, idx) => (
						<motion.a
							key={idx}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.05, delay: idx * 0.05 }}
							className="rounded-md hover:text-[var(--mono-4)] transition-colors"
						>
							{letter}
						</motion.a>
					))}
				</i>

				<IconComponent className="rounded-md text-[var(--background)]/50 dark:text-[var(--foreground)]/50 hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors" />
			</div>

			<div className="mt-4 px-3 text-[var(--background)] dark:text-[var(--foreground)]">
				{Data.split("").map((letter: any, idx: any) => (
					<motion.a
						key={idx}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.1, delay: idx * 0.1 }}
						className="rounded-md hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors"
					>
						{letter}
					</motion.a>
				))}
			</div>
		</>
	)
}


export default function Hero() {
	const params = useParams<{ username?: string }>()
	const endpoint = `/${params?.username || ""}`
	const [Data, setData] = useState<any>()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [currentTagIndex, setCurrentTagIndex] = useState(0)
	const [isVisible, setIsVisible] = useState<Boolean>(false)

	useEffect(() => {
		if (!Data?.Tags) return

		const interval = setInterval(() => {
			setIsVisible(false)
			setTimeout(() => {
				setCurrentTagIndex(prev => (prev + 1) % Data?.Tags?.length)
				setIsVisible(true)
			}, 1000)
		}, 4000)

		return () => clearInterval(interval)
	}, [Data?.Tags?.length])

	const Socials = Data?.Links?.map((Social: any, index: number) => {
		const IconComponent = LucideIcons[Social.Icon as keyof typeof LucideIcons]

		if (!IconComponent) return null

		return (
			<motion.a
				key={index}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.25, delay: index * 0.1 }}
				whileHover={{
					scale: 2,
					rotate: 360,
					transition: { duration: 0.25, ease: "easeOut" }
				}}
				className="
					p-2 lg:p-5 rounded-full bg-[var(--foreground)]/10 dark:bg-[var(--foreground)]/10
					backdrop-blur-sm shadow-lg text-[var(--foreground)]/75 dark:text-[var(--foreground)]/75
					transition-all
				"
				href={Social.Href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={Social.Name}
			>
				{React.createElement(IconComponent as React.FC<any>, {
					className: "rounded-md hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors",
				})}
			</motion.a>
		)
	})

	const GetData = async () => {
		setIsLoading(true)

		try {
			const heroService = HeroService.getInstance()

			const result = await heroService.Hero(endpoint)

			if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
				setData(result)
				setError(null)
			} else {
				setError(result.Message)
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Unknown error occurred")
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		GetData()
	}, [])

	if (error) return <ErrorMessage message={error} />

	if (isLoading) return <Loading />

	return (<>
		<section
			id="Hero"
			className="relative min-h-screen flex items-center py-20 overflow-hidden"
		>
			<FadingBackground Value="Backgrounds" />
			<header className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-56">

					<div className="hidden lg:block w-64 h-64 sm:w-80 sm:h-80"></div>
					{/* 
					<div className="block lg:hidden w-64 h-64 sm:w-80 sm:h-80 rounded-xl overflow-hidden border-2 bg-gradient-to-br from-slate-400 via-slate-700 to-slate-200 dark:from-fuchsia-200 dark:via-slate-300 dark:to-blue-400 shadow-lg">
						<Image 
							src={Data.Backgrounds[0]}
							alt={Data.Name}
							title={Data.Name}
							width={256}
							height={256}
							loading="lazy"
							className="w-full h-full object-cover"
						/>
					</div> */}

					<div className="text-center">

						<div className="text-lg text-gray-600 dark:text-gray-400 mb-2 cursor-default lg:text-left font-inkfree font-bold">
							<TimelyGreeting Data={Data.Greeting} />
						</div>

						{/* className="pb-4 font-oswald font-bold text-7xl sm:text-6xl lg:text-9xl scale-110 mb-4 cursor-default text-transparent [-webkit-text-stroke-width:2px] [-webkit-text-stroke-color:var(--foreground)]" */}


						<Tilt
							tiltMaxAngleX={20}
							tiltMaxAngleY={20}
							glareEnable={false}
							perspective={1000}
							transitionSpeed={300}
							scale={1.05}
							className="inline-block p-2"
						>
							<h1 className="pb-4 font-oswald font-bold text-5xl sm:text-7xl lg:text-9xl scale-110 mb-4 lg:mb-8 bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent cursor-default ">
								{Data.Name.split(' ').map((SplitName: string, ind: number) => (
									<React.Fragment key={`name-part-${ind}`}>
										{SplitName.split('').map((letter: string, idx: number) => (
											<motion.span
												key={`letter-${ind}-${idx}-${letter}`}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ duration: 0.1, delay: idx * 0.05 }}
												whileHover={{
													scale: [1, 1.1, 0.9, 1.05, 0.95, 1],
													rotate: [0, 3, -2, 1.5, -1, 0],
													transition: { duration: 1, ease: "easeInOut" }
												}}
												whileTap={{
													scale: [1, 1.1, 0.9, 1.05, 0.95, 1],
													rotate: [0, 3, -2, 1.5, -1, 0],
													transition: { duration: 1, ease: "easeInOut" }
												}}
												className="rounded-md hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors"
											>
												{letter}
											</motion.span>
										))}
										<br />
									</React.Fragment>
								))}
							</h1>
						</Tilt>

						<h2 className="font-mono font-bold text-center mb-3 cursor-default lg:text-xl bg-gradient-to-br bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent">
							{Data.Tags[currentTagIndex].split("").map((letter: string, index: number) => (
								<motion.span
									key={index}
									initial={{ opacity: 0 }}
									animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
									transition={{ duration: 0.025, delay: index * 0.01 }}
									className="lg:text-xl bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent p-1 hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors tracking-tight "
								>
									{letter}
								</motion.span>
							))}
						</h2>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.6 }}
							className="flex flex-wrap justify-center lg:justify-center gap-3 lg:gap-15 lg:mt-10"
						>
							{Socials}
						</motion.div>
					</div>
				</div>
			</header>
		</section>

	</>)
}