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

            // const response = await fetch(`${this.APIURLService.APIURL}/Education/v1/Education`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                "Educations": [
                    {
                        "Image": "/images/UoM-min.JPG",
                        "Name": "University of Moratuwa",
                        "Title": "MSc in Computer Science",
                        "Date": "Jan 2026 - March 2028 (Present)",
                        "Description": [
                        ]
                    },
                    {
                        "Image": "/images/UoB-min.JPG",
                        "Name": "University of Bedfordshire",
                        "Title": "BSc (Hons) Computer Science & Software Engineering",
                        "Date": "Sep 2023 - May 2024",
                        "Description": [
                            "Second Class, Upper Division"
                        ]
                    },
                    {
                        "Image": "/images/SCU-min.JPG",
                        "Name": "SLIIT City UNI",
                        "Title": "Higher Diploma in Information Technology",
                        "Date": "May 2021 - Jun 2023",
                        "Description": [
                            "Dean's List Award (GPA - 3.8 / 4.0) "
                        ]
                    },
                    {
                        "Image": "/images/SMC-min.JPG",
                        "Name": "St. Michael's College",
                        "Title": "High School",
                        "Date": "Jan 2006 - Aug 2019",
                        "Description": []
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
            console.error('Failed to Education: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}