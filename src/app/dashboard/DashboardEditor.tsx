"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
type JsonObject = { [key: string]: JsonValue }
type SectionData = Record<string, JsonValue>

type SectionConfig = {
    id: string
    title: string
    data: SectionData | null
    missingMessage: string
}

type DashboardEditorProps = {
    portfolioURL: string
    userName?: string | null
    userEmail?: string | null
    sections: SectionConfig[]
}

function deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T
}

function formatLabel(label: string) {
    return label
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function safeId(path: string) {
    return `field_${path.replace(/[^a-zA-Z0-9_-]/g, "_")}`
}

function pathToString(path: Array<string | number>) {
    return path.reduce<string>((output, segment) => {
        if (typeof segment === "number") {
            return `${output}[${segment}]`
        }

        return output ? `${output}.${segment}` : String(segment)
    }, "")
}

function isRecord(value: JsonValue): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function setValueAtPath(
    current: JsonValue,
    path: Array<string | number>,
    nextValue: JsonValue
): JsonValue {
    if (path.length === 0) {
        return nextValue
    }

    const [head, ...rest] = path

    if (Array.isArray(current) && typeof head === "number") {
        return current.map((item, index) => {
            if (index !== head) {
                return item
            }

            return setValueAtPath(item, rest, nextValue)
        })
    }

    if (isRecord(current) && typeof head === "string") {
        return {
            ...current,
            [head]: setValueAtPath(current[head], rest, nextValue)
        }
    }

    return current
}

function appendValueAtPath(
    current: JsonValue,
    path: Array<string | number>,
    nextValue: JsonValue
): JsonValue {
    if (path.length === 0) {
        return Array.isArray(current) ? [...current, nextValue] : current
    }

    const [head, ...rest] = path

    if (Array.isArray(current) && typeof head === "number") {
        return current.map((item, index) => {
            if (index !== head) {
                return item
            }

            return appendValueAtPath(item, rest, nextValue)
        })
    }

    if (isRecord(current) && typeof head === "string") {
        return {
            ...current,
            [head]: appendValueAtPath(current[head], rest, nextValue)
        }
    }

    return current
}

function createEmptyValueFromTemplate(template: JsonValue): JsonValue {
    if (template === null) {
        return ""
    }

    if (typeof template === "string") {
        return ""
    }

    if (typeof template === "number") {
        return 0
    }

    if (typeof template === "boolean") {
        return false
    }

    if (Array.isArray(template)) {
        return template.map((item) => {
            if (Array.isArray(item)) {
                return []
            }

            return createEmptyValueFromTemplate(item)
        })
    }

    return Object.fromEntries(
        Object.entries(template).map(([key, value]) => [key, createEmptyValueFromTemplate(value)])
    )
}

function PrimitiveField({
    path,
    label,
    value,
    onChange
}: {
    path: Array<string | number>
    label: string
    value: JsonPrimitive
    onChange: (path: Array<string | number>, value: JsonValue) => void
}) {
    const inputId = safeId(pathToString(path))

    if (typeof value === "boolean") {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--mono-4)]/50 px-4 py-3">
                <input
                    id={inputId}
                    type="checkbox"
                    checked={value}
                    onChange={(event) => onChange(path, event.target.checked)}
                    className="h-4 w-4 accent-[var(--mono-4)]"
                />
                <label htmlFor={inputId} className="text-sm font-mono font-medium text-neutral-200">
                    {formatLabel(label)}
                </label>
            </div>
        )
    }

    if (typeof value === "number") {
        return (
            <div className="space-y-1">
                <label htmlFor={inputId} className="text-sm font-mono font-medium text-neutral-200">
                    {formatLabel(label)}
                </label>
                <input
                    id={inputId}
                    type="number"
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(event) => onChange(path, Number(event.target.value))}
                    className="w-full rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100"
                />
            </div>
        )
    }

    const stringValue = value ?? ""
    if (typeof stringValue === "string" && stringValue.length > 75) {
        const rows = Math.min(12, Math.max(3, Math.ceil(stringValue.length / 60)))
        return (
            <div className="space-y-1">
                <label htmlFor={inputId} className="text-sm font-mono font-medium text-neutral-200">
                    {formatLabel(label)}
                </label>
                <textarea
                    id={inputId}
                    value={stringValue}
                    onChange={(event) => onChange(path, event.target.value)}
                    rows={rows}
                    className="w-full resize-y rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100"
                />
            </div>
        )
    }

    return (
        <div className="space-y-1">
            <label htmlFor={inputId} className="text-sm font-mono font-medium text-neutral-200">
                {formatLabel(label)}
            </label>
            <input
                id={inputId}
                value={String(stringValue)}
                onChange={(event) => onChange(path, event.target.value)}
                placeholder={value === null ? "(null)" : undefined}
                className="w-full rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
            />
        </div>
    )
}

