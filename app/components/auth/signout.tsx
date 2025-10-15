"use client";
import { signOut } from "next-auth/react";
import { ImExit } from "react-icons/im";

/**
 * Button that signs the user out using NextAuth's `signOut`.
 *
 * @returns JSX button element that triggers sign-out on click.
 */
export function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="flex flex-col items-center duration-200 ease-in-out cursor-pointer text-gray-400 hover:text-red-500/80"
      type="submit"
    >
      <ImExit className="w-6 h-6" />
      <span className="text-xs mt-1">Sign Out</span>
    </button>
  );
}
