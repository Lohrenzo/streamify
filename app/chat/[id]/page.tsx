"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IoSend } from "react-icons/io5";

export default function PrivateChatPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const chatPartnerId = params.id as string;
  const searchParams = useSearchParams();

  const chatPartner = {
    id: chatPartnerId,
    username: decodeURIComponent(searchParams.get("username")!),
    first_name: decodeURIComponent(searchParams.get("first_name")!),
    last_name: decodeURIComponent(searchParams.get("last_name")!),
    image: decodeURIComponent(searchParams.get("image")!),
  };

  // const [chatPartnerName, setChatPartnerName] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = window.location.hostname;
    const wsPort = 4000;
    const ws = new WebSocket(`${wsProtocol}://${wsHost}:${wsPort}`);
    wsRef.current = ws;

    ws.onopen = () => {
      const fallbackImage = session.user.image
        ? session.user.image
        : `https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`;

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
      if (data.type === "message") {
        if (data.from === chatPartnerId) {
          setMessages((prev) => [
            ...prev,
            { from: data.from, text: data.text },
          ]);
        }
      }
    };

    return () => ws.close();
  }, [status, session, chatPartnerId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "privateMessage",
        to: chatPartnerId,
        text: newMessage,
      })
    );

    setMessages((prev) => [
      ...prev,
      { from: session?.user?.id!, text: newMessage },
    ]);
    setNewMessage("");
  };

  return (
    <main className="flex flex-col h-[calc(100vh-5rem)] text-white">
      <header className="sticky top-0 p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <Link href="/chat" className="text-blue-400 hover:underline">
          ← Back
        </Link>
        {chatPartner.username && chatPartner.image ? (
          <div className="flex items-center gap-2">
            <img
              src={chatPartner.image!}
              alt={chatPartner.username}
              className="w-8 h-8 rounded-full"
            />
            <h2 className="text-base font-semibold">{chatPartner.username}</h2>
          </div>
        ) : (
          <h2 className="text-base font-semibold">Loading...</h2>
        )}
        <div className="w-12" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 max-w-[70%] ${
              m.from === session?.user?.id
                ? "bg-blue-800 rounded-l-xl rounded-b-xl self-end ml-auto"
                : "bg-gray-700 rounded-r-xl rounded-b-xl"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-5 p-4 bg-gray-800 border-t border-gray-700 flex gap-3"
      >
        <input
          className="flex-1 p-2 rounded bg-gray-700 text-white focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          <IoSend />
        </button>
      </form>
    </main>
  );
}
