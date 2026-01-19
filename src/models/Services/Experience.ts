import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class ExperienceService {
    private static instance: ExperienceService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): ExperienceService {
        if (!ExperienceService.instance) {
            ExperienceService.instance = new ExperienceService()
        }
        return ExperienceService.instance
    }

    public async Experience(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }

            // const response = await fetch(`${this.APIURLService.APIURL}/Experience/v1/Experience`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Title: "Career Timeline",
                "Experiences": [
                    {
                        "Image": "/images/MDZ_logo-min.JPG",
                        "Title": "Software Engineer",
                        "Company": "M Data Zone (PVT) LTD",
                        "JobType": "Full-time",
                        "Location": "Colombo, Western Province, Sri Lanka",
                        "LocationType": "On-site (US Hours)",
                        "Date": "September 2025 - Present",
                        "Description": [
                            "Building a metadata-driven multi-channel marketing and admin platform using Next.js, ASP.NET Core, SQL Server, and Jenkins CI/CD, powering brand management, deep-linking, analytics, and user/role governance.",
                            "Designed and implemented a dynamic CRUD grid framework in the Next.js App Router where a single generic route renders multiple screens from backend metadata, eliminating one-off pages and accelerating feature delivery.",
                            "Developed a configurable, backend-driven, permission-aware UI with advanced table interactions including column resizing, drag-to-reorder, search, and filtering boosting admin productivity and reducing deployment churn.",
                            "Built and extended the .NET API layer with stored-procedure-driven endpoints, cross-cutting middleware (logging, no-cache, error tracing), rotating-token authentication, Twilio/TOTP-based 2FA, and an HMAC-signed webhook dispatcher/receiver.",
                            "Implemented new services within a distributed multi-service event pipeline: Push API, Deeplink API, RabbitMQ publishing with dead-letter handling, and enhanced observability via rotating Serilog logs and DB-backed sinks."
                        ]
                    },
                    {
                        "Image": "/images/MDZ_logo-min.JPG",
                        "Title": "Associate Software Engineer",
                        "Company": "M Data Zone (PVT) LTD",
                        "JobType": "Full-time",
                        "Location": "Colombo, Western Province, Sri Lanka",
                        "LocationType": "On-site (US Hours)",
                        "Date": "September 2024 - September 2025",
                        "Description": [
                            "Authored 100+ T-SQL queries and database objects with constraints and DB Mail notifications, improving data quality signals and reducing rework.",
                            "Troubleshot and resolved database issues using T-SQL, constraints, and defensive parsing reducing data-related downtime by ~20%.",
                            "Built 3 .NET Core CLI apps with Selenium for automated group/single test runs, screenshots, and logs cutting repeat manual effort by ~70%.",
                            "Automated 1000+ end-to-end UI scenarios with resilient selectors, enabling overnight suites and improving triage with evidence-rich artifacts.",
                            "Performed manual QA across 6+ projects (feature & regression), improving defect detection and reducing escaped bugs by ~30%.",
                            "Led onboarding for 2 employees through code walkthroughs, documentation, and demo suites reducing ramp-up time by ~40% within 4 weeks.",
                            "Documented software and database designs for 3+ system areas, improving cross-team collaboration and onboarding efficiency.",
                            "Collaborated across time zones with teams in Canada, US, and Sri Lanka on release planning, QA handoffs, and DB changes.",
                            "Managed 20+ Zendesk tickets weekly (triage, client communication, routing), improving response and resolution metrics by ~35%."
                        ]
                    },
                    {
                        "Image": "/images/afcplc_logo-min.JPG",
                        "Title": "Intern Software Engineer",
                        "Company": "Alliance Finance Company PLC",
                        "JobType": "Internship",
                        "Location": "Colombo, Western Province, Sri Lanka",
                        "LocationType": "On-site",
                        "Date": "Nov 2023 - Sep 2024",
                        "Description": [
                            "Developed and hosted a MERN stack application for report generation used by 5 departments, integrating Lime’s MongoDB and Finacle’s PostgreSQL.",
                            "Ensured data integrity by writing PostgreSQL and MongoDB scripts to validate backend data from Finacle against in-bank systems.",
                            "Performed manual testing on 40+ core-banking workflows including Customers, Savings, and Fixed Deposits, ensuring functional stability.",
                            "Created 500+ test cases and detailed QA documentation covering both predefined and new Lime workflows.",
                            "Identified, documented, and reported 30+ workflow bugs via JIRA performed regression testing after system updates.",
                            "Developed a sanction list module with database lookups and validation scripts collaborated with Legal & Compliance on risk score security setups.",
                            "Conducted UAT training sessions for 200+ users across AFC branches and provided continuous support post-deployment.",
                            "Trained 2 interns using customized guides and practical exercises reducing onboarding time by ~80%."
                        ]
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
            console.error('Failed to Experience: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}