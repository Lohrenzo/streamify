import { prisma } from "@/prisma"
import bcrypt from "bcryptjs"

/** 
* Hash a password 
* 
* @param password - Plain text password 
* @returns Promise with hashed password 
*/
export async function hashPassword(password: string | any): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

/** 
* Verify a password against its hash 
* 
* @param password - Plain text password 
* @param hash - Hashed password from database 
* @returns Promise with boolean result 
*/
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

/** 
* Verify if the user exists in the database 
* 
* @param email - User email 
* @returns User object if found, otherwise null 
*/
export async function getUserByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        })
        if (!user) {
            return null
        }
        return user
    } catch (error) {
        console.error('Error fetching user by email:', error)
        return null
    }
}

/** 
* Create a new user in the database 
* 
* @param email - User email 
* @param password - User hashed password 
* @param username - Optional username 
* @param first_name - Optional first name 
* @param last_name - Optional last name 
* @param dob - Optional date of birth 
* @returns User object if successful, otherwise throws error 
*/
export async function createUser(email: string, password: string, username?: string, first_name?: string, last_name?: string, dob?: Date) {
    try {
        const hashedPassword = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username: username || null,
                first_name: first_name || null,
                last_name: last_name || null,
                dob: dob || null,
            },
        })

        return user
    } catch (error) {
        console.error('Error creating user:', error)
        throw error
    }
}

/** 
* Update a user in the database 
* 
* @param is - User id 
* @param username - Optional username 
* @param first_name - Optional first name 
* @param last_name - Optional last name 
* @param dob - Optional date of birth 
* @returns User object if successful, otherwise throws error 
*/
export async function updateUser(id: string, username?: string, first_name?: string, last_name?: string, dob?: Date) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        })

        if (!user) {
            // console.error('User not found')
            throw new Error('User not found')
        }

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                username: username || null,
                first_name: first_name || null,
                last_name: last_name || null,
                dob: dob || null,
                updated_at: new Date(),
            },
        })

        // console.log("User updated:", updatedUser)

        return updatedUser
    } catch (error) {
        // console.error('Error updating user:', error)
        throw error
    }
}

/** 
 * Get user profile by ID
* 
* @param id - User ID
* @returns User object if found, otherwise null
*/
export async function getUserProfileById(id: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                email: true,
                username: true,
                first_name: true,
                last_name: true,
                dob: true,
                created_at: true,
                updated_at: true,
            },
        })

        if (!user) {
            return null
        }

        return user
    } catch (error) {
        // console.error('Error fetching user profile by ID:', error)
        return null
    }
}

/**
 * Password reset
 * 
 * @param email - User email
 * @param currentPassword - Current plain text password
 * @param newPassword - New plain text password
 * @returns Updated user object if successful, otherwise throws error
 */
export async function resetPassword(id: string, currentPassword: string, newPassword: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        })

        if (!user) {
            console.error('User not found')
            throw new Error('User not found')
        }

        var isPasswordValid;
        if (user.password !== null) {
            isPasswordValid = await verifyPassword(currentPassword, user.password as string)

            if (!isPasswordValid) {
                // console.error('Current password is incorrect')
                throw new Error('Current password is incorrect')
            }
        }

        const hashedNewPassword = await hashPassword(newPassword)

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                password: hashedNewPassword,
                updated_at: new Date(),
            },
        })

        // console.log("Password updated for user:", updatedUser.email)

        return updatedUser
    } catch (error) {
        // console.error('Error resetting password:', error)
        throw error
    }
}
