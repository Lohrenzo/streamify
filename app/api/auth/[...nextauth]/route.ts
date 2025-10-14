/**
 * NextAuth route handlers.
 *
 * Exposes the framework-provided `GET` and `POST` handlers for the Auth route.
 * These are wired up by the Auth configuration exported from `@/auth`.
 */
import { handlers } from "@/auth"

/**
 * Handle authentication-related GET requests (e.g., provider callbacks).
 */
export const { GET, POST } = handlers
