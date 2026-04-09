import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function GridBackground({ Data, Name, Code }: { Data: any, Name: string, Code: string }) {
	
	const [cornerDims, setCornerDims] = useState({
		w: 10, h: 10, s: 10
	})

	useEffect(() => {
		const interval = setInterval(() => {
			setCornerDims({
				w: Math.floor(Math.random() * 2) + 10,
				h: Math.floor(Math.random() * 2) + 10,
				s: Math.floor(Math.random()) + 1,
			})
		}, (Math.random() * 750) + 250)

		return () => clearInterval(interval)
	}, [])
	
	return (<>
		<div className="absolute inset-0 z-0 pointer-events-none text-[var(--mono-4)]/20 mask-linear-fade">
			<svg className="w-full h-full mask-linear-fade-y" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<motion.pattern 
						id="grid" 
						animate={{ width : cornerDims.w, height: cornerDims.h }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
						// width="10" 
						// height="10"
						patternUnits="userSpaceOnUse"
					>
						<motion.path 
							animate={{ strokeWidth : cornerDims.s }}
							transition={{ duration: 0.5, ease: "easeInOut" }}
							d="M 10 0 L 0 0 0 10" 
							fill="none" 
							stroke="currentColor" 
							// strokeWidth="2" 
						/>
					</motion.pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid)" />
			</svg>
		</div>

		{/* Decorative Overlay UI elements */}
		<div className="absolute top-25 left-25 sm:left-10 flex gap-10 sm:gap-20 mask-linear-fade">

			{/* Left panel */}
			<div className="max-w-4xl text-[10px] tracking-widest text-[var(--mono-4)]/15 font-mono font-bold cursor-default select-none break-words whitespace-pre-wrap mask-linear-fade-y">
				<div>SYSTEM_STATUS: ONLINE</div>
				<div>SECURE_CONNECTION: ESTABLISHED</div>
				<div>TARGET_ID: {Data.Name.replace(/\s/g, '_').toUpperCase()}</div>
				<div>SECTION_TITLE: {Name}</div>
				{/* <div className="">SOURCE_CODE: {Code}</div> */}
			</div>

			{/* Right panel */}
			<div className="max-w-4xl text-[10px] text-[var(--mono-4)]/15 font-mono font-bold tracking-widest cursor-default select-none whitespace-pre-wrap break-words mask-linear-fade-y">
				<div>COORDINATES: {new Date().getFullYear()}.{new Date().getMonth() + 1}.{new Date().getDate()}</div>
				<div>ENCRYPTION: AES-256</div>
				{/* <div>DATA_FOUND: {JSON.stringify(Data, null, 4)}</div> */}
			</div>

		</div>
	</>)
}