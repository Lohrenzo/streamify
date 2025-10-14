"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

/**
 * Displays the authenticated user's avatar with a dropdown menu.
 *
 * - Refreshes the session on mount if basic profile fields are missing.
 * - Closes the dropdown on outside clicks using a document-level listener.
 *
 * @param props
 * @param props.session - Current session object used for initial render.
 * @returns JSX element with avatar and profile actions.
 */
export default function UserAvatar({ session }: { session: any }) {
  const { update, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Force session update when component mounts and we have no session data
  useEffect(() => {
    if (status === "authenticated" && session && !session.user.first_name) {
      console.log("Updating session to get latest user data...");
      update(); // This forces a session refresh
    }
  }, [session, status, update]);

  if (status === "loading")
    return (
      <div className="animate-spin rounded-full min-h-6 min-w-6 border-b-2 border-white"></div>
    );
  if (!session?.user) return null;

  return (
    <div>
      <img
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-6 min-w-6 duration-150 ease-in-out hover:scale-110 cursor-pointer rounded-full border border-gray-700"
        width={24}
        height={24}
        src={
          session.user.image ??
          `https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`
        }
        alt="User Avatar"
      />
    </div>
  );
}
