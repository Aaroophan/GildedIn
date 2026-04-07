import Groq from "groq-sdk"
import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"
import { HeroService } from "./Hero"
import { AboutService } from "./About"
import { ExperienceService } from "./Experience"
import { ProjectsService } from "./Projects"
import { SkillsService } from "./Skills"
import { BlogService } from "./Blog"
import { EducationService } from "./Education"
import { ReferenceService } from "./References"
import { ContactService } from "./Contact"

const MODEL = "llama-3.3-70b-versatile"

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

    private async buildSystemPrompt(endpoint: string): Promise<string> {
        const [
                heroData,
                aboutData,
                experiencesData,
                projectsData,
                SkillsData,
                BlogData,
                educationsData,
                referencesData,
                contactData
            ] = await Promise.all([
                HeroService.getInstance().Hero(endpoint),
                AboutService.getInstance().About(endpoint),
                ExperienceService.getInstance().Experience(endpoint),
                ProjectsService.getInstance().Projects(endpoint),
                SkillsService.getInstance().Skills(endpoint),
                BlogService.getInstance().Blog(endpoint),
                EducationService.getInstance().Education(endpoint),
                ReferenceService.getInstance().Reference(endpoint),
                ContactService.getInstance().Contact(endpoint)
            ])
        const Prompt: string =  `You are ${endpoint}'s friendly portfolio assistant inside the platform GildedIn. You are an AI embedded on his personal website. Your job is to answer visitor questions about ${endpoint} using ONLY the data provided below. Be warm, conversational, and concise.

            RULES:
            - Answer ONLY based on the context below. If you genuinely don't know, say so politely and suggest the visitor reach out to ${endpoint} directly.
            - Keep answers concise (2-4 sentences for simple questions, more for detailed ones).
            - Use a friendly, professional tone with a hint of personality.
            - When listing projects or skills, format them nicely.
            - You may use markdown formatting (bold, lists, etc.) in your responses.
            - If asked who you are, say you're ${endpoint}'s portfolio AI assistant.
            - Never make up information not present in the context.

            === ${endpoint}'s HERO ===
            ${JSON.stringify(heroData || "No hero data available.")}

            === ${endpoint}'s ABOUT ===
            ${JSON.stringify(aboutData || "No about data available.")}

            === ${endpoint}'s EXPERIENCES ===
            ${JSON.stringify(experiencesData || "No experiences data available.")}

            === ${endpoint}'s PROJECTS ===
            ${JSON.stringify(projectsData || "No projects data available.")}

            === ${endpoint}'s SKILLS ===
            ${JSON.stringify(SkillsData || "No skills data available.")}

            === ${endpoint}'s EDUCATION ===
            ${JSON.stringify(educationsData || "No education data available.")}

            === ${endpoint}'s REFERENCES ===
            ${JSON.stringify(referencesData || "No references data available.")}

            === ${endpoint}'s CONTACT ===
            ${JSON.stringify(contactData || "No contact data available.")}

            === ${endpoint}'s PORTFOLIO WEBSITE ===
            URL: https://aaroophan.dev/${endpoint}

            === ABOUT GILDEDIN ===
            { "project": "GildedIn", "tagline": "Instant Presence, Infinite Style", "description": "GildedIn is a no-code platform that instantly generates dynamic, personalized portfolio websites with real-time editing and immersive visuals.", "core_features": [ "Dynamic user-based routing (/username)", "Real-time content editing (CMS-like experience)", "No-code portfolio generation", "Modular portfolio sections (Projects, About, Experience, etc.)", "Responsive and visually rich UI", "3D graphics and animation support" ], "how_it_works": "Users sign up and instantly receive a personalized portfolio URL with pre-built sections. They can update content through a dashboard, with changes reflected in real time.", "tech_stack": { "frontend": ["Next.js", "React", "TypeScript"], "styling": ["Tailwind CSS"], "state_management": ["Redux Toolkit"], "3d_animation": ["Three.js", "Framer Motion", "@react-three/fiber"], "utilities": ["LogRocket", "Crypto-JS"] }, "target_users": [ "Developers", "Designers", "Creatives", "Professionals needing quick portfolios" ], "problem_solved": "Eliminates the need for coding, deployment, and manual portfolio updates by providing an instant, customizable web presence.", "creator": { "name": "Aaroophan Varatharajan", "role": "Full Stack Software Engineer" } }
            
            
            `
        
            return Prompt
    }

    public async ChatBot(messages: { role: string; content: string }[], Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

            if (!apiKey) {
                this.messageService.setMessage(500, "GROQ_API_KEY is not configured")
                return {
                    Status: 500,
                    Message: "GROQ_API_KEY is not configured"
                }
            }

            if (!messages || !Array.isArray(messages)) {
                this.messageService.setMessage(400, "messages array is required")
                return {
                    Status: 400,
                    Message: "messages array is required"
                }
            }

            const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })
            const systemPrompt = await this.buildSystemPrompt(Name)

            const chatMessages = [
                {
                    role: "system" as const,
                    content: systemPrompt
                },
                ...messages.map((m: { role: string; content: string }) => ({
                    role: m.role as "user" | "assistant",
                    content: m.content
                }))
            ]

            const completion = await groq.chat.completions.create({
                model: MODEL,
                messages: chatMessages,
                temperature: 0.7,
                max_completion_tokens: 1024
            })

            const content = completion.choices?.[0]?.message?.content || ""

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Response: content
            }

            this.authService.setUser({
                User_Session_Token: data.User_Session_Token
            })

            if ([200, 201, 202, 203, 204, 205, 206, 207, 208, 226].includes(data.Status)) {
                this.messageService.setMessage(data.Status, data.Message)
                return data
            } else {
                this.messageService.setMessage(data.Status, data.Message)
                return {
                    Status: data.Status,
                    Message: data.Message
                }
            }
        } catch (e) {
            console.error("Failed to ChatBot: ", e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}