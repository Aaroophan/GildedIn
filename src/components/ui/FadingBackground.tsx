import { useAppSelector } from "@/hooks/hooks"
import { HeroService } from "@/models/Services/Hero"
import { useEffect, useState, useRef } from "react"

export default function FadingBackground({ Value }: { Value: string }) {
	const [index, setIndex] = useState(0)
	const [fade, setFade] = useState(true)
	const { resolvedTheme } = useAppSelector((state) => state.theme)
	const timeoutRef = useRef<any>(null)

	const [Data, setData] = useState<any>()
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	let backgrounds: string[] = []
	if (Value === "Images") {
		backgrounds = Data?.Images || []
	} else {
		backgrounds = Data?.Backgrounds || []
	}

	const isVideo = (url: string | undefined) => url ? /\.(mp4|webm|mov)$/i.test(url) : false
	const isSingleVideo = backgrounds.length === 1 && isVideo(backgrounds[0])

	const handleNext = () => {
		// If single video, do nothing (let it loop natively)
		if (isSingleVideo) return

		setFade(false)
		setTimeout(() => {
			setIndex((prev) => (prev + 1) % backgrounds.length)
			setFade(true)
		}, 1000)
	}

	useEffect(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)

		const currentBg = backgrounds[index]
		if (!currentBg) return

		// If current background is NOT a video, wait 5 seconds then advance
		if (!isVideo(currentBg)) {
			// If it's a single image, maybe we don't need to fade/transition either?
			// But user didn't complain about images.
			// Let's keep logic simple: strict check for video.
			// If it's single image, timeouts will fire, fade out/in to same image. 
			// User might want that for "breathing" effect or might not.
			// For now, let's just protect the video loop.
			timeoutRef.current = setTimeout(handleNext, 5000)
		}
		// If it IS a video, onEnded will trigger handleNext unless it's single video

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [index, backgrounds, isSingleVideo])


	const GetData = async () => {
		setIsLoading(true)

		try {
			const heroService = HeroService.getInstance()
			const result = await heroService.Hero("Aaroophan")

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

	return (
		<div className="absolute inset-0 z-0 h-full w-full overflow-hidden transition-opacity duration-1000 ease-in-out bg-[var(--background)]">
			{isVideo(backgrounds[index]) ? (
				<video
					key={backgrounds[index]}
					src={backgrounds[index]}
					className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
					style={{
						opacity: fade ? (resolvedTheme === 'dark' ? 0.4 : 0.4) : 0,
					}}
					autoPlay
					muted
					playsInline
					loop={isSingleVideo}
					onEnded={isSingleVideo ? undefined : handleNext}
				/>
			) : (
				<div
					className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
					style={{
						backgroundImage: `url(${backgrounds[index]})`,
						opacity: fade ? (resolvedTheme === 'dark' ? 0.4 : 0.4) : 0,
					}}
				/>
			)}
			<div className="absolute inset-0" />
		</div>
	)
}
