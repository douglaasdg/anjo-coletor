import { useEffect, useRef, useState } from 'react';
import { Game, type GameSnapshot } from '../game/Game';
import { Hud } from './Hud';

const INITIAL: GameSnapshot = { status: 'menu', score: 0, lives: 3 };

export function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [snap, setSnap] = useState<GameSnapshot>(INITIAL);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const game = new Game(setSnap);
        gameRef.current = game;
        void game.start(container);

        return () => {
            game.destroy();
            gameRef.current = null;
        };
    }, []);

    const handleStart = () => gameRef.current?.startRun();

    return (
        <div className="game-root">
            <div ref={containerRef} className="game-canvas" />
            <Hud snap={snap} onStart={handleStart} />
        </div>
    );
}