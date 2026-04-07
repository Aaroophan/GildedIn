import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { HeroService } from "@/models/Services/Hero"
import { AboutService } from "@/models/Services/About"
import { ExperienceService } from "@/models/Services/Experience"
import { ProjectsService } from "@/models/Services/Projects"
import { SkillsService } from "@/models/Services/Skills"
import { BlogService } from "@/models/Services/Blog"
import { EducationService } from "@/models/Services/Education"
import { ReferenceService } from "@/models/Services/References"
import { ContactService } from "@/models/Services/Contact"

const MODEL = "llama-3.3-70b-versatile"

// Create a ratelimiter that allows 20 requests per 1 hour
const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(20, "1 h"),
	analytics: true,
})

async function buildSystemPrompt(endpoint: string): Promise<string> {
	try {
		const [heroData, aboutData, experiencesData, projectsData, skillsData, blogData, educationsData, referencesData, contactData] = await Promise.all([
			HeroService.getInstance().Hero(endpoint),
			AboutService.getInstance().About(endpoint),
			ExperienceService.getInstance().Experience(endpoint),
			ProjectsService.getInstance().Projects(endpoint),
			SkillsService.getInstance().Skills(endpoint),
			BlogService.getInstance().Blog(endpoint),
			EducationService.getInstance().Education(endpoint),
			ReferenceService.getInstance().Reference(endpoint),
			ContactService.getInstance().Contact(endpoint),
		])

		return `You are ${endpoint}'s friendly portfolio assistant inside the platform GildedIn. You are an AI embedded on his personal website. Your job is to answer visitor questions about ${endpoint} using ONLY the data provided below. Be warm, conversational, and concise.

        RULES:
        - Answer ONLY based on the context below. If you genuinely don't know, say so politely and suggest the visitor reach out to ${endpoint} directly.
        - Keep answers concise (2-4 sentences for simple questions, more for detailed ones).
        - Use a friendly, professional tone with a hint of personality.
        - When listing projects or skills, format them nicely.
        - You may use markdown formatting (bold, lists, etc.) in your responses.
        - If asked who you are, say you're ${endpoint}'s portfolio AI assistant.
        - Never make up information not present in the context.

        === HERO ===
        ${heroData?.Title || "No hero data available."}

        === ABOUT ===
        ${aboutData?.About?.Description || "No about data available."}

        === EXPERIENCES ===
        ${experiencesData?.Experience?.map((e: any) => `${e.company} - ${e.position}`).join("\n") || "No experiences data available."}

        === PROJECTS ===
        ${projectsData?.Project?.map((p: any) => `${p.projectName} - ${p.projectDesc}`).join("\n") || "No projects data available."}

        === SKILLS ===
        ${skillsData?.Skills?.map((s: any) => s.name).join(", ") || "No skills data available."}

        === BLOGS ===
        ${blogData?.Blog?.map((b: any) => b.title).join(", ") || "No blog data available."}

        === EDUCATION ===
        ${educationsData?.Education?.map((e: any) => `${e.schoolName} - ${e.degreeName}`).join("\n") || "No education data available."}

        === REFERENCES ===
        ${referencesData?.Reference?.map((r: any) => r.name).join(", ") || "No references data available."}

        === CONTACT ===
        ${contactData?.Contact?.Email || "No contact data available."}

        === PORTFOLIO WEBSITE ===
        URL: https://aaroophan.dev/${endpoint}`
	} catch (error) {
		console.error("Error building system prompt:", error)
		return `You are a friendly portfolio assistant. Please help the user with their questions.`
	}
}

export async function POST(request: NextRequest) {
	try {
		const apiKey = process.env.GROQ_API_KEY
		if (!apiKey) {
			return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 })
		}

		// Attempt to get IP from headers for rate limiting
		const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
		let rateLimitInfo: any = null

		// Check rate limit
		try {
			const result = await ratelimit.limit(`ratelimit_${ip}`)
			rateLimitInfo = result
			if (!result.success) {
				return NextResponse.json(
					{ error: "Too many requests. Please try again later or reach out directly via LinkedIn or Instagram!" },
					{
						status: 429,
						headers: {
							"X-RateLimit-Limit": result.limit.toString(),
							"X-RateLimit-Remaining": result.remaining.toString(),
							"X-RateLimit-Reset": result.reset.toString(),
						},
					}
				)
			}
		} catch (redisError) {
			console.error("Redis Rate Limiting Error:", redisError)
			// If Redis fails, continue without rate limiting
		}

		const body = await request.json()
		const messages = body?.messages
		const endpoint = body?.endpoint

		if (!messages || !Array.isArray(messages)) {
			return NextResponse.json({ error: "messages array is required" }, { status: 400 })
		}

		if (!endpoint) {
			return NextResponse.json({ error: "endpoint is required" }, { status: 400 })
		}

		const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })
		const systemPrompt = await buildSystemPrompt(endpoint)

		const chatMessages = [
			{
				role: "system" as const,
				content: systemPrompt,
			},
			...messages.map((m: { role: string; content: string }) => ({
				role: m.role as "user" | "assistant",
				content: m.content,
			})),
		]

		const completion = await groq.chat.completions.create({
			model: MODEL,
			messages: chatMessages,
			temperature: 0.7,
			max_completion_tokens: 1024,
			stream: true,
		})

		// Create a ReadableStream from the async iterator
		let stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of completion) {
						const content = chunk.choices?.[0]?.delta?.content || ""
						if (content) {
							controller.enqueue(new TextEncoder().encode(content))
						}
					}
					controller.close()
				} catch (err) {
					controller.error(err)
				}
			},
		})

		const headers: Record<string, string> = {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "no-cache",
		}

		if (rateLimitInfo) {
			headers["X-RateLimit-Limit"] = rateLimitInfo.limit.toString()
			headers["X-RateLimit-Remaining"] = rateLimitInfo.remaining.toString()
			headers["X-RateLimit-Reset"] = rateLimitInfo.reset.toString()
		}

		return new Response(stream, { headers })
	} catch (error) {
		console.error("Chat API error:", error)
		return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
	}
}
