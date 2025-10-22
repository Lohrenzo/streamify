// import { parse } from "node:url";
// import { createServer } from "node:http";
// import next from "next";
// import { WebSocket, WebSocketServer } from "ws";

// interface UserInfo {
//     id: string;
//     username: string;
//     first_name: string;
//     last_name: string;
//     image?: string;
// }

// const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
// const handle = nextApp.getRequestHandler();

// // Map userId → { ws, user }
// const users = new Map<string, { ws: WebSocket; user: UserInfo }>();

// nextApp.prepare().then(() => {
//     const server = createServer((req, res) => {
//         handle(req, res, parse(req.url || "", true));
//     });

//     const wss = new WebSocketServer({ noServer: true });

//     const broadcastOnlineUsers = () => {
//         const onlineList = Array.from(users.values()).map(({ user }) => user);
//         console.log("📡 Broadcasting online users:", onlineList);

//         const payload = JSON.stringify({ type: "onlineUsers", users: onlineList });
//         for (const { ws, user } of users.values()) {
//             if (ws.readyState === WebSocket.OPEN) ws.send(payload);
//             else console.warn(`⚠️ Skipped ${user.username} — socket not open.`);
//         }
//     };

//     wss.on("connection", (ws) => {
//         console.log("🌐 New WebSocket connection");
//         let userId: string | undefined = undefined;

//         ws.on("message", (msgBuffer) => {
//             try {
//                 const msg = JSON.parse(msgBuffer.toString());
//                 console.log("📨 Received message:", msg);

//                 if (msg.type === "init" && msg.user?.id) {
//                     const user: UserInfo = {
//                         id: msg.user.id,
//                         username: msg.user.username,
//                         first_name: msg.user.first_name,
//                         last_name: msg.user.last_name,
//                         image: msg.user.image,
//                     };

//                     userId = user.id;
//                     users.set(userId!, { ws, user });
//                     console.log(`✅ Registered user:`, user);
//                     setTimeout(broadcastOnlineUsers, 100);
//                     return;
//                 }

//                 if (msg.type === "privateMessage" && msg.to && msg.text) {
//                     const target = users.get(msg.to);
//                     if (target?.ws.readyState === WebSocket.OPEN) {
//                         target.ws.send(
//                             JSON.stringify({
//                                 type: "message",
//                                 from: userId,
//                                 text: msg.text,
//                                 timestamp: Date.now(),
//                             })
//                         );
//                     }
//                 }
//             } catch (err) {
//                 console.error("❌ Invalid WS message:", err);
//             }
//         });

//         ws.on("close", () => {
//             if (userId) {
//                 users.delete(userId);
//                 console.log(`❌ ${userId} disconnected`);
//                 broadcastOnlineUsers();
//             }
//         });
//     });

//     server.on("upgrade", (req, socket, head) => {
//         const { pathname } = parse(req.url || "/", true);
//         if (pathname === "/_next/webpack-hmr") {
//             nextApp.getUpgradeHandler()(req, socket, head);
//         } else if (pathname === "/api/ws") {
//             wss.handleUpgrade(req, socket, head, (ws) => {
//                 wss.emit("connection", ws, req);
//             });
//         } else {
//             socket.destroy();
//         }
//     });

//     const port = process.env.PORT || 3000;
//     server.listen(port, () => console.log(`🚀 Server ready at http://localhost:${port}`));
// });

// 2nd
// import { parse } from "node:url";
// import { createServer } from "node:http";
// import next from "next";
// import { WebSocket, WebSocketServer } from "ws";

// interface UserInfo {
//     id: string;
//     username: string;
//     first_name: string;
//     last_name: string;
//     image?: string;
// }

// interface Broadcaster extends UserInfo {
//     streamId: string;
// }

// const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
// const handle = nextApp.getRequestHandler();

// // Map userId → { ws, user }
// const users = new Map<string, { ws: WebSocket; user: UserInfo }>();

// // Map userId → broadcaster info (for those currently live)
// const broadcasters = new Map<string, Broadcaster>();

// nextApp.prepare().then(() => {
//     const server = createServer((req, res) => {
//         handle(req, res, parse(req.url || "", true));
//     });

//     const wss = new WebSocketServer({ noServer: true });

//     const broadcastOnlineUsers = () => {
//         const onlineList = Array.from(users.values()).map(({ user }) => user);
//         console.log("📡 Broadcasting online users:", onlineList);

