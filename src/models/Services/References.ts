import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class ReferenceService {
    private static instance: ReferenceService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): ReferenceService {
        if (!ReferenceService.instance) {
            ReferenceService.instance = new ReferenceService()
        }
        return ReferenceService.instance
    }

    public async Reference(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }

            // const response = await fetch(`${this.APIURLService.APIURL}/Reference/v1/Reference`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Title: "References",
                "References": [
                {
                    "Name": "Lasintha Ferdinando",
                    "Education": "FCMA (UK), FIB (SL), MBA (UOC), CCM (FASEC), CGMA, GSLID MSc - IT & Strategic innovation (UK)",
                    "Job": "Managing Director",
                    "Company": "JKSE Consultants",
                    "Phone": "+94 77 759 0523",
                    "Email": "lasintha@jkseconsultants.com"
                },
                {
                    "Name": "Aruni Samaraweera",
                    "Education": null,
                    "Job": "Project Manager",
                    "Company": "Alliance Finance Company PLC",
                    "Phone": "+94 77 477 3665",
                    "Email": "aruni@alliancefinance.lk"
                }
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
            console.error('Failed to Reference: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}