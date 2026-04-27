import { auth } from "@/../auth"
import { redirect } from "next/navigation"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"
export const revalidate = 0

type AnyRecord = Record<string, unknown>

function normalizeDoc(doc: AnyRecord): AnyRecord {
    const out: AnyRecord = {}

    for (const [key, value] of Object.entries(doc)) {
        if (key === "_id" || key === "ID" || key === "URL") {
            continue
        }

        if (value instanceof Date) {
            out[key] = value.toISOString()
            continue
        }

        // Best-effort serialization for Mongo types and Dates stored as objects.
        if (typeof value === "object" && value !== null) {
            const maybeToJSON = (value as { toJSON?: unknown }).toJSON
            if (typeof maybeToJSON === "function") {
                try {
                    out[key] = (maybeToJSON as () => unknown).call(value)
                    continue
                } catch {
                    // fall through
                }
            }
        }

        out[key] = value
    }

    return out
}

function safeId(path: string) {
    return `field_${path.replace(/[^a-zA-Z0-9_-]/g, "_")}`
}

function joinPath(parent: string, key: string) {
    return parent ? `${parent}.${key}` : key
}

function joinIndex(parent: string, index: number) {
    return `${parent}[${index+1}]`
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function PrimitiveField({ path, label, value }: { path: string, label: string, value: unknown }) {
    const id = safeId(path)

    if (value === null || value === undefined) {
        return (
            <div className="space-y-1">
                <label htmlFor={id} className="text-sm font-mono font-medium text-neutral-200">{label}</label>
                <input
                    id={id}
                    name={path}
                    defaultValue=""
                    placeholder="(null)"
                    className="w-full rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                />
            </div>
        )
    }

    if (typeof value === "string" || typeof value === "number") {
        if (typeof value === "string" && value.length > 75) {
            const rows = Math.min(12, Math.max(3, Math.ceil(value.length / 60)))
            return (
                <div className="space-y-1">
                    <label htmlFor={id} className="text-sm font-mono font-medium text-neutral-200">{label}</label>
                    <textarea
                        id={id}
                        name={path}
                        defaultValue={value}
                        rows={rows}
                        className="w-full resize-y rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100"
                    />
                </div>
            )
        }

        return (
            <div className="space-y-1">
                <label htmlFor={id} className="text-sm font-mono font-medium text-neutral-200">{label ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() : ""}</label>
                <input
                    id={id}
                    name={path}
                    defaultValue={String(value)}
                    className="w-full rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100"
                />
            </div>
        )
    }

    if (typeof value === "boolean") {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2">
                <input id={id} name={path} type="checkbox" defaultChecked={value} className="h-4 w-4 accent-neutral-200" />
                <label htmlFor={id} className="text-sm font-mono font-medium text-neutral-200">{label ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() : ""}</label>
            </div>
        )
    }

    return (
        <div className="space-y-1">
            <label htmlFor={id} className="text-sm font-mono font-medium text-neutral-200">{label ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() : ""}</label>
            <input
                id={id}
                name={path}
                defaultValue={String(value)}
                className="w-full rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100"
            />
        </div>
    )
}

