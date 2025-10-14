"use client";
import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="duration-200 ease-in-out cursor-pointer text-gray-400 hover:text-red-500/80"
      type="submit"
    >
      Sign Out
    </button>
  );
}
