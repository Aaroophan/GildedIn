import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class HeroService {
    private static instance: HeroService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): HeroService {
        if (!HeroService.instance) {
            HeroService.instance = new HeroService()
        }
        return HeroService.instance
    }

    public async Hero(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }

            // const response = await fetch(`${this.APIURLService.APIURL}/Hero/v1/Hero`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                "Image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBwb3J0Zm9saW8lMjBiYWNrZ3JvdW5kJTIwdGVjaHxlbnwwfHx8fDE3NDg1MTMxNzB8MA&ixlib=rb-4.1.0",
                "Greeting": "I'm",
                "Name": "Aaroophan Varatharajan",
                "Tags": [
                    "Animation Enthusiast",
                    "Full Stack Developer",
                    "Associate Software Engineer",
                    "MSc in Computer Science",
                    "Next.js, React, JavaScript/TypeScript",
                    "Node, Python (FastAPI), C# (.NET)",
                    "SQL, PostgreSQL, MongoDB",
                    "Agile Team Player"
                ],
                "Links": [
                    {
                        "Name": "Instagram",
                        "Icon": "Instagram",
                        "Href": "https://www.instagram.com/aaroophan/?theme=dark"
                    },
                    {
                        "Name": "LinkedIn",
                        "Icon": "Linkedin",
                        "Href": "https://www.linkedin.com/in/aaroophan/"
                    },
                    {
                        "Name": "GitHub",
                        "Icon": "Github",
                        "Href": "https://github.com/Aaroophan"
                    },
                    {
                        "Name": "Email",
                        "Icon": "Mail",
                        "Href": "mailto:arophn@gmail.com"
                    },
                    {
                        "Name": "Phone",
                        "Icon": "Phone",
                        "Href": "https://wa.me/+94768505131"
                    },
                    {
                        "Name": "Resume",
                        "Icon": "FileText",
                        "Href": "https://docs.google.com/document/d/1DfQIxQo6b5PwLa1kKXoS7bUM2pUMsKIY5_GTlorXpzk/edit?usp=sharing"
                    }
                ],
                "Backgrounds": [
                    "/images/BG_1-min.JPG",
                    "/images/BG_2-min.JPG",
                    "/images/BG_3-min.JPG",
                    "/images/BG_4-min.JPG",
                    "/images/BG_5-min.JPG",
                    "/images/BG_6-min.JPG",
                    "/images/BG_7-min.JPG",
                    "/images/BG_8-min.JPG",
                    "/images/BG_9-min.JPG",
                    "/images/BG_10-min.JPG",
                    "/images/BG_11-min.mp4"
                ],
                "Images": [
                    // "/images/Profile_1-min.JPG",
                    // "/images/Profile_2-min.JPG",
                    // "/images/Profile_3-min.JPG",
                    // "/images/Profile_4-min.JPG",
                    // "/images/Profile_5-min.JPG",
                    // "/images/Profile_6-min.JPG",
                    // "/images/Profile_3-min.JPG",
                    // "/images/Profile_4-min.JPG",
                    // "/images/Profile_5-min.JPG",
                    // "/images/Profile_6-min.JPG",
                    // "/images/BG_11-min.mp4",
                    "/images/Profile_8-min.mp4",
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
            console.error('Failed to Hero: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}