function FieldNode({ path, label, value }: { path: string, label: string, value: unknown }) {
    if (Array.isArray(value)) {
        return (
            <div className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-8">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                    <div className="text-sm font-mono font-bold text-neutral-200">{label ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() : ""}</div>
                    <div className="text-xs text-neutral-500">{value.length} items</div>
                </div>

                {value.length === 0 ? (
                    <div className="text-xs text-neutral-500">(empty array)</div>
                ) : (
                    <div className="space-y-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {value.map((item, index) => (
                            <FieldNode
                                key={`${path}[${index}]`}
                                path={joinIndex(path, index + 1)}
                                label={(label ? label.replace(/#/g, "").trim().slice(0, -1) : "") + " #" + (index + 1)}
                                value={item}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (isRecord(value)) {
        const entries = Object.entries(value)
        return (
            <div className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-8">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                    <div className="text-sm font-mono font-bold text-neutral-200">{label ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() : ""}</div>
                    <div className="text-xs text-neutral-500">{entries.length} fields</div>
                </div>

                {entries.length === 0 ? (
                    <div className="text-xs text-neutral-500">(empty object)</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                        {entries.map(([key, child]) => (
                            <FieldNode key={key} path={joinPath(path, key)} label={key} value={child} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return <PrimitiveField path={path} label={label} value={value} />
}

function SectionCard({ title, data, missingMessage }: { title: string, data: AnyRecord | null, missingMessage?: string }) {
    return (
        <section className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-8">
            <header className="mb-4 flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-semibold text-neutral-100 font-oswald tracking-widest">{title}</h2>
                <span className="text-xs text-neutral-400">{data ? "Loaded" : "Missing"}</span>
            </header>

            {!data ? (
                <p className="text-sm text-neutral-400">{missingMessage ?? "No data found for this section."}</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                    {Object.entries(data).map(([key, value]) => (
                        <FieldNode key={key} path={key} label={key} value={value} />
                    ))}
                </div>
            )}
        </section>
    )
}

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if (!session.user.portfolioURL) {
        return (
            <main className="min-h-screen p-10">
                <h1 className="text-3xl font-bold">Portfolio not connected</h1>
                <p>Your Google account is logged in, but no portfolio is assigned yet.</p>
            </main>
        )
    }

    const portfolioURL = session.user.portfolioURL
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB ?? "User")

    const collections = {
        Hero: "Hero",
        About: "About",
        Projects: "Projects",
        Experience: "Experience",
        Education: "Education",
        Skills: "Skills",
        References: "References",
        Blog: "Blog",
        Contact: "Contact"
    } as const

    const docs = await Promise.all(
        Object.entries(collections).map(async ([key, collectionName]) => {
            const doc = await db.collection(collectionName).findOne({ URL: portfolioURL })
            return [key, doc ? normalizeDoc(doc as unknown as AnyRecord) : null] as const
        })
    )

    const dataBySection = Object.fromEntries(docs) as Record<keyof typeof collections, AnyRecord | null>

    return (
        <main className="min-h-screen p-6 text-neutral-100 md:p-10 mt-10">
            <div className="mx-auto mb-10 max-w-6xl">
                <div className="rounded-2xl p-6 shadow-sm">
                    <h1 className="text-4xl text-[var(--foreground)] font-bold font-oswald tracking-widest">
                        Welcome back, <span className="font-medium text-neutral-100">{session.user.name ?? session.user.email}</span>!
                    </h1>
                    <p className="mt-1 text-sm text-neutral-400">
                        Manage and preview your portfolio content
                    </p>
                    <div className="mt-4 text-sm text-neutral-300">
                        Signed in as{" "}
                        <span className="font-medium text-neutral-100">
                            {session.user.email ?? session.user.name}
                        </span>
                    </div>
                    <div className="mt-1 text-sm text-neutral-300">
                        Portfolio URL:{" "}
                        <span className="font-mono text-neutral-200">
                            /{portfolioURL}
                        </span>
                    </div>
                    <p className="mt-4 text-xs text-neutral-500">
                        This interface currently supports editing in the UI only (changes are not saved yet).
                        Complex data structures like objects and arrays are displayed as nested sections.
                    </p>
                </div>
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6">
                <SectionCard title="Hero" data={dataBySection.Hero} missingMessage="No Hero document found for this URL." />
                <SectionCard title="About" data={dataBySection.About} missingMessage="No About document found for this URL." />
                <SectionCard title="Projects" data={dataBySection.Projects} missingMessage="No Projects document found for this URL." />
                <SectionCard title="Experience" data={dataBySection.Experience} missingMessage="No Experience document found for this URL." />
                <SectionCard title="Education" data={dataBySection.Education} missingMessage="No Education document found for this URL." />
                <SectionCard title="Skills" data={dataBySection.Skills} missingMessage="No Skills document found for this URL." />
                <SectionCard title="References" data={dataBySection.References} missingMessage="No References document found for this URL." />
                <SectionCard title="Blog" data={dataBySection.Blog} missingMessage="No Blog document found for this URL." />
                <SectionCard title="Contact" data={dataBySection.Contact} missingMessage="No Contact document found for this URL." />
            </div>
        </main>
    )
}