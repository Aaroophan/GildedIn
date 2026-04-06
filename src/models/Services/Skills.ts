import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export type TechnologyHighlightIcon = "Layers3" | "ShieldCheck" | "Rocket"

export type TechnologySkill = [
    icon: string,
    name: string,
    description: string
]

export type TechnologyLane = [
    category: string,
    description: string,
    skills: TechnologySkill[]
]

export type SkillsResult = {
    Status: number
    Message: string
    User_Session_Token?: string
    Title?: string
    Description?: string
    Guidance?: string
    Highlights?: Array<{
        Title: string
        Description: string
        Icon: TechnologyHighlightIcon
    }>
    Skills?: TechnologyLane[]
}

export class SkillsService {
    private static instance: SkillsService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

    private constructor() {
        this.authService = AuthService.getInstance()
        this.messageService = MessageService.getInstance()
    }

    public static getInstance(): SkillsService {
        if (!SkillsService.instance) {
            SkillsService.instance = new SkillsService()
        }
        return SkillsService.instance
    }

    public async Skills(_name: string): Promise<SkillsResult> {
        try {
            void _name

            const data: SkillsResult = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Title: "Skills",
                Description: "A full-stack engineering ecosystem shaped around metadata-driven platforms, dynamic UI runtimes, and secure distributed integrations.",
                Guidance: "Follow the infinite stream to inspect each engineering lane, then hover a skill to reveal its role in the platform.",
                Highlights: [
                    {
                        Title: "Metadata-driven architecture",
                        Description: "Build configurable platforms where schemas, workflows, and admin surfaces are rendered from runtime data instead of hard-coded screens.",
                        Icon: "Layers3"
                    },
                    {
                        Title: "Secure transport layers",
                        Description: "Typed APIs and backend services that connect storage, identity, messaging, and third-party systems without losing observability.",
                        Icon: "ShieldCheck"
                    },
                    {
                        Title: "Delivery with confidence",
                        Description: "Automation-first engineering with CI, testing, deployment tooling, and feedback loops that keep changes reliable as products scale.",
                        Icon: "Rocket"
                    }
                ],
                Skills: [
                    [
                        "Experience Layer",
                        "Dynamic UI runtimes, workflow builders, and operator-facing interfaces that stay configurable without feeling generic.",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
                                "Next.js",
                                "Powers the app shell, routing, and server-client composition for portfolio and platform-facing experiences."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
                                "React",
                                "Drives reusable interactive components and runtime-rendered surfaces for complex UI flows."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                                "TypeScript",
                                "Keeps large frontends safe and navigable when interfaces are generated from metadata."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
                                "Tailwind CSS",
                                "Shapes fast-moving UI systems with consistent tokens, rapid iteration, and responsive control."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
                                "Redux Toolkit",
                                "Coordinates predictable client state for dynamic builders, forms, and admin tooling."
                            ],
                            [
                                "https://cdn.simpleicons.org/framer/0F73FF",
                                "Framer Motion",
                                "Adds intentional motion and feedback without sacrificing clarity in utility-driven interfaces."
                            ]
                        ]
                    ],
                    [
                        "Platform Core",
                        "Typed backend services and orchestration layers that turn configuration into reliable product behavior.",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg",
                                "ASP.NET Core",
                                "Builds the service layer behind configurable systems, messaging flows, and enterprise integrations."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
                                "C#",
                                "Implements strongly typed business logic and backend contracts for large application surfaces."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
                                "FastAPI",
                                "Supports lightweight Python services, automation endpoints, and AI-adjacent workflows."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
                                "Python",
                                "Used for integrations, automation, data-heavy utilities, and service-side experimentation."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
                                "Node.js",
                                "Handles supporting services and JavaScript tooling around full-stack product delivery."
                            ],
                            [
                                "https://cdn.simpleicons.org/openapiinitiative/0F73FF",
                                "OpenAPI",
                                "Keeps service contracts explicit so frontends, QA, and integrations move with fewer surprises."
                            ]
                        ]
                    ],
                    [
                        "Data and Messaging",
                        "Persistence, queues, and event flow across the parts of a system that need to stay in sync.",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
                                "SQL Server",
                                "Supports stored-procedure driven enterprise workflows and operational application data."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
                                "PostgreSQL",
                                "Provides relational depth for products that need robust querying and transactional safety."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
                                "MongoDB",
                                "Fits flexible content, document-heavy data, and rapidly evolving application models."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
                                "Redis",
                                "Speeds up stateful workflows with caching, fast lookups, and transient coordination."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rabbitmq/rabbitmq-original.svg",
                                "RabbitMQ",
                                "Moves events across distributed features so background processing stays reliable and observable."
                            ],
                            [
                                "https://cdn.simpleicons.org/socketdotio/0F73FF",
                                "Event Channels",
                                "Represents the real-time and asynchronous glue used to connect configurable product behavior."
                            ]
                        ]
                    ],
                    [
                        "Delivery and Quality",
                        "Tooling and automation that keep releases safe while preserving velocity across teams.",
                        [
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
                                "Docker",
                                "Packages services and supporting infrastructure into reproducible environments."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg",
                                "Jenkins",
                                "Automates CI pipelines so testing and shipping stay dependable as systems grow."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg",
                                "Selenium",
                                "Drives large-scale UI automation to catch regressions before they reach users."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
                                "GitHub",
                                "Anchors collaboration, reviews, and versioned delivery across codebases."
                            ],
                            [
                                "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
                                "Vercel",
                                "Deploys frontend experiences quickly with strong preview workflows and iteration speed."
                            ],
                            [
                                "https://cdn.simpleicons.org/render/0F73FF",
                                "Render",
                                "Supports pragmatic hosting for side projects, APIs, and proof-of-concept deployments."
                            ]
                        ]
                    ],
                    [
                        "Security and Integration",
                        "Identity, contracts, and trust boundaries that let enterprise systems talk safely to each other.",
                        [
                            [
                                "https://cdn.simpleicons.org/openid/0F73FF",
                                "OAuth / OIDC",
                                "Handles delegated identity flows and secure access boundaries across integrated systems."
                            ],
                            [
                                "https://cdn.simpleicons.org/jsonwebtokens/0F73FF",
                                "JWT",
                                "Encodes auth context and trusted claims between services and clients."
                            ],
                            [
                                "https://cdn.simpleicons.org/postman/0F73FF",
                                "Postman",
                                "Exercises and validates APIs quickly while refining contracts and edge cases."
                            ],
                            [
                                "https://cdn.simpleicons.org/swagger/0F73FF",
                                "Swagger",
                                "Documents endpoints so teams can move faster without losing clarity on request and response shape."
                            ],
                            [
                                "https://cdn.simpleicons.org/ngrok/0F73FF",
                                "Webhook Flows",
                                "Represents the signed callback and integration patterns used for external platform communication."
                            ],
                            [
                                "https://cdn.simpleicons.org/sentry/0F73FF",
                                "Observability",
                                "Captures what happened, where it failed, and how distributed flows behave in production."
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
            console.error('Failed to Skills: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}
