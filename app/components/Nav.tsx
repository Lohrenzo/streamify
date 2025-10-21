"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserAvatar from "./auth/userAvatar";
import { SignOut } from "./auth/signout";
import VideoUpload from "./VideoUpload";
import AppContext from "../state/Context";

// React Icons
import { RiSearch2Fill } from "react-icons/ri";
import { GoHomeFill } from "react-icons/go";
import { BsBroadcast } from "react-icons/bs";
import { IoChatbox, IoPerson } from "react-icons/io5";
import { BiSolidVideoPlus } from "react-icons/bi";

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { state, dispatch } = useContext(AppContext);

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    else return pathname.startsWith(path);
  };

  return (
    <nav
      // bg-gradient-to-t from-black/70 to-black/30
      // backdrop-blur-2xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]
      // before:absolute before:inset-x-0 before:top-0 before:h-[1px]
      // before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      className="
        fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50
        backdrop-blur-2xl duration-150 ease-in-out
        overflow-hidden app-card
      "
    >
      {/* VideoUpload component is only rendered if the user is authenticated */}
      {/* {status === "authenticated" && state.uploadOpen && (
        <div className=" pt-6 top-0 left-0 right-0 z-20">
          <VideoUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )} */}
      <div className="flex justify-around items-center py-2 transition-all">
        {/* Search */}
        <Link
          href="/search"
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive("/search")
              ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
              : "text-white/80 hover:text-white"
          }`}
        >
          <RiSearch2Fill className="w-6 h-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>

        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive("/")
              ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
              : "text-white/80 hover:text-white"
          }`}
        >
          <GoHomeFill className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        {session?.user && (
          <>
            {/* Live */}
            <Link
              href="/live"
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive("/live")
                  ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <BsBroadcast className="w-6 h-6" />
              <span className="text-xs mt-1">Live</span>
            </Link>

            {/* Upload */}
            <button
              onClick={() => dispatch({ type: "OPEN_UPLOAD" })}
              className={`cursor-pointer flex flex-col items-center transition-all duration-300 ${
                isActive("/upload")
                  ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <BiSolidVideoPlus className="w-6 h-6" />
              <span className="text-xs mt-1">Upload</span>
            </button>

            {/* Chat */}
            <Link
              href="/chat"
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive("/chat")
                  ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <IoChatbox className="w-6 h-6" />
              <span className="text-xs mt-1">Chat</span>
            </Link>
          </>
        )}

        {/* Profile or Login */}
        {session?.user ? (
          <Link
            href={`/profile/${session.user.id}`}
            className={`flex flex-col items-center transition-all duration-300 ${
              pathname.startsWith(`/profile/${session.user.id}`)
                ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
                : "text-white/80 hover:text-white"
            }`}
          >
            <UserAvatar session={session} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className={`flex flex-col items-center transition-all duration-300 ${
              isActive("/auth")
                ? "text-[#1957bc] scale-110 drop-shadow-[0_0_3px_#0f469f]"
                : "text-white/80 hover:text-white"
            }`}
          >
            <IoPerson className="w-6 h-6" />
            <span className="text-xs mt-1">Login</span>
          </Link>
        )}

        {/* Logout */}
        {session?.user && <SignOut />}
      </div>
      <footer className="text-gray-500 pb-1 w-full text-center">
        <p className="text-xs">
          Created by Lorenzo, ©{new Date().getFullYear()}
        </p>
      </footer>
    </nav>
  );
}
