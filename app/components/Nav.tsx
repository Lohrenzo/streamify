import Link from "next/link";
import { auth } from "@/auth";
import UserAvatar from "./auth/userAvatar";
import { SignOut } from "./auth/signout";

export default async function Nav() {
  const session = await auth();

  return (
    <nav className="sticky bottom-2 mx-auto w-full max-w-5xl z-50 bg-black/70 backdrop-blur-xl rounded-2xl">
      <div className="flex justify-around items-center py-2">
        {/* Search Button */}
        <Link
          href="/search"
          className="flex flex-col items-center text-white/80 hover:text-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <span className="text-xs mt-1">Search</span>
        </Link>

        {/* Home Button */}
        <Link
          href="/"
          className="flex flex-col items-center text-white/80 hover:text-white transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"
            />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </Link>

        {/* Profile / Avatar */}
        {session?.user ? (
          <Link
            href={`/profile/${session.user.id}`}
            className="flex flex-col items-center text-white/80 hover:text-white transition"
          >
            <UserAvatar session={session} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center text-white/80 hover:text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2 12a10 10 0 1120 0 10 10 0 01-20 0z"
              />
            </svg>
            <span className="text-xs mt-1">Login</span>
          </Link>
        )}

        {/* Logout Button */}
        {session?.user && <SignOut />}
      </div>
    </nav>
  );
}
