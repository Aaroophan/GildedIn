import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class AboutService {
    private static instance: AboutService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): AboutService {
        if (!AboutService.instance) {
            AboutService.instance = new AboutService()
        }
        return AboutService.instance
    }

    public async About(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }

            // const response = await fetch(`${this.APIURLService.APIURL}/About/v1/About`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Title: "Who Am I ?",
                Tagline: "Full Stack Software Engineer | MSc in CS (In Progress) | Metadata-Driven Platforms | Next.js, React, JavaScript/TypeScript • C# (.NET) • Node.js • Python (FastAPI) • T-SQL • PostgreSQL • MongoDB | Agile Team Player | Blog Writer",
                "About": {
                    "Description": "Hi, I’m Aaroophan Varatharajan, a Full Stack Software Engineer with 2+ years of experience and MSc Computer Science candidate at the University of Moratuwa.\n\nI design and build metadata-driven platforms that allow complex systems to be configured dynamically rather than hard-coded. My work spans Next.js / TypeScript frontends and ASP.NET Core backends, where I build UI runtime engines, backend transport layers, and distributed messaging pipelines that power configurable enterprise applications.\n\nCurrently I’m working on a metadata-driven white-label Customer Engagement Platform that enables organizations to configure campaign workflows, messaging channels, and operational interfaces without writing new code. The system uses a dynamic UI runtime built with Next.js that renders workflows, CRUD interfaces, and messaging builders directly from backend metadata, while a typed ASP.NET Core transport layer orchestrates SQL Server stored procedures, messaging pipelines, and external services.\n\nMy experience includes:\n• Designing metadata-driven CRUD engines that dynamically generate enterprise admin interfaces from backend schemas\n• Building WYSIWYG configuration UIs for workflow builders and messaging platforms\n• Developing typed API layers that orchestrate databases, authentication systems, and external integrations\n• Implementing secure architectures including HMAC-signed webhooks, multi-factor authentication (TOTP/SMS), and role-governed systems\n• Building distributed event pipelines using messaging systems and observability tooling\n\nEarlier in my career I also built automation infrastructure, including 1000+ Selenium-based UI test scenarios, helping teams ship features faster with more confidence.\n\nI enjoy working in cross-time-zone teams, collaborating with engineers, DB architects, QA, and product teams to ship reliable systems and continuously improve engineering workflows.\n\nCurrently I’m pursuing my MSc in Computer Science (Software Architecture) to deepen my expertise in distributed systems, platform engineering, and scalable software design.\n\nCore Skills\n\nNext.js • React • TypeScript • ASP.NET Core • Python • SQL Server • PostgreSQL • MongoDB • Redis • RabbitMQ • FastAPI • Docker • Jenkins • Selenium\n\nI’m always interested in discussions around platform engineering, metadata-driven systems, distributed architecture, and developer tooling.\n\nBest regards,\nAaroophan Varatharajan",
                    "Image": "/images/Aaroophan-Main.png",
                },
                "Values": [
                    {
                        title: "Continuous Learning",
                        description: "Always exploring new Skills and approaches",
                        icon: "Brain",
                        color: "from-blue-500 to-cyan-400"
                    },
                    {
                        title: "Creative Problem Solving",
                        description: "Finding elegant solutions to complex problems",
                        icon: "Puzzle",
                        color: "from-purple-500 to-pink-400"
                    },
                    {
                        title: "Attention to Detail",
                        description: "Focus on the small things that make a big difference",
                        icon: "ZoomIn",
                        color: "from-green-500 to-emerald-400"
                    },
                    {
                        title: "Collaboration",
                        description: "Strong believer in team synergy and shared knowledge",
                        icon: "Users",
                        color: "from-orange-500 to-amber-400"
                    },
                ],
                "Interests": [
                    { name: "Photography", level: 80, icon: "Camera", color: "from-blue-500 to-blue-300" },
                    { name: "Movies", level: 100, icon: "Film", color: "from-green-500 to-green-300" },
                    { name: "Music", level: 70, icon: "Music", color: "from-purple-500 to-purple-300" },
                    { name: "Cooking", level: 45, icon: "ChefHat", color: "from-red-500 to-red-300" },
                    { name: "Audiobooks", level: 90, icon: "Book", color: "from-amber-500 to-amber-300" },
                    { name: "Cycling", level: 70, icon: "Bike", color: "from-indigo-500 to-indigo-300" },
                ],
                "FunFacts": [
                    { icon: "Coffee", fact: "Can't start the day without coffee", color: "from-amber-600 to-orange-500" },
                    { icon: "Music", fact: "Codes better with Lo-fi beats", color: "from-purple-600 to-pink-500" },
                    { icon: "Notebook", fact: "Avid learner on weekends", color: "from-green-600 to-emerald-500" },
                    { icon: "Bike", fact: "Cycling enthusiast", color: "from-blue-600 to-cyan-500" },
                    { icon: "Film", fact: "Watches 2-3 movies a week", color: "from-red-600 to-rose-500" },
                    { icon: "CookingPot", fact: "Amateur chef at home", color: "from-violet-600 to-purple-500" },
                ],
                "Day": [
                    { time: "🌅 6-9 AM", activity: "Morning routine & planning", color: "bg-blue-500" },
                    { time: "💻 9-12 PM", activity: "Deep work & coding", color: "bg-purple-500" },
                    { time: "🍽️ 12-1 PM", activity: "Lunch & quick walk", color: "bg-green-500" },
                    { time: "🚀 1-5 PM", activity: "Collaboration & meetings", color: "bg-orange-500" },
                    { time: "🎨 5-7 PM", activity: "Learning & side projects", color: "bg-pink-500" },
                    { time: "🌙 7+ PM", activity: "Wind down & hobbies", color: "bg-indigo-500" },
                ]
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
            console.error('Failed to About: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}