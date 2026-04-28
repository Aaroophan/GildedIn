"use client"

import { useRef, useState, type ReactNode } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { GripVertical } from "lucide-react"
import { signOut } from "next-auth/react"
import {
    createArrayItemTemplate,
    normalizePortfolioURLInput,
    type DashboardSectionId,
    type JsonPrimitive,
    type JsonValue,
    type JsonObject,
    type SectionData
} from "./sectionTemplates"

type SectionConfig = {
    id: DashboardSectionId
    title: string
    data: SectionData
    missingMessage: string
}

type DashboardEditorProps = {
    portfolioURL: string
    hasPortfolio: boolean
    userName?: string | null
    userEmail?: string | null
    sections: SectionConfig[]
}

type ArrayDragItem = {
    arrayPathKey: string
    index: number
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

function removeValueAtPath(
    current: JsonValue,
    path: Array<string | number>
): JsonValue {
    if (path.length === 0) {
        return current
    }

    const [head, ...rest] = path

    if (Array.isArray(current) && typeof head === "number") {
        if (rest.length === 0) {
            return current.filter((_, index) => index !== head)
        }

        return current.map((item, index) => {
            if (index !== head) {
                return item
            }

            return removeValueAtPath(item, rest)
        })
    }

    if (isRecord(current) && typeof head === "string") {
        return {
            ...current,
            [head]: removeValueAtPath(current[head], rest)
        }
    }

    return current
}

function moveValueAtPath(
    current: JsonValue,
    path: Array<string | number>,
    fromIndex: number,
    toIndex: number
): JsonValue {
    if (path.length === 0) {
        if (!Array.isArray(current) || fromIndex === toIndex) {
            return current
        }

        if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= current.length ||
            toIndex >= current.length
        ) {
            return current
        }

        const next = [...current]
        const [movedItem] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, movedItem)
        return next
    }

    const [head, ...rest] = path

    if (Array.isArray(current) && typeof head === "number") {
        return current.map((item, index) => {
            if (index !== head) {
                return item
            }

            return moveValueAtPath(item, rest, fromIndex, toIndex)
        })
    }

    if (isRecord(current) && typeof head === "string") {
        return {
            ...current,
            [head]: moveValueAtPath(current[head], rest, fromIndex, toIndex)
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

function SortableArrayItem({
    arrayPath,
    index,
    label,
    onMove,
    onRemove,
    children
}: {
    arrayPath: Array<string | number>
    index: number
    label: string
    onMove: (arrayPath: Array<string | number>, fromIndex: number, toIndex: number) => void
    onRemove: (path: Array<string | number>) => void
    children: ReactNode
}) {
    const arrayPathKey = pathToString(arrayPath)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const [{ isDragging }, drag, preview] = useDrag<ArrayDragItem, void, { isDragging: boolean }>(
        () => ({
            type: "dashboard-array-item",
            item: {
                arrayPathKey,
                index
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        [arrayPathKey, index]
    )

    const [, drop] = useDrop<ArrayDragItem, void, unknown>(
        () => ({
            accept: "dashboard-array-item",
            hover: (item, monitor) => {
                if (!containerRef.current || item.arrayPathKey !== arrayPathKey || item.index === index) {
                    return
                }

                const rect = containerRef.current.getBoundingClientRect()
                const middleY = (rect.bottom - rect.top) / 2
                const clientOffset = monitor.getClientOffset()

                if (!clientOffset) {
                    return
                }

                const hoverY = clientOffset.y - rect.top

                if (item.index < index && hoverY < middleY) {
                    return
                }

                if (item.index > index && hoverY > middleY) {
                    return
                }

                onMove(arrayPath, item.index, index)
                item.index = index
            }
        }),
        [arrayPathKey, arrayPath, index, onMove]
    )

    function setContainerNode(node: HTMLDivElement | null) {
        containerRef.current = node
        drop(node)
        preview(node)
    }

    function setHandleNode(node: HTMLButtonElement | null) {
        drag(node)
    }

    return (
        <div
            ref={setContainerNode}
            className={`rounded-2xl border border-[var(--mono-4)]/50 px-4 py-4 ${isDragging ? "opacity-50" : "opacity-100"}`}
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-400">
                    <button
                        ref={setHandleNode}
                        type="button"
                        className="rounded-full border border-[var(--mono-4)]/30 p-1 text-neutral-400 transition-colors hover:bg-[var(--mono-4)]/10 hover:text-neutral-100 active:cursor-grabbing"
                        aria-label={`Reorder ${label}`}
                        title="Drag to reorder"
                    >
                        <GripVertical size={14} />
                    </button>
                    <span>{label}</span>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove([...arrayPath, index])}
                    className="rounded-full px-4 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/80 hover:text-red-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
            {children}
        </div>
    )
}

function FieldNode({
    path,
    label,
    value,
    onChange,
    onAddArrayItem,
    onRemoveArrayItem,
    onMoveArrayItem
}: {
    path: Array<string | number>
    label: string
    value: JsonValue
    onChange: (path: Array<string | number>, value: JsonValue) => void
    onAddArrayItem: (path: Array<string | number>, template: JsonValue[]) => void
    onRemoveArrayItem: (path: Array<string | number>) => void
    onMoveArrayItem: (path: Array<string | number>, fromIndex: number, toIndex: number) => void
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
                        className="rounded-full px-4 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-400/80 hover:text-green-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                </div>

                {value.length === 0 ? (
                    <div className="text-xs text-neutral-500">(empty array - add the first item to start this list)</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                        {value.map((item, index) => (
                            <SortableArrayItem
                                key={pathToString([...path, index])}
                                arrayPath={path}
                                index={index}
                                label={`${formatLabel(label)} #${index + 1}`}
                                onMove={onMoveArrayItem}
                                onRemove={onRemoveArrayItem}
                            >
                                <FieldNode
                                    path={[...path, index]}
                                    label={`${label ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() : ""} #${index + 1}`}
                                    value={item}
                                    onChange={onChange}
                                    onAddArrayItem={onAddArrayItem}
                                    onRemoveArrayItem={onRemoveArrayItem}
                                    onMoveArrayItem={onMoveArrayItem}
                                />
                            </SortableArrayItem>
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
                                onRemoveArrayItem={onRemoveArrayItem}
                                onMoveArrayItem={onMoveArrayItem}
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
    portfolioURL,
    hasPortfolio,
    onPortfolioReady
}: SectionConfig & {
    portfolioURL: string
    hasPortfolio: boolean
    onPortfolioReady: (portfolioURL: string) => void
}) {
    const [savedData, setSavedData] = useState<SectionData>(() => deepClone(data))
    const [draftData, setDraftData] = useState<SectionData>(() => deepClone(data))
    const [isSaving, setIsSaving] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const isDirty = JSON.stringify(savedData) !== JSON.stringify(draftData)
    const normalizedPortfolioURL = normalizePortfolioURLInput(portfolioURL)
    const canCreatePortfolio = !hasPortfolio
    const canSave = !isSaving && (isDirty || (canCreatePortfolio && normalizedPortfolioURL.length > 0))

    function handleChange(path: Array<string | number>, value: JsonValue) {
        setDraftData((current) => {
            return setValueAtPath(current, path, value) as SectionData
        })
        setStatusMessage("")
        setErrorMessage("")
    }

    function handleAddArrayItem(path: Array<string | number>, template: JsonValue[]) {
        const newItem = template.length > 0
            ? createEmptyValueFromTemplate(template[0])
            : createEmptyValueFromTemplate(createArrayItemTemplate(id, path))

        setDraftData((current) => {
            return appendValueAtPath(current, path, newItem) as SectionData
        })
        setStatusMessage("")
        setErrorMessage("")
    }

    function handleRemoveArrayItem(path: Array<string | number>) {
        setDraftData((current) => {
            return removeValueAtPath(current, path) as SectionData
        })
        setStatusMessage("")
        setErrorMessage("")
    }

    function handleMoveArrayItem(path: Array<string | number>, fromIndex: number, toIndex: number) {
        if (fromIndex === toIndex) {
            return
        }

        setDraftData((current) => {
            return moveValueAtPath(current, path, fromIndex, toIndex) as SectionData
        })
        setStatusMessage("")
        setErrorMessage("")
    }

    async function handleSave() {
        if (!canSave) {
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
                body: JSON.stringify({
                    data: draftData,
                    portfolioURL: normalizedPortfolioURL
                })
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
            if (typeof result?.PortfolioURL === "string" && result.PortfolioURL.length > 0) {
                onPortfolioReady(result.PortfolioURL)
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : `Failed to save ${title}`)
        } finally {
            setIsSaving(false)
        }
    }

    function handleCancel() {
        setDraftData(deepClone(savedData))
        setStatusMessage("")
        setErrorMessage("")
    }

    return (
        <section className="rounded-2xl border border-[var(--mono-4)]/50 px-4 py-8">
            <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-2xl font-oswald font-semibold tracking-widest text-neutral-100">{title}</h2>
                    <p className="mt-1 text-xs text-neutral-400">
                        {canCreatePortfolio
                            ? (isDirty ? "Ready to create portfolio" : "Fill this section, then save to create your portfolio")
                            : (isDirty ? "Unsaved changes" : "Saved")}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={!isDirty || isSaving}
                        className="rounded-full px-4 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/80 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw-icon lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className="rounded-full px-4 py-1 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-500/80 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSaving ? "Saving..." : (canCreatePortfolio ? "Create + Save" : <><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save-icon lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg></>)}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {Object.entries(draftData).map(([key, value]) => (
                    <FieldNode
                        key={key}
                        path={[key]}
                        label={key}
                        value={value}
                        onChange={handleChange}
                        onAddArrayItem={handleAddArrayItem}
                        onRemoveArrayItem={handleRemoveArrayItem}
                        onMoveArrayItem={handleMoveArrayItem}
                    />
                ))}
            </div>

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
    hasPortfolio: initialHasPortfolio,
    userName,
    userEmail,
    sections
}: DashboardEditorProps) {
    const [activePortfolioURL, setActivePortfolioURL] = useState(portfolioURL)
    const [hasPortfolio, setHasPortfolio] = useState(initialHasPortfolio)
    const normalizedPortfolioURL = normalizePortfolioURLInput(activePortfolioURL)

    function handlePortfolioReady(nextPortfolioURL: string) {
        setActivePortfolioURL(nextPortfolioURL)
        setHasPortfolio(true)
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <main className="min-h-screen px-6 py-10 text-neutral-100 md:px-10">
                <div className="mx-auto my-10 max-w-7xl">
                    <div className="rounded-3xl p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h1 className="text-4xl font-oswald font-bold tracking-[0.2em] text-[var(--foreground)]">
                                    Welcome, {userName ?? "User"}!
                                </h1>
                                <p className="mt-3 text-sm text-neutral-300">
                                    Signed in as <span className="font-medium text-[var(--foreground)]">{userEmail ?? userName}</span>
                                </p>
                                {hasPortfolio ? (
                                    <p className="mt-1 text-sm text-neutral-300">
                                        Portfolio URL: <span className="font-mono text-[var(--foreground)]">/{activePortfolioURL}</span>
                                    </p>
                                ) : null}
                                <p className="mt-3 max-w-2xl text-xs leading-6 text-mono-4/75">
                                    {hasPortfolio
                                        ? "Each section saves independently. Drag array items with the grip handle, and cancel restores the last saved version for that section only."
                                        : "Choose your portfolio URL, then save any section to create your portfolio and claim that URL."}
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

                        {!hasPortfolio ? (
                            <div className="mt-6 rounded-2xl border border-[var(--mono-4)]/30 bg-[var(--mono-4)]/5 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                                    <div className="flex-1">
                                        <label htmlFor="portfolio-url" className="block text-sm font-mono font-medium text-neutral-200">
                                            Portfolio URL
                                        </label>
                                        <input
                                            id="portfolio-url"
                                            type="text"
                                            value={activePortfolioURL}
                                            onChange={(event) => setActivePortfolioURL(normalizePortfolioURLInput(event.target.value))}
                                            placeholder="your-name"
                                            className="mt-2 w-full rounded-2xl border border-[var(--mono-4)]/50 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                                        />
                                        <p className="mt-2 text-xs leading-6 text-neutral-400">
                                            Use letters, numbers, hyphens, or underscores. Preview: <span className="font-mono text-neutral-200">/{normalizedPortfolioURL || "your-name"}</span>
                                        </p>
                                    </div>
                                    <div className="max-w-sm text-xs leading-6 text-neutral-500">
                                        Your first section save will claim this URL and create the starter portfolio documents behind it.
                                    </div>
                                </div>
                            </div>
                        ) : null}
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
                            portfolioURL={normalizedPortfolioURL}
                            hasPortfolio={hasPortfolio}
                            onPortfolioReady={handlePortfolioReady}
                        />
                    ))}
                </div>
            </main>
        </DndProvider>
    )
}
