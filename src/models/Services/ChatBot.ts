import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class ChatBotService {
    private static instance: ChatBotService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): ChatBotService {
        if (!ChatBotService.instance) {
            ChatBotService.instance = new ChatBotService()
        }
        return ChatBotService.instance
    }

    public async ChatBot(messages: { role: string; content: string }[], endpoint: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            if (!messages || !Array.isArray(messages)) {
                this.messageService.setMessage(400, "messages array is required")
                return {
                    Status: 400,
                    Message: "messages array is required",
                    rateLimitRemaining: null,
                    rateLimitReset: null
                }
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers,
                body: JSON.stringify({ messages, endpoint })
            })

            // Extract rate limit headers
            const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining")
            const rateLimitReset = response.headers.get("X-RateLimit-Reset")

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: "Unknown error" }))
                this.messageService.setMessage(response.status, error.error || "Request failed")
                return {
                    Status: response.status,
                    Message: error.error || "Request failed",
                    rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
                    rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : null
                }
            }

            // Read streaming response
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let content = ""

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    content += decoder.decode(value, { stream: true })
                }
            }

            const data = {
                Status: 200,
                Message: "",
                Response: content,
                rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
                rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : null
            }

            this.messageService.setMessage(data.Status, data.Message)
            return data
        } catch (e) {
            console.error("Failed to ChatBot: ", e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`,
                rateLimitRemaining: null,
                rateLimitReset: null
            }
        }
    }
}