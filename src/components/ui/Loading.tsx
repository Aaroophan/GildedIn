'use client'

export default function Loading() {
    return (
        <div className="flex justify-center items-center p-5">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-t-[var(--mono-4)] border-b-[var(--mono-4)]"></div>
        </div>
    )
}