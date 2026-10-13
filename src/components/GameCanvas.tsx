import { useEffect, useRef } from "react";
import { Game } from "../game/Game";

export function GameCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const game = new Game();
        game.start(container);

        return () => game.destroy();
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}