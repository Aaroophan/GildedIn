"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBotService } from "@/models/Services/ChatBot";
import { useParams } from "next/navigation";
import TechCorners from "../ui/TechCorners";

interface Message {
	role: "user" | "assistant";
	content: string;
}

const MAX_CHARS = 150;

export default function ChatBot() {
    const params = useParams<{ username?: string }>()
    const decodedUsername = decodeURIComponent(params?.username || "Aaroophan")

    const WELCOME_MESSAGE: Message = {
        role: "assistant",
        content:
            `Hey there! 👋 I'm Gilden, ${decodedUsername}'s portfolio assistant. Ask me anything about his projects, skills, experience, education, etc. I'm happy to help!`,
    };

    const SUGGESTED_QUESTIONS = [
        `What does ${decodedUsername} do?`,
        `Tell me about his projects`,
        "What tech stack does he use?",
        "How can I contact him?",
    ];

	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [isCoolingDown, setIsCoolingDown] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);
	const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
	const [rateLimitLimit, setRateLimitLimit] = useState<number | null>(null);
	const [rateLimitReset, setRateLimitReset] = useState<number | null>(null);
	const [countdownText, setCountdownText] = useState<string | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const abortRef = useRef<AbortController | null>(null);

	const isQuotaExhausted = rateLimitRemaining !== null && rateLimitRemaining <= 0;

	// Auto-scroll to bottom
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	// Focus input when chat opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => inputRef.current?.focus(), 300);
		}
	}, [isOpen]);

	// Fetch quota from backend when the chat opens
	useEffect(() => {
		if (!isOpen) return;

		const controller = new AbortController();
		const fetchQuota = async () => {
			try {
				const response = await fetch("/api/chat/quota", {
					signal: controller.signal,
				});
				if (!response.ok) return;
				const data = await response.json();
				setRateLimitRemaining(data.remaining);
				setRateLimitLimit(data.limit);
				setRateLimitReset(data.reset);
			} catch {
				// Silently fail — chat still works without quota display
			}
		};

		fetchQuota();
		return () => controller.abort();
	}, [isOpen]);

	// Live countdown timer when quota is exhausted
	useEffect(() => {
		if (!isQuotaExhausted || !rateLimitReset) {
			setCountdownText(null);
			return;
		}

		const tick = () => {
			const diff = rateLimitReset - Date.now();
			if (diff <= 0) {
				setCountdownText(null);
				setRateLimitRemaining(null);
				setRateLimitReset(null);
				return;
			}
			const mins = Math.floor(diff / 60000);
			const secs = Math.floor((diff % 60000) / 1000);
			setCountdownText(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
		};

		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	}, [isQuotaExhausted, rateLimitReset]);

	const sendMessage = useCallback(
		async (text?: string) => {
			const messageText = text || input.trim();
			if (!messageText || isStreaming || isCoolingDown || isQuotaExhausted) return;

			setHasInteracted(true);
			const userMessage: Message = { role: "user", content: messageText };
			const updatedMessages = [...messages, userMessage];
			setMessages(updatedMessages);
			setInput("");
			setIsStreaming(true);

			// Add empty assistant message while the request is in flight
			const assistantMessage: Message = { role: "assistant", content: "" };
			setMessages([...updatedMessages, assistantMessage]);

			try {
				const chatBotService = ChatBotService.getInstance();
				const result = await chatBotService.ChatBot(
					updatedMessages.filter((m) => m !== WELCOME_MESSAGE),
					decodedUsername
				);

				if (result.rateLimitRemaining !== null) setRateLimitRemaining(result.rateLimitRemaining);
				if (result.rateLimitLimit !== null) setRateLimitLimit(result.rateLimitLimit);
				if (result.rateLimitReset !== null) setRateLimitReset(result.rateLimitReset);

				const isRateLimited = result.Status === 429;

				if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(result.Status)) {
					setMessages((prev) => {
						const updated = [...prev];
						updated[updated.length - 1] = {
							role: "assistant",
							content: result.Response || "I couldn't get an answer just now.",
						};
						return updated;
					});
				} else {
					setMessages((prev) => {
						const updated = [...prev];
						updated[updated.length - 1] = {
							role: "assistant",
							content: isRateLimited
								? "You\'ve used all your messages for now. Please try again later or reach out directly via LinkedIn or email."
								: result.Message || "Oops, something went wrong. Please try again.",
						};
						return updated;
					});
				}
			} catch (err) {
				setMessages((prev) => {
					const updated = [...prev];
					updated[updated.length - 1] = {
						role: "assistant",
						content: "Oops, something went wrong. Please try again! 🙏",
					};
					return updated;
				});
			} finally {
				setIsStreaming(false);
				abortRef.current = null;
				setTimeout(() => inputRef.current?.focus(), 50);
				setIsCoolingDown(true);
				setTimeout(() => {
					setIsCoolingDown(false);
					inputRef.current?.focus();
				}, 3000);
			}
		},
		[input, isStreaming, isCoolingDown, isQuotaExhausted, messages, decodedUsername]
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (!isCoolingDown && !isStreaming) {
				sendMessage();
			}
		}
	};

	const formatResetTime = (timestamp: number) => {
		const diff = timestamp - Date.now();
		if (diff <= 0) return "soon";
		const minutes = Math.ceil(diff / 60000);
		return `${minutes} min`;
	};

	const charCountColor =
		input.length >= 140 ? "text-red-400/80" :
		input.length >= 120 ? "text-amber-400/70" :
		"text-slate-600";

	const quotaBadgeText = (() => {
		if (rateLimitRemaining === null || rateLimitLimit === null) return null;
		if (isQuotaExhausted && countdownText) return `Resets in ${countdownText}`;
		if (isQuotaExhausted) return "Limit reached";
		return `${rateLimitRemaining}/${rateLimitLimit} questions left`;
	})();

	const quotaBadgeColor = (() => {
		if (rateLimitRemaining === null) return "";
		if (isQuotaExhausted) return "text-red-400/80";
		if (rateLimitRemaining <= 5) return "text-amber-400/70";
		return "text-emerald-400/60";
	})();

	// Simple markdown-like rendering (bold, inline code)
	const renderContent = (content: string) => {
		if (!content) return null;

		const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
		return parts.map((part, i) => {
			if (part.startsWith("**") && part.endsWith("**")) {
				return (
					<strong key={i} className="text-[var(--mono-4)] font-semibold">
						{part.slice(2, -2)}
					</strong>
				);
			}
			if (part.startsWith("`") && part.endsWith("`")) {
				return (
					<code
						key={i}
						className="bg-[var(--mono-4)]/10 text-[var(--mono-4)] px-1.5 py-0.5 rounded text-[11px] font-mono"
					>
						{part.slice(1, -1)}
					</code>
				);
			}
			if (part === "\n") return <br key={i} />;
			return <span key={i}>{part}</span>;
		});
	};

	return (
		<>
			{/* Floating Action Button — elegant orbiting ring design */}
			<AnimatePresence>
				{!isOpen && (
					<motion.button
						id="chatbot-fab"
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, rotate: 180 }}
						transition={{ type: "spring", stiffness: 200, damping: 15 }}
						onClick={() => setIsOpen(true)}
						className="fixed bottom-6 right-6 z-[9998] group cursor-pointer"
						aria-label="Open chat assistant"
					>
						<TechCorners Padding={3} Width={3} Height={3} Radius="full" />
						{/* Orbiting ring */}
						<div className="absolute inset-[-6px] rounded-full border border-[var(--mono-4)]/30 chatbot-orbit" />
						<div className="absolute inset-[-12px] rounded-full border border-[var(--mono-4)]/10 chatbot-orbit-reverse" />

						{/* Tiny orbiting dot */}
						<div className="absolute inset-[-6px] chatbot-orbit">
							<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--mono-4)] shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
						</div>

						{/* Main button */}
						<div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[var(--mono-4)]/80 to-[var(--mono-4)]/60 backdrop-blur-md shadow-lg shadow-[var(--mono-4)]/20 flex items-center justify-center transition-all duration-300 group-hover:shadow-[var(--mono-4)]/30 group-hover:shadow-xl group-hover:scale-105 border border-[var(--mono-4)]/30">
							{/* Chat icon */}
							<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot-message-square-icon lucide-bot-message-square"><path d="M12 6V2H8"/><path d="M15 11v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M9 11v2"/></svg>
						</div>

						{/* Floating label */}
						<motion.div
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 1, duration: 0.4 }}
							className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap bg-[var(--background)]/50 text-[var(--mono-7)] text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--mono-4)]/20 shadow-[0_0_20px_rgba(var(--mono-4-rgb),0.1)] pointer-events-none chatbot-float"
						>
							Ask me about {decodedUsername} ✨
						</motion.div>
					</motion.button>
				)}
			</AnimatePresence>

			{/* Chat Window */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						id="chatbot-window"
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						className="fixed bottom-6 right-6 z-[9998] w-[calc(100vw-3rem)] sm:w-[400px] h-[min(580px,calc(100vh-6rem))] flex flex-col rounded-2xl border border-[var(--mono-4)]/20 shadow-2xl shadow-[var(--mono-4)]/10 backdrop-blur-xs"
						style={{
							background: "linear-gradient(135deg, rgba(var(--mono-7-rgb), 0.4) 0%, rgba(var(--mono-8-rgb), 0.3) 100%)",
							backdropFilter: "blur(20px)",
						}}
					>
						<TechCorners Padding={3} Width={6} Height={6} />
                        <div className="absolute inset-0 pointer-events-none text-[var(--mono-4)]/5 mask-linear-fade">
                            <svg className="w-full h-full mask-linear-fade-y" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>

						{/* Header */}
						<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[var(--background)]/60 via-[var(--background)]/60 to-[var(--background)]/20">
							<div className="flex items-center gap-3">
								<div className="relative">
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mono-4)] to-[var(--mono-6)] flex items-center justify-center text-lg font-bold text-white shadow-md font-oswald">
										G
									</div>
									<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-900 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
								</div>
								<div className="flex flex-col justify-center">
									<p className="text-sm font-semibold text-[var(--foreground)] leading-tight flex items-center justify- gap-1 ">
                                        <b className="text-md font-bold tracking-widest font-oswald">Gilden</b> 
                                        <i className="text-[10px] font-semibold text-[var(--foreground)]/80 font-italic leading-tight font-inkfree"> 
                                            ({decodedUsername}&apos;s Assistant) 
                                        </i>
									</p>
									<div className="flex items-center gap-2 ">
										<p className="text-[10px] text-emerald-500">
											{isStreaming ? "Typing..." : "Online"}
										</p>
										<span className="text-[10px] px-1.5 py-[1px] rounded bg-[var(--mono-4)]/5 text-[var(--mono-4)]/60 border border-[var(--mono-4)]/20 whitespace-nowrap scale-90">
											20 questions every 1 hr · Max 150 chars
										</span>
									</div>
								</div>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="text-[var(--foreground)] hover:text-red-500 transition-all p-1 rounded-lg hover:scale-125"
								aria-label="Close chat"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
									<path
										d="M18 6L6 18M6 6l12 12"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
							</button>
						</div>

						{/* Messages */}
						<div
							ref={scrollRef}
							className="flex-1 overflow-y-auto px-4 py-3 space-y-3 chatbot-scrollbar bg-[var(--background)]/20"
						>
							{messages.map((msg, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2 }}
									className={`flex ${
										msg.role === "user" ? "justify-end" : "justify-start"
									}`}
								>
									<div
										className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed backdrop-blur-md z-10 transition-all ${
											msg.role === "user"
												? "bg-[var(--mono-4)]/75 text-white rounded-br-md shadow-[0_0_12px_rgba(var(--mono-4-rgb),0.3)]"
												: "bg-[var(--background)]/25 text-[var(--foreground)] rounded-bl-md border border-[var(--mono-4)]/20 shadow-[0_0_8px_rgba(var(--mono-4-rgb),0.1)]"
										}`}
									>
										{msg.role === "assistant"
											? renderContent(msg.content)
											: msg.content}

										{/* Streaming cursor */}
										{msg.role === "assistant" &&
											i === messages.length - 1 &&
											isStreaming && (
												<span className="inline-block w-0.5 h-4 bg-[var(--mono-4)] rounded-full ml-0.5 chatbot-blink align-middle" />
											)}
									</div>
								</motion.div>
							))}

							{/* Suggested questions (only before first user message) */}
							{!hasInteracted && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
									className="flex flex-wrap gap-2 pt-1"
								>
									{SUGGESTED_QUESTIONS.map((q) => (
										<button
											key={q}
											onClick={() => sendMessage(q)}
											className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--mono-4)]/20 text-[var(--mono-4)] bg-[var(--mono-4)]/5 hover:bg-[var(--mono-4)]/15 hover:border-[var(--mono-4)]/40 transition-all cursor-pointer backdrop-blur-sm"
										>
											{q}
										</button>
									))}
								</motion.div>
							)}
						</div>

						{/* Input */}
						<div className="px-3 py-3 bg-gradient-to-t from-[var(--background)]/60 from-[var(--background)]/60 to-[var(--background)]/20">
							{isQuotaExhausted ? (
								<div className="space-y-3 rounded-2xl border border-red-500/10 bg-[var(--background)]/70 p-4 text-center">
									<p className="text-[12px] text-slate-300">
										You&apos;ve used all {rateLimitLimit ?? 20} messages this hour.
									</p>
									{countdownText && (
										<p className="text-[11px] text-amber-400/80">
											⏱ Resets in {countdownText}
										</p>
									)}
								</div>
							) : (
								<>
									<div className="flex items-center gap-2 bg-[var(--mono-4)]/5 rounded-xl px-3 py-1.5 border border-[var(--mono-4)]/20 focus-within:border-[var(--mono-4)]/40 focus-within:bg-[var(--mono-4)]/10 focus-within:shadow-[0_0_12px_rgba(var(--mono-4-rgb),0.1)] transition-all backdrop-blur-sm">
										<input
											ref={inputRef}
											type="text"
											placeholder={
												isQuotaExhausted
													? "Message limit reached. Please email me!"
													: isStreaming
														? "Waiting for response..."
														: isCoolingDown
															? "Preparing next message..."
															: `Ask about ${decodedUsername}...`
											}
											value={input}
											onChange={(e) => setInput(e.target.value)}
											onKeyDown={handleKeyDown}
											disabled={isStreaming || isQuotaExhausted}
											maxLength={MAX_CHARS}
											className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--mono-4)]/75 outline-none disabled:opacity-50"
										/>
										{input.length > 0 && (
											<span className={`text-[10px] tabular-nums whitespace-nowrap transition-colors ${charCountColor}`}>
												{input.length}/{MAX_CHARS}
											</span>
										)}
										<button
											onClick={() => sendMessage()}
											disabled={!input.trim() || isStreaming || isCoolingDown || isQuotaExhausted}
											className="p-1.5 rounded-lg text-[var(--mono-4)] hover:bg-[var(--mono-4)]/15 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
											aria-label="Send message"
										>
												<svg
													width="18"
													height="18"
												viewBox="0 0 24 24"
												fill="none"
											>
													<path
														d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</button>
									</div>
									<div className="flex items-center justify-between text-[10px] text-[var(--mono-4)]/60 mt-1.5">
										<p>Powered by <a href="https://aaroophan.dev" className="font-oswald text-[var(--mono-4)]/90 text-md">GildedIn</a> • Answers from portfolio data</p>
										{rateLimitRemaining !== null && (
											<p className={rateLimitRemaining === 0 ? "text-red-500/60" : rateLimitRemaining > 5 ? "text-emerald-500/70" : "text-amber-500/70"}>
												{rateLimitRemaining} msgs left
												{rateLimitRemaining === 0 && rateLimitReset && ` (resets ${formatResetTime(rateLimitReset)})`}
											</p>
										)}
									</div>
								</>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}