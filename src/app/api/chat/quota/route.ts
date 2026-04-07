import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(20, "1 h"),
	analytics: true,
})

export async function GET(request: NextRequest) {
	try {
		const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
		const { remaining, limit, reset } = await ratelimit.getRemaining(`ratelimit_${ip}`)

		return NextResponse.json(
			{ remaining, limit, reset },
			{
				headers: {
					"Cache-Control": "no-store",
					"X-RateLimit-Limit": limit.toString(),
					"X-RateLimit-Remaining": remaining.toString(),
					"X-RateLimit-Reset": reset.toString(),
				},
			}
		)
	} catch (error) {
		console.error("Quota check error:", error)
		return NextResponse.json(
			{ remaining: 20, limit: 20, reset: Date.now() + 3600000 },
			{ status: 200, headers: { "Cache-Control": "no-store" } }
		)
	}
}
