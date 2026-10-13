import { Application, Graphics, type Ticker } from 'pixi.js';
const ANGEL_HALF_W = 20;
const ANGEL_HALF_H = 30;

type ItemKind = 'blessing' | 'darkness';

interface FallingItem {
    sprite: Graphics;
    kind: ItemKind;
    speed: number;
    radius: number;
}

export type GameStatus = 'menu' | 'playing' | 'gameover';

export interface GameSnapshot {
    status: GameStatus;
    score: number;
    lives: number;
}

export class Game {
    private app: Application | null = null;
    private destroyed = false;
    private angel: Graphics | null = null;
    private keys = new Set<string>();
    private readonly speed = 6;
    private items: FallingItem[] = [];
    private spawnTimer = 0;
    private readonly spawnInterval = 2;
    private score = 0;
    private lives = 3;
    private status: GameStatus = 'menu';
    private readonly onChange: (snap: GameSnapshot) => void;
    private readonly onBlessing: () => void;
    private pointerDir = 0;

    getFps(): number {
        return this.app?.ticker.FPS ?? 0;
    }

    constructor(onChange: (snap: GameSnapshot) => void, onBlessing: () => void) {
        this.onChange = onChange;
        this.onBlessing = onBlessing;
    }

    private notify(): void {
        this.onChange({ status: this.status, score: this.score, lives: this.lives });
    }

    private onKeyDown = (e: KeyboardEvent): void => {
        this.keys.add(e.code);
    };

    private onKeyUp = (e: KeyboardEvent): void => {
        this.keys.delete(e.code);
    };

    private createAngel(app: Application): void {
        const angel = new Graphics()
            .rect(-ANGEL_HALF_W, -ANGEL_HALF_H, ANGEL_HALF_W * 2, ANGEL_HALF_H * 2)
            .fill(0xf2d27a);

        angel.x = app.screen.width / 2;
        app.stage.addChild(angel);
        this.angel = angel;
    }

    private update = (ticker: Ticker): void => {
        if (!this.app || !this.angel) return;

        let dir = 0;
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) dir -= 3;
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) dir += 3;
        if (dir === 0) dir = this.pointerDir;

        this.angel.x += dir * this.speed * ticker.deltaTime;

        const half = ANGEL_HALF_W;
        const maxX = this.app.screen.width - half;
        this.angel.x = Math.min(Math.max(this.angel.x, half), maxX);
        this.angel.y = this.app.screen.height - 80;
        this.spawnTimer += ticker.deltaTime;

        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnItem();
        }

        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.sprite.y += item.speed * ticker.deltaTime;

            const hit =
                Math.abs(item.sprite.x - this.angel.x) < ANGEL_HALF_W + item.radius &&
                Math.abs(item.sprite.y - this.angel.y) < ANGEL_HALF_H + item.radius;

            if (hit) {
                if (item.kind === 'blessing') {
                    this.score += 10;
                    this.onBlessing();
                } else {
                    this.lives -= 1;
                }


                if (this.lives <= 0) this.status = 'gameover';
                this.notify();
                this.removeItem(i);

            } else if (item.sprite.y > this.app.screen.height + item.radius) {
                this.removeItem(i);
            }
        }

        if (this.status !== 'playing') return;

        // Debugging: Log the number of items currently in the game
        console.log(this.items.length)
    }

    private spawnItem(): void {
        if (!this.app) return;

        const kind: ItemKind = Math.random() < 0.75 ? 'blessing' : 'darkness';
        const radius = 14;
        const sprite = new Graphics();

        if (kind === 'blessing') {
            sprite.star(0, 0, 5, radius, radius * 0.45).fill(0xffe9a8);
        } else {
            sprite.circle(0, 0, radius).fill(0x2a0a2e).stroke({ width: 3, color: 0x8b1e3f });
        }

        sprite.x = radius + Math.random() * (this.app.screen.width - radius * 2);
        sprite.y = -radius;
        this.app.stage.addChild(sprite);

        this.items.push({ sprite, kind, radius, speed: 2.5 + Math.random() * 2.5 });
    }

    private removeItem(index: number): void {
        const [item] = this.items.splice(index, 1);
        item.sprite.destroy();
    }

    startRun(): void {
        if (!this.app || !this.angel) return;

        for (const item of this.items) item.sprite.destroy();
        this.items = [];
        this.score = 0;
        this.lives = 3;
        this.spawnTimer = 0;
        this.angel.x = this.app.screen.width / 2;

        this.status = 'playing';
        this.notify();
    }

    async start(container: HTMLElement): Promise<void> {
        const app = new Application();


        await app.init({
            background: '#0b0814',
            resizeTo: container,
            antialias: true,
        });

        if (this.destroyed) {
            app.destroy(true);
            return;
        }

        this.app = app;
        container.appendChild(app.canvas);

        this.createAngel(app);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        app.ticker.add(this.update);
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;

        const setDir = (x: number): void => {
            this.pointerDir = x < app.screen.width / 2 ? -3 : 3;
        };
        app.stage.on('pointerdown', (e) => setDir(e.global.x));
        app.stage.on('pointermove', (e) => { if (this.pointerDir !== 0) setDir(e.global.x); });
        app.stage.on('pointerup', () => { this.pointerDir = 0; });
        app.stage.on('pointerupoutside', () => { this.pointerDir = 0; });
    }

    destroy(): void {
        this.destroyed = true;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.app?.destroy(true, { children: true });
        this.items = [];
        this.app = null;
        this.angel = null;
    }
}