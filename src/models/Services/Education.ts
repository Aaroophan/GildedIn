import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class EducationService {
    private static instance: EducationService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): EducationService {
        if (!EducationService.instance) {
            EducationService.instance = new EducationService()
        }
        return EducationService.instance
    }

    public async Education(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }
            
            const response = await fetch(`${this.APIURLService.APIURL}/api/education`, {
                method: "POST",
                headers,
                body: JSON.stringify(requestData),
                cache: "no-store"
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.Message || data?.error || `Education API request failed with status ${response.status}`)
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
            console.error('Failed to Education: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}