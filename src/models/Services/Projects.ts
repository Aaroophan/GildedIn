import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export type ProjectHighlightIcon = "Layers3" | "ShieldCheck" | "Rocket"

export type ProjectLink = {
    Name: string
    Icon: string
    Href: string
}

export type ProjectRecord = {
    Image: string
    Name: string
    Links: ProjectLink[]
    Date: string
    Description: string
    Skills: string | string[]
}

export type ProjectLane = [
    title: string,
    description: string,
    projectNames: string[]
]

export type ProjectsResult = {
    Status: number
    Message: string
    User_Session_Token?: string
    Title?: string
    Description?: string
    Guidance?: string
    Highlights?: Array<{
        Title: string
        Description: string
        Icon: ProjectHighlightIcon
    }>
    Lanes?: ProjectLane[]
    Projects?: ProjectRecord[]
}

export class ProjectsService {
    private static instance: ProjectsService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()
    private readonly APIURLService: APIURLService

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): ProjectsService {
        if (!ProjectsService.instance) {
            ProjectsService.instance = new ProjectsService()
        }
        return ProjectsService.instance
    }

    public async Projects(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }
            
            const response = await fetch(`${this.APIURLService.APIURL}/api/projects`, {
                method: "POST",
                headers,
                body: JSON.stringify(requestData),
                cache: "no-store"
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.Message || data?.error || `Projects API request failed with status ${response.status}`)
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
            console.error('Failed to Projects: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}
