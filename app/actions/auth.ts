"use server"
import { signIn, signOut } from '@/auth'
import { updateUser } from '@/utils/db';
// import { redirect } from 'next/navigation'

/**
 * @module authActions
 * @description Server actions for handling authentication-related operations such as sign-up,
 * sign-in, Google authentication, sign-out, and user profile updates.
 * These functions are marked with "use server" to ensure they run only on the server.
 */

/**
 * @function handleSignUp
 * @description Handles the sign-up process using credentials. It extracts user registration details
 * from the provided form data and attempts to create a new user session.
 * @param {FormData} formData - The form data containing user registration details (first name, last name, email, username, date of birth, password, and confirm password).
 * @returns {Promise<void>} This function attempts to sign in the user immediately after sign-up.
 * If successful, it redirects to the home page (`/`). Throws an error if sign-up fails.
 */
export async function handleSignUp(formData: FormData) {
  "use server";

  await signIn("credentials-signup", {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    dob: formData.get("dob"),
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    redirectTo: "/",
  });
}

/**
 * @function handleSignIn
 * @description Handles the sign-in process using credentials. It extracts user login details
 * from the provided form data and attempts to authenticate the user.
 * @param {FormData} formData - The form data containing user login credentials (email and password).
 * @returns {Promise<void>} This function attempts to sign in the user.
 * If successful, it redirects to the home page (`/`). Throws an error if sign-in fails.
 */
export async function handleSignIn(formData: FormData) {
  "use server";

  await signIn("credentials-signin", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    redirectTo: "/",
  });
}

/**
 * @function authenticateWithGoogle
 * @description Initiates the Google OAuth authentication flow. This function is a server action
 * that redirects the user to Google's authentication page.
 * @returns {Promise<void>} This function redirects the user for Google authentication.
 * Upon successful authentication, Auth.js handles the callback and redirects to the home page (`/`).
 */
export async function authenticateWithGoogle() {
  "use server";

  await signIn("google", {
    redirectTo: "/",
  });
}

/**
 * @function handleSignOut
 * @description Handles the user sign-out process. This function terminates the current user session.
 * @returns {Promise<void>} This function redirects the user to the login page (`/auth/login`)
 * or a default configured page after signing out.
 */
export async function handleSignOut() {
  await signOut()
  // redirect('/auth/login') // This commented-out line shows a potential redirection after signOut.
}

/**
 * @function handleUpdateUser
 * @description Handles updating a user's profile information (username, first name, last name).
 * @param {FormData} formData - The form data containing the updated user details.
 * @param {any} user - The current user object, expected to contain `id`.
 * @returns {Promise<any>} Returns the updated user object on success, otherwise throws an error.
 */
export async function handleUpdateUser(formData: FormData, user: any) {

  const username = formData.get("username") as string
  const updatedUser = await updateUser(
    user?.id as string,
    username.trim().toLowerCase(),
    formData.get("firstName") as string,
    formData.get("lastName") as string
  );

  return updatedUser
}
