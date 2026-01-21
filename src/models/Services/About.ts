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
                Tagline: "Full Stack Software Engineer | MSc in Computer Science (In Progress) | Metadata-Driven Systems | Next.js, React, JavaScript/TypeScript | C# (.NET) | Node.js | Python (FastAPI) | T-SQL | PostgreSQL | MongoDB | Agile Team Player | Blog Writer",
                "About": {
                    "Description": "Hi, I’m Aaroophan Varatharajan, a Full Stack Software Engineer and MSc Computer Science Candidate at the University of Moratuwa. I have 2+ years of experience building metadata-driven web applications using Next.js, React, TypeScript, and ASP.NET Core (.NET/C#) supported by strong skills in SQL Server, PostgreSQL, MongoDB, and MySQL.\n\nI specialize in designing robust, maintainable, and scalable systems from metadata-driven UIs with dynamic routes and drag-and-drop interfaces to typed backend APIs, secure authentication flows, and distributed multi-service event pipelines. I’ve also automated 1000+ UI test scenarios using .NET Core and Selenium, improving test reliability and enabling faster, more confident releases \n\nI thrive in Agile, cross-time-zone teams, collaborating with PM, QA, DevOps, and DB engineers to deliver stable, performant solutions for fintech and marketing platforms. I’m passionate about clean architecture, data integrity, defensive engineering, and building documentation and onboarding processes that improve team velocity. \n\nCurrently, I am pursuing my MSc in Computer Science (2026-2028) to further strengthen my expertise in advanced software engineering, distributed systems, and AI/ML integration. \n\nKey Skills & Tech Stack \n\n• Languages & Fundamentals: TypeScript (TS) / JavaScript (JS) (ES6+), C# (.NET Core), Python, SQL (T-SQL, PostgreSQL), PHP, Java, Bash / PowerShell \n• Frontend Architecture: Next.js (App Router), React, State Management (Zustand, Redux), UI Libraries (Tailwind CSS, MUI, Shadcn UI), Visuals & Animation (Framer Motion, Three.js) \n• Backend & System Design: Node.js (Express), ASP.NET Core, FastAPI, Distributed Systems (RabbitMQ), Security (HMAC-signed Webhooks, OAuth2, 2FA/TOTP), RESTful APIs \n• Database Engineering: MS SQL Server (Stored Procedures), PostgreSQL, MongoDB, MySQL, Caching & Persistence (Redis, SQLite, Firebase) \n• DevOps & Automation: CI/CD (Jenkins, Vercel, Render, Netlify), Docker, Selenium Automation, Observability (Serilog, Database-backed Sinks) \n• Productivity & Design: JIRA, Zendesk, Trello, Open Project, Android Studio, DBeaver, Adobe Photoshop, Adobe Illustrator, After Effects \n• Data Science & AI: OpenAI API, PyTorch (NLP), Pandas, NumPy, Chart.js\n\nI love turning complex ideas into reliable, user-friendly products and I’m always looking for ways to optimize workflows, automate processes, and build solutions that make life easier for both users and engineering teams.\n\nBest regards,\nAaroophan Varatharajan",
                    "Image": "/images/Aaroophan-Main.png",
                },
                "Values": [
                    {
                        title: "Continuous Learning",
                        description: "Always exploring new technologies and approaches",
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