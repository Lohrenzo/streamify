"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { BsBroadcast } from "react-icons/bs";
import { GiStopSign } from "react-icons/gi";

export default function StartLivePage() {
  const { data: session, status } = useSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [isLive, setIsLive] = useState(false);

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    // const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    // const wsHost = window.location.hostname;
    // const wsPort = 4000;
    // const ws = new WebSocket(`${wsProtocol}://${wsHost}:${wsPort}`);
    const origin = window.location.origin; // e.g. https://streamify-230c.onrender.com
    const wsUrl = origin.replace(/^http/, "ws") + "/api/ws"; // switch protocol to ws/wss
    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "init",
          user: session.user,
        })
      );
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "viewerJoined") {
        await createAndSendOffer(msg.viewerId);
      }
      if (msg.type === "answer") {
        const pc = peerConnections.current.get(msg.from);
        if (pc)
          await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
      }
      if (msg.type === "candidate" && msg.from) {
        const pc = peerConnections.current.get(msg.from);
        if (pc && msg.candidate)
          await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    };

    return () => ws.close();
  }, [status, session]);

  const startLive = async () => {
    if (!videoRef.current || !wsRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      await videoRef.current.play();

      wsRef.current.send(JSON.stringify({ type: "startBroadcast" }));
      setIsLive(true);
    } catch (err) {
      console.error("Error starting live:", err);
    }
  };

  const stopLive = () => {
    wsRef.current?.send(JSON.stringify({ type: "stopBroadcast" }));
    setIsLive(false);
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const createAndSendOffer = async (viewerId: string) => {
    if (!wsRef.current || !videoRef.current?.srcObject) return;
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.current.set(viewerId, pc);

    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate)
        wsRef.current?.send(
          JSON.stringify({
            type: "candidate",
            to: viewerId,
            candidate: event.candidate,
          })
        );
    };

    pc.onconnectionstatechange = () => {
      console.log("📡 Connection state:", pc.connectionState);
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    wsRef.current.send(JSON.stringify({ type: "offer", to: viewerId, offer }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-[480px] app-card shadow-lg"
      />
      {!isLive ? (
        <button
          onClick={startLive}
          className="mt-6 cursor-pointer inline-flex flex-row items-center justify-center gap-1 px-4 py-2 text-sm app-button rounded-lg transition"
        >
          <BsBroadcast className="w-6 h-6" />
          Go Live
        </button>
      ) : (
        <button
          onClick={stopLive}
          // className="mt-6 bg-gray-700 hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold"
          className="mt-6 cursor-pointer inline-flex flex-row items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm rounded-lg transition"
        >
          <GiStopSign className="w-6 h-6 text-red-800" />
          Stop Live
        </button>
      )}
    </div>
  );
}
