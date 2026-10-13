export interface GlobalStats {
    total: number;
    players: number;
}

export class ScoreSocket {
    private ws: WebSocket | null = null;
    private closed = false;
    private retryId: number | undefined;
    private readonly url: string;
    private readonly onStats: (stats: GlobalStats) => void;

    constructor(url: string, onStats: (stats: GlobalStats) => void) {
        this.url = url;
        this.onStats = onStats;
    }

    connect(): void {
        const ws = new WebSocket(this.url);
        this.ws = ws;

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'total') this.onStats({ total: msg.total, players: msg.players });
            } catch {}
        };

        ws.onclose = () => {
            if (!this.closed) this.retryId = window.setTimeout(() => this.connect(), 2000);
        };
    }

    sendBlessing(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'blessing' }));
        }
    }

    close(): void {
        this.closed = true;
        window.clearTimeout(this.retryId);
        this.ws?.close();
    }
}