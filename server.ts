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

import { parse } from "node:url";
import { createServer } from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";

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

// Map userId → broadcaster info (for those currently live)
const broadcasters = new Map<string, Broadcaster>();

// ✅ Start Next.js on port 3000
nextApp.prepare().then(() => {
    const server = createServer((req, res) => {
        handle(req, res, parse(req.url || "", true));
    });

    const port = process.env.PORT || 3000;
    server.listen(port, () =>
        console.log(`🚀 Next.js ready at http://localhost:${port}`)
    );

    // ✅ Create a standalone WebSocket server on port 4000
    const wss = new WebSocketServer({ port: 4000 });
    console.log("🌐 WebSocket server running on ws://localhost:4000");

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
        console.log("🎥 Broadcasting live streamers:", liveList);

        const payload = JSON.stringify({ type: "liveBroadcasters", broadcasters: liveList });
        for (const { ws } of users.values()) {
            if (ws.readyState === WebSocket.OPEN) ws.send(payload);
        }
    };


    wss.on("connection", (ws) => {
        console.log("🟢 New WebSocket connection");
        let userId: string | undefined;

        ws.on("message", (msgBuffer) => {
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

                // Handle private messages
                if (msg.type === "privateMessage" && msg.to && msg.text) {
                    const target = users.get(msg.to);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(
                            JSON.stringify({
                                type: "message",
                                from: userId,
                                text: msg.text,
                                timestamp: Date.now(),
                            })
                        );
                    }
                }

                // Future: handle live streaming signaling
                if (msg.type === "offer" || msg.type === "answer" || msg.type === "candidate") {
                    const target = users.get(msg.to);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(JSON.stringify(msg));
                    }
                }

                // Start broadcasting
                if (msg.type === "startBroadcast" && userId) {
                    const userInfo = users.get(userId);
                    if (userInfo) {
                        const streamId = `stream_${userId}_${Date.now()}`;
                        const broadcaster: Broadcaster = {
                            ...userInfo.user,
                            streamId,
                        };
                        broadcasters.set(userId, broadcaster);
                        console.log(`🎬 ${userInfo.user.username} started broadcasting`);

                        // Confirm to broadcaster
                        ws.send(JSON.stringify({
                            type: "broadcastStarted",
                            streamId,
                        }));

                        broadcastLiveBroadcasters();
                    }
                }

                // Stop broadcasting
                if (msg.type === "stopBroadcast" && userId) {
                    broadcasters.delete(userId);
                    console.log(`🎬 ${userId} stopped broadcasting`);
                    broadcastLiveBroadcasters();

                    // Notify all viewers watching this stream
                    const payload = JSON.stringify({
                        type: "broadcastEnded",
                        broadcasterId: userId,
                    });
                    for (const { ws } of users.values()) {
                        if (ws.readyState === WebSocket.OPEN) ws.send(payload);
                    }
                }

                // WebRTC signaling: offer from broadcaster to viewer
                if (msg.type === "offer" && msg.to && msg.offer) {
                    const target = users.get(msg.to);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(JSON.stringify({
                            type: "offer",
                            from: userId,
                            offer: msg.offer,
                        }));
                    }
                }

                // WebRTC signaling: answer from viewer to broadcaster
                if (msg.type === "answer" && msg.to && msg.answer) {
                    const target = users.get(msg.to);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(JSON.stringify({
                            type: "answer",
                            from: userId,
                            answer: msg.answer,
                        }));
                    }
                }

                // WebRTC signaling: ICE candidates
                if (msg.type === "iceCandidate" && msg.to && msg.candidate) {
                    const target = users.get(msg.to);
                    if (target?.ws.readyState === WebSocket.OPEN) {
                        target.ws.send(JSON.stringify({
                            type: "iceCandidate",
                            from: userId,
                            candidate: msg.candidate,
                        }));
                    }
                }

                // Request to watch a specific broadcaster
                if (msg.type === "watchStream" && msg.broadcasterId && userId) {
                    const broadcaster = users.get(msg.broadcasterId);
                    if (broadcaster?.ws.readyState === WebSocket.OPEN) {
                        // Notify broadcaster that someone wants to watch
                        broadcaster.ws.send(JSON.stringify({
                            type: "viewerJoined",
                            viewerId: userId,
                        }));
                    }
                }


            } catch (err) {
                console.error("❌ Invalid WS message:", err);
            }
        });

        ws.on("close", () => {
            if (userId) {
                users.delete(userId);
                console.log(`❌ ${userId} disconnected`);
                broadcastOnlineUsers();
            }
        });
    });
});
