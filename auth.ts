
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { createUser, getUserByEmail, hashPassword, verifyPassword } from "./utils/db"
import { signInSchema, signUpSchema } from "@/lib/zod"
import { prisma } from "@/prisma"

// Extend NextAuth types to include first_name and last_name
declare module "next-auth" {
    interface User {
        first_name?: string
        last_name?: string
        username?: string
    }
    interface Session {
        user: {
            id?: string
            first_name?: string
            last_name?: string
            username?: string
            [key: string]: any
        }
    }
}

const providers: Provider[] = [
    Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        async profile(profile) {
            console.log("Profile from Google:", profile)

            return {
                id: profile.sub,
                first_name: profile.given_name,
                last_name: profile.family_name,
                username: `${profile.given_name}.${profile.family_name}${Math.random() * 10}`.toLowerCase(),
                email: profile.email,
                image: profile.picture,
                emailVerified: profile.emailVerified ? new Date() : null,
            }

        },
    }),
    Credentials({
        id: "credentials-signin",
        name: "Sign In",
        credentials: {
            email: {
                type: "email",
                label: "Email",
            },
            password: {
                type: "password",
                label: "Password",
            },
        },
        authorize: async (credentials, request) => {
            try {
                console.log("Sign-in attempt with credentials:", { email: credentials?.email })

                // Validate input using your schema
                const { email, password } = await signInSchema.parseAsync(credentials)

                console.log("Validated email:", email)

                // Get user by email (without password comparison here)
                const user = await getUserByEmail(email)

                if (!user) {
                    console.log("User not found for email:", email)
                    throw new Error("Invalid credentials")
                }

                // console.log("User found:", { id: user.id, email: user.email })

                // Verify password against stored hash
                if (!user.password) {
                    throw new Error("Please sign in with Google")
                }
                const isValidPassword = await verifyPassword(password, user.password)

                if (!isValidPassword) {
                    console.log("Invalid password for user:", email)
                    throw new Error("Invalid credentials")
                }

                console.log("Authentication successful for user:", email)

                // console.log("User data being returned:", user)
                // Return user object with their profile data
                return {
                    id: user.id,
                    email: user.email,
                    username: user.username ?? undefined,
                    first_name: user.first_name ?? undefined,
                    last_name: user.last_name ?? undefined,
                    image: user.image ?? undefined,
                    dob: user.dob ?? undefined,
                }

            } catch (error) {
                // console.error("Sign-in error:", error)
                throw error

            }

        },
    }),
    Credentials({
        id: "credentials-signup",
        name: "Sign Up",
        credentials: {
            first_name: { type: "text", label: "First Name" },
            last_name: { type: "text", label: "Last Name" },
            email: { type: "email", label: "Email" },
            username: { type: "text", label: "Username" },
            password: { type: "password", label: "Password" },
            confirmPassword: { type: "password", label: "Confirm Password" },
            dob: { type: "date", label: "Date of Birth" },
        },
        authorize: async (credentials) => {
            try {
                console.log("Sign-up attempt:", { email: credentials?.email, username: credentials?.username })

                const { first_name, last_name, email, username, password, dob } = await signUpSchema.parseAsync(credentials)

                // Check if user already exists
                const existingUser = await getUserByEmail(email)
                if (existingUser) {
                    throw new Error("User already exists with this email")
                }

                // Create new user
                const newUser = await createUser(email, password, username, first_name, last_name, dob)

                return {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username ?? undefined,
                    first_name: newUser.first_name ?? undefined,
                    last_name: newUser.last_name ?? undefined,
                    image: newUser.image ?? undefined,
                    dob: newUser.dob ?? undefined,
                }
            } catch (error) {
                console.error("Sign-up error:", error)
                throw error
            }
        },
    })
]

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: providers,
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error', // Error code passed in query string as ?error=
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Handle Google OAuth sign-in
            if (account?.provider === "google") {
                try {
                    // Check if user already exists
                    const existingUser = await getUserByEmail(user.email!)

                    if (!existingUser) {
                        // User will be created by PrismaAdapter automatically
                        console.log("New Google user will be created:", user.email)
                    } else {
                        console.log("Existing Google user signing in:", user.email)
                    }

                    return true
                } catch (error) {
                    console.error("Google sign-in error:", error)
                    return false
                }
            }

            // For credentials, the authorize function handles validation
            return true
        },
        async session({ session, user, token }) {
            // Database strategy (used with OAuth)
            if (user) {
                session.user.id = user.id
                session.user.first_name = user.first_name
                session.user.last_name = user.last_name
                session.user.username = user.username
            }
            // JWT strategy (used with credentials)
            else if (token.sub) {
                session.user.id = token.sub
                session.user.first_name = token.first_name as string
                session.user.last_name = token.last_name as string
                session.user.username = token.username as string
            }
            return session
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.sub = user.id
                token.first_name = user.first_name
                token.last_name = user.last_name
                token.username = user.username
            }
            return token
        },
    },
    session: {
        // Use database strategy for OAuth, JWT for credentials
        // strategy: "database", // This will be overridden to JWT for credentials automatically
        strategy: "jwt", // Force JWT strategy to ensure compatibility with Credentials provider
    },
    debug: process.env.NODE_ENV === "development",
})
