import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class TechnologiesService {
    private static instance: TechnologiesService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
        this.APIURLService = APIURLService.getInstance()
    }

    public static getInstance(): TechnologiesService {
        if (!TechnologiesService.instance) {
            TechnologiesService.instance = new TechnologiesService()
        }
        return TechnologiesService.instance
    }

    public async Technologies(Name: string): Promise<any> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...this.authService.getUser()
            }

            const requestData = {
                Name: Name
            }

            // const response = await fetch(`${this.APIURLService.APIURL}/Technologies/v1/Technologies`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Title: "Skills & Technologies",
                "Technologies": [
                    [
                        "Programming Languages",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
                                "JS"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                                "TS"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
                                "C#"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
                                "Python"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg",
                                "SQL"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
                                "Java"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
                                "PHP"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
                                "HTML"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
                                "CSS"
                            ]
                        ]
                    ],
                    [
                        "Frameworks & Libraries",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
                                "Next.js"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                                "React"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
                                "FastAPI"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
                                "Node"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
                                "Express"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg",
                                ".NET"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
                                "Flask"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
                                "TailwindCSS"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-plain.svg",
                                "Bootstrap"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg",
                                "Selenium"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg",
                                "Three"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/serilog/serilog-original.svg",
                                "Serilog"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg",
                                "RabbitMQ"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jwt/jwt-original.svg",
                                "JWT"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oauth2/oauth2-original.svg",
                                "OAuth2"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webhooks/webhooks-original.svg",
                                "Webhooks"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg",
                                "MaterialUI"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/shadcn/shadcn-original.svg",
                                "ShadcnUI"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framer/framer-original.svg",
                                "Framer"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
                                "Redux"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/zustand/zustand-original.svg",
                                "Zustand"
                            ],
                        ]
                    ],
                    [
                        "Databases & Tools",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
                                "SQL"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
                                "MySQL"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
                                "PostgreSQL"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
                                "MongoDB"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg",
                                "Firebase"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
                                "Supabase"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg",
                                "Oracle"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg",
                                "SQLite"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
                                "Redis"
                            ]
                        ]
                    ],
                    [
                        "Development Tools",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg",
                                "Visual Studio"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
                                "VS Code"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg",
                                "Android Studio"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
                                "Figma"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
                                "Docker"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg",
                                "Jenkins"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
                                "Git"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
                                "GitHub"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
                                "Vercel"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/render/render-original.svg",
                                "Render"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg",
                                "Netlify"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
                                "GIT"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
                                "GitHub"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
                                "JIRA"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg",
                                "Trello"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openproject/openproject-original.svg",
                                "OpenProject"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/zendesk/zendesk-original.svg",
                                "Zendesk"
                            ]
                        ]
                    ],
                    [
                        "Machine Learning",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg",
                                "OpenAI"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/HuggingFace/HuggingFace-original.svg",
                                "HuggingFace"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
                                "PyTorch"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg",
                                "Pandas"
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
                                "NumPy"
                            ]
                        ]
                    ],
                    [
                        "Design and Multimedia",
                        [
                        [
                            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg",
                            "PhotoShop"
                        ],
                        [
                            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg",
                            "Illustrator"
                        ],
                        [
                            "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-plain.svg",
                            "After Effects"
                        ]
                        ]
                    ]
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
            console.error('Failed to Technologies: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}