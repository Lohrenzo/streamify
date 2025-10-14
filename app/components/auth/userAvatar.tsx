"use client";
import { useSession } from "next-auth/react";
import { SignOut } from "@/app/components/auth/signout";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export default function UserAvatar({ session }: { session: any }) {
  const { update, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Force session update when component mounts and we have no session data
  useEffect(() => {
    if (status === "authenticated" && session && !session.user.first_name) {
      console.log("Updating session to get latest user data...");
      update(); // This forces a session refresh
    }
  }, [session, status, update]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (status === "loading")
    return (
      <div className="animate-spin rounded-full min-h-[45] min-w-[45] border-b-2 border-white"></div>
    );
  if (!session?.user) return null;

  return (
    <div ref={dropdownRef}>
      <img
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[45] min-w-[45] duration-150 ease-in-out hover:scale-110 cursor-pointer rounded-full border border-gray-700"
        width={45}
        height={45}
        src={
          session.user.image ??
          `https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`
        }
        alt="User Avatar"
      />
      {isOpen && (
        <div className="min-w-52 duration-200 ease-in-out absolute top-[5.4rem] right-4 grid grid-cols-1 rounded-md border border-blue-800/20 z-30 bg-black/60 backdrop-blur-xl shadow-md shadow-gray-800/15">
          <div className="w-full text-center text-sm px-2 py-4 border-b border-blue-900/45">
            <p className="text-gray-300">{session.user.username}</p>
            <p className="font-bold text-gray-500">{session.user.email}</p>
          </div>
          {/* <hr className="text-gray-800/30" /> */}
          <div className="w-full font-bold text-sm px-2 py-4 grid grid-cols-1 gap-1.5 place-items-start">
            <Link
              href="/settings"
              className="duration-200 ease-in-out text-gray-300 hover:text-gray-400"
            >
              Account Settings
            </Link>
            <SignOut />
          </div>
        </div>
      )}
    </div>
  );
}
