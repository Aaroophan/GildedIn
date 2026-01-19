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
import GridBackground from "../ui/GridBackground"
import TechCorners from "../ui/TechCorners"
import HeroScene from "../ui/HeroScene"

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
		<div className="relative inline-flex items-center gap-3 bg-[var(--background)]/60 backdrop-blur-md py-2 px-4 rounded-lg border border-[var(--mono-4)]/25 shadow-lg group hover:border-[var(--mono-4)]/50 transition-all duration-300">
			{/* Tech Corners */}
			<TechCorners Padding={2} Width={4} Height={4} />

			<i className={className}>
				{text.split("").map((letter, idx) => (
					<motion.span
						key={idx}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.05, delay: idx * 0.05 }}
						className="font-inkfree font-bold hover:text-[var(--mono-4)] transition-colors"
					>
						{letter}
					</motion.span>
				))}
			</i>

			<IconComponent className="w-5 h-5 rounded-md text-[var(--foreground)]/70 hover:text-[var(--mono-4)] transition-colors" />
		</div>
	)
}

export default function Hero({ initialData }: { initialData?: any }) {
	const params = useParams<{ username?: string }>()
	const endpoint = `/${params?.username || ""}`
	const [Data, setData] = useState<any>(initialData)
	const [isLoading, setIsLoading] = useState(!initialData)
	const [error, setError] = useState<string | null>(null)
	const [currentTagIndex, setCurrentTagIndex] = useState(0)
	const [isVisible, setIsVisible] = useState<Boolean>(false)
	const [cornerDims, setCornerDims] = useState({ w: 12, h: 12 })
    const [Title, setTitle] = useState<string>(initialData?.Title || "")
	let SPLITHERE

	useEffect(() => {
		const interval = setInterval(() => {
			setCornerDims({
				w: Math.floor(Math.random() * (50 - 5 + 1) + 5),
				h: Math.floor(Math.random() * (50 - 5 + 1) + 5)
			})
		}, 500)
		return () => clearInterval(interval)
	}, [])

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
		if (!initialData) {
			GetData()
		}
	}, [])

	if (error) return <ErrorMessage message={error} />
	if (isLoading) return <Loading />

	const Socials = Data?.Links?.map((Social: any, index: number) => {
		const IconComponent = LucideIcons[Social.Icon as keyof typeof LucideIcons]
		if (!IconComponent) return null

		return (
			<motion.a
				key={index}
				initial={{ opacity: 0, scale: 0 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.25, delay: index * 0.1 }}
				whileHover={{
					scale: 2,
					rotate: 360,
					borderColor: "var(--mono-4)",
					transition: { duration: 0.2 }
				}}
				className="
                    relative group flex items-center justify-center mt-4 lg:mt-0 lg:p-6 p-2 
                    rounded-full bg-[var(--mono-1)]/10 backdrop-blur-sm 
                    border border-[var(--foreground)]/10 hover:border-[var(--mono-4)]/50
                    text-[var(--foreground)]/75 hover:text-[var(--mono-4)] transition-all duration-300
                "
				href={Social.Href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={Social.Name}
				title={Social.Name}
			>
				{/* Connecting Line to Center (Visual Only) */}
				<div className="absolute -top-15 left-1/2 w-1 h-15 bg-gradient-to-b from-transparent to-[var(--mono-4)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 m-10" />

				{React.createElement(IconComponent as React.FC<any>, { className: "" })}

				{/* Node Dot */}
				<div className="absolute -top-1 -right-1 w-2 h-4 bg-[var(--mono-4)] rounded-full opacity-0 group-hover:opacity-100 animate-pulse " />
			</motion.a>
		)
	})

	return (
		<section id="Hero" className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden font-mono">
			<FadingBackground Value="Backgrounds" />
			{/* <HeroScene /> */}
			{/* <GridBackground Data={Data} Name={Hero.name} Code={Hero.toString().split("SPLITHERE")[1]} /> */}

			<header className="container mx-auto px-4 relative z-10 flex flex-col items-center cursor-default">
				<div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-100">
					<div className="hidden lg:block w-64 h-64 sm:w-80 sm:h-80" />
					<div className="flex flex-col items-center justify-center">
						{/* Main Dossier Card */}
						<Tilt
							tiltMaxAngleX={20}
							tiltMaxAngleY={20}
							glareEnable={false}
							perspective={1000}
							transitionSpeed={300}
							scale={1.05}
							className="inline-block"
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9, y: 30 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								transition={{ duration: 0.8, ease: "easeOut" }}
								className="
									relative p-8 sm:p-5 lg:py-10 rounded-2xl
									bg-[var(--background)]/20 backdrop-blur-md
									border border-[var(--foreground)]/10
									shadow-2xl
									w-full lg:w-auto
								"
							>

								<TechCorners Padding={2} Width={cornerDims.w} Height={cornerDims.h} />

								{/* Case ID Label */}
								<div className="absolute top-4 right-6 text-[10px] tracking-widest text-[var(--mono-4)] font-bold opacity-70">
									CASE_FILE_#: {Array.from(Data.Name.split(' ')[0]).map((char: any) => char.charCodeAt(0).toString(16).toUpperCase()).join("")}
								</div>

								<div className="flex flex-col items-center text-center gap-4">

									{/* Greeting Note */}
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3 }}
										className="relative rotate-[4deg]"
									>
										<div className="absolute -top-6 -left-4 text-[var(--mono-4)] text-2xl opacity-50">"</div>
										<TimelyGreeting Data={Data.Greeting} />
										<div className="absolute -bottom-8 -right-4 text-[var(--mono-4)] text-2xl opacity-50">"</div>
									</motion.div>

									{/* Name Title */}
									<div className="relative mt-4">
										<h1 className="
											font-oswald font-bold text-6xl sm:text-7xl lg:text-9xl 
											tracking-wibdest bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text
											cursor-default select-none
											drop-shadow-lg lg:px-4
										">
											{Data.Name.split(' ').map((SplitName: string, ind: number) => (
												<React.Fragment key={`name-part-${ind}`}>
													{SplitName.split('').map((letter: string, idx: number) => (
														<motion.span
															key={`letter-${ind}-${idx}-${letter}`}
															initial={{ opacity: 0, filter: "blur(10px)" }}
															animate={{ opacity: 1, filter: "blur(0px)" }}
															transition={{
																duration: 0.1,
																delay: idx * 0.05 + 0.5,
																type: "spring",
																stiffness: 100
															}}
															className="rounded-md hover:text-[var(--mono-4)] transition-colors"
														>
															{letter}
														</motion.span>
													))}
													<br />
												</React.Fragment>
											))}
										</h1>

										{/* Underline scanning effect */}
										<motion.div
											initial={{ width: "0%" }}
											animate={{ width: "100%" }}
											transition={{ delay: 3, duration: 3, ease: "easeInOut" }}
											className="h-2 w-full bg-gradient-to-r from-transparent via-[var(--mono-4)] to-transparent opacity-50 mt-5 animate-pulse"
										/>
									</div>
									<h2 className="h-15 lg:h-auto font-mono font-bold text-center cursor-default lg:text-xl bg-gradient-to-br bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent">
										{Data.Tags[currentTagIndex].split("").map((letter: string, index: number) => (
											<motion.span
												key={index}
												initial={{ opacity: 0, y: 10 }}
												animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
												transition={{ duration: 0.05, delay: index * 0.01 }}
												className="lg:text-xl bg-gradient-to-br from-[var(--foreground)] via-[var(--foreground)] to-[var(--foreground)] bg-clip-text text-transparent hover:text-[var(--mono-4)] dark:hover:text-[var(--mono-4)] transition-colors tracking-widest "
											>
												{letter}
											</motion.span>
										))}
									</h2>
								</div>
							</motion.div>
						</Tilt>

						{/* Evidence Links (Socials) */}
						<div className="mt-2 w-full max-w-5xl relative">
							<div className="flex flex-wrap justify-center lg:justify-center gap-3 lg:gap-10 lg:mt-10 font-bold">
								{Socials}
							</div>
						</div>
					</div>
				</div>
			</header>
		</section>
	)
}