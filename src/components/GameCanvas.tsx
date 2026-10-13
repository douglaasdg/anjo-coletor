import { useEffect, useRef, useState } from 'react';
import { Game, type GameSnapshot } from '../game/Game';
import { Hud } from './Hud';
import { ScoreSocket, type GlobalStats } from '../net/ScoreSocket';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';
const INITIAL: GameSnapshot = { status: 'menu', score: 0, lives: 3 };

export function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [snap, setSnap] = useState<GameSnapshot>(INITIAL);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const socket = new ScoreSocket(WS_URL, setGlobalStats);
        socket.connect();

        const game = new Game(setSnap, () => socket.sendBlessing());
        gameRef.current = game;
        void game.start(container);

        return () => {
            game.destroy();
            socket.close();
            gameRef.current = null;
        };
    }, []);

    const handleStart = () => gameRef.current?.startRun();

    return (
        <div className="game-root">
            <div ref={containerRef} className="game-canvas" />
            <Hud snap={snap} globalStats={globalStats} onStart={handleStart} />
        </div>
    );
}