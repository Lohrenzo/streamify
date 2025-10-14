"use server"
import { signIn, signOut } from '@/auth'
import { updateUser } from '@/utils/db';
// import { redirect } from 'next/navigation'
// import { FormState } from 'react-hook-form'

/**
 * Credentials Signup action handler
 *
 * @param formData - Form data from the signup form
 * @returns Redirects to the home page on success
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
 * Credentials Signin action handler
 *
 * @param formData - Form data from the signin form
 * @returns Redirects to the home page on success
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
 * Google authentication action handler.
 * Uses google to sign in or sign up the user.
 *
 * @returns Redirects to the home page on success
 */
export async function authenticateWithGoogle() {
  "use server";

  await signIn("google", {
    redirectTo: "/",
  });
}


/**
 * Signout action handler
 *
 * @returns Redirects to the login page
 */
export async function handleSignOut() {
  await signOut()
  // redirect('/auth/login')
}

/**
 * Update user action handler
 *
 * @returns User object on success, otherwise throws error
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
