import { auth } from "@/../auth"
import { redirect } from "next/navigation"

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

    return (
        <main className="min-h-screen p-10">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <p>Welcome, {session.user.name}</p>
            <p>Portfolio: /{session.user.portfolioURL}</p>

            {/* Later: add edit forms here */}
        </main>
    )
}