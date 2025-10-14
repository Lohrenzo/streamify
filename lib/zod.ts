import { z } from "zod"

/**
 * Zod schemas and inferred types for authentication forms.
 */

/**
 * Schema for sign-in form validation.
 */
export const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters"),
})

/**
 * Schema for sign-up form validation.
 */
export const signUpSchema = z.object({
    first_name: z
        .string()
        .min(1, "First name is required")
        .min(2, "First name must be at least 2 characters")
        .max(30, "First name must be less than 30 characters"),
    last_name: z
        .string()
        // .min(1, "Last name is required")
        .min(2, "Last name must be at least 2 characters")
        .max(30, "Last name must be less than 20 characters")
        .optional(),
    username: z
        .string()
        .min(1, "Username is required")
        .min(2, "Username must be at least 2 characters")
        .max(30, "Name must be less than 30 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string(),
    dob: z.coerce.date()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

/** Input type for sign-in form. */
export type SignInInput = z.infer<typeof signInSchema>
/** Input type for sign-up form. */
export type SignUpInput = z.infer<typeof signUpSchema>