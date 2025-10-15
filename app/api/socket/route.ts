// import { NextRequest } from "next/server";

// const rooms = new Map<string, WebSocket[]>(); // keep track of connected peers per room

// export const config = {
//     runtime: "edge",
// };

// export async function GET(req: NextRequest) {
//     const { searchParams } = new URL(req.url);
//     const roomId = searchParams.get("roomId") || "default";

//     const { socket } = (req as any).webSocket ?? {};

//     if (!socket) {
//         return new Response("Expected a WebSocket connection", { status: 400 });
//     }

//     socket.accept();

//     if (!rooms.has(roomId)) rooms.set(roomId, []);
//     const peers = rooms.get(roomId)!;
//     peers.push(socket);

//     socket.addEventListener("message", (event: { data: string | Blob | ArrayBufferLike | ArrayBufferView<ArrayBufferLike>; }) => {
//         // Relay signaling messages to other peers in the room
//         peers.forEach((peer) => {
//             if (peer !== socket && peer.readyState === peer.OPEN) {
//                 peer.send(event.data);
//             }
//         });
//     });

//     socket.addEventListener("close", () => {
//         const updated = (rooms.get(roomId) || []).filter((p) => p !== socket);
//         rooms.set(roomId, updated);
//     });

//     return new Response(null, { status: 101 });
// }

import { WebSocketServer } from "ws";

const rooms = new Map<string, Set<WebSocket>>();

export const config = {
    api: { bodyParser: false },
};

export default function handler(req: any, res: any) {
    if (!res.socket.server.wss) {
        const wss = new WebSocketServer({ noServer: true });
        res.socket.server.wss = wss;

        res.socket.server.on("upgrade", (req: any, socket: any, head: any) => {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            const roomId = url.searchParams.get("roomId") || "default";

            wss.handleUpgrade(req, socket, head, (ws) => {
                if (!rooms.has(roomId)) rooms.set(roomId, new Set());
                const clients = rooms.get(roomId)!;
                clients.add(ws as any);

                ws.on("message", (msg) => {
                    // Broadcast to everyone else in same room
                    for (const client of clients) {
                        if (client !== ws && client.readyState === client.OPEN) {
                            client.send(msg.toString());
                        }
                    }
                });

                ws.on("close", () => {
                    clients.delete(ws as any);
                });
            });
        });
    }
    res.end();
}