//         const payload = JSON.stringify({ type: "onlineUsers", users: onlineList });
//         for (const { ws, user } of users.values()) {
//             if (ws.readyState === WebSocket.OPEN) ws.send(payload);
//             else console.warn(`⚠️ Skipped ${user.username} — socket not open.`);
//         }
//     };

//     const broadcastLiveBroadcasters = () => {
//         const liveList = Array.from(broadcasters.values());
//         console.log("🎥 Broadcasting live streamers:", liveList);

//         const payload = JSON.stringify({ type: "liveBroadcasters", broadcasters: liveList });
//         for (const { ws } of users.values()) {
//             if (ws.readyState === WebSocket.OPEN) ws.send(payload);
//         }
//     };

//     wss.on("connection", (ws) => {
//         console.log("🌐 New WebSocket connection");
//         let userId: string | undefined = undefined;

//         ws.on("message", (msgBuffer) => {
//             try {
//                 const msg = JSON.parse(msgBuffer.toString());
//                 console.log("📨 Received message:", msg);

//                 // Initialize user connection
//                 if (msg.type === "init" && msg.user?.id) {
//                     const user: UserInfo = {
//                         id: msg.user.id,
//                         username: msg.user.username,
//                         first_name: msg.user.first_name,
//                         last_name: msg.user.last_name,
//                         image: msg.user.image,
//                     };

//                     userId = user.id;
//                     users.set(userId!, { ws, user });
//                     console.log(`✅ Registered user:`, user);
//                     setTimeout(broadcastOnlineUsers, 100);
//                     setTimeout(broadcastLiveBroadcasters, 100);
//                     return;
//                 }

//                 // Handle private messages (existing chat functionality)
//                 if (msg.type === "privateMessage" && msg.to && msg.text) {
//                     const target = users.get(msg.to);
//                     if (target?.ws.readyState === WebSocket.OPEN) {
//                         target.ws.send(
//                             JSON.stringify({
//                                 type: "message",
//                                 from: userId,
//                                 text: msg.text,
//                                 timestamp: Date.now(),
//                             })
//                         );
//                     }
//                 }

//                 // Start broadcasting
//                 if (msg.type === "startBroadcast" && userId) {
//                     const userInfo = users.get(userId);
//                     if (userInfo) {
//                         const streamId = `stream_${userId}_${Date.now()}`;
//                         const broadcaster: Broadcaster = {
//                             ...userInfo.user,
//                             streamId,
//                         };
//                         broadcasters.set(userId, broadcaster);
//                         console.log(`🎬 ${userInfo.user.username} started broadcasting`);

//                         // Confirm to broadcaster
//                         ws.send(JSON.stringify({
//                             type: "broadcastStarted",
//                             streamId,
//                         }));

//                         broadcastLiveBroadcasters();
//                     }
//                 }

//                 // Stop broadcasting
//                 if (msg.type === "stopBroadcast" && userId) {
//                     broadcasters.delete(userId);
//                     console.log(`🎬 ${userId} stopped broadcasting`);
//                     broadcastLiveBroadcasters();

//                     // Notify all viewers watching this stream
//                     const payload = JSON.stringify({
//                         type: "broadcastEnded",
//                         broadcasterId: userId,
//                     });
//                     for (const { ws } of users.values()) {
//                         if (ws.readyState === WebSocket.OPEN) ws.send(payload);
//                     }
//                 }

//                 // WebRTC signaling: offer from broadcaster to viewer
//                 if (msg.type === "offer" && msg.to && msg.offer) {
//                     const target = users.get(msg.to);
//                     if (target?.ws.readyState === WebSocket.OPEN) {
//                         target.ws.send(JSON.stringify({
//                             type: "offer",
//                             from: userId,
//                             offer: msg.offer,
//                         }));
//                     }
//                 }

//                 // WebRTC signaling: answer from viewer to broadcaster
//                 if (msg.type === "answer" && msg.to && msg.answer) {
//                     const target = users.get(msg.to);
//                     if (target?.ws.readyState === WebSocket.OPEN) {
//                         target.ws.send(JSON.stringify({
//                             type: "answer",
//                             from: userId,
//                             answer: msg.answer,
//                         }));
//                     }
//                 }

