import { APIURLService } from "./API"
import { AuthService } from "./Auth"
import { MessageService } from "./Messages"

export class ProjectsService {
    private static instance: ProjectsService
    private readonly APIURLService: APIURLService
    private readonly authService: AuthService
    private readonly messageService = MessageService.getInstance()

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

            // const response = await fetch(`${this.APIURLService.APIURL}/Projects/v1/Projects`, {
            //     method: "POST",
            //     headers: headers,
            //     body: JSON.stringify(requestData),
            // })

            // const data = await response.json()

            const data = {
                Status: 200,
                Message: "",
                User_Session_Token: "User_Session_Token",
                Title: "Personal Projects Archive",
                "Projects": [
                    {
                        "Image": "/images/HarkBase-min.JPG",
                        "Name": "Harkbase",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://harkbase.onrender.com"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/HarkBase"
                        }
                        ],
                        "Date": "July 2025",
                        "Description": "DBaaS platform that provisions isolated SQLite databases with REST APIs for rapid prototyping.Supports dynamic schema, optional JWT authentication, Google Drive persistence, audit logs, input validation, and quota monitoring.",
                        "Technologies": "FastAPI, Python, SQLite, Pydantic, Google Drive API "
                    },
                    {
                        "Image": "/images/OneWorkLoc-min.JPG",
                        "Name": "OneWorkLoc",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://OneWorkLoc.vercel.app"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/OneWorkLoc"
                        }
                        ],
                        "Date": "June 2025",
                        "Description": "Built a modern web application for encoding and sharing text, code, JSON, and diagrams through compact, versioned URLs. Enabled real-time content compression, syntax-highlighted code sharing, and diagram visualization—all accessible via shareable links without requiring user accounts or backend infrastructure. Focused on developer experience, responsive UI, and multi-format content support.",
                        "Technologies": "Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI, Lucide, custom URL encoding, localStorage"
                    },
                    {
                        "Image": "/images/SkrinePlae-min.JPG",
                        "Name": "SkrinePlae",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://skrineplae.vercel.app"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/SkrinePlae"
                        }
                        ],
                        "Date": "June 2025",
                        "Description": "Built a modern, web-based screenwriting application with industry-standard formatting and a rich, interactive editor. Enabled users to create, edit, and manage multiple screenplays with persistent local storage, keyboard navigation, responsive design, and customizable theming. Focused on usability, professional formatting, and a seamless experience across devices—all without a backend.",
                        "Technologies": "React, Next.js, TypeScript, Tailwind CSS, Radix UI, Lucide, localStorage, GitHub"
                    },
                    {
                        "Image": "/images/anaphora-min.JPG",
                        "Name": "anaphora",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://aaroophan.dev"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/GildedIn"
                        }
                        ],
                        "Date": "June 2025",
                        "Description": "Developed a fully customizable, data-driven portfolio system where each user has a unique URL and personalized content. Enabled real-time content updates, interactive animations, responsive layouts, and 3D visual elements—all without requiring code changes. Prioritized performance, accessibility, and seamless user experience across devices.",
                        "Technologies": "Next.js, TypeScript, Tailwind, Framer-Motion, Redux, GitHub"
                    },
                    {
                        "Image": "/images/Tic-Tac-Bot-min.JPG",
                        "Name": "Tic-Tac-Bot",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://aaroophan.github.io/Tic-Tac-Bot/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/Tic-Tac-Bot"
                        }
                        ],
                        "Date": "May 2025",
                        "Description": "Designed a strategy-driven Tic Tac Toe platform featuring Classic, Super, and Continuous game modes with AI opponents, adaptive difficulty, and AI vs AI simulations. Included innovative mechanics like decision-tree visualizations, interactive tutorials, and persistent play through dynamic board updates. Prioritized user engagement with responsive UI, intuitive controls, and a polished gameplay experience.",
                        "Technologies": "React, TypeScript, Tailwind, Framer-Motion, GitHub"
                    },
                    {
                        "Image": "/images/Grid-ify-min.JPG",
                        "Name": "Grid-ify",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://aaroophan.github.io/Grid-ify/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/Grid-ify"
                        }
                        ],
                        "Date": "May 2025",
                        "Description": "Built an interactive 3D spatial data editor that lets users input and visualize coordinates in real time. Designed a seamless experience where data entry (via a spreadsheet-style interface or raw input) instantly reflects in a dynamic 3D scene with support for point, line, and vector render modes. Enabled full control over axis naming, graph scaling, and scene manipulation, tailored for educators, engineers, and designers working with spatial data.",
                        "Technologies": "React, TypeScript, Tailwind, Framer-Motion Three, Zod, GitHub"
                    },
                    {
                        "Image": "/images/SVG-ify-min.JPG",
                        "Name": "SVG-ify",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://aaroophan.github.io/SVG-ify/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/SVG-ify"
                        }
                        ],
                        "Date": "May 2025",
                        "Description": "Built an API that converts text into clean, scalable SVGs with individual path elements per character. Enabled real-time font selection from web-safe and Google Fonts, with customizable styling, spacing, and persistent font preferences. Designed for easy integration into design tools with graceful fallbacks and high-quality vector output.",
                        "Technologies": "React, TypeScript, Tailwind, FastAPI, Python, GitHub"
                    },
                    {
                        "Image": "/images/PixelPainter-min.JPG",
                        "Name": "PixelPainter",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://aaroophan.github.io/PixelPainter/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/PixelPainter"
                        }
                        ],
                        "Date": "May 2025",
                        "Description": "Created an interactive web app for designing customizable pixel art icons using a grid-based editor. Enabled features like zoom, undo/redo, fill/erase tools, and export options for clean SVG files or React-ready JSX/TSX code. Included advanced customization (color palettes, stroke/size options), responsive UI, and local save/load functionality for a seamless design workflow.",
                        "Technologies": "React, TypeScript, Tailwind, GitHub"
                    },
                    {
                        "Image": "/images/AFCLOD-min.JPG",
                        "Name": "AFC's LOD Web Application",
                        "Links": [],
                        "Date": "Jul 2024 - Jul 2024",
                        "Description": "Developed and implemented a new Letter of Demand (LOD) Web Application for Alliance Finance PLC's LIME banking solution in just one day using the MERN Stack and PostgreSQL. This secondary MERN Stack application integrates with Lime's MongoDB and Finacle's PostgreSQL databases to generate LOD issued details. The Audit and Legal teams use it to input parameters and produce a comprehensive LOD posting list in PDF format for their daily tasks.",
                        "Technologies": "JavaScript, MongoDB, Express, React, Node, PostgreSQL, Bootstrap, Mongoose"
                    },
                    {
                        "Image": "/images/MT-min.JPG",
                        "Name": "Mend-Tale-Game",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://mend-tale-game.onrender.com/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/Mend-Tale-Game"
                        },
                        {
                            "Name": "Demo",
                            "Icon": "play-circle",
                            "Href": "https://mend-tale-game.onrender.com/"
                        }
                        ],
                        "Date": "Dec 2023 - Apr 2024",
                        "Description": "The idea of MendTale is to develop a text-based adventure game website that analyses user's mood by utilizing machine learning and provide feedback through storytelling using Natural Language Processing to promote a sense of emotional-awareness among its users. By combining gaming, personal journaling, machine learning, and storytelling, users will be encouraged to interact with the platform regularly, turning this emotional-awareness promotion into an enjoyable and informative experience.",
                        "Technologies": "JavaScript, Python, MongoDB, Express, React, Node, Flask, PyTorch, OpenAI, Bootstrap, Mongoose, GitHub"
                    },
                    {
                        "Image": "/images/Dom-min.JPG",
                        "Name": "CIS-Domeytoe-Game",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://cis-domeytoe-game.onrender.com/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/CIS-Domeytoe-Game"
                        },
                        {
                            "Name": "Demo",
                            "Icon": "play-circle",
                            "Href": "https://www.youtube.com/watch?v=Q0trwCC5dgE"
                        }
                        ],
                        "Date": "Oct 2023 - Dec 2023",
                        "Description": "Developed the game 'Domeytoe' in MERN Stack to use the 'Tomato' API. This Computer Integrated Systems module assignment asks to reflect on various concepts, paradigms and architectures related to Software Development. Software design principles, event-driven programming, interoperability, and virtual identity.",
                        "Technologies": "JavaScript, MongoDB, Express, React, Node, Bootstrap, Mongoose, GitHub"
                    },
                    {
                        "Image": "/images/LocDev-min.JPG",
                        "Name": "LocDev",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://loc-dev-assessment.onrender.com/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/loc-dev-assessment"
                        }
                        ],
                        "Date": "Apr 2024 - Apr 2024",
                        "Description": "This one day project manages locations that control multiple devices, with a REST service and user interfaces for storing and displaying information about these locations and their associated devices. All data is securely stored in a MongoDB database.",
                        "Technologies": "JavaScript, MongoDB, Express, React, Node, Bootstrap, Mongoose, GitHub"
                    },
                    {
                        "Image": "/images/ML-min.JPG",
                        "Name": "MovieList",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://3d2y-genin-com.stackstaging.com/"
                        }
                        ],
                        "Date": "Jun 2023 - Jun 2023",
                        "Description": "Developed a movie database website as a project to enhance my React skills. The website includes various functions such as the Home Page, Movie Page, Series Page, Search, Theme, Sign in, Sign up, Watchlist, Watch History, Dashboard, Profile, Edit Profile.",
                        "Technologies": "HTML, JavaScript, CSS, SQL, PHP, VS Code, React, MySQL, phpMyAdmin, Bootstrap, GitHub"
                    },
                    {
                        "Image": "/images/EveryMoveProgress-min.JPG",
                        "Name": "EveryMove",
                        "Links": [
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/NeroBrutal/EveryMoveApp"
                        }
                        ],
                        "Date": "May 2023 - May 2023",
                        "Description": "Developed 'Progress' function of a fitness nutrition tracking android app for a gym's members as a group project for Higer Diploma in Information Technology. The Progress function combines progress tracking, chart visualization, data saving, and post management.",
                        "Technologies": "Java, XML, Studio, Firebase, GitHub"
                    },
                    {
                        "Image": "/images/BB1-min.JPG",
                        "Name": "BaratieBakery",
                        "Links": [
                        {
                            "Name": "Link",
                            "Icon": "link",
                            "Href": "https://baratiebakery-asv.stackstaging.com/"
                        },
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/BaratieBakery"
                        }
                        ],
                        "Date": "Nov 2022 - Dec 2022",
                        "Description": "Developed an e-commerce website for a model bakery as a project for Higher Diploma in Information Technology. The website includes various pages such as the Home Page, Product Page, Search, Sign in, Sign up, Cart, Checkout Bill, Order History, Dashboard, Profile, Edit Profile, Admin Product Page (with options to Edit, Delete, and set Availability, exclusive to administrators), and Admin Add Product.",
                        "Technologies": "HTML, CSS, JavaScript, jQuery, SQL, PHP, DreamWeaver, MySQL, phpMyAdmin, GitHub"
                    },
                    {
                        "Image": "/images/2D-min.JPG",
                        "Name": "2D Animation Short",
                        "Links": [
                        {
                            "Name": "Demo",
                            "Icon": "play-circle",
                            "Href": "https://www.youtube.com/watch?v=Q0trwCC5dgE"
                        }
                        ],
                        "Date": "Nov 2022 - Nov 2022",
                        "Description": "This is a 2D animation short video I animated as a part for a group project for Interactive Design Concepts & Practices module for Higer Diploma in Information Technology.",
                        "Technologies": "Adobe Illustrator, After Effects"
                    },
                    {
                        "Image": "/images/TT-min.JPG",
                        "Name": "TimeTicker",
                        "Links": [
                        {
                            "Name": "GitHub",
                            "Icon": "github",
                            "Href": "https://github.com/Aaroophan/PaperClips"
                        }
                        ],
                        "Date": "May 2022 - Jun 2022",
                        "Description": "Developed a Java Swing application for a watch sales and repair shop. Implemented features for managing watch sales invoices, watch repair jobs, spare parts, and part suppliers. Developed functionality for allocating employees to repair jobs and generating monthly income and expense reports. Integrated ability to send notifications to suppliers when parts are out of stock and to customers when repair job is completed via email.",
                        "Technologies": "Java, NetBeans IDE, MySQL, phpMyAdmin, GitHub"
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
            console.error('Failed to Projects: ', e)
            this.messageService.setMessage(500, e instanceof Error ? e.message : "Unexpected error")
            return {
                Status: 500,
                Message: `500 - Internal Server Error${e instanceof Error && e.message ? '\n' + e.message : ''}`
            }
        }
    }
}