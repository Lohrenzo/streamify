"use client";
export const runtime = "nodejs"; // Force Node.js runtime
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BsBroadcast } from "react-icons/bs";

interface Broadcaster {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  image?: string;
  streamId: string;
}

export default function LiveHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const [liveBroadcasters, setLiveBroadcasters] = useState<Broadcaster[]>([]);
  const [selectedBroadcaster, setSelectedBroadcaster] =
    useState<Broadcaster | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [streamEnded, setStreamEnded] = useState(false);

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Connect WS
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = window.location.hostname;
    const wsPort = 4000;
    const ws = new WebSocket(`${wsProtocol}://${wsHost}:${wsPort}`);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected to WS");
      ws.send(
        JSON.stringify({
          type: "init",
          user: {
            id: session.user.id,
            username: session.user.username,
            first_name: session.user.first_name,
            last_name: session.user.last_name,
            image: session.user.image,
          },
        })
      );
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      console.log("📩 WS:", msg);

      // Update live broadcasters list
      if (msg.type === "liveBroadcasters") {
        const others = msg.broadcasters.filter(
          (b: Broadcaster) => b.id !== session.user.id
        );
        setLiveBroadcasters(others);
      }

      // Handle stream offer
      if (
        msg.type === "offer" &&
        selectedBroadcaster &&
        msg.from === selectedBroadcaster.id
      ) {
        await handleOffer(msg.offer, msg.from);
      }

      // Handle ICE candidates
      if (
        msg.type === "candidate" &&
        selectedBroadcaster &&
        msg.from === selectedBroadcaster.id
      ) {
        if (peerRef.current && msg.candidate) {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(msg.candidate)
          );
        }
      }

      if (
        msg.type === "broadcastEnded" &&
        msg.broadcasterId === selectedBroadcaster?.id
      ) {
        setStreamEnded(true);
        if (peerRef.current) peerRef.current.close();
      }
    };

    return () => ws.close();
  }, [status, session?.user?.id, selectedBroadcaster]);

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: string
  ) => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      peerRef.current = pc;

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(
            JSON.stringify({
              type: "candidate",
              to: from,
              candidate: event.candidate,
            })
          );
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("📡 Connection state:", pc.connectionState);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current?.send(
        JSON.stringify({
          type: "answer",
          to: from,
          answer,
        })
      );
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  };

  const startWatching = (broadcaster: Broadcaster) => {
    setSelectedBroadcaster(broadcaster);
    setStreamEnded(false);
    setIsConnected(false);

    setTimeout(() => {
      wsRef.current?.send(
        JSON.stringify({
          type: "watchStream",
          broadcasterId: broadcaster.id,
        })
      );
    }, 500);
  };

  const stopWatching = () => {
    setSelectedBroadcaster(null);
    setIsConnected(false);
    setStreamEnded(false);
    peerRef.current?.close();
    peerRef.current = null;
  };

  if (status === "loading")
    return <div className="text-white p-8">Loading session...</div>;
  if (status === "unauthenticated")
    return <div className="text-white p-8">Please log in first.</div>;

  return (
    <main className="min-h-screen text-white p-8">
      {!selectedBroadcaster ? (
        <>
          <div className="max-w-6xl mx-auto">
            <div className="relative flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Live Streams</h1>
              <button
                onClick={() => router.push("/live/start")}
                className="sticky top-0 right-0 cursor-pointer flex flex-row items-center justify-center gap-1 px-4 py-2 text-sm app-button rounded-lg transition"
              >
                <BsBroadcast className="w-6 h-6" />
                Go Live
              </button>
            </div>

            {liveBroadcasters.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold mb-3">No Live Streams</h2>
                <p className="text-gray-400 mb-6">
                  Nobody is streaming right now. Be the first!
                </p>
                <button
                  onClick={() => router.push("/live/start")}
                  className="cursor-pointer inline-flex flex-row items-center justify-center gap-1 px-4 py-2 text-sm app-button rounded-lg transition"
                >
                  <BsBroadcast className="w-6 h-6" />
                  Go Live
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveBroadcasters.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => startWatching(b)}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition cursor-pointer"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/30"></div>
                      <img
                        src={b.image}
                        alt={b.username}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                      <div className="relative z-10 text-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white mx-auto mb-3">
                          <img
                            src={b.image}
                            alt={b.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-3 py-1 bg-red-600 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {b.username}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {b.first_name} {b.last_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-4xl rounded-lg bg-black shadow-lg"
          />
          <div className="mt-6 flex gap-4">
            <button
              onClick={stopWatching}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg"
            >
              ⬅️ Back to Streams
            </button>
          </div>
          {!isConnected && !streamEnded && (
            <p className="mt-4 text-gray-400">Connecting to stream...</p>
          )}
          {streamEnded && (
            <p className="mt-4 text-red-400">Stream has ended.</p>
          )}
        </div>
      )}
    </main>
  );
}
