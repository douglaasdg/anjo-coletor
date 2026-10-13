import { Application, Graphics, type Ticker } from 'pixi.js';

export class Game {
    private app: Application | null = null;
    private destroyed = false;
    private angel: Graphics | null = null;
    private keys = new Set<string>();
    private readonly speed = 6;

    private onKeyDown = (e: KeyboardEvent): void => {
        this.keys.add(e.code);
    };

    private onKeyUp = (e: KeyboardEvent): void => {
        this.keys.delete(e.code);
    };

    private createAngel(app: Application): void {
        const angel = new Graphics()
            .rect(-20, -30, 40, 60)
            .fill(0xf2d27a);

        angel.x = app.screen.width / 2;
        app.stage.addChild(angel);
        this.angel = angel;
    }

    private update = (ticker: Ticker): void => {
        if (!this.app || !this.angel) return;

        let dir = 0;
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) dir -= 1;
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) dir += 1;

        this.angel.x += dir * this.speed * ticker.deltaTime;

        const half = 20;
        const maxX = this.app.screen.width - half;
        this.angel.x = Math.min(Math.max(this.angel.x, half), maxX);
        this.angel.y = this.app.screen.height - 80;
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
    }

    destroy(): void {
        this.destroyed = true;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.app?.destroy(true, { children: true });
        this.app = null;
        this.angel = null;
    }
}