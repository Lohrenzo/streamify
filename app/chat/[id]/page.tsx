"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { IoSend } from "react-icons/io5";

interface Message {
  id?: string;
  from: string;
  text: string;
  timestamp: string;
  status: "pending" | "sent" | "seen";
  tempId?: string;
}

export default function PrivateChatPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const chatPartnerId = params.id as string;
  const searchParams = useSearchParams();
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatPartner = {
    id: chatPartnerId,
    username: decodeURIComponent(searchParams.get("username")!),
    first_name: decodeURIComponent(searchParams.get("first_name")!),
    last_name: decodeURIComponent(searchParams.get("last_name")!),
    image: decodeURIComponent(searchParams.get("image")!),
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = window.location.hostname;
    const wsPort = 4000;
    const ws = new WebSocket(`${wsProtocol}://${wsHost}:${wsPort}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "init",
          user: {
            id: session.user.id,
            username: session.user.username,
            first_name: session.user.first_name,
            last_name: session.user.last_name,
            image:
              session.user.image ||
              `https://avatar.iran.liara.run/username?username=${session.user.first_name}+${session.user.last_name}`,
          },
        })
      );
      ws.send(JSON.stringify({ type: "getChatHistory", chatPartnerId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Load chat history
      if (data.type === "chatHistory") {
        const formatted = data.messages.map((m: any) => ({
          from: m.senderId,
          text: m.content,
          timestamp: m.createdAt,
          status: m.seen ? "seen" : "sent",
        }));
        setMessages(formatted);
        return;
      }

      // New incoming message
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            from: data.from,
            text: data.text,
            timestamp: data.timestamp || new Date().toISOString(),
            status: "sent",
          },
        ]);
        return;
      }

      // Confirmation for sent message
      if (data.type === "messageSent" && data.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === data.tempId
              ? { ...msg, status: "sent", timestamp: data.message.timestamp }
              : msg
          )
        );
        return;
      }

      // Mark messages as seen
      if (data.type === "messagesSeen" && data.chatId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.from === session?.user?.id ? { ...m, status: "seen" } : m
          )
        );
        return;
      }
    };

    return () => ws.close();
  }, [status, session, chatPartnerId]);

  // Send message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const tempId = Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    wsRef.current?.send(
      JSON.stringify({
        type: "privateMessage",
        to: chatPartnerId,
        text: newMessage,
        tempId,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        from: session?.user?.id!,
        text: newMessage,
        timestamp: now,
        status: "pending",
        tempId,
      },
    ]);
    setNewMessage("");
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="flex flex-col h-[calc(100vh-5rem)] text-white">
      <header className="sticky top-0 p-4 bg-[#1018285d] border-b border-gray-800/60 flex items-center justify-between">
        <Link
          href="/chat"
          className="font-bold text-blue-400 hover:scale-125 transition-all duration-100 ease-in-out"
        >
          ←
        </Link>
        <div className="flex flex-row items-center gap-2">
          <img
            src={chatPartner.image}
            alt={chatPartner.username}
            className="w-8 h-8 rounded-full"
          />
          <h2 className="text-base font-semibold">{chatPartner.username}</h2>
        </div>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((m, i) => {
          const isMine = m.from === session?.user?.id;
          return (
            <div
              key={i}
              className={`max-w-[70%] p-3 flex flex-col text-sm ${
                isMine
                  ? "bg-blue-900/90 rounded-l-xl rounded-b-xl self-end ml-auto text-right"
                  : "bg-gray-700 rounded-r-xl rounded-b-xl text-left"
              }`}
            >
              <span>{m.text}</span>
              <div className="text-xs text-gray-300 mt-1 flex justify-end items-center gap-1">
                <span>{formatTime(m.timestamp)}</span>
                {isMine && (
                  <>
                    {m.status === "pending" && <span>🕓</span>}
                    {m.status === "sent" && <span>✅</span>}
                    {m.status === "seen" && <span>👁️</span>}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="sticky bottom-5 p-4 bg-[#1018282d] border-t border-gray-800/60 flex gap-3"
      >
        <input
          className="flex-1 p-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="app-button px-4 py-2">
          <IoSend />
        </button>
      </form>
    </main>
  );
}
