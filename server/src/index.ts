import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT ?? 3001);
let total = 0;

type ClientMessage = { type: 'blessing' };
type ServerMessage = { type: 'total'; total: number; players: number };

const http = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/total') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ total }));
        return;
    }
    res.writeHead(404).end();
});

const wss = new WebSocketServer({ server: http });

function snapshot(): ServerMessage {
    return { type: 'total', total, players: wss.clients.size };
}

function broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    }
}

function isClientMessage(value: unknown): value is ClientMessage {
    return (
        typeof value === 'object' &&
        value !== null &&
        (value as { type?: unknown }).type === 'blessing'
    );
}

wss.on('connection', (socket) => {
    broadcast(snapshot()); // avisa todos: entrou mais um anjo

    socket.on('message', (raw) => {
        let msg: unknown;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return; 
        }
        if (isClientMessage(msg)) {
            total += 1;
            broadcast(snapshot());
        }
    });

    socket.on('close', () => broadcast(snapshot()));
});

http.listen(PORT, () => {
    console.log(`Servidor em http://localhost:${PORT}`);
});