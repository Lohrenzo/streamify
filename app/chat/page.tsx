"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
// import { Session } from "next-auth";

interface OnlineUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  image?: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const fallbackImage = session.user.image
      ? session.user.image
      : `https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`;

    const origin = window.location.origin; // e.g. https://streamify-230c.onrender.com
    const wsUrl = origin.replace(/^http/, "ws") + "/api/ws"; // switch protocol to ws/wss
    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS open — sending user data:", session.user);
      ws.send(
        JSON.stringify({
          type: "init",
          user: {
            id: session.user.id,
            username: session.user.username,
            first_name: session.user.first_name,
            last_name: session.user.last_name,
            image: fallbackImage,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WS message:", data);

      if (data.type === "onlineUsers") {
        const others = data.users.filter(
          (u: OnlineUser) => u.id !== session.user.id
        );
        setOnlineUsers(others);
      }
    };

    ws.onclose = () => console.log("🔌 WS closed");
    return () => ws.close();
  }, [status, session?.user?.id]);

  if (status === "loading")
    return <div className="text-white p-8">Loading session...</div>;

  if (status === "unauthenticated")
    return <div className="text-white p-8">Please log in first.</div>;

  return (
    <main className="flex text-white">
      <aside className="w-96 mx-auto bg-gray-800 border border-gray-700/50 p-6 rounded-xl shadow-lg mt-10">
        <h1 className="text-xl font-semibold mb-4 text-center">Online Users</h1>
        {onlineUsers.length === 0 ? (
          <p className="text-gray-400 text-center">
            No one online right now 😞
          </p>
        ) : (
          <ul className="space-y-3">
            {onlineUsers.map((user) => (
              <li key={user.id}>
                <Link
                  href={{
                    pathname: `/chat/${user.id}`,
                    query: {
                      username: encodeURIComponent(user.username),
                      first_name: encodeURIComponent(user.first_name),
                      last_name: encodeURIComponent(user.last_name),
                      image: encodeURIComponent(user.image!),
                    },
                  }}
                  className="flex items-center gap-3 bg-[#1018285d] hover:bg-[#101828e6] transition-all p-3 rounded-lg"
                >
                  <img
                    src={user.image}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </main>
  );
}