//                 // WebRTC signaling: ICE candidates
//                 if (msg.type === "iceCandidate" && msg.to && msg.candidate) {
//                     const target = users.get(msg.to);
//                     if (target?.ws.readyState === WebSocket.OPEN) {
//                         target.ws.send(JSON.stringify({
//                             type: "iceCandidate",
//                             from: userId,
//                             candidate: msg.candidate,
//                         }));
//                     }
//                 }

//                 // Request to watch a specific broadcaster
//                 if (msg.type === "watchStream" && msg.broadcasterId && userId) {
//                     const broadcaster = users.get(msg.broadcasterId);
//                     if (broadcaster?.ws.readyState === WebSocket.OPEN) {
//                         // Notify broadcaster that someone wants to watch
//                         broadcaster.ws.send(JSON.stringify({
//                             type: "viewerJoined",
//                             viewerId: userId,
//                         }));
//                     }
//                 }

//             } catch (err) {
//                 console.error("❌ Invalid WS message:", err);
//             }
//         });

//         ws.on("close", () => {
//             if (userId) {
//                 users.delete(userId);

//                 // If user was broadcasting, stop their broadcast
//                 if (broadcasters.has(userId)) {
//                     broadcasters.delete(userId);
//                     console.log(`🎬 ${userId} broadcast ended (disconnected)`);
//                     broadcastLiveBroadcasters();

//                     // Notify viewers
//                     const payload = JSON.stringify({
//                         type: "broadcastEnded",
//                         broadcasterId: userId,
//                     });
//                     for (const { ws } of users.values()) {
//                         if (ws.readyState === WebSocket.OPEN) ws.send(payload);
//                     }
//                 }

//                 console.log(`❌ ${userId} disconnected`);
//                 broadcastOnlineUsers();
//             }
//         });
//     });

//     server.on("upgrade", (req, socket, head) => {
//         const { pathname } = parse(req.url || "/", true);
//         if (pathname === "/_next/webpack-hmr") {
//             nextApp.getUpgradeHandler()(req, socket, head);
//         } else if (pathname === "/api/ws") {
//             wss.handleUpgrade(req, socket, head, (ws) => {
//                 wss.emit("connection", ws, req);
//             });
//         } else {
//             socket.destroy();
//         }
//     });

//     const port = process.env.PORT || 3000;
//     server.listen(port, () => console.log(`🚀 Server ready at http://localhost:${port}`));
// });

// server.ts
import { parse } from "node:url";
import { createServer } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";
import { prisma } from "./prisma.ts";

interface UserInfo {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image?: string;
}
interface Broadcaster extends UserInfo {
    streamId: string;
}

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Map userId → { ws, user }
const users = new Map<string, { ws: WebSocket; user: UserInfo }>();
const broadcasters = new Map<string, Broadcaster>();