function FieldNode({
    path,
    label,
    value,
    onChange,
    onAddArrayItem
}: {
    path: Array<string | number>
    label: string
    value: JsonValue
    onChange: (path: Array<string | number>, value: JsonValue) => void
    onAddArrayItem: (path: Array<string | number>, template: JsonValue[]) => void
}) {
    if (Array.isArray(value)) {
        return (
            <div className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-6">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                    <div>
                        <div className="text-sm font-mono font-bold text-neutral-200">{formatLabel(label)}</div>
                        <div className="mt-1 text-xs text-neutral-500">{value.length} items</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onAddArrayItem(path, value)}
                        className="rounded-full border border-[var(--mono-4)]/50 px-3 py-1 text-xs font-medium text-neutral-100 transition-colors hover:bg-[var(--mono-4)]/10"
                    >
                        Add Item
                    </button>
                </div>

                {value.length === 0 ? (
                    <div className="text-xs text-neutral-500">(empty array - add the first item to start this list)</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                        {value.map((item, index) => (
                            <FieldNode
                                key={pathToString([...path, index])}
                                path={[...path, index]}
                                label={`${label} #${index + 1}`}
                                value={item}
                                onChange={onChange}
                                onAddArrayItem={onAddArrayItem}
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
            <div className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-6">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                    <div className="text-sm font-mono font-bold text-neutral-200">{formatLabel(label)}</div>
                    <div className="text-xs text-neutral-500">{entries.length} fields</div>
                </div>

                {entries.length === 0 ? (
                    <div className="text-xs text-neutral-500">(empty object)</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {entries.map(([key, child]) => (
                            <FieldNode
                                key={pathToString([...path, key])}
                                path={[...path, key]}
                                label={key}
                                value={child}
                                onChange={onChange}
                                onAddArrayItem={onAddArrayItem}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <PrimitiveField
            path={path}
            label={label}
            value={value}
            onChange={onChange}
        />
    )
}

function SectionEditor({
    id,
    title,
    data,
    missingMessage
}: SectionConfig) {
    const [savedData, setSavedData] = useState<SectionData | null>(() => (data ? deepClone(data) : null))
    const [draftData, setDraftData] = useState<SectionData | null>(() => (data ? deepClone(data) : null))
    const [isSaving, setIsSaving] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const isDirty = JSON.stringify(savedData) !== JSON.stringify(draftData)

    function handleChange(path: Array<string | number>, value: JsonValue) {
        if (!draftData) {
            return
        }

        setDraftData((current) => {
            if (!current) {
                return current
            }

            return setValueAtPath(current, path, value) as SectionData
        })
        setStatusMessage("")
        setErrorMessage("")
    }

    function handleAddArrayItem(path: Array<string | number>, template: JsonValue[]) {
        if (!draftData) {
            return
        }

        const newItem = template.length > 0
            ? createEmptyValueFromTemplate(template[0])
            : ""

        setDraftData((current) => {
            if (!current) {
                return current
            }

            return appendValueAtPath(current, path, newItem) as SectionData
        })
        setStatusMessage("")
        setErrorMessage("")
    }

    async function handleSave() {
        if (!draftData) {
            return
        }

        setIsSaving(true)
        setStatusMessage("")
        setErrorMessage("")

        try {
            const response = await fetch(`/api/dashboard/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(draftData)
            })

            const result = await response.json().catch(() => null)

            if (!response.ok) {
                setErrorMessage(result?.Message ?? `Failed to save ${title}`)
                return
            }

            const nextSaved = deepClone(draftData)
            setSavedData(nextSaved)
            setDraftData(nextSaved)
            setStatusMessage(result?.Message ?? `${title} saved`)
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : `Failed to save ${title}`)
        } finally {
            setIsSaving(false)
        }
    }

    function handleCancel() {
        setDraftData(savedData ? deepClone(savedData) : null)
        setStatusMessage("")
        setErrorMessage("")
    }

    return (
        <section className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-8">
            <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-2xl font-oswald font-semibold tracking-widest text-neutral-100">{title}</h2>
                    <p className="mt-1 text-xs text-neutral-400">
                        {draftData ? (isDirty ? "Unsaved changes" : "Saved") : "Missing"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={!isDirty || isSaving || !draftData}
                        className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!isDirty || isSaving || !draftData}
                        className="rounded-full border border-[var(--mono-4)]/60 bg-[var(--mono-4)]/10 px-4 py-2 text-sm font-medium text-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </header>

            {!draftData ? (
                <p className="text-sm text-neutral-400">{missingMessage}</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {Object.entries(draftData).map(([key, value]) => (
                        <FieldNode
                            key={key}
                            path={[key]}
                            label={key}
                            value={value}
                            onChange={handleChange}
                            onAddArrayItem={handleAddArrayItem}
                        />
                    ))}
                </div>
            )}

            {(statusMessage || errorMessage) && (
                <p className={`mt-4 text-sm ${errorMessage ? "text-red-400" : "text-emerald-400"}`}>
                    {errorMessage || statusMessage}
                </p>
            )}
        </section>
    )
}

export default function DashboardEditor({
    portfolioURL,
    userName,
    userEmail,
    sections
}: DashboardEditorProps) {
    return (
        <main className="min-h-screen px-6 py-10 text-neutral-100 md:px-10">
            <div className="mx-auto my-10 max-w-7xl">
                <div className="rounded-3xl p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-4xl font-oswald font-bold tracking-[0.2em] text-[var(--foreground)]">
                                Welcome back, {userName ?? "User"}!
                            </h1>
                            <p className="mt-3 text-sm text-neutral-300">
                                Signed in as <span className="font-medium text-[var(--foreground)]">{userEmail ?? userName}</span>
                            </p>
                            <p className="mt-1 text-sm text-neutral-300">
                                Portfolio URL: <span className="font-mono text-[var(--foreground)]">/{portfolioURL}</span>
                            </p>
                            <p className="mt-3 max-w-2xl text-xs leading-6 text-mono-4/75">
                                Each section saves independently. Cancel restores the last saved version for that section only.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="self-start rounded-full border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-100 transition-colors hover:border-[var(--mono-4)]/60 hover:bg-[var(--mono-4)]/10"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6">
                {sections.map((section) => (
                    <SectionEditor
                        key={section.id}
                        id={section.id}
                        title={section.title}
                        data={section.data}
                        missingMessage={section.missingMessage}
                    />
                ))}
            </div>
        </main>
    )
}
