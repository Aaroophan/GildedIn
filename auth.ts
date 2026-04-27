import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import clientPromise from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    pages: {
        signIn: "/login"
    },
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async signIn({ user }) {
            if (!user.email) {
                return false
            }

            const client = await clientPromise
            const db = client.db(process.env.MONGODB_DB ?? "User")
            const users = db.collection("Users")

            const existingUser = await users.findOne({
                Email: user.email
            })

            if (!existingUser) {
                await users.insertOne({
                    Name: user.name,
                    Email: user.email,
                    Image: user.image,
                    Provider: "google",
                    Role: "User",
                    PortfolioURL: user.email === "arophn@gmail.com" ? "Aaroophan" : null,
                    CreatedAt: new Date(),
                    UpdatedAt: new Date()
                })
            } else {
                await users.updateOne(
                    { Email: user.email },
                    {
                        $set: {
                            Name: user.name,
                            Image: user.image,
                            UpdatedAt: new Date()
                        }
                    }
                )
            }

            return true
        },
        async jwt({ token }) {
            if (!token.email) {
                return token
            }

            const client = await clientPromise
            const db = client.db(process.env.MONGODB_DB ?? "User")
            const users = db.collection("Users")

            const appUser = await users.findOne({
                Email: token.email
            })

            if (appUser) {
                token.userId = appUser._id.toString()
                token.role = appUser.Role
                token.portfolioURL = appUser.PortfolioURL
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.userId as string | undefined
                session.user.role = token.role as string | undefined
                session.user.portfolioURL = token.portfolioURL as string | undefined
            }

            return session
        }
    }
}

export function auth() {
    return getServerSession(authOptions)
}
