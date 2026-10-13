import type { GameSnapshot } from '../game/Game';
import type { GlobalStats } from '../net/ScoreSocket';

interface HudProps {
    snap: GameSnapshot;
    onStart: () => void;
    globalStats: GlobalStats | null;
}

export function Hud({ snap, onStart, globalStats }: HudProps) {
    const { status, score, lives } = snap;

    return (
        <div className="hud">
            <div className="hud-global">
                {globalStats
                ? `Bênçãos de todos: ${globalStats.total} · ${globalStats.players} anjo(s) online`
                : 'Placar global offline'}
            </div>
            
            {status === 'playing' && (
                <div className="hud-bar">
                    <span>Bênçãos: {score}</span>
                    <span aria-label={`${lives} vidas`}>{'♥'.repeat(Math.max(0, lives))}</span>
                </div>
            )}

            {status === 'menu' && (
                <div className="hud-panel">
                    <h1>Anjo Coletor</h1>
                    <p>Pegue as bênçãos e desvie das trevas. Use ← → ou A/D.</p>
                    <button onClick={onStart}>Começar</button>
                </div>
            )}

            {status === 'gameover' && (
                <div className="hud-panel">
                    <h2>As trevas venceram desta vez</h2>
                    <p>Você coletou {score} pontos em bênçãos.</p>
                    <button onClick={onStart}>Jogar de novo</button>
                </div>
            )}
        </div>
        
    );
}