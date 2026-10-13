import { Application } from 'pixi.js';

export class Game {
    private app: Application | null = null;
    private destroyed = false;

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
    }

    destroy(): void {
        this.destroyed = true;
        this.app?.destroy(true, { children: true });
        this.app = null;
    }
}