nextApp.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res, parse(req.url || "", true));
    });

    // IMPORTANT: create WSS with noServer: true — we will hook it into the same HTTP server
    const wss = new WebSocketServer({ noServer: true });

    const broadcastOnlineUsers = () => {
        const onlineList = Array.from(users.values()).map(({ user }) => user);
        const payload = JSON.stringify({ type: "onlineUsers", users: onlineList });
        for (const { ws, user } of users.values()) {
            if (ws.readyState === WebSocket.OPEN) ws.send(payload);
            else console.warn(`⚠️ Skipped ${user.username} — socket not open.`);
        }
    };

    const broadcastLiveBroadcasters = () => {
        const liveList = Array.from(broadcasters.values());
        const payload = JSON.stringify({ type: "liveBroadcasters", broadcasters: liveList });
        for (const { ws } of users.values()) {
            if (ws.readyState === WebSocket.OPEN) ws.send(payload);
        }
    };

    wss.on("connection", (ws, req) => {
        console.log("🟢 New WebSocket connection");
        let userId: string | undefined;

        ws.on("message", async (msgBuffer) => {
            try {
                const msg = JSON.parse(msgBuffer.toString());

                if (msg.type === "init" && msg.user?.id) {
                    const user: UserInfo = {
                        id: msg.user.id,
                        username: msg.user.username,
                        first_name: msg.user.first_name,
                        last_name: msg.user.last_name,
                        image: msg.user.image,
                    };

                    userId = user.id;
                    users.set(userId!, { ws, user });
                    console.log(`✅ Registered user:`, user);
                    setTimeout(broadcastOnlineUsers, 100);
                    setTimeout(broadcastLiveBroadcasters, 100);
                    return;
                }

                // Fetch chat history
                if (msg.type === "getChatHistory" && msg.chatPartnerId && userId) {
                    const chatId = [userId, msg.chatPartnerId].sort().join("_");
                    const messages = await prisma.privateMessage.findMany({
                        where: { chatId },
                        orderBy: { createdAt: "asc" },
                    });

                    // mark seen
                    await prisma.privateMessage.updateMany({
                        where: { chatId, receiverId: userId, seen: false },
                        data: { seen: true },
                    });

                    ws.send(JSON.stringify({ type: "chatHistory", messages }));

                    const sender = users.get(msg.chatPartnerId);
                    if (sender?.ws.readyState === WebSocket.OPEN) {
                        sender.ws.send(JSON.stringify({ type: "messagesSeen", seenBy: userId, chatId }));
                    }
                    return;
                }

                // private messages
                if (msg.type === "privateMessage" && msg.to && msg.text && userId) {
                    const receiverId = msg.to;
                    const senderId = userId;
                    const chatId = [senderId, receiverId].sort().join("_");
                    const savedMessage = await prisma.privateMessage.create({
                        data: { chatId, senderId, receiverId, content: msg.text, seen: false },
                    });

                    // confirm to sender
                    ws.send(JSON.stringify({
                        type: "messageSent",
                        tempId: msg.tempId,
                        message: { from: senderId, text: msg.text, timestamp: savedMessage.createdAt },
                    }));

                    const target = users.get(receiverId);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(JSON.stringify({
                            type: "message",
                            from: senderId,
                            text: msg.text,
                            timestamp: savedMessage.createdAt,
                        }));
                    }
                    return;
                }

                // WebRTC signaling (offer/answer/candidate)
                if (["offer", "answer", "candidate"].includes(msg.type) && msg.to) {
                    const target = users.get(msg.to);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(JSON.stringify({ ...msg, from: userId }));
                    }
                    return;
                }

                // start/stop broadcast
                if (msg.type === "startBroadcast" && userId) {
                    const userInfo = users.get(userId);
                    if (userInfo) {
                        const streamId = `stream_${userId}_${Date.now()}`;
                        const broadcaster: Broadcaster = { ...userInfo.user, streamId };
                        broadcasters.set(userId, broadcaster);
                        ws.send(JSON.stringify({ type: "broadcastStarted", streamId }));
                        broadcastLiveBroadcasters();
                    }
                    return;
                }
                if (msg.type === "stopBroadcast" && userId) {
                    broadcasters.delete(userId);
                    broadcastLiveBroadcasters();
                    const payload = JSON.stringify({ type: "broadcastEnded", broadcasterId: userId });
                    for (const { ws } of users.values()) {
                        if (ws.readyState === WebSocket.OPEN) ws.send(payload);
                    }
                    return;
                }

                // watchStream
                if (msg.type === "watchStream" && msg.broadcasterId && userId) {
                    const broadcaster = users.get(msg.broadcasterId);
                    if (broadcaster?.ws.readyState === WebSocket.OPEN) {
                        broadcaster.ws.send(JSON.stringify({ type: "viewerJoined", viewerId: userId }));
                    }
                    return;
                }
            } catch (err) {
                console.error("❌ Invalid WS message:", err);
            }
        });

        ws.on("close", () => {
            if (userId) {
                users.delete(userId);
                if (broadcasters.has(userId)) {
                    broadcasters.delete(userId);
                    broadcastLiveBroadcasters();
                    const payload = JSON.stringify({ type: "broadcastEnded", broadcasterId: userId });
                    for (const { ws } of users.values()) {
                        if (ws.readyState === WebSocket.OPEN) ws.send(payload);
                    }
                }
                broadcastOnlineUsers();
            }
        });
    });

    // Hook WebSocket upgrade onto same HTTP server used by Next
    server.on("upgrade", (req, socket, head) => {
        const { pathname } = parse(req.url || "/", true);
        if (pathname === "/api/ws") {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });
        } else {
            socket.destroy();
        }
    });

    const port = parseInt(process.env.PORT || "3000", 10);
    server.listen(port, () => {
        console.log(`🚀 Next.js + WS ready at http://localhost:${port}`);
    });
});
